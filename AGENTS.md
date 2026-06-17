# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Overview

Angular 2 HN is a progressive Hacker News client built with Angular 9, TypeScript, RxJS, and Sass (SCSS). It is served as an offline-capable App Shell using the Angular service worker.

- **Framework:** Angular 9 (`@angular/*` ~9.0.1)
- **Language:** TypeScript ~3.7.5 — never add plain JS
- **Package manager:** Yarn (yarn.lock present; npm also works)
- **Styles:** SCSS
- **Tests:** Karma + Jasmine (unit), Protractor (e2e)
- **Lint:** TSLint + codelyzer
- **Build tooling:** Angular CLI (`@angular/cli` ~9.0.2)
- **Offline:** Angular service worker (`@angular/service-worker`), configured in `ngsw-config.json`
- **Deploy:** Firebase Hosting (`firebase.json`)

## Repository Layout

- `src/app/` — Angular application code (components, services, modules)
- `src/assets/` — Static brand assets
- `src/environments/` — Environment configs
- `src/index.html`, `src/main.ts`, `src/styles.scss` — App entry points
- `src/app/shared/scss/` — Shared theme variables and mixins
- `e2e/` — Protractor end-to-end tests
- `angular.json` — Angular CLI workspace config
- `ngsw-config.json` — Angular service worker config
- `firebase.json`, `database.rules.json` — Firebase hosting/db config
- `karma.conf.js`, `tsconfig*.json`, `tslint.json`, `.editorconfig` — Tooling configs

## Commands

Install dependencies:
```
yarn install
```

Development server (http://localhost:4200):
```
yarn start          # or: ng serve
```

Production build (outputs to `dist/`; also performs Angular template/type checking):
```
yarn build          # or: ng build
```

Run unit tests (Karma + Jasmine):
```
yarn test           # or: ng test
```

Run end-to-end tests (Protractor):
```
yarn e2e            # or: ng e2e
```

Lint — ALWAYS run before committing:
```
yarn lint           # or: ng lint
```

## Code Conventions

- Use Angular components (`*.component.ts` + `*.component.html` + `*.component.scss`); follow the existing feature-module structure under `src/app/`.
- All code is TypeScript (`.ts`) — never add plain JS.
- Use camelCase for variables, methods, and properties.
- Component styles live next to each component as `.scss`; reuse the shared theme variables and mixins in `src/app/shared/scss/` instead of hardcoding colors.
- Use the existing `HackerNewsAPIService` (`src/app/shared/services/`) for HN data access; it already wraps `unfetch`/`node-fetch` — don't add axios or other HTTP libraries.
- Formatting follows the Prettier config in `package.json` (`trailingComma: "es5"`, `tabWidth: 4`, `singleQuote: true`, `printWidth: 120`), plus `tslint.json` and `.editorconfig`.

## Conventions for Agents

- Match existing TypeScript/Angular patterns; do not introduce new state management or HTTP libraries without reason (the app uses `node-fetch`/`unfetch` and RxJS).
- Keep changes minimal and focused; do not bump dependency versions unless asked. The project targets Angular-9-era tooling — avoid upgrades unless requested.
- Do not edit `yarn.lock` manually — let the package manager update it.
- Do not commit build artifacts (`dist/`, `coverage/`).
- Verify changes with `yarn lint` and `yarn build` (and `yarn test` if logic changed) before finalizing.

## Boundaries

- Never modify files in `src/assets/` — they are brand assets.
- Don't change `angular.json` or the service worker config (`ngsw-config.json`) without asking.
- Update `ngsw-config.json` when adding new caching needs.
