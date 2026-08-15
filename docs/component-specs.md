# Component specs

Migration contract for the design-system work. For each component: its selector, the CSS
classes its stylesheet owns, and the token every currently-hardcoded value SHOULD map to.

Nothing here has been applied yet — this document is the target state. Later PRs change
component SCSS to match it, one component family at a time. A row marked **keep literal**
is intentionally excluded from tokenization (layout-only percentages, `vh`/`vw`/`em` units,
animation timings, geometry that is not part of the spacing or type scale).

Token definitions live in `src/app/shared/scss/_tokens.scss`; breakpoint names live in
`src/app/shared/scss/_breakpoints.scss`.

---

## AppComponent

**Selector:** `app-root` — **Stylesheet:** `src/app/app.component.scss`

**Owns:** `.body-cover`, `.wrapper`

| Selector | Property | Current | Target |
| --- | --- | --- | --- |
| `.wrapper` | `font-family` | Helvetica Neue stack | `$font-family-base` |
| `.wrapper` | `font-size` | `15px` | `$font-size-md` |
| `.wrapper` | `line-height` | `1.3` | `$line-height-base` |
| `.wrapper` | `min-height` | `80px` | **keep literal** (shell geometry) |
| `.wrapper` | `width` | `85%` / `100%` | **keep literal** (layout) |
| `.body-cover` | `width`, `height` | `100%` | **keep literal** (layout) |
| both | `@media #{$mobile-only}` | `_media.scss` | `#{$breakpoint-mobile}` |

---

## HeaderComponent

**Selector:** `app-header` — **Stylesheet:** `src/app/core/header/header.component.scss`

**Owns:** `#header`, `.home-link`, `.logo-inner`, `.logo`, `h1`, `.name`, `.header-text`,
`.left`, `.header-nav`, `.header-nav .active`, `.info`

| Selector | Property | Current | Target |
| --- | --- | --- | --- |
| `#header` | `color` | `#fff` | `$color-on-accent` |
| `#header` | `padding` | `6px 0` | `$space-2 0` after normalizing 6px → 5px, else **keep literal** until design sign-off |
| `#header` | `line-height` | `18px` | `$font-size-xxl` (18px) as a line-height unit |
| `#header` | `height` (mobile) | `50px` | **keep literal** (header geometry) |
| `.home-link` | `width`, `height` | `50px`, `66px` | **keep literal** (geometry) |
| `.logo-inner` | `width`, `height` | `32px` | `$font-size-display` is 32px but this is geometry → **keep literal** |
| `.logo-inner` | `left`, `top` | `17px`, `18px` / `16px`, `12px` | **keep literal** (absolute positioning) |
| `.logo` | `padding` | `3px 8px 0` | `0 $space-3 0` for the horizontal step; vertical **keep literal** |
| `.logo` | `padding` (mobile) | `0 0 0 10px` | `0 0 0 $space-4` |
| `.logo` | `width` | `50px` / `45px` | **keep literal** (asset size) |
| `h1` | `font-size` | `16px` | `$font-size-lg` |
| `h1 a` | `color` | `#fff` | `$color-on-accent` |
| `.name` | `margin-right` | `30px` | **keep literal** until a `$space-*` step exists for 30px |
| `.name` | `margin-bottom` | `2px` | `$space-0` |
| `.header-text` | `height` | `20px` | `$space-5` |
| `.header-text` | `left` | `10px` | `$space-4` |
| `.header-text` | `top` | `27px` / `22px` | **keep literal** (absolute positioning) |
| `.left` | `font-size` | `16px` | `$font-size-lg` |
| `.left` | `left` | `60px` | **keep literal** (absolute positioning) |
| `.header-nav` | `margin-left` | `20px` | `$space-5` |
| `.header-nav` | `margin-left` (mobile) | `60px` | **keep literal** |
| `.header-nav a` | `color` | `hsla(0,0%,100%,.9)` | `$color-on-accent-muted` |
| `.header-nav a` | `margin` | `0 5px` | `0 $space-2` |
| `.header-nav a` | `letter-spacing` | `1.8px` | `$letter-spacing-wide` |
| `.header-nav a:hover`, `.active` | `color` | `#fff` | `$color-on-accent` |
| `.info` | `right` | `20px` / `10px` | `$space-5` / `$space-4` |
| `.info img` | `width` | `25px` | **keep literal** (asset size) |
| `.info img` | `margin-top` | `21.5px` / `15px` | **keep literal** (optical alignment) |
| `.info img` | `opacity` | `0.8` / `1` | **keep literal** |
| all | `@media #{$mobile-only}` | `_media.scss` | `#{$breakpoint-mobile}` |

---

## FooterComponent

**Selector:** `app-footer` — **Stylesheet:** `src/app/core/footer/footer.component.scss`

**Owns:** `#footer`, `#footer a`

| Selector | Property | Current | Target |
| --- | --- | --- | --- |
| `#footer` | `padding` | `10px` | `$space-4` |
| `#footer` | `height` | `60px` | **keep literal** (footer geometry) |
| `#footer` | `letter-spacing` | `0.7px` | `$letter-spacing-tight` (0.5px) only with design sign-off; otherwise **keep literal** |
| `#footer a` | `font-weight`, `text-decoration` | — | no token (non-numeric) |
| `#footer` | `@media #{$mobile-only}` | `_media.scss` | `#{$breakpoint-mobile}` |

---

## SettingsComponent

**Selector:** `app-settings` — **Stylesheet:** `src/app/core/settings/settings.component.scss`

**Owns:** `.overlay`, `.popup`, `.popup h1`, `.popup h2`, `.popup hr`, `.popup .close`,
`.popup .content`, `.popup input[type=number]`, `.control-section`, `.box` (mobile only)

| Selector | Property | Current | Target |
| --- | --- | --- | --- |
| `.overlay` | `background` | `rgba(0, 0, 0, 0.7)` | `$color-overlay` |
| `.popup` | `margin` | `70px auto` | **keep literal** (dialog offset) |
| `.popup` | `padding` | `30px` | **keep literal** until a 30px step is added |
| `.popup` | `border-radius` | `5px` | `$space-2` (5px) as radius, or a dedicated `$radius-*` token in a later PR |
| `.popup` | `width` | `30%` / `70%` | **keep literal** (layout) |
| `.popup h1` | `color` | `#fff` | `$color-on-accent` |
| `.popup h1` | `letter-spacing` | `1px` | **keep literal** until a 1px letter-spacing token is added |
| `.popup h2` | `padding-top` | `10px` | `$space-4` |
| `.popup hr` | `margin-bottom` | `20px` | `$space-5` |
| `.popup hr` | `width` | `40%` | **keep literal** (layout) |
| `.popup .close` | `top`, `right` | `12px`, `20px` | `top` **keep literal**, `right` → `$space-5` |
| `.popup .close` | `font-size` | `30px` | **keep literal** (icon glyph size) |
| `.popup .close` | `color` | `rgba(255,255,255,0.8)` | `$color-on-overlay-muted` |
| `.popup .close:hover` | `color` | `#fff` | `$color-on-accent` |
| `.popup .content` | `color` | `#fff` | `$color-on-accent` |
| `.popup .content` | `letter-spacing` | `1px` | **keep literal** (see `.popup h1`) |
| `.popup input[type=number]` | `height` | `20px` | `$space-5` |
| `.popup input[type=number]` | `margin-bottom` | `15px` | **keep literal** until a 15px step is added |
| `.popup input[type=number]` | `border-radius` | `5px` | `$space-2` / future `$radius-*` |
| `.popup input[type=number]` | `padding` | `2px` | `$space-0` |
| `.control-section` | `margin-bottom`, `padding-bottom` | `15px` | **keep literal** (see above) |
| `.control-section` | `border-bottom` | `1px solid white` | `$border-width-hairline solid $color-on-accent` |
| `.box`, `.popup` | `@media screen and (max-width: 700px)` | inline literal | `#{$breakpoint-mobile}` — **deviation, migrate in a later PR** (changes the query from 700px to 768px, so it needs explicit sign-off) |

---

## FeedComponent

**Selector:** `app-feed` — **Stylesheet:** `src/app/feeds/feed/feed.component.scss`

**Owns:** `a`, `ol`, `ol li`, `.list-margin`, `.main-content`, `.post`, `.post .itemNum`,
`.item-block`, `.nav`, `.nav .prev`, `.nav .more`, `.job-header`

| Selector | Property | Current | Target |
| --- | --- | --- | --- |
| `ol` | `padding` | `0 40px` | `0 $space-6` |
| `ol` | `padding` (mobile) | `0 10px` | `0 $space-4` |
| `ol li` | `transition` | `background-color .2s ease` | **keep literal** (motion) |
| `.list-margin` | `margin-top` (mobile) | `55px` | **keep literal** (clears fixed header) |
| `.main-content` | `padding` | `8px 0` | `$space-3 0` |
| `.main-content` | `min-height` | `100vh` | **keep literal** |
| `.post` | `padding` | `10px 0 10px 5px` | `$space-4 0 $space-4 $space-2` |
| `.post` | `border-bottom` | `1px solid #CECECB` | `$border-width-hairline solid $color-hairline` |
| `.post .itemNum` | `color` | `#696969` | `$color-subtext` |
| `.post .itemNum` | `width` | `30px` | **keep literal** (gutter geometry) |
| `.post .itemNum` | `top` | `4px` | `$space-1` |
| `.nav` | `padding` | `10px 40px` | `$space-4 $space-6` |
| `.nav` | `margin-top` | `10px` | `$space-4` |
| `.nav` | `font-size` | `17px` | `$font-size-xl` |
| `.nav` | `margin` (mobile) | `20px 0` | `$space-5 0` |
| `.nav` | `padding` (mobile) | `10px 80px` | `$space-4 ($space-6 * 2)` |
| `.nav` | `height` (mobile) | `20px` | `$space-5` |
| `.nav .prev` | `padding-right` | `20px` | `$space-5` |
| `.job-header` | `font-size` | `15px` | `$font-size-md` |
| `.job-header` | `padding` | `0 40px 10px` | `0 $space-6 $space-4` |
| `.job-header` | `padding` (mobile) | `60px 15px 25px 15px` | **keep literal** (clears fixed header) |
| all | `@media #{$mobile-only}` | `_media.scss` | `#{$breakpoint-mobile}` |

---

## ItemComponent

**Selector:** `item` — **Stylesheet:** `src/app/feeds/item/item.component.scss`

**Owns:** `p`, `a`, `.title`, `.subtext-laptop`, `.subtext-palm`, `.subtext-palm .details`,
`.subtext-palm .details .right`, `.domain`, `.item-details`

Pilot family for Milestone 2 together with `FeedComponent`.

| Selector | Property | Current | Target |
| --- | --- | --- | --- |
| `p` | `margin` | `2px 0` | `$space-0 0` |
| `p` | `margin-bottom` (mobile) | `5px` | `$space-2` |
| `.title` | `font-size` | `16px` | `$font-size-lg` |
| `.title` | `font-family` | `Verdana, Geneva, sans-serif` | `$font-family-alt` |
| `.subtext-laptop` | `font-size` | `12px` | `$font-size-xs` |
| `.subtext-laptop` | `letter-spacing` | `0.5px` | `$letter-spacing-tight` |
| `.subtext-palm` | `font-size` | `13px` | `$font-size-sm` |
| `.subtext-palm` | `letter-spacing` | `0.5px` | `$letter-spacing-tight` |
| `.subtext-palm .details` | `margin-top` | `5px` | `$space-2` |
| `.domain` | `color` | `#696969` | `$color-subtext` |
| `.domain` | `letter-spacing` | `0.5px` | `$letter-spacing-tight` |
| `.item-details` | `padding` | `10px` | `$space-4` |
| `.subtext-laptop` | `@media #{$mobile-only}` | `_media.scss` | `#{$breakpoint-mobile}` |
| `.subtext-palm` | `@media #{$laptop-only}` | `_media.scss` | `#{$breakpoint-laptop}` |

---

## CommentComponent

**Selector:** `app-comment` — **Stylesheet:** `src/app/item-details/comment/comment.component.scss`

**Owns:** `:host >>> a`, `.meta`, `.meta .time`, `.meta-collapse`, `.deleted-meta`,
`.collapse`, `.comment-tree`, `.comment-text`, `.subtree`

| Selector | Property | Current | Target |
| --- | --- | --- | --- |
| `.meta` | `font-size` | `13px` | `$font-size-sm` |
| `.meta` | `color` | `#696969` | `$color-subtext` |
| `.meta` | `letter-spacing` | `0.5px` | `$letter-spacing-tight` |
| `.meta` | `margin-bottom` | `8px` | `$space-3` |
| `.meta .time` | `padding-left` | `5px` | `$space-2` |
| `.meta` (mobile) | `font-size` | `14px` | **keep literal**; 14px is not on the scale — normalize to `$font-size-sm` or `$font-size-md` with design sign-off |
| `.meta` (mobile) | `margin-bottom` | `10px` | `$space-4` |
| `.meta-collapse` | `margin-bottom` | `20px` | `$space-5` |
| `.deleted-meta` | `font-size` | `12px` | `$font-size-xs` |
| `.deleted-meta` | `letter-spacing` | `0.5px` | `$letter-spacing-tight` |
| `.deleted-meta` | `margin` | `30px 0` | **keep literal** until a 30px step is added |
| `.collapse` | `font-size` | `13px` | `$font-size-sm` |
| `.collapse` | `letter-spacing` | `2px` | `$letter-spacing-wider` |
| `.comment-tree` | `margin-left` | `24px` | **keep literal** (indent unit; candidate for a dedicated token) |
| `.comment-tree` (tablet) | `margin-left` | `8px` | `$space-3` |
| `.comment-text` | `font-size` | `15px` | `$font-size-md` |
| `.comment-text` | `margin-bottom` | `20px` | `$space-5` |
| `.comment-text` | `line-height` | `1.5em` | **keep literal**; differs from `$line-height-base` (1.3) by design |
| `.meta` | `@media #{$mobile-only}` | `_media.scss` | `#{$breakpoint-mobile}` |
| `.comment-tree` | `@media #{$tablet-only}` | `_media.scss` | `#{$breakpoint-tablet}` |

---

## ItemDetailsComponent

**Selector:** `app-item-details` — **Stylesheet:** `src/app/item-details/item-details.component.scss`

**Owns:** `.main-content`, `.item`, `.head-margin`, `p`, `.subject`, `a`, `.laptop`,
`.mobile`, `.title`, `.title-block`, `.back-button`, `.subtext`, `.subtext a`, `.domain`,
`.item-details`, `.item-header`, `.pollResults`, `.pollContent`, `.pollContent .pollBar`,
`ul`, `li`

| Selector | Property | Current | Target |
| --- | --- | --- | --- |
| `.main-content` | `padding` | `8px 0` | `$space-3 0` |
| `.item` | `padding` | `10px 40px 0 40px` | `$space-4 $space-6 0 $space-6` |
| `.item` (tablet) | `padding` | `10px 20px 0 40px` | `$space-4 $space-5 0 $space-6` |
| `.item` (mobile) | `padding` | `110px 15px 0 15px` | **keep literal** (clears fixed header) |
| `.head-margin` | `margin-bottom` | `15px` | **keep literal** until a 15px step is added |
| `p` | `margin` | `2px 0` | `$space-0 0` |
| `.subject` | `margin-top` | `20px` | `$space-5` |
| `.title` | `font-size` | `16px` | `$font-size-lg` |
| `.title` | `font-family` | `Verdana, Geneva, sans-serif` | `$font-family-alt` |
| `.title` (mobile) | `font-size` | `15px` | `$font-size-md` |
| `.title-block` | `margin` | `0 75px` | **keep literal** (clears back button + actions) |
| `.back-button` | `width`, `height`, `top`, `left`, `transform` | `0.6rem`, `52%`, `4%`, … | **keep literal** (icon geometry) |
| `.back-button` | `transition` | `all 200ms ease` | **keep literal** (motion) |
| `.subtext` | `font-size` | `12px` | `$font-size-xs` |
| `.subtext` | `letter-spacing` | `0.5px` | `$letter-spacing-tight` |
| `.domain` | `letter-spacing` | `0.5px` | `$letter-spacing-tight` |
| `.item-details` | `padding` | `10px` | `$space-4` |
| `.item-header` | `padding-bottom` | `10px` | `$space-4` |
| `.item-header` (mobile) | `padding` | `10px 0 10px 0` | `$space-4 0` |
| `.item-header` (mobile) | `top` | `62px` | **keep literal** (header height offset) |
| `.pollResults` | `margin-bottom` | `1em` | **keep literal** (em-relative) |
| `.pollContent *` | `margin-bottom`, `margin-top` | `-1em`, `1em` | **keep literal** (em-relative) |
| `.pollContent .pollBar` | `height` | `10px` | `$space-4` |
| `.pollContent .pollBar` | `margin-bottom` | `1em` | **keep literal** |
| `ul` | `padding` | `10px 0` | `$space-4 0` |
| all | `@media #{$mobile-only}` / `#{$tablet-only}` / `#{$laptop-only}` | `_media.scss` | `#{$breakpoint-mobile}` / `#{$breakpoint-tablet}` / `#{$breakpoint-laptop}` |

---

## ErrorMessageComponent

**Selector:** `app-error-message` — **Stylesheet:** `src/app/shared/components/error-message/error-message.component.scss`

**Owns:** `.error-section`, `.error-section p`, `.error-section p.strong`, `.skull`,
`.skull .head`, `.skull .head .crack`, `.skull .mouth`, `.skull .mouth .teeth`

The skull is pure decorative geometry driven by `$skull-size` and percentages; only the
outer spacing is tokenizable.

| Selector | Property | Current | Target |
| --- | --- | --- | --- |
| `.error-section` | `height` | `300px` | **keep literal** (illustration box) |
| `.error-section` | `margin` | `200px` | **keep literal** (illustration box) |
| `.error-section` (mobile) | `margin` | `30vh 0` | **keep literal** (viewport-relative) |
| `.error-section p` | `padding` | `0 25px` | **keep literal** until a 25px step is added |
| `.error-section p.strong` | `margin-top` | `25px` | **keep literal** (see above) |
| `.skull` and descendants | sizes, radii, offsets | `$skull-size`, `%` | **keep literal** — decorative geometry; `$skull-size` stays in `_theme_variables.scss` |
| `.error-section` | `@media #{$mobile-only}` | `_media.scss` | `#{$breakpoint-mobile}` |

Colors for the skull come from the `theme()` mixin in `_themes.scss`, not from this file, and
stay there.

---

## LoaderComponent

**Selector:** `app-loader` — **Stylesheet:** `src/app/shared/components/loader/loader.component.scss`

**Owns:** `.loader`, `.loader:before`, `.loader:after`, `.loading-section`, `@keyframes load1`

| Selector | Property | Current | Target |
| --- | --- | --- | --- |
| `.loading-section` | `height` | `70px` | **keep literal** (spinner box) |
| `.loading-section` | `margin` | `40px 0 40px 40px` | `$space-6 0 $space-6 $space-6` |
| `.loading-section` (mobile) | `margin` | `45vh 0` | **keep literal** (viewport-relative) |
| `.loader` | `margin` | `20px 20px` | `$space-5 $space-5` |
| `.loader` (mobile) | `margin` | `20px auto` | `$space-5 auto` |
| `.loader` | `font-size` | `11px` | **keep literal** — drives the `em`-based spinner geometry, not text |
| `.loader` | `width`, `height`, `left` | `1em`, `4em`, `-1.5em` | **keep literal** (em-relative geometry) |
| `.loader` | `text-indent` | `-9999em` | **keep literal** (a11y text hiding) |
| `.loader` | `animation`, `animation-delay` | `1s`, `-0.32s`, `-0.16s` | **keep literal** (motion) |
| `@keyframes load1` | `box-shadow`, `height` | `em` values | **keep literal** (motion) |
| all | `@media #{$mobile-only}` | `_media.scss` | `#{$breakpoint-mobile}` |

Loader colors come from the `theme()` mixin and stay there.

---

## UserComponent

**Selector:** `app-user` — **Stylesheet:** `src/app/user/user.component.scss`

**Owns:** `:host >>> pre`, `.profile`, `.title-block`, `.back-button`, `.item-header`,
`.mobile`, `.main-details`, `.main-details .name`, `.main-details .age`,
`.main-details .right`, `.other-details`

| Selector | Property | Current | Target |
| --- | --- | --- | --- |
| `.profile` | `padding` | `30px` | **keep literal** until a 30px step is added |
| `.profile` (mobile) | `padding` | `110px 15px 0 15px` | **keep literal** (clears fixed header) |
| `.title-block` (mobile) | `font-size` | `15px` | `$font-size-md` |
| `.title-block` (mobile) | `margin` | `0 75px` | **keep literal** (clears back button) |
| `.back-button` | geometry / `transition` | `0.6rem`, `52%`, `4%`, `200ms` | **keep literal** |
| `.item-header` (mobile) | `padding-bottom` | `10px` | `$space-4` |
| `.item-header` (mobile) | `background-color` | `#fff` | `$color-surface-mobile` — better: move to the `theme()` mixin so night/amoled stop being overridden |
| `.item-header` (mobile) | `padding` | `10px 0 10px 0` | `$space-4 0` |
| `.item-header` (mobile) | `top` | `62px` | **keep literal** (header height offset) |
| `.item-header` (mobile) | `height` | `20px` | `$space-5` |
| `.main-details .name` | `font-size` | `32px` | `$font-size-display` |
| `.main-details .name` | `letter-spacing` | `2px` | `$letter-spacing-wider` |
| `.main-details .name` (mobile) | `font-size` | `18px` | `$font-size-xxl` |
| `.main-details .age` | `color` | `#696969` | `$color-subtext` |
| `.main-details .right` | `font-size` | `32px` | `$font-size-display` |
| `.main-details .right` | `letter-spacing` | `2px` | `$letter-spacing-wider` |
| `.main-details .right` (mobile) | `font-size` | `18px` | `$font-size-xxl` |
| `.main-details` (mobile) | `margin-top` | `20px` | `$space-5` |
| all | `@media #{$mobile-only}` / `#{$laptop-only}` | `_media.scss` | `#{$breakpoint-mobile}` / `#{$breakpoint-laptop}` |

---

## Global stylesheet (not a component)

`src/styles.scss` also carries hardcoded values that belong to the same contract:

| Selector | Property | Current | Target |
| --- | --- | --- | --- |
| `.app-loader` (in `@media screen and (max-width: 768px)`) | `background-color` | `#fff` | `$color-page-background` |
| that block | media query | raw `768px` literal | `#{$breakpoint-mobile}` — **deviation, migrate in a later PR** |
| `app-root:empty + .app-loader .logo` | `width` | `20vh` | **keep literal** (viewport-relative) |
