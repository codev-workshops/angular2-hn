# E2E Baseline (frozen contract)

Recorded 2026-08-05 against the Angular app (`ng serve`, http://localhost:4200, Node 14.21.3)
using the Playwright suite in `e2e-pw/` (Chromium 151, Node 22). The suite was run twice
back-to-back with identical results. From this point the suite is FROZEN: no selector,
assertion, or timeout changes are permitted. The React migration is complete when the same
suite passes against the React app at the same rate.

## Totals

- 20 tests: **18 passed, 2 failed** (stable across two consecutive full runs)

## Passing tests (18)

- app shell (header nav and footer) renders on every deep link
- ask feed page 1 renders a list of stories
- comments can be collapsed and expanded
- deep link to a later feed page numbers items from the correct offset
- deep-linked item page renders title and comment thread
- font size setting changes story title font size
- header navigation links route to feed pages
- jobs feed page 1 renders a list of stories
- jobs feed shows the YC jobs header and no comment links
- navigating from feed to an item shows its details
- newest feed page 1 renders a list of stories
- news feed page 1 renders a list of stories
- news feed paginates with More and Prev, updating list numbering
- open links in new tab setting adds target=_blank to story links
- root URL redirects to /news/1
- show feed page 1 renders a list of stories
- story rows show points, user link and time ago
- theme switching applies the theme class and persists across reloads

## Failing tests (2) — pre-existing backend failures

- deep-linked user profile renders name, karma and created date
- user link on a story navigates to the profile page

Cause: the live API (`https://node-hnapi.herokuapp.com`) returns HTTP 404 for
`/user/:id` (verified: `curl https://node-hnapi.herokuapp.com/user/pg` → 404
"Cannot GET /user/pg"). The Angular app renders its error state
("Could not load user pg."). These failures are expected to remain on React;
parity means the same 18 tests pass and, if the backend endpoint stays down,
the same 2 fail.

## Scope notes

- The repo's historical e2e suite is the default Protractor scaffold (asserts a
  welcome message that does not exist); it is not a usable contract and was left
  untouched. Karma unit suite discovers 0 spec files. `ng lint` has 43
  pre-existing errors on master.
- Offline/service-worker behavior is not covered: both apps are exercised via
  dev servers, which do not register the Workbox service worker (prod-build-only).
  The app-shell deep-link test covers shell rendering instead. The PWA/service
  worker decision is handled in the final migration wave.
