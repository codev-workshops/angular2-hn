# Spec: `core/` family

Components: `HeaderComponent`, `FooterComponent`, `SettingsComponent`
(`src/app/core/**`). All three are singletons rendered by `AppComponent`.

Migration status: per component — see each section below. Tokens listed for a component that is not
yet migrated are the targets for its migration.

## HeaderComponent

- Selector: `app-header`, styles `src/app/core/header/header.component.scss`
- `@Input` / `@Output`: none. State comes from `SettingsService`.
- Public members: `settings: Settings`, `toggleSettings()`, `scrollTop()`
- Usage: rendered once at the top of the app shell; fixed to the top on mobile.

Status: **migrated**. `header.component.scss` imports
`@import "../../shared/scss/tokens";` first, then `media` and `theme_variables`, and contains zero
raw hex/rgba/hsla colors and zero raw px literals.

Tokens it consumes:

| Declaration | Token |
| --- | --- |
| `color` (header text, `h1 a`, `.active`, nav hover) | `$color-white` |
| `.header-nav a` `color` | `$color-white-hsla-90` |
| `#header` `line-height` | `$line-height-header` |
| `#header` `padding: 6px 0` | `$space-6` (the `0` stays a bare unitless `0`) |
| `#header` mobile `height` | `$size-header-mobile` |
| `.home-link` `width` / `height` | `$size-home-link`, `$size-home-link-height` |
| `.logo-inner` `width` / `height`, `left`, `top`, mobile `left` / `top` | `$size-logo-inner`, `$space-17`, `$space-18`, `$space-16`, `$space-12` |
| `.logo` `width` / mobile `width`, `padding`, mobile `padding` | `$size-logo`, `$size-logo-mobile`, `$space-3`, `$space-8`, `$space-10` |
| `h1`, `.left` `font-size` | `$font-size-lg` |
| `.name` `margin-right`, `margin-bottom` | `$space-30`, `$space-2` |
| `.header-text` `height`, `left`, `top`, mobile `top` | `$size-header-text-height`, `$space-10`, `$space-27`, `$space-22` |
| `.left` `left` | `$space-60` |
| `.header-nav` `margin-left` / mobile `margin-left`, `a` `margin: 0 5px` | `$space-20`, `$space-60`, `$space-5` |
| `.header-nav a` `letter-spacing` | `$letter-spacing-nav` |
| `.info` `right` / mobile `right` | `$space-20`, `$space-10` |
| `.info img` `width`, `margin-top` / mobile `margin-top` | `$size-icon`, `$space-21-5`, `$space-15` |
| media queries | `$mobile-only` (from `$bp-mobile-max`) |

`.logo-inner` keeps `border-radius: 50%` as a literal percentage (percentages are intentionally not
tokenized), and `opacity`, `z-index` and `width: 100%` values are unitless/percentage and untouched.
No new tokens were needed.

## FooterComponent

- Selector: `app-footer`, styles `src/app/core/footer/footer.component.scss`
- `@Input` / `@Output`: none. Static markup, hidden on mobile.

| Declaration | Token |
| --- | --- |
| `padding: 10px` | `$space-10` |
| `height: 60px` | `$size-footer` |
| `letter-spacing: 0.7px` | `$letter-spacing-footer` |
| media query | `$mobile-only` |

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
