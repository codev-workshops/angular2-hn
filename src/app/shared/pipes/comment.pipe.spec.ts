import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  it('formats empty, singular and plural comment counts', () => {
    const pipe = new CommentPipe();
    expect(pipe.transform(0)).toBe('discuss');
    expect(pipe.transform(-1)).toBe('discuss');
    expect(pipe.transform(1)).toBe('1 comment');
    expect(pipe.transform(12)).toBe('12 comments');
  });
});
