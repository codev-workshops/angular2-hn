import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Item } from './Item';
import type { Story } from '../models';

const baseStory: Story = {
  id: 123,
  title: 'A story',
  points: 10,
  user: 'alice',
  time: 0,
  time_ago: '2 hours ago',
  type: 'story',
  url: 'https://example.com/post',
  domain: 'example.com',
  comments: [],
  comments_count: 5,
};

function renderItem(story: Story) {
  return render(
    <MemoryRouter>
      <Item item={story} />
    </MemoryRouter>
  );
}

describe('Item', () => {
  it('renders external title link with domain', () => {
    renderItem(baseStory);
    const title = screen.getByText('A story');
    expect(title).toHaveAttribute('href', 'https://example.com/post');
    expect(title).toHaveClass('title');
    expect(screen.getByText('(example.com)')).toHaveClass('domain');
  });

  it('renders internal item link when there is no external url', () => {
    renderItem({ ...baseStory, url: `item?id=123` });
    const title = screen.getByText('A story');
    expect(title).toHaveAttribute('href', '/item/123');
  });

  it('links user and comments', () => {
    renderItem(baseStory);
    for (const link of screen.getAllByRole('link', { name: 'alice' })) {
      expect(link).toHaveAttribute('href', '/user/alice');
    }
    expect(screen.getByText('5 comments')).toHaveAttribute('href', '/item/123');
  });

  it('hides points, user and comments for jobs', () => {
    renderItem({ ...baseStory, type: 'job' });
    expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
    expect(screen.queryByText('5 comments')).not.toBeInTheDocument();
  });
});
