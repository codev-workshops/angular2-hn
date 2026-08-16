# Spec: `item-details/` family

Components: `ItemDetailsComponent`, `CommentComponent` (`src/app/item-details/**`, lazy loaded).

Migration status: **migrated** — both component stylesheets consume the existing SCSS design
tokens without changing compiled CSS.

## ItemDetailsComponent

- Selector: `app-item-details`, styles `src/app/item-details/item-details.component.scss`
- Migration status: **migrated**
- Tokens consumed: `$space-2`, `$space-8`, `$space-10`, `$space-15`, `$space-20`, `$space-40`,
  `$space-75`, `$space-110`, `$space-62`, `$font-size-xs`, `$font-size-base`, `$font-size-lg`,
  `$font-family-title`, `$color-named-lightgray`, `$letter-spacing-tight`, `$size-poll-bar`
- `@Input` / `@Output`: none — the item id comes from the route params.
- Public members: `item: Story`, `errorMessage: string`, `settings: Settings`, `goBack()`
- Usage: routed detail page for a story or poll; renders the header, the story body and the
  comment tree (`app-comment` per top-level comment).

| Declaration | Token |
| --- | --- |
| `.main-content` `padding: 8px 0` | `$space-8`, bare `0` |
| `.item` `padding: 10px 40px 0 40px` | `$space-10`, `$space-40`, bare `0` |
| `.item` tablet `padding: 10px 20px 0 40px` | `$space-10`, `$space-20`, `$space-40`, bare `0` |
| `.item` mobile `padding: 110px 15px 0 15px` | `$space-110`, `$space-15`, bare `0` |
| `.head-margin` `margin-bottom: 15px` | `$space-15` |
| `p` `margin: 2px 0` | `$space-2`, bare `0` |
| `.subject` `margin-top: 20px` | `$space-20` |
| `.title` `font-size: 16px` / mobile `15px` | `$font-size-lg`, `$font-size-base` |
| `.title` `font-family: Verdana, Geneva, sans-serif` | `$font-family-title` |
| `.title-block` `margin: 0 75px` | bare `0`, `$space-75` |
| `.back-button` `box-shadow: 0 0 0 lightgray` | `$color-named-lightgray` |
| `.subtext` `font-size: 12px` | `$font-size-xs` |
| `letter-spacing: 0.5px` (`.subtext`, `.domain`) | `$letter-spacing-tight` |
| `.item-details` `padding: 10px`, `.item-header` `padding-bottom: 10px` | `$space-10` |
| `.item-header` mobile `padding: 10px 0 10px 0`, `top: 62px` | `$space-10`, bare `0`, `$space-62` |
| `.pollContent .pollBar` `height: 10px` | `$size-poll-bar` |
| `ul` `padding: 10px 0` | `$space-10`, bare `0` |
| media queries | `$mobile-only`, `$laptop-only`, `$tablet-only` |

## CommentComponent

- Selector: `app-comment`, styles `src/app/item-details/comment/comment.component.scss`
- Migration status: **migrated**
- Tokens consumed: `$font-size-sm`, `$font-size-md`, `$font-size-xs`, `$font-size-base`,
  `$color-subtext`, `$letter-spacing-tight`, `$letter-spacing-wide`, `$space-5`, `$space-8`,
  `$space-10`, `$space-20`, `$space-24`, `$space-30`, `$line-height-comment`
- `@Input`: `comment: Comment`
- `@Output`: none
- Public members: `collapse: boolean`
- Usage: recursive comment node — renders its own meta line plus a `.subtree` of child
  `app-comment` instances; collapsible.

| Declaration | Token |
| --- | --- |
| `.meta` `font-size: 13px` / mobile `14px` | `$font-size-sm`, `$font-size-md` |
| `.meta` `color: #696969` | `$color-subtext` |
| `.meta` `letter-spacing: 0.5px` | `$letter-spacing-tight` |
| `.meta` `margin-bottom: 8px` / mobile `10px` | `$space-8`, `$space-10` |
| `.meta .time` `padding-left: 5px` | `$space-5` |
| `.meta-collapse` `margin-bottom: 20px` | `$space-20` |
| `.deleted-meta` `font-size: 12px`, `margin: 30px 0` | `$font-size-xs`, `$space-30`, bare `0` |
| `.collapse` `font-size: 13px`, `letter-spacing: 2px` | `$font-size-sm`, `$letter-spacing-wide` |
| `.comment-tree` `margin-left: 24px` / tablet `8px` | `$space-24`, `$space-8` |
| `.comment-text` `font-size: 15px`, `margin-bottom: 20px`, `line-height: 1.5em` | `$font-size-base`, `$space-20`, `$line-height-comment` |
| media queries | `$mobile-only`, `$tablet-only` |

## Do's and don'ts

- DO import tokens with `@import "../shared/scss/tokens";` (or `../../shared/scss/tokens` from
  `comment/`).
- Unitless `0` values stay literal: do not use `$space-0`, because that token resolves to `0px`
  and would change the compiled CSS bytes.
- DON'T hardcode `#696969` — DO use `$color-subtext`.
- DON'T hardcode `0.5px` letter spacing — DO use `$letter-spacing-tight`.
- DON'T hardcode indentation px for the comment tree — DO use the `$space-*` scale.
- DON'T rely on theme colors here; theme-dependent colors are applied by
  `src/app/shared/scss/_themes.scss` via the `.subtext` / `.meta` / `.deleted-meta` classes.
