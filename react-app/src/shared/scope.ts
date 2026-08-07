/**
 * Angular's emulated view encapsulation tags every element of a component's
 * template with a `_ngcontent-*` attribute and scopes that component's CSS
 * selectors to it. `build/emulated-encapsulation.ts` performs the CSS half of
 * that rewrite; `scope()` produces the attribute the markup half needs.
 *
 * Spread the result onto every element a component renders itself:
 *
 *     const ng = scope('item');
 *     <p {...ng}>…</p>
 */
export type Scope = Record<string, string>;

export function scope(component: string): Scope {
    return { [`data-ng-${component}`]: '' };
}
