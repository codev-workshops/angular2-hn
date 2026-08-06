import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ItemDetailsPage } from './ItemDetailsPage';
import { CommentNode } from './CommentNode';
import { fetchItemContent } from '../../lib/api';

vi.mock('../../lib/api', () => ({
    fetchItemContent: vi.fn(),
}));

vi.mock('../../store/settings', () => ({
    useSettingsStore: (selector: (state: { openLinkInNewTab: boolean }) => boolean) =>
        selector({ openLinkInNewTab: false }),
}));

const mockedFetchItemContent = vi.mocked(fetchItemContent);

function renderPage(id = '1') {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    return render(
        <MemoryRouter initialEntries={[`/item/${id}`]}>
            <Routes>
                <Route path="/item/:id" element={<ItemDetailsPage />} />
            </Routes>
        </MemoryRouter>
    );
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ItemDetailsPage', () => {
    it('renders loading and error states, including null-item rejection', async () => {
        mockedFetchItemContent.mockRejectedValue(new TypeError("Cannot read properties of null (reading 'type')"));
        renderPage();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        await waitFor(() => expect(screen.getByText('Could not load item comments.')).toBeInTheDocument());
    });

    it('renders a sanitized subject, conditional classes, poll bars, and null collections', async () => {
        mockedFetchItemContent.mockResolvedValue({
            id: 7000,
            title: 'Poll',
            type: 'poll',
            url: 'item?id=7000',
            comments_count: 0,
            text: 'poll body',
            poll_votes_count: 10,
            poll: [
                { points: 3, content: '<b>Option A</b><script>bad()</script>' },
                { points: 7, content: '<i>Option B</i>' },
            ],
            content: '<strong>Subject</strong><script>bad()</script>',
            comments: null,
        });
        renderPage('7000');
        await waitFor(() => expect(screen.getByText('Subject')).toBeInTheDocument());
        expect(document.querySelector('.laptop')).not.toHaveClass('item-header');
        expect(document.querySelector('.laptop')).toHaveClass('head-margin');
        expect(document.querySelectorAll('.pollBar')[0]).toHaveStyle({ width: '30%' });
        expect(document.querySelectorAll('.pollBar')[1]).toHaveStyle({ width: '70%' });
        expect(document.querySelector('p.subject script')).not.toBeInTheDocument();
    });

    it('supports url links, gated link attributes, and conditional item header', async () => {
        mockedFetchItemContent.mockResolvedValue({
            id: 7003,
            title: 'Job',
            type: 'job',
            url: 'https://jobs.example.test/frozen',
            comments_count: 0,
            comments: [],
        });
        renderPage('7003');
        await waitFor(() => expect(screen.getAllByRole('link', { name: 'Job' }).length).toBe(2));
        const links = screen.getAllByRole('link', { name: 'Job' });
        expect(links[0]).not.toHaveAttribute('target');
        expect(document.querySelector('.laptop')).toHaveClass('item-header');
        expect(document.querySelector('.laptop')).not.toHaveClass('head-margin');
    });
});

describe('CommentNode', () => {
    it('preserves the legacy comment-meta text separator', () => {
        render(
            <MemoryRouter>
                <CommentNode comment={{ user: 'parent', time_ago: 'now', content: 'comment', comments: [] }} />
            </MemoryRouter>
        );
        expect(document.querySelector('.meta')?.textContent).toBe('[-]parentnow');
    });

    it('sanitizes content, recursively renders, and hides the subtree on collapse', () => {
        render(
            <MemoryRouter>
                <CommentNode
                    comment={{
                        user: 'parent',
                        time_ago: 'now',
                        content: '<b>comment</b><script>bad()</script>',
                        comments: [{ user: 'child', content: 'child', comments: [] }],
                    }}
                />
            </MemoryRouter>
        );
        expect(screen.getByText('comment')).toBeInTheDocument();
        expect(document.querySelector('.comment-text')).toHaveTextContent('comment');
        expect(document.querySelectorAll('.comment-text')[1]).toHaveTextContent('child');
        const collapse = document.querySelector('.meta > .collapse') as HTMLElement;
        fireEvent.click(collapse);
        expect(collapse).toHaveTextContent('[+]');
        expect(collapse.closest('.meta')).toHaveClass('meta-collapse');
        expect(document.querySelector('.comment-tree > div')).toHaveAttribute('hidden');
    });

    it('renders deleted comments and tolerates non-array descendants', () => {
        render(
            <MemoryRouter>
                <CommentNode comment={{ deleted: true, comments: null }} />
            </MemoryRouter>
        );
        expect(document.querySelector('.deleted-meta')).toHaveTextContent('[deleted] | Comment Deleted');
    });
});
