import { commentLabel } from './comment-label';

describe('commentLabel', () => {
  it('returns discuss for zero comments', () => {
    expect(commentLabel(0)).toBe('discuss');
  });

  it('returns singular for one comment', () => {
    expect(commentLabel(1)).toBe('1 comment');
  });

  it('returns plural for many comments', () => {
    expect(commentLabel(42)).toBe('42 comments');
  });
});
