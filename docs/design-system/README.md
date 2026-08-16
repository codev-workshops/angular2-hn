# Design system

This directory documents the design system for angular2-hn: the design tokens, the per-component
specs, and the rules every contributor (human or agent) must follow when writing styles.

## Where tokens live

| File | Role |
| --- | --- |
| `docs/design-system/tokens.json` | Machine-readable **source of truth**. Every distinct color, spacing, font size, font family, line height, letter spacing, breakpoint, radius, size and border currently used in `src/**/*.scss`. |
| `src/app/shared/scss/_tokens.scss` | SCSS mirror of `tokens.json`, one variable per token. This is what components import and consume. |

`_tokens.scss` declares variables only and emits **zero CSS**. It is imported from
`src/styles.scss` so the build always validates it.

Every token value is byte-for-byte the literal it replaces. Consuming a token must never change a
rendered pixel.

## Naming conventions

Names are `<category>-<semantic-or-scale>`:

- `color` — semantic where possible (`$color-subtext`, `$color-brand-red`, `$color-border-light`),
  alpha variants keep their channel in the name (`$color-white-alpha-70`).
- `spacing` — numeric scale of the literal value: `$space-10` is `10px`, `$space-21-5` is `21.5px`.
  Use these for `margin`, `padding` and positional offsets.
- `fontSize` — t-shirt scale: `$font-size-xxs` (11px) … `$font-size-base` (15px) … `$font-size-4xl` (32px).
- `fontFamily`, `lineHeight`, `letterSpacing` — semantic (`$font-family-title`, `$line-height-base`).
- `breakpoint` — `$bp-mobile-max`, `$bp-laptop-min`, `$bp-tablet-max` (plus the anomaly below).
- `radius`, `size`, `border` — semantic, named after what they describe (`$size-skull`,
  `$border-theme-day`).

## Breakpoints

The standard scale, defined in `_tokens.scss` and consumed through the media strings in
`src/app/shared/scss/_media.scss`:

| Token | Value | Media string |
| --- | --- | --- |
| `$bp-mobile-max` | `768px` | `$mobile-only` — `only screen and (max-width : 768px)` |
| `$bp-laptop-min` | `769px` | `$laptop-only` — `only screen and (min-width : 769px)` |
| `$bp-tablet-max` | `1024px` | `$tablet-only` — `only screen and (max-width : 1024px)` |

**Anomaly:** `$bp-settings-modal` is `700px` and is used by exactly one rule, the settings modal
width override in `src/app/core/settings/settings.component.scss`
(`@media screen and (max-width: 700px)`). It does **not** match the standard scale and should not
be used by new code — it is tokenized only to keep the inventory complete. New responsive rules
must use one of the three standard breakpoints.

## How to add a token

1. Add the entry to `docs/design-system/tokens.json` under the right category, with a stable
   semantic name and the raw value.
2. Add the matching SCSS variable to `src/app/shared/scss/_tokens.scss` with the identical value.
3. Consume it from the component SCSS via `@import "<relative path>/shared/scss/tokens";`
   (there is no `includePaths` configured in `angular.json`, so the path must be relative).
4. Note the new token in the relevant spec under `docs/design-system/specs/`.

## Hard rule

**Components must never hardcode colors or px values.** If a value does not exist as a token, add
the token first (step 1 and 2 above) and then reference it.

## Specs

- [core](specs/core.md) — header, footer, settings
- [feeds](specs/feeds.md) — feed, item
- [item-details](specs/item-details.md) — item-details, comment
- [app](specs/app.md) — app shell
- [shared](specs/shared.md) — error-message, loader
- [user](specs/user.md) — user

## Migration status

Tokens are defined for the whole SCSS tree. Component migration is incremental; each spec records
whether its family has been migrated onto tokens. The `feeds/` family is the pilot.
