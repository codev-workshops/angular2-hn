import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchFeed } from '../../lib/api';
import { useSettingsStore } from '../../store/settings';
import { Story } from '../../types/models';
import { FeedPage } from './FeedPage';
import { StoryItem } from './StoryItem';

vi.mock('../../lib/api', () => ({
    fetchFeed: vi.fn(),
}));

const mockedFetchFeed = vi.mocked(fetchFeed);

const story = (overrides: Partial<Story> = {}): Story => ({
    id: 1,
    title: 'A story',
    points: 8,
    user: 'spottedmarley',
    time_ago: '2 hours ago',
    type: 'story',
    url: '',
    comments_count: 4,
    ...overrides,
});

function renderFeed(body: unknown, path = '/news/1', feedType = 'news') {
    mockedFetchFeed.mockResolvedValue(body as never);
    const router = createMemoryRouter(
        [
            {
                path: '/:feedType/:page',
                handle: { feedType },
                Component: FeedPage,
            },
        ],
        { initialEntries: [path] }
    );
    return render(<RouterProvider router={router} />);
}

describe('FeedPage', () => {
    afterEach(() => {
        cleanup();
    });

    beforeEach(() => {
        mockedFetchFeed.mockReset();
        vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    });

    it('shows the loader until a feed succeeds and an error after failure', async () => {
        mockedFetchFeed.mockReturnValueOnce(new Promise(() => undefined));
        const router = createMemoryRouter(
            [{ path: '/:feedType/:page', handle: { feedType: 'news' }, Component: FeedPage }],
            { initialEntries: ['/news/1'] }
        );
        render(<RouterProvider router={router} />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        mockedFetchFeed.mockRejectedValueOnce(new Error('offline'));
        router.navigate('/news/2');
        await waitFor(() => expect(screen.getByText('Could not load news stories.')).toBeInTheDocument());
    });

    it('renders list start, margins, and pagination based on page and body length', async () => {
        renderFeed(Array.from({ length: 30 }, (_, index) => story({ id: index })));
        await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(30));
        expect(screen.getByRole('list')).toHaveAttribute('start', '1');
        expect(screen.getByRole('list')).toHaveClass('list-margin');
        expect(screen.queryByRole('link', { name: '‹ Prev' })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/2');

        cleanup();
        renderFeed([story()], '/news/2');
        await waitFor(() => expect(screen.getByRole('list')).toHaveAttribute('start', '31'));
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/news/1');
        expect(screen.queryByRole('link', { name: 'More ›' })).not.toBeInTheDocument();
    });

    it('renders jobs without list margin and with the job header', async () => {
        renderFeed([story({ type: 'job' })], '/jobs/1', 'jobs');
        await waitFor(() => expect(screen.getByRole('list')).toBeInTheDocument());
        expect(screen.getByRole('list')).not.toHaveAttribute('class');
        expect(screen.getByText(/These are jobs at startups/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
            'href',
            'https://triplebyte.com/?ref=yc_jobs'
        );
    });

    it.each([
        ['an empty array', []],
        ['a malformed object', { malformed: true }],
    ])('renders %s without story items or pagination', async (_, body) => {
        renderFeed(body);
        await waitFor(() => expect(screen.getByRole('list')).toBeInTheDocument());
        expect(screen.queryAllByRole('listitem')).toHaveLength(0);
        expect(screen.queryByRole('link', { name: '‹ Prev' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'More ›' })).not.toBeInTheDocument();
    });

    it('keeps the loader visible for a null body', async () => {
        renderFeed(null);
        expect(await screen.findByText('Loading...')).toBeInTheDocument();
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
});

describe('StoryItem', () => {
    afterEach(() => {
        cleanup();
    });

    beforeEach(() => {
        useSettingsStore.setState({
            openLinkInNewTab: false,
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    function renderStory(item: Story) {
        return render(
            <MemoryRouter>
                <StoryItem item={item} />
            </MemoryRouter>
        );
    }

    it('renders external titles, domains, settings attributes, and styles', () => {
        useSettingsStore.setState({ openLinkInNewTab: true, titleFontSize: '21', listSpacing: '7' });
        renderStory(story({ url: 'https://example.com/story', domain: 'example.com' }));
        const title = screen.getByRole('link', { name: 'A story' });
        expect(title).toHaveAttribute('href', 'https://example.com/story');
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
        expect(title).toHaveStyle({ fontSize: '21px' });
        expect(screen.getByText('(example.com)')).toHaveClass('domain');
        expect(document.querySelector('.item-block > div')).toHaveStyle({ marginBottom: '7px' });
    });

    it('renders internal titles and omits external attributes when disabled', () => {
        renderStory(story());
        const title = screen.getByRole('link', { name: 'A story' });
        expect(title).toHaveAttribute('href', '/item/1');
        expect(title).not.toHaveAttribute('target');
        expect(title).not.toHaveAttribute('rel');
        expect(screen.queryByRole('link', { name: '(example.com)' })).not.toBeInTheDocument();
    });

    it.each([
        [0, 'discuss'],
        [1, '1 comment'],
        [7, '7 comments'],
    ])('renders the %s comment label', (count, label) => {
        renderStory(story({ comments_count: count }));
        expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    });

    it('omits user metadata and item details for jobs', () => {
        renderStory(story({ type: 'job' }));
        expect(screen.queryByText('8 points by')).not.toBeInTheDocument();
        expect(screen.queryByText('spottedmarley')).not.toBeInTheDocument();
        expect(document.querySelector('.item-details')).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /comment|discuss/ })).not.toBeInTheDocument();
        expect(document.querySelectorAll('.subtext-palm .details')).toHaveLength(1);
    });

    it('marks non-job laptop metadata with item-details', () => {
        renderStory(story());
        expect(document.querySelector('.item-details')).toBeInTheDocument();
        expect(document.querySelector('.subtext-laptop')).toHaveTextContent('8 points by spottedmarley');
    });
});
