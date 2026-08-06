import { describe, expect, it } from 'vitest';
import { http } from './http';

describe('http', () => {
    it('accepts non-2xx statuses for JSON bodies', () => {
        expect(http.defaults.validateStatus?.(500)).toBe(true);
    });

    it('parses JSON and rejects non-JSON response bodies', () => {
        const transforms = http.defaults.transformResponse;
        const transform = (Array.isArray(transforms) ? transforms[0] : transforms) as (data: string) => unknown;
        expect(transform('{"ok":true}')).toEqual({ ok: true });
        expect(() => transform('<html>offline</html>')).toThrow();
    });
});
