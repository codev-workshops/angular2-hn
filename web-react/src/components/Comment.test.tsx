import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Comment as CommentModel } from '../models';
import { Comment } from './Comment';

const baseComment: CommentModel = {
  id: 1,
  level: 0,
  user: 'alice',
  time: 0,
  time_ago: '1 hour ago',
  content: 'A <strong>comment</strong>',
  deleted: false,
  comments: [],
};

function renderComment(comment: CommentModel = baseComment) {
  return render(
    <MemoryRouter>
      <Comment comment={comment} />
    </MemoryRouter>
  );
}

describe('Comment', () => {
  it('renders and sanitizes comment content', () => {
    renderComment({ ...baseComment, content: 'safe<script>alert("x")</script>' });
    expect(screen.getByText('safe')).toBeInTheDocument();
    expect(screen.queryByText('alert("x")')).not.toBeInTheDocument();
    expect(document.querySelector('script')).not.toBeInTheDocument();
  });

  it('collapses and expands comment text while retaining it in the DOM', () => {
    renderComment();
    const toggle = screen.getByText('[-]');
    const text = screen.getByText(/A/);
    expect(text).toBeVisible();
    fireEvent.click(toggle);
    expect(screen.getByText('[+]')).toBeInTheDocument();
    expect(text).not.toBeVisible();
    expect(text.parentElement).toHaveAttribute('hidden');
    fireEvent.click(screen.getByText('[+]'));
    expect(screen.getByText('[-]')).toBeInTheDocument();
    expect(text).toBeVisible();
  });

  it('renders deleted comments', () => {
    renderComment({ ...baseComment, deleted: true });
    expect(screen.getByText('[deleted]')).toBeInTheDocument();
    expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
    expect(screen.queryByText('alice')).not.toBeInTheDocument();
  });
});
