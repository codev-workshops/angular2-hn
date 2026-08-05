# Final E2E Run: React vs Angular Baseline

Run 2026-08-05 with the frozen suite in `e2e-pw/` (unmodified since the baseline)
against the React app (`web-react`, Vite dev server, http://localhost:5173),
after the final routing wave merged into `migrate/react`.

## Result: exact baseline parity

- 20 tests: **18 passed, 2 failed** — identical pass/fail set to
  `docs/E2E_BASELINE.md` (Angular: 18 passed, 2 failed).

| Test | Angular | React |
|---|---|---|
| All 18 baseline-passing tests (feeds ×5, jobs header, pagination/ListStart, story rows, item deep link, comment collapse, feed→item nav, theme persistence, new-tab setting, font size, root redirect, app shell deep links, header nav, offset numbering) | pass | pass |
| deep-linked user profile renders name, karma and created date | fail (API `/user` 404) | fail (same 404, same error state) |
| user link on a story navigates to the profile page | fail (API `/user` 404) | fail (same 404, same error state) |

The two failures were re-confirmed as backend-caused at baseline time
(`curl https://node-hnapi.herokuapp.com/user/pg` → 404); the React app renders
the identical Angular error state ("Could not load user pg.").

`npm run build && npm run lint && npm run typecheck && npm test` all pass on
`migrate/react` (27 unit tests). The Angular app remains untouched and runnable.

Service worker/PWA: intentionally not ported in this migration (dev-server e2e
never exercises it); recommended follow-up is `vite-plugin-pwa` (Workbox).
