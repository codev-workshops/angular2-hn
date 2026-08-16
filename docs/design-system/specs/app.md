# Spec: `AppComponent` (app shell)

`AppComponent` is the shell wrapper (`.wrapper`, `.body-cover`) styled by
`src/app/app.component.scss`.

Migration status: **migrated** — the fixed declarations use design tokens.

| Declaration | Token |
| --- | --- |
| `.wrapper` `min-height: 80px` | `$size-wrapper-min-height` |
| `.wrapper` `font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif` | `$font-family-base` |
| `.wrapper` `font-size: 15px` | `$font-size-base` |
| `.wrapper` `line-height: 1.3` | `$line-height-base` |
| mobile media query | `$mobile-only` |

## Do's and don'ts

- DO import tokens with `@import "./shared/scss/tokens";`.
- DO use the existing shell tokens for fixed typography and dimensions.
- DO keep percentages, `100%`, and `85%` as they are; these values are intentionally relative and
  are not tokenized.
- DON'T add theme colors here: theme colors stay in
  `src/app/shared/scss/_themes.scss`.
- DON'T hardcode fixed typography or dimension values when an app-shell token exists.
