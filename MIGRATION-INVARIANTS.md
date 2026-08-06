# angular2-hn migration invariants (derived from legacy Angular 9 sources)

These are the contracts the frozen Playwright parity suite depends on. They must be
byte-identical in behavior after the port.

## Implementation constraints
- Use route-level `lazy` in the data router, never bare `React.lazy`, because the specs assert immediately after navigation.
- Angular templates preserve inter-element whitespace while JSX collapses whitespace across newlines; compare rendered `textContent` and use explicit `{' '}` separators when porting templates.
- Tolerate `null` and non-array response bodies on every read.
- Use `sanitizeHtml` from `web/src/lib/html.ts` and never raw `dangerouslySetInnerHTML`.
- Guard `window.ga`.
- Class names and DOM structure are a frozen contract.

## HTTP contract (src/app/shared/services/hackernews-api.service.ts)
- Base URL: `https://node-hnapi.herokuapp.com`
- `fetchFeed(feedType, page)` -> GET `${base}/${feedType}?page=${page}` -> `Story[]`
- `fetchItemContent(id)`     -> GET `${base}/item/${id}` -> `Story`
  - if `story.type === 'poll'`: for i in 1..story.poll.length, GET `${base}/item/${story.id + i}`
    and assign into `story.poll[i-1]`, accumulating `story.poll_votes_count += points`.
- `fetchUser(id)`            -> GET `${base}/user/${id}` -> `User`
- No auth header, no credentials, no interceptors, no `window.__debug__` hook.
- Errors: any fetch rejection or non-JSON body -> observable error -> component sets a
  human error message. HTTP non-2xx statuses are NOT treated as errors by `fetch`; the
  body is `.json()`-parsed and passed through. A non-JSON body (e.g. HTML 500 page)
  rejects at `.json()` and surfaces as an error.

## Loading / empty / malformed tolerance (CRITICAL for React)
- Feed: `items: Story[]` starts `undefined`. Loader shows while `!items && errorMessage === ''`.
  - body `[]`  -> `items` truthy -> renders `<ol>` with zero `<li>`, no Prev (page 1), no More.
  - body `null`/`undefined` -> `items` stays falsy and `errorMessage` stays '' -> LOADER STAYS FOREVER.
  - body an object (not array) -> `items` truthy, `*ngFor` over non-iterable renders nothing (no crash).
  React must reproduce these WITHOUT crashing/unmounting the tree.
- Item details: `item` starts undefined; loader while `!item && errorMessage === ''`; on
  error -> `errorMessage = 'Could not load item comments.'`
- User: loader while `!user && errorMessage === ''`; on error -> `errorMessage = 'Could not load user ' + userID + '.'`
- Feed error message: `'Could not load ' + feedType + ' stories.'`

## Routes (src/app/app.routes.ts)
- `''` -> redirect to `/news/1` (pathMatch full)
- `/news/:page`, `/newest/:page`, `/show/:page`, `/ask/:page`, `/jobs/:page` (FeedComponent, feedType from route data)
- `/item/:id` (lazy module), `/user/:id` (lazy module)

## localStorage contract (src/app/shared/services/settings.service.ts)
| key                | type                      | default |
|--------------------|---------------------------|---------|
| `openLinkInNewTab` | JSON boolean (`"true"`)   | `false` |
| `theme`            | raw string                | see below |
| `titleFontSize`    | raw string                | `'16'`  |
| `listSpacing`      | raw string                | `'0'`   |
- Theme init: if `localStorage.theme` set -> use it. Else derive from
  `window.matchMedia('(prefers-color-scheme: dark)')`: matches -> `'night'`, else `'default'`.
  NOTE: the derived-from-media path does NOT write to localStorage (only `setTheme` does),
  but the legacy code reaches `setTheme` via a synthetic MediaQueryListEvent dispatch, so
  first load DOES persist the derived theme. Preserve that.
- Live `change` on the media query switches theme to `'night'`/`'default'` and persists.
- Theme values: `default` | `night` | `amoledblack`
- `showSettings` is in-memory only (never persisted), default `false`.

## DOM contract (class names / structure must be preserved exactly)
### App shell (app.component.html)
```
<div class="{{theme}}">          <!-- theme class: default | night | amoledblack -->
  <div class="body-cover"></div>
  <div class="wrapper">
    header ... router outlet ... footer
```
### Header (core/header)
`header > #header`; `a.home-link` -> `/news/1` containing `div.logo-inner` + `img.logo`
(`assets/images/logo.svg`, alt `Logo`); `.header-text > .left > span.header-nav` with 4
anchors `new`/`show`/`ask`/`jobs` -> `/newest/1`,`/show/1`,`/ask/1`,`/jobs/1` separated by
literal `|` text; `.info > img.settings` (`assets/images/cog.svg`, alt `Settings`, click
toggles settings); `<app-settings>` rendered only when `showSettings`.
All nav links use Angular `routerLinkActive="active"` -> active link gets class `active`.
Clicking a nav link also calls `window.scrollTo(0,0)`.

### Footer
`div#footer > p` with text `Show this project some ❤ on ` + `a[href="https://github.com/hdjirdeh/angular2-hn"][target=_blank][rel=noopener]` "GitHub"

### Settings panel (core/settings)
`div#popup1.overlay > div.popup` containing `h1` "Settings", `hr`, `span.close` (&times;,
click closes), `div.content`:
- `.control-section` with `h2` "Links" + `input[type=checkbox]` (checked = openLinkInNewTab) + text "Open links in a new tab"
- `.theme-controls` with two `.control-section`s:
  - `h2` "Select a theme" + 3 `label > input[name=theme][type=radio][value=default|night|amoledblack]`, labels "Default", "Night", "Black (AMOLED)"; `click` sets theme
  - `h2` "Change Font" + `label` "Font size:" `input[type=number][min=1]` (value = titleFontSize, `keyup` -> setFont)
    and `label` "List spacing:" `input[type=number][min=0]` (value = listSpacing, `keyup` -> setSpacing)
    (both these number inputs also carry `name="theme"` in the legacy markup - keep it)

### Feed (feeds/feed)
`div.main-content`; `<app-loader>` while loading; `<app-error-message [message]>` on error.
When loaded:
- jobs only: `p.job-header` with the Triplebyte blurb + `a[href="https://triplebyte.com/?ref=yc_jobs"]`
- `<ol [class.list-margin]="feedType !== 'jobs'" start="{{listStart}}">` where
  `listStart = (pageNum - 1) * 30 + 1`
- each `li.post > item.item-block` (custom element tag name `item` with class `item-block`)
- `div.nav` with `a.prev` "‹ Prev" -> `/{feedType}/{page-1}` shown only when `listStart !== 1`,
  and `a.more` "More ›" -> `/{feedType}/{page+1}` shown only when `items.length === 30`
- on load complete: `window.scrollTo(0, 0)`

### Story item (feeds/item)
Outer `div` with inline style `margin-bottom: {listSpacing}px`.
- `hasUrl` = `item.url.indexOf('http') === 0`
- hasUrl: `p > a.title[href=item.url]` with inline `font-size: {titleFontSize}px`, plus
  `target="_blank" rel="noopener"` ONLY when `openLinkInNewTab` (otherwise attributes absent),
  then `span.domain` "({{item.domain}})" when `item.domain`
- !hasUrl: `p > a.title` routerLink `/item/{id}` with the same inline font-size
- `div.subtext-palm` (mobile): `div.details` (skipped for type `job`) with
  `span.name > a[/user/{user}]` and `span.right` "{points} ★"; then `div.details` with
  `{{time_ago}}` and (non-job) `a.comment-number[/item/{id}]` " • {{comments_count|comment}}"
- `div.subtext-laptop`: (non-job) `span` "{points} points by " `a[/user/{user}]`; then
  `span [class.item-details]="type !== 'job'"` with `{{time_ago}}` and (non-job) " | " + `a[/item/{id}]` "{{comments_count|comment}}"
- `comment` pipe: `n > 0 ? \`${n} ${n === 1 ? 'comment' : 'comments'}\` : 'discuss'`

### Item details (item-details)
`div.main-content` > loader / error-message / `div.item`:
- `div.mobile.item-header > p.title-block` with `span.back-button` (click -> history back)
  and the title anchor (same hasUrl rule)
- `div.laptop` with `[class.item-header]="comments_count > 0 || type === 'job'"` and
  `[class.head-margin]="item.text"`; title `p`, `span.domain`, then `div.subtext` (same shape as
  `.subtext-laptop` above)
- polls: `div.pollResults > div.pollContent` per poll option: `div[innerHTML=content]`,
  `div.subtext` "{points} points", `div.pollBar` inline `width: points/poll_votes_count*100 %`
- `p.subject` with `innerHTML = item.content`
- `ul.comment-list > li > app-comment`

### Comment (item-details/comment)
- not deleted: `div.meta [class.meta-collapse]="collapse"` containing `span.collapse`
  text `[-]` / `[+]` (click toggles), `a[/user/{user}]`, `span.time` `{{time_ago}}`;
  then `div.comment-tree > div[hidden]` (hidden when collapsed) containing
  `p.comment-text` (innerHTML = comment.content) and `ul.subtree > li > app-comment` recursion
- deleted: `div.deleted-meta > span.collapse` `[deleted]` + literal ` | Comment Deleted`

### Loader (shared/components/loader)
`div.loading-section > div.loader` text `Loading...`

### Error message (shared/components/error-message)
`div.error-section > div.skull(> div.head > div.crack, div.mouth > div.teeth)`,
`p.strong` = message, then a fixed `p` "If you are offline viewing, you'll need to visit this
page with a network connection first before it can work offline."

### User (user)
loader / error-message / `div.profile`:
- `div.mobile.item-header > p.title-block` with `span.back-button` + `Profile: {{user.id}}`
- `div.main-details`: `span.name` = user.id, `span.right` = "{{karma}} ★", `p.age` = "Created {{created}}"
- `div.other-details > p[innerHTML=user.about]` only when `user.about`

## index.html / PWA contract
- `<title>Angular 2 HN</title>`, `<base href="/">`
- meta description / twitter:* / og:* / fb:admins / viewport / theme-color(#b92b27 then #1976d2)
  / msapplication-* / apple-mobile-web-app-*
- `link rel=manifest href=/manifest.json` AND `link rel=manifest href=manifest.webmanifest`
- mask-icon, favicon (x-icon + 32x32 + 16x16 png), 4 apple-touch-icons
- inline `#skip a` style block; `div#skip > a[href="#content"]` "skip to navigation"
- `div.app-loader#content > img.logo` + `noscript` JS-required message
- inline Google Analytics snippet defining `window.ga` then `ga('create','UA-66348622-3','auto')`
- app root: legacy renders into `<app-root>`; `styles.scss` has `app-root:empty + .app-loader { opacity: 1 }`
- Production PWA service worker precaches index/css/js/manifest and static assets; it is not generated or registered during development.
- App shell: `div.app-loader` visible until the root element has content
- `firebase.json` hosting: `public: "dist-react"`, SPA rewrite `** -> /index.html`

## Analytics
`AppComponent` subscribes to router `NavigationEnd` and calls
`ga('set','page',urlAfterRedirects); ga('send','pageview')`. The React port must call the same
if `window.ga` exists, and MUST NOT throw when it does not.
