declare module 'dompurify' {
    const DOMPurify: {
        sanitize(value: string): string;
    };
    export default DOMPurify;
}
