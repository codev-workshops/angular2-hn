import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  const pipe = new CommentPipe();

  it('creates an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns "discuss" when there are no comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('uses the singular form for a single comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('uses the plural form for multiple comments', () => {
    expect(pipe.transform(5)).toBe('5 comments');
  });
});
