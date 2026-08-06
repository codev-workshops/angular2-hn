import { describe, expect, it } from 'vitest';
import { http } from './http';

describe('http', () => {
    it('accepts non-2xx statuses for JSON bodies', () => {
        expect(http.defaults.validateStatus?.(500)).toBe(true);
    });

    it('parses JSON and rejects non-JSON response bodies', () => {
        const transform = http.defaults.transformResponse?.[0] as (data: string) => unknown;
        expect(transform('{"ok":true}')).toEqual({ ok: true });
        expect(() => transform('<html>offline</html>')).toThrow();
    });
});
