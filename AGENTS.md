# AGENTS.md

## Project overview
A Hacker News PWA client built with Angular 9, TypeScript, RxJS, and Sass, served as an offline-capable App Shell via the Angular service worker.

## Commands
- Dev server: `npm start` (runs `ng serve`)
- Build: `npm run build` — also performs Angular's template/type checking
- Lint: `npm run lint` — ALWAYS run before committing
- Tests: `npm test` (Karma + Jasmine)
- E2E: `npm run e2e` (Protractor)

## Code conventions
- Use Angular components (`*.component.ts` + `*.component.html` + `*.component.scss`); follow the existing module structure under `src/app/`
- All code is TypeScript (`.ts`) — never add plain JS
- Use camelCase for variables, methods, and properties
- Component styles live next to each component as `.scss`; shared theme variables and mixins live in `src/app/shared/scss/` — reuse them instead of hardcoding colors
- Use the existing `HackerNewsAPIService` (`src/app/shared/services/`) for HN data access; it already wraps `unfetch`/`node-fetch` — don't add axios
- Follow `tslint.json` and `.editorconfig` for formatting

## Boundaries
- Never modify files in `src/assets/` — they are brand assets
- Don't change `angular.json` or the service worker config (`ngsw-config.json`) without asking
