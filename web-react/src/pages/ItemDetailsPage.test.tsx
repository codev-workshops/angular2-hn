import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Story } from '../models';
import { ItemDetailsPage } from './ItemDetailsPage';
import { fetchItem } from '../api/hackernews';

vi.mock('../api/hackernews', () => ({
  fetchItem: vi.fn(),
  fetchPollResult: vi.fn(),
}));

const mockedFetchItem = vi.mocked(fetchItem);

const item: Story = {
  id: 123,
  title: 'A title',
  points: 10,
  user: 'alice',
  time: 0,
  time_ago: '2 hours ago',
  type: 'story',
  url: 'https://example.com/story',
  domain: 'example.com',
  comments: [
    {
      id: 456,
      level: 0,
      user: 'bob',
      time: 0,
      time_ago: '1 hour ago',
      content: 'Hello <script>alert("x")</script>',
      deleted: false,
      comments: [],
    },
  ],
  comments_count: 1,
  content: 'Body <script>alert("x")</script>',
};

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/item/123']}>
        <Routes>
          <Route path="/item/:id" element={<ItemDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ItemDetailsPage', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    mockedFetchItem.mockResolvedValue(item);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the title, comment list, comment label, and sanitized content', async () => {
    renderPage();
    expect((await screen.findAllByText('A title')).length).toBe(2);
    expect(screen.getByText('1 comment')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(document.querySelectorAll('script')).toHaveLength(0);
    expect(document.querySelectorAll('ul.comment-list > li')).toHaveLength(1);
  });
});
