import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  const pipe = new CommentPipe();

  it('should use the singular form for exactly one comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('should use the plural form for many comments', () => {
    expect(pipe.transform(2)).toBe('2 comments');
    expect(pipe.transform(1234)).toBe('1234 comments');
  });

  it('should return "discuss" for zero, negative, null and undefined counts', () => {
    expect(pipe.transform(0)).toBe('discuss');
    expect(pipe.transform(-3)).toBe('discuss');
    expect(pipe.transform(null)).toBe('discuss');
    expect(pipe.transform(undefined)).toBe('discuss');
  });
});
