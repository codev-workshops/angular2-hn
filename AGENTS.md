# AGENTS.md

Guidance for AI agents and contributors working in this repository (Angular 9 Hacker News PWA).

## Commands

| Task | Command |
| --- | --- |
| Build | `NODE_OPTIONS=--openssl-legacy-provider npx ng build` |
| Dev server | `NODE_OPTIONS=--openssl-legacy-provider yarn start` |
| Lint | `yarn lint` (`ng lint` = tslint over TypeScript only — it does **not** lint SCSS) |
| Test | `NODE_OPTIONS=--openssl-legacy-provider yarn test` |

Angular 9 needs legacy OpenSSL on Node 17+, hence `NODE_OPTIONS=--openssl-legacy-provider`.

## Styling rules

**Never hardcode colors or px values in `.scss` files.** Always reference tokens from
`src/app/shared/scss/_tokens.scss` (source of truth: `docs/design-system/tokens.json`). New values
must be added as tokens first — add them to `tokens.json` and `_tokens.scss` with identical values,
then consume the variable.

- Import tokens with a **relative** path, e.g. `@import "../../shared/scss/tokens";`. There is no
  `includePaths` configured in `angular.json`.
- `_tokens.scss` declares variables only and must keep emitting zero CSS.
- Use the `$space-*` scale for margin/padding/offsets, `$font-size-*` for font sizes,
  `$color-*` for colors, `$size-*` for fixed component dimensions and `$border-*` for borders.
- Theme-dependent colors stay in `src/app/shared/scss/_themes.scss` /
  `_theme_variables.scss`; component SCSS must not re-declare them.
- Responsive rules use the media strings from `src/app/shared/scss/_media.scss`:
  `@media #{$mobile-only}`, `@media #{$laptop-only}`, `@media #{$tablet-only}`.

### Standard breakpoints

| Token | Value | Media string |
| --- | --- | --- |
| `$bp-mobile-max` | `768px` | `$mobile-only` — `only screen and (max-width : 768px)` |
| `$bp-laptop-min` | `769px` | `$laptop-only` — `only screen and (min-width : 769px)` |
| `$bp-tablet-max` | `1024px` | `$tablet-only` — `only screen and (max-width : 1024px)` |

`$bp-settings-modal` (`700px`) is a legacy anomaly used only by the settings modal. Do not use it
for new rules.

### Changing styles

Token substitutions must be pixel-neutral: a token's value is byte-for-byte the literal it
replaces. When migrating a component, compile its SCSS before and after (e.g.
`npx sass src/app/feeds/feed/feed.component.scss`) and diff the output.

Full documentation: [`docs/design-system/README.md`](docs/design-system/README.md), with a spec per
component family under `docs/design-system/specs/`.
