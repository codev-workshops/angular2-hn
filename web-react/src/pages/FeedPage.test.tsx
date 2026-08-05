import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FeedPage } from './FeedPage';
import * as api from '../api/hackernews';
import type { Story } from '../models';

function makeStories(count: number, type = 'story'): Story[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Story ${i + 1}`,
    points: 10,
    user: 'alice',
    time: 0,
    time_ago: '2 hours ago',
    type,
    url: `https://example.com/${i + 1}`,
    domain: 'example.com',
    comments: [],
    comments_count: 3,
  }));
}

function renderFeed(feedType: string, page: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/${feedType}/${page}`]}>
        <Routes>
          <Route path="/:feedType/:page" element={<FeedPage feedType={feedType} />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('FeedPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  it('renders 30 mocked items with correct ol start on page 1', async () => {
    vi.spyOn(api, 'fetchFeed').mockResolvedValue(makeStories(30));
    const { container } = renderFeed('news', '1');

    expect(await screen.findByText('Story 1')).toBeInTheDocument();
    expect(container.querySelectorAll('li.post')).toHaveLength(30);
    const ol = container.querySelector('.main-content ol')!;
    expect(ol).toHaveAttribute('start', '1');
    expect(ol).toHaveClass('list-margin');
    expect(container.querySelectorAll('li.post > .item-block')).toHaveLength(30);
  });

  it('numbers items from the correct offset on page 2', async () => {
    vi.spyOn(api, 'fetchFeed').mockResolvedValue(makeStories(30));
    const { container } = renderFeed('news', '2');

    expect(await screen.findByText('Story 1')).toBeInTheDocument();
    expect(container.querySelector('.main-content ol')).toHaveAttribute('start', '31');
  });

  it('renders the jobs variant with job-header and no list-margin', async () => {
    vi.spyOn(api, 'fetchFeed').mockResolvedValue(makeStories(5, 'job'));
    const { container } = renderFeed('jobs', '1');

    expect(await screen.findByText('Story 1')).toBeInTheDocument();
    expect(container.querySelector('p.job-header')).toHaveTextContent(
      'These are jobs at startups that were funded by Y Combinator.'
    );
    expect(container.querySelector('.main-content ol')).not.toHaveClass('list-margin');
  });

  it('hides Prev on page 1 and shows More when there are 30 items', async () => {
    vi.spyOn(api, 'fetchFeed').mockResolvedValue(makeStories(30));
    const { container } = renderFeed('news', '1');

    expect(await screen.findByText('Story 1')).toBeInTheDocument();
    expect(container.querySelector('.nav a.prev')).toBeNull();
    expect(screen.getByText('More ›')).toHaveAttribute('href', '/news/2');
  });

  it('shows Prev on page 2 and hides More when fewer than 30 items', async () => {
    vi.spyOn(api, 'fetchFeed').mockResolvedValue(makeStories(10));
    const { container } = renderFeed('news', '2');

    expect(await screen.findByText('Story 1')).toBeInTheDocument();
    expect(screen.getByText('‹ Prev')).toHaveAttribute('href', '/news/1');
    expect(container.querySelector('.nav a.more')).toBeNull();
  });

  it('renders the error state with the exact message', async () => {
    vi.spyOn(api, 'fetchFeed').mockRejectedValue(new Error('boom'));
    renderFeed('ask', '1');

    expect(await screen.findByText('Could not load ask stories.')).toBeInTheDocument();
  });
});
