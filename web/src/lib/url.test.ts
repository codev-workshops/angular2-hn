import { describe, expect, it } from 'vitest';
import { hasHttpUrl } from './url';

describe('hasHttpUrl', () => {
    it('recognizes only URLs beginning with http', () => {
        expect(hasHttpUrl('https://example.com')).toBe(true);
        expect(hasHttpUrl('item?id=1')).toBe(false);
    });

    it('preserves the legacy throw for absent URLs', () => {
        expect(() => hasHttpUrl(undefined)).toThrowError("Cannot read properties of undefined (reading 'indexOf')");
    });
});
