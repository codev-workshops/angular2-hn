# Code Review Guide

How to review changes to this repository (`angular-hnpwa`, an Angular 9 Hacker News PWA).
Reviewers: work through the checklists below. Authors: self-review against them before
requesting a review. See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup.

## 1. Before reviewing

- [ ] PR description explains **what** changed and **why**, and links the issue it closes.
- [ ] Scope is focused: no unrelated refactors, formatting-only churn, or stray files
      (`dist/`, `.env`, editor configs, lockfile changes unrelated to the change).
- [ ] Both lockfiles stay consistent — this repo tracks `package-lock.json` *and*
      `yarn.lock`; if dependencies changed, both must be updated.
- [ ] Screenshots (light + dark/AMOLED themes) are included for any visual change.

## 2. Build, lint and tests must pass

Run locally (Angular here builds under Node 14: `source ~/.nvm/nvm.sh && nvm use 14`):

```bash
npm install
npm run lint     # ng lint -> tslint + codelyzer
npm run build    # production build; must stay within the angular.json budgets
npm test         # karma/jasmine
npm run e2e      # protractor (optional, needs a browser)
```

- [ ] `npm run lint` is clean — no new warnings, and no `tslint:disable` without a
      comment explaining why.
- [ ] `npm run build` succeeds and the initial bundle stays under the budgets declared
      in `angular.json` (warn 2 MB / error 5 MB). Flag any noticeable bundle growth.
- [ ] Tests pass. New/changed logic (services, pipes, pagination math) comes with specs;
      the repo has almost no unit tests today, so new coverage is welcome, never removed.

## 3. Linting and style rules

Enforced by `tslint.json` / `.editorconfig` — do not weaken them to make code pass:

- [ ] Single quotes, max line length 140, 2-space indentation, final newline, no
      trailing whitespace.
- [ ] Angular naming: components end in `Component`, directives in `Directive`,
      element selectors are `app-kebab-case`, attribute selectors `appCamelCase`.
- [ ] Lifecycle hooks implement their interfaces (`OnInit`, `OnDestroy`, …); no
      conflicting lifecycle usage; pipes implement `PipeTransform`.
- [ ] No `import ... from 'rxjs/Rx'`; import operators from `rxjs/operators` and use
      `.pipe(...)`. Prefer removing `rxjs-compat`-era patterns rather than adding more.
- [ ] No `console.log`-style debug output left behind (`no-console` bans
      `debug`/`info`/`time`/`timeEnd`/`trace`), no `!` non-null assertions.
- [ ] Members ordered static field → instance field → static method → instance method.
- [ ] Prefer `const`/`let` with explicit types on public APIs; avoid `any` — model the
      shape in `src/app/shared/models/` instead.

## 4. Architecture and Angular correctness

- [ ] Code lives in the right place: singletons and global chrome in `src/app/core/`,
      feed lists/pagination in `src/app/feeds/`, reusable models/pipes/SCSS in
      `src/app/shared/`, routes and `FeedType` metadata in `src/app/app.routes.ts`.
- [ ] Data access goes through `HackerNewsAPIService`; components don't call `fetch`
      directly, and API URLs are not hard-coded in components.
- [ ] User preferences go through `SettingsService`; theme/font values are not read from
      or written to `localStorage` ad hoc.
- [ ] **Subscriptions are cleaned up** — every `subscribe()` in a component is either
      unsubscribed in `ngOnDestroy`, wrapped with `takeUntil`, or replaced by the `async`
      pipe. Leaks here are the most common bug in this codebase.
- [ ] Router-dependent logic reacts to param/`NavigationEnd` changes rather than
      assuming components are re-created between routes.
- [ ] Loading and error states use the shared `loader` / `error-message` components;
      failed requests never leave a blank screen.
- [ ] Shared modules are imported where needed, not re-declared; no new `providers` for
      services that are meant to be singletons.

## 5. PWA, performance and accessibility

- [ ] App-shell/offline behaviour still works: changes to `ngsw-config.json`, the
      manifest, or asset paths are exercised with a production build, not just `ng serve`.
- [ ] New assets are registered in `angular.json` `assets` and, when they must work
      offline, in the service-worker config; cache-busting/versioning is respected.
- [ ] No heavy synchronous work or unbounded loops in render paths; avoid N+1 request
      fan-out (see the poll-fetch loop in `HackerNewsAPIService` as the pattern to *not*
      copy).
- [ ] Styling uses the SCSS variables in `src/app/shared/scss/` so all themes (including
      AMOLED black) stay readable; contrast checked in dark themes.
- [ ] Interactive elements are real buttons/links, are keyboard reachable and focus-
      visible, have accessible labels, and images have `alt` text.

## 6. Security rules

- [ ] **No secrets in the repo** — API keys, Firebase tokens (`FIREBASE_TOKEN` lives in
      CI settings), or credentials must never be committed, logged, or embedded in
      `src/environments/*`.
- [ ] HN-supplied HTML (comment/poll/`about` text) is rendered via `[innerHTML]`, which
      Angular sanitizes. Never bypass that with `DomSanitizer.bypassSecurityTrust*`,
      manual DOM writes, or `[attr.*]` interpolation of user data into `href`/`src`.
- [ ] No `eval`, `new Function`, or dynamic script injection.
- [ ] External links built from HN data use `rel="noopener noreferrer"` when opened in a
      new tab, and URLs are validated (`http(s)` only) before use.
- [ ] All network calls are HTTPS; no new third-party endpoint or analytics/tracking
      script is added without discussion.
- [ ] Changes to `firebase.json` or `database.rules.json` are reviewed carefully — rules
      must not be loosened to public read/write.
- [ ] New dependencies: justified, actively maintained, published at least ~7 days ago,
      pinned to a bounded range, and free of known advisories (`npm audit`). Prefer no
      new runtime dependency at all.

## 7. Review etiquette

- Distinguish blocking issues from suggestions; prefix optional comments with `nit:`.
- Explain the reasoning, propose a concrete alternative, and link to the rule or docs.
- Approve once the checklists above hold; request changes for correctness, security,
  accessibility, or bundle-size regressions.
