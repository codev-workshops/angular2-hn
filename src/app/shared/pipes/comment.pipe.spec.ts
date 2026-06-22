import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
    let pipe: CommentPipe;

    beforeEach(() => {
        pipe = new CommentPipe();
    });

    it('should create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return "discuss" for 0 comments', () => {
        expect(pipe.transform(0)).toBe('discuss');
    });

    it('should return "discuss" for negative comments', () => {
        expect(pipe.transform(-1)).toBe('discuss');
    });

    it('should return "1 comment" for exactly 1 comment', () => {
        expect(pipe.transform(1)).toBe('1 comment');
    });

    it('should return "2 comments" for 2 comments', () => {
        expect(pipe.transform(2)).toBe('2 comments');
    });

    it('should return "100 comments" for 100 comments', () => {
        expect(pipe.transform(100)).toBe('100 comments');
    });
});
