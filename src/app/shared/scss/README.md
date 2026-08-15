# Shared SCSS / design system

This folder holds the style foundation for the app.

| File | Role |
| --- | --- |
| `_tokens.scss` | Source of truth for spacing, type, font families, line height, letter spacing, border widths, and semantic color aliases. |
| `_breakpoints.scss` | Documented names for the three sanctioned media query strings. |
| `_media.scss` | Legacy media query strings (`$mobile-only`, `$laptop-only`, `$tablet-only`). Still the raw definitions; prefer `_breakpoints.scss` in new code. |
| `_theme_variables.scss` | Per-theme color values (day / night / amoledblack) plus `$skull-size`. Source of truth for colors. |
| `_themes.scss` | The `theme()` mixin plus one `@include` per theme; the only file that emits themed CSS. |

Sass here is legacy `@import` based (Angular 9 / node-sass era). Do **not** introduce `@use`
until the whole layer is migrated at once.

## Usage

```scss
@import "../../shared/scss/tokens";
@import "../../shared/scss/breakpoints";

.subtext {
  font-size: $font-size-xs;
  letter-spacing: $letter-spacing-tight;
  color: $color-subtext;

  @media #{$breakpoint-mobile} {
    margin-bottom: $space-4;
  }
}
```

`_tokens.scss` imports `_theme_variables.scss` itself, so importing tokens is enough to get
both the tokens and the theme variables.

## Spacing scale

Derived from the magic numbers already present across component SCSS.

| Token | Value | Typical use |
| --- | --- | --- |
| `$space-0` | `2px` | tight paragraph margins, input padding |
| `$space-1` | `4px` | micro offsets (`.itemNum` top) |
| `$space-2` | `5px` | inline gaps between nav links, small margins |
| `$space-3` | `8px` | content block padding, comment tree indent on tablet |
| `$space-4` | `10px` | default padding unit (rows, footers, headers) |
| `$space-5` | `20px` | section spacing, gutters |
| `$space-6` | `40px` | page gutters on laptop |

## Type scale

| Token | Value | Typical use |
| --- | --- | --- |
| `$font-size-xs` | `12px` | `.subtext`, `.subtext-laptop`, `.deleted-meta` |
| `$font-size-sm` | `13px` | `.subtext-palm`, `.meta`, `.collapse` |
| `$font-size-md` | `15px` | `.wrapper` base size, `.comment-text`, `.job-header` |
| `$font-size-lg` | `16px` | `h1`, header `.left`, `.title` |
| `$font-size-xl` | `17px` | feed pagination `.nav` |
| `$font-size-xxl` | `18px` | mobile user `.name` / `.right` |
| `$font-size-display` | `32px` | laptop user `.name` / `.right` |

## Font families

| Token | Value |
| --- | --- |
| `$font-family-base` | `"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif` |
| `$font-family-alt` | `Verdana, Geneva, sans-serif` (story / item titles) |

## Line height, letter spacing, border widths

| Token | Value |
| --- | --- |
| `$line-height-base` | `1.3` |
| `$letter-spacing-tight` | `0.5px` |
| `$letter-spacing-wide` | `1.8px` |
| `$letter-spacing-wider` | `2px` |
| `$border-width-hairline` | `1px` |
| `$border-width-thick` | `2px` |

## Colors

Colors stay owned by the theme engine. The token file only adds semantic aliases onto the
existing day-theme variables so component SCSS can stop hardcoding hex values:

| Alias | Aliases | Value |
| --- | --- | --- |
| `$color-page-background` | `$theme-day-body-background-color` | `#fff` |
| `$color-surface` | `$theme-day-wrapper-background-color` | `#f5f5f5` |
| `$color-surface-mobile` | `$theme-day-wrapper-mobile-background-color` | `#fff` |
| `$color-text` | `$theme-day-text-color` | `#000` |
| `$color-subtext` | `$theme-day-subtext-color` | `#696969` |
| `$color-accent` | `$theme-day-secondary-color` | `#b92b27` |
| `$color-header-background` | `$theme-day-header-background-color` | `#b92b27` |
| `$color-logo-inner` | `$theme-day-logo-inner` | `#fff` |
| `$color-on-accent` | — | `#fff` |
| `$color-on-accent-muted` | — | `hsla(0, 0%, 100%, .9)` |
| `$color-hairline` | — | `#CECECB` |
| `$color-overlay` | — | `rgba(0, 0, 0, 0.7)` |
| `$color-on-overlay-muted` | — | `rgba(255, 255, 255, 0.8)` |

Anything that must change per theme belongs in `_theme_variables.scss` and must be routed
through the `theme()` mixin — not through these aliases.

## Theme model

Three themes exist today: `default` (day), `night`, and `amoledblack`. Each is a set of
`$theme-<name>-*` variables in `_theme_variables.scss`, passed positionally into the
`theme()` mixin in `_themes.scss`, which emits everything under a `.<name>` root class.
`SettingsComponent` toggles that class on the app wrapper, and the app also reads the user's
`prefers-color-scheme` on first load.

Consequences to be aware of:

* `theme()` takes 12 positional arguments. Adding a theme property today means adding an
  argument at every call site. The planned fix is a theme **map** per theme — see
  `docs/design-system-migration-plan.md`.
* Only selectors listed inside `theme()` are themeable. A component that needs a themed color
  must use one of those class names or the mixin must be extended.

## Breakpoints

| Token | Value |
| --- | --- |
| `$breakpoint-mobile` | `only screen and (max-width : 768px)` |
| `$breakpoint-laptop` | `only screen and (min-width : 769px)` |
| `$breakpoint-tablet` | `only screen and (max-width : 1024px)` |

768 / 769 / 1024 are the only sanctioned breakpoints. The `700px` query in
`src/app/core/settings/settings.component.scss` and the raw `768px` literal in
`src/styles.scss` are known deviations, to be migrated in later PRs.
