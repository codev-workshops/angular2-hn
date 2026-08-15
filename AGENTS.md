# AGENTS.md

Contributor rules for this repo (humans and AI agents alike). These cover the styling layer;
see `src/app/shared/scss/README.md` for token reference and `docs/design-system-migration-plan.md`
for where the refactor is headed.

## Project basics

Angular 9 with `@angular/cli` 9. SCSS uses legacy `@import` (no `@use` — the toolchain
predates the Sass module system; migrating is a separate, all-at-once change).

Node 17+ needs the legacy OpenSSL provider:

```bash
npm ci
NODE_OPTIONS=--openssl-legacy-provider npm run build
NODE_OPTIONS=--openssl-legacy-provider npm test -- --watch=false --browsers=ChromeHeadless
npm run lint
```

## Styling rules

1. **No raw colors in component SCSS.** No hex, `rgb()`/`rgba()`, `hsl()`/`hsla()`, or named
   colors. Use a semantic alias from `src/app/shared/scss/_tokens.scss` or a theme variable
   from `_theme_variables.scss`. Anything that must differ per theme belongs in the `theme()`
   mixin in `_themes.scss`, not in a component stylesheet.
2. **No raw `px` for spacing or font size.** Use `$space-0..$space-6` and
   `$font-size-xs..$font-size-display`. Values that are genuinely not on a scale (illustration
   geometry, fixed-header offsets, asset sizes) are allowed only where
   `docs/component-specs.md` marks them **keep literal** — add a short comment saying why.
3. **No inline `@media` literals.** Import `src/app/shared/scss/_breakpoints.scss` and use
   `#{$breakpoint-mobile}`, `#{$breakpoint-laptop}`, `#{$breakpoint-tablet}`. 768 / 769 / 1024
   are the only sanctioned breakpoints; do not introduce new ones.
4. **New themes go through a map, not new positional mixin args.** `theme()` currently takes
   12 positional arguments, so every new property means editing every call site. The planned
   refactor passes one Sass map per theme. Do not add positional parameters to `theme()`;
   land the map refactor first (see the migration plan).
5. **Run the grep guards below before pushing**, and keep style-only PRs pixel-neutral —
   if a PR is meant to be additive, `git diff` must show no changed values.

## Grep guards

Run from the repo root. Each should print nothing (or only lines you can justify with a
**keep literal** entry in `docs/component-specs.md`).

```bash
# 1. Raw colors in component SCSS
grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(' src/app --include='*.component.scss'

# 2. Raw px for spacing / font-size in component SCSS
grep -rnE '(margin|padding|font-size|top|right|bottom|left|gap)[^:]*:[^;]*[0-9]+px' \
  src/app --include='*.component.scss'

# 3. Inline @media literals instead of breakpoint tokens
grep -rn '@media' src --include='*.scss' | grep -v 'breakpoint-' | grep -v -- '-only}'

# 4. Positional growth of the theme mixin
grep -n '@mixin theme' -A 20 src/app/shared/scss/_themes.scss

# 5. Sanctioned breakpoints only (768 / 769 / 1024)
grep -rnP 'm(?:in|ax)-width\s*:(?!\s*(?:768px|769px|1024px))' src --include='*.scss' \
  | grep -v '_breakpoints.scss' | grep -v '_media.scss'
```

Known pre-existing violations (tracked, not regressions): the `700px` query in
`src/app/core/settings/settings.component.scss` and the raw `768px` query in `src/styles.scss`.

## Documentation

When a change adds a token, a breakpoint, a build step, or a convention, update
`src/app/shared/scss/README.md`, this file, and `docs/component-specs.md` in the same PR.
