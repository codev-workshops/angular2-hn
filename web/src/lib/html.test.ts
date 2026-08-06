import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from './html';

describe('sanitizeHtml', () => {
    it('keeps safe markup and removes unsafe markup', () => {
        expect(sanitizeHtml('<p><strong>safe</strong></p>')).toContain('<strong>safe</strong>');
        expect(sanitizeHtml('<img src=x onerror=alert(1)>')).not.toContain('onerror');
    });
});
