import { describe, expect, it } from 'vitest';
import { commentLabel } from './comments';

describe('commentLabel', () => {
    it.each([
        [0, 'discuss'],
        [1, '1 comment'],
        [3, '3 comments'],
    ])('formats %s', (count, expected) => {
        expect(commentLabel(count)).toBe(expected);
    });
});
