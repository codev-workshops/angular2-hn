---
name: testing-angular2-hn
description: How to run, browse and visually verify the angular2-hn Angular 9 Hacker News PWA, including pixel-neutrality checks for SCSS/design-token refactors, breakpoint probing and theme switching.
---

# Testing angular2-hn (Angular 9 HN PWA)

## Running the app

```bash
cd <repo>
NODE_OPTIONS=--openssl-legacy-provider npx ng serve            # http://localhost:4200
NODE_OPTIONS=--openssl-legacy-provider npx ng serve --port 4300  # second instance (baseline)
NODE_OPTIONS=--openssl-legacy-provider npx ng build            # prod build check
```

Angular 9 fails on modern Node without `NODE_OPTIONS=--openssl-legacy-provider`.
First compile takes ~1-2 minutes; wait for "Compiled successfully".

No credentials are needed — the app is fully public.

## Comparing a branch against a baseline

Use a worktree so the active checkout is untouched:

```bash
git worktree add /tmp/hn-master master
cd /tmp/hn-master && yarn install   # node_modules are not shared
NODE_OPTIONS=--openssl-legacy-provider npx ng serve --port 4300
```

## Routes / UI entry points

- `/news/1` feed (FeedComponent + ItemComponent), `/news/2` via the "More" link, "Prev" to go back
- `/item/<id>` story + threaded comments (`.comment-tree`)
- `/user/<id>` profile — **may be broken**: the app calls
  `https://node-hnapi.herokuapp.com/user/<id>`, which currently returns 404 for valid users even
  though the public Firebase HN API works. Treat a failing user page as a likely upstream/API
  outage, not a regression; verify with
  `curl -s -o /dev/null -w '%{http_code}' https://node-hnapi.herokuapp.com/user/<id>`.
- Settings modal: the cog image in the header (`img.settings`); themes are radios
  `default` / `night` / `amoledblack`. The choice persists in localStorage, so reset to Default
  after theme tests.

## Breakpoints worth exercising

`src/app/shared/scss/_media.scss` is imported by every component:
`$mobile-only` ≤768px, `$laptop-only` ≥769px, `$tablet-only` ≤1024px.
The settings modal has a legacy 700px override (`.box, .popup { width: 70% }`).

Mobile vs laptop is observable without devtools: on mobile the feed shows `.subtext-palm`
(13px, `display:block`) and hides `.subtext-laptop`; `ol` padding drops 40px → 10px;
`.list-margin` margin-top becomes 55px. On item pages `.comment-tree` margin-left is 24px
above 1024px and 8px at/below it.

### Probing exact viewport widths

Browser window resizing may not be available, and mobile emulation gives a fixed width
(e.g. 410px, not 375px). A reliable trick for exact boundary widths (769/768, 1025/1024) is to
load a page on the same origin containing two same-origin iframes of the exact widths, then read
`iframe.contentWindow.getComputedStyle(...)` from the console. Note the iframe's inner document is
a few px narrower than the iframe element (border/scrollbar), so set the iframe slightly wider
than the target.

## Pixel-neutrality verification (token/SCSS refactors)

1. Dump computed styles on both ports at the same viewport for the affected selectors
   (`ol`, `.post`, `.title`, `.domain`, `.subtext-laptop`, `.subtext-palm`, `.nav`) and diff.
2. Screenshot `/news/1` on both ports and pixel-diff:
   ```python
   from PIL import Image, ImageChops
   d = ImageChops.difference(Image.open(a).convert('RGB'), Image.open(b).convert('RGB'))
   print(d.getbbox())   # None == identical
   ```
   HN content is served identically to both ports, so a clean run really does give bbox `None`.
   **Gotcha:** a screenshot taken immediately after toggling mobile emulation off can be a stale
   frame and produces a bogus diff — re-navigate and re-capture before believing any difference.
3. `.itemNum` in `feed.component.scss` is dead CSS (no template renders it); the visible numbers
   come from the `ol` list marker. Rules on it cannot be verified visually.

## Devin Secrets Needed

None.
