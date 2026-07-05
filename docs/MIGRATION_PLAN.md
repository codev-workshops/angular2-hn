# Angular → React Migration Plan

A phased plan to migrate this Hacker News PWA from **Angular 9** to the **latest React (React 19 era)** stack.

> Note on "latest": versions below were verified against live sources in June 2026 and should be re-confirmed at implementation time. This document reflects current best practices in the React 19 / Vite 8 ecosystem.
>
> **Prerequisite:** Vite 8 requires **Node.js 20.19+ or 22.12+**. The current project targets very old Node (`@types/node` ^12), so upgrading the local/CI Node runtime is a hard prerequisite before scaffolding.

---

## 1. What the project actually is (analysis)

**Stack:** Angular 9.0.1, TypeScript 3.7.5, RxJS 6.5.4, zone.js, SCSS. Build via Angular CLI; unit tests Karma + Jasmine; e2e Protractor; lint TSLint + codelyzer. PWA via `@angular/service-worker` (ngsw) with a Workbox app-shell build.

**Architecture (NgModules):** `AppModule` + `CoreModule`, `SharedComponentsModule`, `PipesModule`, and two lazy-loaded modules `ItemDetailsModule` and `UserModule`.

**Routing** (`src/app/app.routes.ts`): five feed types (`news`, `newest`, `show`, `ask`, `jobs`) each with a `:page` child route and a `data.feedType` tag; `item` and `user` are lazy-loaded. Default redirect to `news/1`.

**Data layer** (`src/app/shared/services/hackernews-api.service.ts`): a single `HackerNewsAPIService` wrapping `unfetch` in hand-rolled RxJS Observables (with a cancel-token teardown). Base URL is `https://node-hnapi.herokuapp.com`.

> **WARNING (API endpoint):** The configured base URL is a Heroku host, and Heroku free dynos were discontinued in late 2022, so this endpoint is effectively dead. node-hnapi (the project this app uses) has since moved to a Cloudflare-fronted host. Replacement options:
> - **`https://api.hackerwebapp.com`** — current node-hnapi host. **Drop-in**: same routes/shape the code already expects (`/news?page=N`, `/item/:id`, `/user/:id`). Just swap the base URL.
> - **`https://api.hnpwa.com/v0/`** — the HNPWA aggregator. **NOT a drop-in**: different URL shape (`/v0/news/1.json`, `/v0/item/:id.json`) and a different response schema, so the API layer and some models would need adapting.
>
> Additional caveat: node-hnapi's **`/user/:id` endpoint is officially deprecated** ("use the official HN API instead"), so the User page may be broken independent of the migration — verify and, if needed, point user lookups at the official Firebase HN API (`https://hacker-news.firebaseio.com/v0/user/:id.json`).

**Global state** (`src/app/shared/services/settings.service.ts`): `SettingsService` (root singleton) manages settings persisted to `localStorage`, plus theme handling via `matchMedia('(prefers-color-scheme: dark)')` with auto/explicit theme logic.

**Components:** `app`, `header`, `footer`, `settings` (core); `feed`, `item` (feeds); `item-details`, `comment` (item-details); `user`; plus shared `loader` and `error-message`.

- The **`comment` component is recursive** (`comment.component.html` renders `app-comment`) and renders comment HTML via Angular's auto-sanitized `[innerHTML]`.

**Other:** one pure pipe `CommentPipe` (pluralization), models as TS classes (`Story`, `Comment`, `User`, `Settings`, `PollResult`, `FeedType`), SCSS theming in `src/app/shared/scss/` (`_theme_variables`, `_themes`, `_media`), imperative `window.scrollTo` / `Location.back()`.

---

## 2. Target stack (latest React)

| Concern | Angular (now) | React (target) |
|---|---|---|
| Framework | Angular 9 | **React 19** (19.2.x) + TypeScript 5.x |
| Build/dev | Angular CLI (webpack) | **Vite 8** (Rolldown-based; needs Node 20.19+/22.12+) |
| Routing | `@angular/router` | **React Router v7** (7.16+) — Data mode (`createBrowserRouter`) |
| Data fetching | RxJS + custom service | **TanStack Query v5** + `fetch`/`AbortController` |
| Global state | root service singleton | **React Context + hooks** |
| PWA / service worker | `@angular/service-worker` | **`vite-plugin-pwa`** (Workbox) |
| Styling | SCSS + theme files | SCSS via Vite (keep files) + CSS variables for theming |
| HTML sanitization | auto via `[innerHTML]` | **DOMPurify** + `dangerouslySetInnerHTML` |
| Lint | TSLint + codelyzer (deprecated) | **ESLint + typescript-eslint + Prettier** |
| Unit tests | Karma + Jasmine | **Vitest + React Testing Library** |
| E2E | Protractor (EOL) | **Playwright** |
| Reactivity runtime | zone.js | none (removed) |

**Framework decision point:** This is a client-only PWA, so a **Vite SPA + React Router (Data mode via `createBrowserRouter`)** is the closest 1:1 migration. If SSR/SEO/streaming is desired, the alternatives are **React Router v7 Framework mode** (`ssr:false` still build-time pre-renders the root route) or **Next.js (App Router) + RSC** — both are more involved. This plan assumes the Vite SPA + Data-mode router and calls out where the others would diverge.

> **Router mode note:** Data mode (`createBrowserRouter`) is recommended over Declarative mode (`<BrowserRouter>`/`<Routes>`) because it cleanly supports the nested route structure and *optional* loaders. Data fetching here is handled by TanStack Query, so route `loader`s are optional (use them only for prefetching). Note: loaders / `useLoaderData` are **not** available in Declarative mode — don't mix them.

---

## 3. Angular → React concept mapping

| Angular concept | React equivalent |
|---|---|
| `@Component` + template/styles | Function component + JSX + CSS/SCSS |
| `@Input()` | Props |
| `@Output()` / `EventEmitter` | Callback props |
| `ngOnInit` / `ngOnDestroy` | `useEffect` (with cleanup) |
| Services + DI | Modules/hooks; Context for shared state |
| RxJS `Observable` data flows | TanStack Query hooks / `useState` + `useEffect` |
| `@Pipe` (e.g. `CommentPipe`) | Plain formatting helper function |
| `routerLink` / `routerLinkActive` | `<Link>` / `<NavLink>` |
| `ActivatedRoute` params / `data` | `useParams` (+ optional route `loader`/`useLoaderData` in Data mode) |
| `*ngFor` / `*ngIf` | `Array.map` / conditional JSX |
| `[innerHTML]` (auto-sanitized) | `dangerouslySetInnerHTML` + DOMPurify |
| NgModule lazy `loadChildren` | `React.lazy` + route-based code splitting |

---

## 4. Execution model — orchestrator + cloud worker Devins

This migration is executed by **multiple Devin sessions running in the cloud**, coordinated by a single **orchestrator Devin** that owns the plan end-to-end.

### Roles

**Orchestrator Devin (owns the whole plan).** Does not implement leaf features itself; instead it:
- Finalizes Phase 0 decisions and **freezes the shared contracts** every worker builds against: TypeScript types, the API-client interface, the route map, the `SettingsContext` API, and the SCSS design tokens.
- Sets up the repo skeleton and the long-lived **integration branch** (`migration/react`).
- Splits work into tasks, **assigns each to a worker Devin**, and tracks status.
- **Reviews and merges** worker PRs into the integration branch; resolves cross-cutting issues and contract changes.
- Owns the **global parity + quality gate** and the final **cutover** to `master`.

**Worker Devins (parallel cloud sessions).** Each owns a **disjoint slice** (a feature/component stream or one cross-cutting concern):
- Branches off `migration/react`, implements its slice **plus its own unit tests**, and opens a PR back to the integration branch.
- **Must not edit files outside its assigned ownership area.** If a shared contract needs to change, it requests the change from the orchestrator rather than editing it directly.
- Delivers a short handoff note (what changed, deviations, follow-ups) with each PR.

### Coordination principles
- **Contracts before parallelism.** The orchestrator completes the foundation wave and freezes interfaces so workers build against stable seams.
- **Ownership by directory** to avoid merge conflicts (e.g. `src/features/feeds`, `src/features/item`, `src/features/user`, `src/components`, `src/api`, `src/context`, `src/styles`).
- **Mock the seams.** Workers depend on the frozen API client + types and use fixtures/MSW so they are never blocked on the live HN API.
- **Integration branch is the source of truth.** Workers PR into it; the orchestrator merges; `master` is only touched at cutover after the parity gate is green.

### Ownership map

| Stream | Owner | Directory it owns |
|---|---|---|
| Decisions & contracts | Orchestrator | repo root, `src/api`, `src/types`, `src/context`, route config, `src/styles` tokens |
| Feeds | Worker **F** | `src/features/feeds` (Feed, Item) |
| Item details | Worker **I** | `src/features/item` (ItemDetails, recursive Comment, polls) |
| User | Worker **U** | `src/features/user` |
| Shell / core / shared | Worker **S** | `src/components` (Header, Footer, Settings UI, Loader, ErrorMessage, App shell) |
| PWA / service worker | Worker **P** | PWA config, `manifest`, SW caching |
| Testing / e2e | Worker **T** (or Orchestrator) | `e2e/`, parity suite |

### Waves (dependency-ordered)
- **Wave 0 — Decisions** (Orchestrator): Phase 0.
- **Wave 1 — Foundation, blocking** (Orchestrator): Phases 1–5 establish the running empty shell + frozen contracts.
- **Wave 2 — Feature streams, parallel** (Workers F, I, U, S): Phase 6, split per feature; all depend on Wave 1.
- **Wave 3 — Cross-cutting** (Workers P, T): Phases 7–8, after features integrate.
- **Wave 4 — Cutover** (Orchestrator): Phase 9.

---

## 5. Phased plan (orchestrated)

> Each phase is tagged with `Owner · Wave · Depends on · Done when`. Workers operate on their own branch and PR into `migration/react`.

### Phase 0 — Decisions & baseline (no code)
*Owner: Orchestrator · Wave 0 · Depends on: — · Done when: decisions recorded and parity checklist published to all workers.*
- Confirm rendering target: Vite SPA + RR Data mode (assumed) vs RR Framework mode vs Next.js.
- Ensure the local/CI **Node.js runtime is 20.19+/22.12+** (required by Vite 8).
- Pick and smoke-test the HN API base URL — default to the drop-in **`https://api.hackerwebapp.com`**; decide how to handle the deprecated `/user` endpoint (e.g. official Firebase HN API).
- Capture current behavior as a parity checklist (routes, 30-items-per-page pagination, theming/auto-theme, settings persistence, recursive comments, offline/PWA, install prompt).
- Decide big-bang rewrite vs. incremental. Given ~12 components, a clean parallel rewrite is most pragmatic.

### Phase 1 — Scaffold new React app + tooling
*Owner: Orchestrator · Wave 1 (blocking) · Depends on: Phase 0 · Done when: app builds/runs, lint+test+e2e harnesses green on empty shell, `migration/react` branch pushed.*
- `npm create vite@latest` (react-ts); add `react-router-dom`, `@tanstack/react-query`, `sass`, `dompurify` (+ `@types/dompurify` if needed).
- ESLint (typescript-eslint) + Prettier; Vitest + React Testing Library (`jsdom` + `@testing-library/jest-dom`); Playwright.
- Enable `strict` in `tsconfig` (the old project ran loose TS 3.7) and fix resulting errors as you port.
- Configure env: `.env` with `VITE_API_BASE_URL`; replace Angular's `environment.ts` prod flag with `import.meta.env.PROD`.
- Establish structure: `src/components`, `src/features`, `src/api`, `src/context`, `src/styles`, `src/types`.

### Phase 2 — Types + API layer (shared contract)
*Owner: Orchestrator · Wave 1 (blocking) · Depends on: Phase 1 · Done when: `src/types` + `src/api` client are **frozen and published** to workers, with fixtures/MSW handlers for each endpoint.*
- Port models to `types/` interfaces (classes → `interface`). Fix latent type bugs while porting — e.g. `Story.time_ago` is typed `number` but the API returns a string ("2 hours ago").
- Replace `HackerNewsAPIService` with plain `fetch` functions (base URL from `import.meta.env.VITE_API_BASE_URL`) + TanStack Query hooks (`useFeed`, `useItem`, `useUser`). Consider `useSuspenseQuery` + an `ErrorBoundary` to mirror the loader/error states cleanly.
- Cancellation comes for free: TanStack Query passes an `AbortSignal` to `queryFn` — forward it to `fetch` (replaces the hand-rolled RxJS cancel-token).
- The poll-options fan-out (currently sequential `subscribe`s mutating `story.poll`) becomes a `useQueries` parallel fetch with the points summed in derived state — no mutation.

### Phase 3 — Settings / global state (shared contract)
*Owner: Orchestrator · Wave 1 (blocking) · Depends on: Phase 1 · Done when: `SettingsContext` + `useSettings()` API is frozen and published.*
- `SettingsContext` + provider replacing the singleton service; `useSettings()` hook.
- Port localStorage persistence and the `prefers-color-scheme` auto/explicit theme logic into an effect-based hook.

### Phase 4 — Styling & theming (shared contract)
*Owner: Orchestrator · Wave 1 (blocking) · Depends on: Phase 1 · Done when: theme tokens + CSS-variable `data-theme` scheme are published so workers style against shared tokens, not hardcoded colors.*
- Reuse existing SCSS (`_theme_variables`, `_themes`, `_media`) via Vite's Sass support.
- Convert theme switching to a `data-theme` attribute on `<html>` + CSS variables, driven by `SettingsContext`.

### Phase 5 — Routing skeleton (shared contract)
*Owner: Orchestrator · Wave 1 (blocking) · Depends on: Phases 1–4 · Done when: route tree exists with placeholder route elements that workers later replace; running shell navigates between empty routes.*
- Define routes with `createBrowserRouter` (Data mode): index → redirect to `/news/1`; `/:feedType/:page` (feed types constrained to `news|newest|show|ask|jobs`); `/item/:id`; `/user/:id`. Code-split `/item` and `/user` with `React.lazy` + `Suspense`.
- Map the Angular `data.feedType` tag to the `:feedType` route param. Reproduce scroll-to-top on navigation (e.g. a `ScrollRestoration`/effect on pathname change).

### Phase 6 — Components (parallel feature streams)
*Wave 2 · Depends on: Wave 1 (frozen contracts) · Runs in parallel across Workers F/I/U/S.*

Shared porting rules for every stream: `@Input()` → props; `ngOnInit` + subscriptions → `useEffect`/query hooks; `routerLink`/`routerLinkActive` → `<Link>`/`<NavLink>`; `*ngFor`/`*ngIf` → JSX. Each worker writes its own unit tests and replaces its placeholder route element from Phase 5.

> **Sequencing note:** Worker **S** delivers the shared `Loader` and `ErrorMessage` first (small PR) so Workers F/I/U can import them; alternatively the orchestrator includes those two in the foundation wave. Everything else in the four streams is independent.

- **Phase 6S — Shell / core / shared** — *Owner: Worker S · Done when: app shell, header, footer, settings UI, loader, error-message merged with tests.*
  - App shell layout + `<Outlet>`; `Header` (+ scroll-to-top, settings toggle); `Footer`; `Settings` UI wired to `useSettings()`; shared `Loader` + `ErrorMessage`.
- **Phase 6F — Feeds** — *Owner: Worker F · Depends on: 6S shared components · Done when: feed list + pagination match parity checklist, tests merged.*
  - `Feed` (reads `:feedType`/`:page`, calls `useFeed`, 30-per-page, scroll reset) + `Item` row (reads `openLinkInNewTab` etc. from `useSettings()`).
- **Phase 6I — Item details** — *Owner: Worker I · Depends on: 6S shared components · Done when: item view + recursive comments + polls match parity, tests merged.*
  - `ItemDetails` (`useItem`, back button); **recursive `Comment`** with collapse; **sanitize comment HTML with DOMPurify before `dangerouslySetInnerHTML`** (Angular sanitized automatically; React does not); poll rendering from the `useQueries` fan-out.
- **Phase 6U — User** — *Owner: Worker U · Depends on: 6S shared components · Done when: user page renders, deprecated `/user` fallback handled, tests merged.*
  - `User` page (`useUser`, back button), honoring the Phase 0 decision on the deprecated endpoint.

### Phase 7 — PWA / service worker
*Owner: Worker P · Wave 3 · Depends on: feature streams integrated · Done when: offline + install + update-available verified against parity checklist.*
- Configure `vite-plugin-pwa` (Workbox) to replace `ngsw-config.json`: precache the app shell + runtime caching for the HN API (e.g. `StaleWhileRevalidate`) and static assets; port `manifest.webmanifest`.
- **Carry over existing brand assets and icons unchanged** (the repo treats `src/assets/` as read-only brand assets) — copy them into the new `public/`/assets pipeline and reuse the same icon set referenced by the manifest.
- Verify offline behavior, the install prompt, and update-available handling parity.
- **Compatibility caveat:** as of mid-2026 the published `vite-plugin-pwa` may not yet list Vite 8 in its peer deps. If install warns/conflicts, add a `package.json` `overrides` entry pinning the plugin's `vite` to `$vite`, and expect an `inlineDynamicImports`→`codeSplitting:false` deprecation note. The ecosystem is moving to `@vite-pwa/workbox` (Google Workbox is being discontinued/forked) — re-check the recommended package at implementation time.

### Phase 8 — Testing
*Owner: Worker T (or Orchestrator) · Wave 3 · Depends on: feature streams integrated · Done when: e2e parity suite green in CI.*
- Unit tests are delivered **by each feature worker** alongside its components; this stream backfills gaps for hooks, settings, recursive comments, and feed pagination.
- Replace Protractor specs with Playwright e2e covering the full parity checklist (this is the cross-feature suite the orchestrator gates on).

### Phase 9 — Build, CI, cutover, cleanup
*Owner: Orchestrator · Wave 4 · Depends on: all prior phases merged into `migration/react` · Done when: parity gate green and `migration/react` merged to `master`.*
- Vite production build; Lighthouse PWA/perf check vs. current.
- **Configure SPA fallback** on the host (rewrite all unknown paths to `index.html`) so client-side routes like `/news/2` work on refresh/deep-link; ensure it composes with the service worker's navigation fallback.
- Wire CI (lint, typecheck, test, build) on the upgraded Node runtime.
- Cut over, then remove Angular deps/config (`angular.json`, `ngsw-config.json`, TSLint, codelyzer, Karma, Protractor, zone.js) **and the now-unused `unfetch` / `node-fetch` / `rxjs` polyfills** (native `fetch` + Query replace them).
- **Update `AGENTS.md`** to the new commands (`npm run dev`/`build`/`test`/`lint`/`e2e` now map to Vite/Vitest/ESLint/Playwright) and the new conventions, since the existing one documents the Angular toolchain.

---

## 6. Key risks / gotchas
- **Dead API endpoint** (Heroku) — blocks everything; resolve in Phase 0 (swap to `api.hackerwebapp.com`).
- **Deprecated `/user` endpoint** — node-hnapi's user route is deprecated; the User page may need the official Firebase HN API.
- **`vite-plugin-pwa` vs Vite 8** — published peer deps may lag Vite 8; may need a `package.json` `overrides` workaround, and the Workbox→`@vite-pwa/workbox` transition is in flight. Verify at implementation time.
- **Node runtime** — Vite 8 needs Node 20.19+/22.12+; old CI/dev environments will fail until upgraded.
- **HTML sanitization** — must add DOMPurify; easy to introduce XSS otherwise (Angular sanitized `[innerHTML]` for free).
- **Recursive comments** — straightforward in React but watch stable `key`s and deep-tree performance.
- **RxJS → Query** — cancellation (via `AbortSignal`), loading/error states, and the poll fan-out (`useQueries`) need explicit handling.
- **Latent type bugs** — e.g. `Story.time_ago` typed as `number` but is a string; `strict` mode will surface these.
- **Theming model shift** — per-component theme classes → CSS variables / `data-theme`.
- **SPA deep-link/refresh** — needs host `index.html` fallback + SW navigation fallback.
- **No zone.js** — all implicit change detection becomes explicit state/effects.
- **Router mode mismatch** — don't mix Declarative mode with loaders/`useLoaderData` (Data/Framework only).
- **SSR scope creep** — only if RR Framework mode or Next.js is chosen.
- **Contract drift (multi-agent)** — if Wave 1 contracts aren't truly frozen, parallel workers diverge. Orchestrator must version/announce any contract change and rebase affected workers.
- **Merge conflicts (multi-agent)** — mitigated by disjoint directory ownership; shared edits (router registration, `package.json`) flow only through the orchestrator.
- **Blocked workers** — feature streams must use the published fixtures/MSW so a dead/slow API or unfinished sibling stream never blocks them.

---

## 7. Verified facts (checked June 2026)

Versions/claims below were confirmed against live sources; re-verify before implementing as the ecosystem moves fast.

| Item | Finding |
|---|---|
| React | Latest stable **19.2.x** (React 19.0 GA was Dec 5, 2024). |
| Vite | Latest major **8.x** (Vite 8.0 GA Mar 12, 2026; Rolldown-based). Requires **Node 20.19+ / 22.12+**. |
| React Router | **v7** (7.16+); three modes — Framework / Data / Declarative. Loaders & `useLoaderData` exist only in Data/Framework modes. |
| TanStack Query | **v5** (~5.101); peer deps `react@^18 || ^19` — React 19 fully supported. |
| vite-plugin-pwa | Works with Vite 8 but published peer-dep range lagged (`overrides` workaround); Workbox being forked to `@vite-pwa/workbox`. |
| HN API | `node-hnapi.herokuapp.com` is dead (Heroku free tier ended Nov 2022). Live node-hnapi host: `api.hackerwebapp.com` (drop-in). Aggregator alternative: `api.hnpwa.com/v0` (different schema). node-hnapi `/user` deprecated. |
| TSLint / Protractor | Both deprecated/EOL — replaced by ESLint and Playwright respectively. |
