# angular2-hn — React port

A React (Vite + TypeScript) port of the Angular 9 Hacker News reader that lives in the repository
root. Both apps can run side by side and render byte-for-byte identical UIs:

```bash
npm start                    # Angular, http://localhost:4200 (repo root)
cd react-app && npm run dev  # React,   http://localhost:5173
```

## Layout

| Angular                                | React                                     |
| -------------------------------------- | ----------------------------------------- |
| `src/app/shared/models/*`              | `src/models/*`                            |
| `HackerNewsAPIService`                 | `src/api/hackerNews.ts` (`fetch`)         |
| `SettingsService`                      | `src/context/SettingsContext.tsx`         |
| `CommentPipe`                          | `src/utils/formatCommentCount.ts`         |
| `DomSanitizer` on `[innerHTML]`        | `src/utils/sanitizeHtml.ts`               |
| `src/app/shared/scss/*`, `src/styles.scss` | `src/styles/*`                        |
| component `.html`/`.ts`/`.scss` triples | `src/components/<Name>/<Name>.{tsx,scss}` |
| `@angular/service-worker` + `ngsw-config.json` | `vite-plugin-pwa`                 |

Routing mirrors `src/app/app.routes.ts`, including the lazily loaded item and user views
(`React.lazy` + `Suspense`).

## Verifying visual parity

`parity/compare.mjs` drives both apps through Playwright and diffs full-page screenshots with
pixelmatch; `parity/interact.mjs` does the same for interaction flows (collapsing comments, every
settings control, pagination, navigation, hover/focus states) and additionally compares the
resulting URL, `localStorage` and link `target`/`rel` after each step.

```bash
npx playwright install chromium
npm run parity           # 64 route × theme × viewport × settings-state combinations
npm run parity:interact  # 19 interaction steps
```

Both apps are served the same API payloads: the recorded responses in `parity/fixtures/` are
replayed via request interception, so runs are deterministic. As of the last run every case reports
`mismatch=0`.

`parity/fixtures/…/user/pg.json` records what the live API actually returns for a profile
(`Cannot GET /user/pg` — the deployed `node-hnapi` no longer exposes `/user/:id`), so both apps show
the same error state there. `user/testuser.json` is a hand-written payload used to exercise the
profile view itself.

## Intentional deviations

Everything user-visible is reproduced as-is; the only deliberate differences are places where the
Angular code could not be copied literally.

- **Polls.** `HackerNewsAPIService.fetchItemContent` mutates `story.poll` after the observable has
  emitted. `fetchItemContent` awaits all poll option requests with `Promise.all` before resolving,
  because React renders from the resolved value.
- **`>>>` selectors.** `comment.component.scss` and `user.component.scss` wrap rules in
  `:host >>> { … }`. Angular 9 removed `>>>`, so those rules never applied — they are omitted here
  (keeping them would bold and un-underline links inside comment bodies). See the comments in
  `src/components/Comment/Comment.scss` and `src/components/User/User.scss`.
- **`sanitizeHtml`.** Angular routes `[innerHTML]` through `DomSanitizer`, which re-serializes the
  markup with non-ASCII characters as numeric character references. That has a visible side effect:
  stray windows-1252 control characters in old comments come back as typographic quotes instead of
  "missing glyph" boxes. `src/utils/sanitizeHtml.ts` reproduces that (and the element/attribute
  allow-listing) for the four `[innerHTML]` bindings.
- **Global CSS order.** Angular always injects component styles after global styles. Component
  styles here therefore have to be imported after `styles/styles.scss`, which is why the global
  imports live in `src/main.tsx` rather than in `App.tsx`.
- **Dead header rules.** `header.component.scss` styles `h1`/`.name`, which the header template does
  not contain. Under Angular's emulated encapsulation those rules cannot reach the settings popup;
  here they are scoped to `#header` so they stay inert.
- **Text nodes.** Angular compiles `({{item.domain}})` and friends into a single text node and drops
  whitespace-only nodes (`preserveWhitespaces: false`). JSX is written to produce the same text
  nodes (e.g. `` {`(${item.domain})`} ``) because splitting them changes glyph rasterisation.
- **Font size / list spacing inputs.** The Angular template updates them on `(keyup)` with a one-way
  `[value]` binding, so the inputs are uncontrolled here with `onKeyUp` handlers rather than
  controlled React inputs, which would also react to spinners and paste.
