# Spec: `user/` family

Component: `UserComponent` (`src/app/user/**`, lazy loaded).

Migration status: **migrated** — `src/app/user/user.component.scss` consumes tokens only and
contains zero raw hex/rgba/hsla colors and zero raw px literals.

Tokens consumed by `src/app/user/user.component.scss`:

- Colors: `$color-white`, `$color-subtext`, `$color-named-lightgray`
- Spacing: `$space-10`, `$space-15`, `$space-20`, `$space-30`, `$space-62`, `$space-75`,
  `$space-110`
- Font sizes: `$font-size-base`, `$font-size-2xl`, `$font-size-4xl`
- Letter spacing: `$letter-spacing-wide`
- Sizes: `$size-header-text-height`
- Media strings: `$mobile-only`, `$laptop-only`

## UserComponent

- Selector: `app-user`, styles `src/app/user/user.component.scss`
- `@Input` / `@Output`: none — the user id comes from the route params.
- Public members: `user: User`, `errorMessage: string`, `goBack()`
- Usage: routed profile page showing karma, account age and the user's "about" HTML; falls back to
  `app-error-message` when the user cannot be loaded.

| Declaration | Token |
| --- | --- |
| `.profile` `padding: 30px` | `$space-30` |
| `.profile` mobile `padding: 110px 15px 0 15px` | `$space-110`, `$space-15`, bare `0` kept |
| `.title-block` mobile `font-size: 15px`, `margin: 0 75px` | `$font-size-base`, `$space-75`, bare `0` kept |
| `.back-button` `box-shadow: 0 0 0 lightgray` | `$color-named-lightgray` |
| `.item-header` mobile `padding-bottom: 10px`, `padding: 10px 0 10px 0` | `$space-10`, bare `0` kept |
| `.item-header` mobile `background-color: #fff` | `$color-white` |
| `.item-header` mobile `top: 62px`, `height: 20px` | `$space-62`, `$size-header-text-height` |
| `.main-details .name` / `.right` `font-size: 32px` / mobile `18px` | `$font-size-4xl`, `$font-size-2xl` |
| `.main-details .name` / `.right` `letter-spacing: 2px` | `$letter-spacing-wide` |
| `.main-details .age` `color: #696969` | `$color-subtext` |
| `.main-details` mobile `margin-top: 20px` | `$space-20` |
| media queries | `$mobile-only`, `$laptop-only` |

## Do's and don'ts

- DO import tokens with `@import "../shared/scss/tokens";`
- DON'T hardcode `#696969` — DO use `$color-subtext`.
- DON'T hardcode `#fff` — DO use `$color-white`.
- DON'T hardcode font sizes — DO use the `$font-size-*` scale.
- DON'T replace a bare unitless `0` with `$space-0` (`0px`) — that changes the compiled bytes.
- DO note that `.main-details .name` / `.right` colors are theme-driven via
  `src/app/shared/scss/_themes.scss`; only non-theme values belong in this component's SCSS.
