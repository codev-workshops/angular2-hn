const BLOCKED_ELEMENTS = 'script,style,iframe,object,embed,link,meta,base,form,template';

const UNSAFE_URL = /^\s*(javascript|data|vbscript):/i;

/**
 * Mirrors what Angular's `DomSanitizer` does for `[innerHTML]` bindings on the
 * markup that the Hacker News API returns: the HTML is parsed into an inert
 * document, unsafe elements/attributes are dropped, and the result is
 * re-serialized with non-printable/non-ASCII characters as numeric character
 * references. The last step matters visually: re-parsing `&#146;` and friends
 * makes the HTML parser apply its windows-1252 mapping, so the stray C1 control
 * characters present in old comments render as typographic quotes instead of
 * "missing glyph" boxes.
 */
export function sanitizeHtml(html: string | undefined | null): string {
    if (!html) {
        return '';
    }

    const doc = new DOMParser().parseFromString(html, 'text/html');

    doc.body.querySelectorAll(BLOCKED_ELEMENTS).forEach((element) => element.remove());

    doc.body.querySelectorAll('*').forEach((element) => {
        for (const attribute of Array.from(element.attributes)) {
            const name = attribute.name.toLowerCase();
            const isUrl = name === 'href' || name === 'src' || name === 'action';
            if (name.startsWith('on') || (isUrl && UNSAFE_URL.test(attribute.value))) {
                element.removeAttribute(attribute.name);
            }
        }
    });

    return doc.body.innerHTML.replace(/[^\u0020-\u007e]/g, (character) => `&#${character.charCodeAt(0)};`);
}
