import DOMPurify from 'dompurify';

export function sanitizeHtml(value: string | undefined): string {
    return DOMPurify.sanitize(value ?? '');
}
