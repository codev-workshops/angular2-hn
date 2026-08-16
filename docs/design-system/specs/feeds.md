# Spec: `feeds/` family

Components: `FeedComponent`, `ItemComponent` (`src/app/feeds/**`).

Migration status: **not migrated yet** — this family is the designated pilot for the token
migration (it holds the canonical duplicated colors `#696969` / `#CECECB` and many raw px values,
and is self-contained).

## FeedComponent

- Selector: `app-feed`, styles `src/app/feeds/feed/feed.component.scss`
- `@Input` / `@Output`: none — the feed type comes from the route data and the page number from
  the route params.
- Public members: `items: Story[]`, `feedType: string`, `pageNum: number`, `listStart: number`,
  `errorMessage: string`
- Usage: routed component rendering the paginated ordered list of stories; renders one
  `<item>` per story plus the prev/more navigation.

Tokens it should consume:

| Declaration | Token |
| --- | --- |
| `ol` `padding: 0 40px` / mobile `0 10px` | `$space-0`, `$space-40`, `$space-10` |
| `.list-margin` mobile `margin-top: 55px` | `$space-55` |
| `.main-content` `padding: 8px 0` | `$space-8`, `$space-0` |
| `.post` `padding: 10px 0 10px 5px` | `$space-10`, `$space-0`, `$space-5` |
| `.post` `border-bottom: 1px solid #CECECB` | `$border-hairline-light` (`$border-width-hairline`, `$color-border-light`) |
| `.post .itemNum` `color: #696969` | `$color-subtext` |
| `.post .itemNum` `width: 30px`, `top: 4px` | `$size-item-num`, `$space-4` |
| `.nav` `padding: 10px 40px`, `margin-top: 10px`, `font-size: 17px` | `$space-10`, `$space-40`, `$font-size-xl` |
| `.nav` mobile `margin: 20px 0`, `padding: 10px 80px`, `height: 20px` | `$space-20`, `$space-0`, `$space-10`, `$space-80` |
| `.nav .prev` `padding-right: 20px` | `$space-20` |
| `.job-header` `font-size: 15px`, `padding: 0 40px 10px` | `$font-size-base`, `$space-0`, `$space-40`, `$space-10` |
| `.job-header` mobile `padding: 60px 15px 25px 15px` | `$space-60`, `$space-15`, `$space-25` |
| media queries | `$mobile-only` (from `$bp-mobile-max`) |

## ItemComponent

- Selector: `item`, styles `src/app/feeds/item/item.component.scss`
- `@Input`: `item: Story`
- `@Output`: none
- Public members: `settings: Settings`, `hasUrl: boolean` (getter)
- Usage: a single row inside the feed list; renders the title/domain plus a laptop and a palm
  variant of the subtext.

Tokens it should consume:

| Declaration | Token |
| --- | --- |
| `p` `margin: 2px 0`, mobile `margin-bottom: 5px` | `$space-2`, `$space-0`, `$space-5` |
| `.title` `font-size: 16px` | `$font-size-lg` |
| `.title` `font-family: Verdana, Geneva, sans-serif` | `$font-family-title` |
| `.subtext-laptop` `font-size: 12px` | `$font-size-xs` |
| `.subtext-palm` `font-size: 13px` | `$font-size-sm` |
| `letter-spacing: 0.5px` (`.subtext-laptop`, `.subtext-palm`, `.domain`) | `$letter-spacing-tight` |
| `.subtext-palm .details` `margin-top: 5px` | `$space-5` |
| `.domain` `color: #696969` | `$color-subtext` |
| `.item-details` `padding: 10px` | `$space-10` |
| media queries | `$mobile-only`, `$laptop-only` (from `$bp-mobile-max` / `$bp-laptop-min`) |

## Do's and don'ts

- DO import tokens with `@import "../../shared/scss/tokens";` (relative path — no `includePaths`).
- DON'T hardcode `#696969` — DO use `$color-subtext`.
- DON'T hardcode `1px solid #CECECB` — DO use `$border-hairline-light`.
- DON'T hardcode px paddings/margins — DO use the `$space-*` scale.
- DON'T write raw media strings — DO use `$mobile-only` / `$laptop-only`.
- DON'T change a token value to tweak this family; add a token and update `tokens.json`.
