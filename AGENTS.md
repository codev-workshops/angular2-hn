# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Overview

Angular 2 HN is a progressive Hacker News client built with Angular 9. It uses a Service Worker App Shell + Dynamic Content model (Workbox) for offline support and fast load times.

- **Framework:** Angular 9 (`@angular/*` ~9.0.1)
- **Language:** TypeScript ~3.7.5
- **Package manager:** Yarn (yarn.lock present; npm also works)
- **Styles:** SCSS
- **Tests:** Karma + Jasmine (unit), Protractor (e2e)
- **Lint:** TSLint + codelyzer
- **Build tooling:** Angular CLI (`@angular/cli` ~9.0.2)

## Repository Layout

- `src/app/` — Angular application code (components, services, modules)
- `src/assets/` — Static assets
- `src/environments/` — Environment configs
- `src/index.html`, `src/main.ts`, `src/styles.scss` — App entry points
- `e2e/` — Protractor end-to-end tests
- `angular.json` — Angular CLI workspace config
- `ngsw-config.json` — Angular service worker config
- `firebase.json`, `database.rules.json` — Firebase hosting/db config
- `karma.conf.js`, `tsconfig*.json`, `tslint.json` — Tooling configs

## Common Commands

Install dependencies:
```
yarn install
```

Development server (http://localhost:4200):
```
yarn start          # or: ng serve
```

Production build (outputs to `dist/`):
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

Lint:
```
yarn lint           # or: ng lint
```

## Code Style

Prettier config lives in `package.json`:
- `trailingComma: "es5"`
- `tabWidth: 4`
- `singleQuote: true`
- `printWidth: 120`

Follow existing Angular style: feature modules, components co-located with templates/styles, services provided in root where appropriate. Lint with `yarn lint` before committing.

## Conventions for Agents

- Match existing TypeScript/Angular patterns when adding code; do not introduce new state management or HTTP libraries without reason (the app uses `node-fetch`/`unfetch` and RxJS).
- Keep changes minimal and focused; do not bump dependency versions unless asked.
- Do not edit `yarn.lock` manually — let the package manager update it.
- Do not commit build artifacts (`dist/`, `coverage/`).
- Verify changes with `yarn lint` and `yarn build` (and `yarn test` if logic changed) before finalizing.
- The project targets Node/CLI tooling from the Angular 9 era; expect older dependencies and avoid upgrades unless requested.

## Notes

- Service worker config is in `ngsw-config.json` — update it when adding new caching needs.
- The app is deployed to Firebase Hosting (`firebase.json`).
