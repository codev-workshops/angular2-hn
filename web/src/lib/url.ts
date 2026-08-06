export function hasHttpUrl(url: string | undefined): boolean {
    return url!.indexOf('http') === 0;
}
