import type { AtRule, Container, Document, Plugin, Rule } from 'postcss';

/**
 * Rewrites the stylesheet of every `*.component.scss` the way Angular's default
 * `ViewEncapsulation.Emulated` does: an attribute selector is appended to each
 * compound selector so a rule only ever matches elements rendered by that
 * component's own template. Components apply the matching attribute through the
 * `scope()` helper in `src/shared/scope.ts`.
 *
 * `>>>` / `/deep/` rules are dropped, matching Angular 9 which removed support
 * for those combinators.
 */
export function scopeAttribute(file: string): string | null {
    const match = /([a-z-]+)\.component\.scss(?:\?.*)?$/.exec(file);
    return match ? `data-ng-${match[1]}` : null;
}

function scopeCompound(compound: string, attribute: string): string {
    if (compound === '*') {
        return `[${attribute}]`;
    }
    let depth = 0;
    for (let i = 0; i < compound.length; i++) {
        const char = compound[i];
        if (char === '(' || char === '[') {
            depth++;
        } else if (char === ')' || char === ']') {
            depth--;
        } else if (char === ':' && depth === 0) {
            return `${compound.slice(0, i)}[${attribute}]${compound.slice(i)}`;
        }
    }
    return `${compound}[${attribute}]`;
}

export function scopeSelector(selector: string, attribute: string): string {
    return selector
        .split(/(\s*[>+~]\s*|\s+)/)
        .filter((part) => part !== '' && part !== undefined)
        .map((part) => (/^\s*[>+~]?\s*$/.test(part) ? part : scopeCompound(part, attribute)))
        .join('');
}

function insideKeyframes(rule: Rule): boolean {
    let parent: Container | Document | undefined = rule.parent;
    while (parent) {
        if (parent.type === 'atrule' && /keyframes$/.test((parent as AtRule).name)) {
            return true;
        }
        parent = parent.parent;
    }
    return false;
}

export function emulatedEncapsulation(): Plugin {
    return {
        postcssPlugin: 'ng-emulated-encapsulation',
        Once(root) {
            const attribute = scopeAttribute(root.source?.input.file ?? '');
            if (!attribute) {
                return;
            }
            root.walkRules((rule) => {
                if (insideKeyframes(rule)) {
                    return;
                }
                if (/>>>|\/deep\//.test(rule.selector)) {
                    rule.remove();
                    return;
                }
                rule.selectors = rule.selectors.map((selector) => scopeSelector(selector, attribute));
            });
        },
    };
}
