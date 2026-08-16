# Spec: `shared/` component family

Components: `ErrorMessageComponent`, `LoaderComponent`
(`src/app/shared/components/**`). Both are presentational and reused by the feed, item-details and
user pages.

Migration status: **not migrated** — SCSS still contains raw literals. Tokens below are the
migration targets.

## ErrorMessageComponent

Migration status: **migrated**.

- Selector: `app-error-message`, styles
  `src/app/shared/components/error-message/error-message.component.scss`
- Consumed tokens in `src/app/shared/components/error-message/error-message.component.scss`:
  `$size-error-section`, `$size-skull`, `$space-25`, `$radius-skull-head`, `$radius-circle`,
  `$radius-skull-nose`, `$radius-skull-teeth`, `$mobile-only`
- `@Input`: `message: string`
- `@Output`: none
- Usage: shown instead of content when an API call fails; draws the CSS skull illustration plus
  the message text.

| Declaration | Token |
| --- | --- |
| `.error-section` `height: 300px` | `$size-error-section` |
| `.error-section` `margin: 200px` | `$size-skull` (`200px`, same literal as the skull size) |
| `.error-section p` `padding: 0 25px`, `margin-top: 25px` | `$space-0`, `$space-25` |
| `.error-section` mobile `margin: 30vh 0` | vh values are not tokenized |
| `.skull` `width`/`height: $skull-size` | `$size-skull` (currently `$skull-size` from `_theme_variables.scss`) |
| `.head` `border-radius: 15% / 20%` | `$radius-skull-head` |
| `&:before, &:after` `border-radius: 50%` | `$radius-circle` |
| `.mouth` `border-radius: 0 0 $skull-size / 10 …` | derived from `$size-skull` |
| `.mouth:before` `border-radius: 50% / 30%` | `$radius-skull-nose` |
| `.teeth` `border-radius: 50% / 20%` | `$radius-skull-teeth` |
| media query | `$mobile-only` |

Note: the skull geometry divides `$skull-size` (`200px`) by 8/10/15/20/40. Those divisions must
keep using a single size token so the proportions stay intact.

## LoaderComponent

- Selector: `app-loader`, styles `src/app/shared/components/loader/loader.component.scss`
- `@Input` / `@Output`: none
- Usage: placeholder spinner while a feed, item or user request is in flight.

| Declaration | Token |
| --- | --- |
| `.loading-section` `height: 70px` | `$size-loading-section` |
| `.loading-section` `margin: 40px 0 40px 40px` | `$space-40`, `$space-0` |
| `.loader` `margin: 20px 20px` / mobile `20px auto` | `$space-20` |
| `.loader` `font-size: 11px` | `$font-size-xxs` |
| `em`-based sizes, animation delays, `vh` margins | not tokenized (relative units) |
| media query | `$mobile-only` |

## Do's and don'ts

- DO import tokens with `@import "../../scss/tokens";` from `shared/components/*`.
- DON'T hardcode `200px` for the skull — DO use `$size-skull`.
- DON'T hardcode `px` heights/margins — DO use `$size-*` / `$space-*`.
- DO keep `em`/`vh`/percentage values as they are: they are intentionally relative and are not part
  of the token set.
- DON'T set colors here: the loader and skull colors come from the theme mixin in
  `src/app/shared/scss/_themes.scss`.
