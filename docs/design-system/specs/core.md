# Spec: `core/` family

Components: `HeaderComponent`, `FooterComponent`, `SettingsComponent`
(`src/app/core/**`). All three are singletons rendered by `AppComponent`.

Migration status: **not migrated** — SCSS still contains raw literals. Tokens listed below are the
targets for the migration.

## HeaderComponent

- Selector: `app-header`, styles `src/app/core/header/header.component.scss`
- `@Input` / `@Output`: none. State comes from `SettingsService`.
- Public members: `settings: Settings`, `toggleSettings()`, `scrollTop()`
- Usage: rendered once at the top of the app shell; fixed to the top on mobile.

Tokens it should consume:

| Declaration | Token |
| --- | --- |
| `color: #fff` (header text, `h1 a`, `.active`, nav hover) | `$color-white` |
| `color: hsla(0,0%,100%,.9)` (nav links) | `$color-white-hsla-90` |
| `line-height: 18px` | `$line-height-header` |
| `padding: 6px 0` | `$space-6`, `$space-0` |
| mobile header height `50px` | `$size-header-mobile` |
| `.home-link` `50px` / `66px` | `$size-home-link`, `$size-home-link-height` |
| `.logo-inner` `32px`, `left: 17px`, `top: 18px`, mobile `16px` / `12px` | `$size-logo-inner`, `$space-17`, `$space-18`, `$space-16`, `$space-12` |
| `.logo` `50px` / `45px`, `padding: 3px 8px 0`, mobile `0 0 0 10px` | `$size-logo`, `$size-logo-mobile`, `$space-3`, `$space-8`, `$space-10` |
| `h1`, `.left` `font-size: 16px` | `$font-size-lg` |
| `.name` `margin-right: 30px`, `margin-bottom: 2px` | `$space-30`, `$space-2` |
| `.header-text` `height: 20px`, `left: 10px`, `top: 27px`, mobile `top: 22px` | `$size-header-text-height`, `$space-10`, `$space-27`, `$space-22` |
| `.left` `left: 60px` | `$space-60` |
| `.header-nav` `margin-left: 20px` / mobile `60px`, `margin: 0 5px` | `$space-20`, `$space-60`, `$space-5` |
| `.header-nav a` `letter-spacing: 1.8px` | `$letter-spacing-nav` |
| `.info` `right: 20px` / mobile `10px` | `$space-20`, `$space-10` |
| `.info img` `width: 25px`, `margin-top: 21.5px` / mobile `15px` | `$size-icon`, `$space-21-5`, `$space-15` |
| media queries | `$mobile-only` (from `$bp-mobile-max`) |

## FooterComponent

- Selector: `app-footer`, styles `src/app/core/footer/footer.component.scss`
- `@Input` / `@Output`: none. Static markup, hidden on mobile.

Migration status: **migrated** — `footer.component.scss` contains no raw colors or px literals.

Tokens consumed by `src/app/core/footer/footer.component.scss`:

| Declaration | Token |
| --- | --- |
| `padding: 10px` | `$space-10` |
| `height: 60px` | `$size-footer` |
| `letter-spacing: 0.7px` | `$letter-spacing-footer` |
| media query | `$mobile-only` (via `_media.scss`, from `$bp-mobile-max`) |

## SettingsComponent

- Selector: `app-settings`, styles `src/app/core/settings/settings.component.scss`
- `@Input` / `@Output`: none. Reads/writes `SettingsService`.
- Public members: `settings: Settings`, `closeSettings()`, `toggleOpenLinksInNewTab()`,
  `selectTheme(theme)`, `changeTitleFont(val)`, `changeSpacing(val)`
- Usage: modal overlay toggled from the header; theme/font/spacing preferences.

| Declaration | Token |
| --- | --- |
| `background: rgba(0, 0, 0, 0.7)` (overlay) | `$color-overlay` |
| `.popup` `margin: 70px auto`, `padding: 30px` | `$space-70`, `$space-30` |
| `.popup` `border-radius: 5px` | `$radius-sm` |
| `h1` / `.content` `color: #fff`, `letter-spacing: 1px`, `margin-bottom: 0px` | `$color-white`, `$letter-spacing-normal`, `$space-0` |
| `h2` `padding-top: 10px`, `hr` `margin-bottom: 20px` | `$space-10`, `$space-20` |
| `.close` `top: 12px`, `right: 20px`, `font-size: 30px` | `$space-12`, `$space-20`, `$font-size-3xl` |
| `.close` `color: rgba(255,255,255,0.8)` | `$color-white-alpha-80` |
| `input[type=number]` `height: 20px`, `margin-bottom: 15px`, `padding: 2px`, `border-radius: 5px` | `$size-input-height`, `$space-15`, `$space-2`, `$radius-sm` |
| `.control-section` `margin/padding-bottom: 15px`, `border-bottom: 1px solid white` | `$space-15`, `$border-hairline-white` |
| `@media screen and (max-width: 700px)` | `$bp-settings-modal` (anomalous breakpoint, see README) |

## Do's and don'ts

- DO import tokens with a relative path: `@import "../../shared/scss/tokens";`
- DO use `$mobile-only` / `$laptop-only` / `$tablet-only` for responsive rules.
- DON'T hardcode `#fff` — DO use `$color-white`.
- DON'T hardcode `rgba(0, 0, 0, 0.7)` — DO use `$color-overlay`.
- DON'T introduce a new breakpoint like `700px`; use the standard scale.
- DON'T change a token's value to fix one component; add a new token instead.
