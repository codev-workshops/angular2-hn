export function hasHttpUrl(url: string | undefined): boolean {
    if (url === undefined) {
        // Deliberate legacy parity: the Angular implementation throws on an absent URL.
        throw new TypeError("Cannot read properties of undefined (reading 'indexOf')");
    }
    return url.indexOf('http') === 0;
}
