---
name: verify
description: Run lint, unit tests, and production build to verify the project
allowed-tools:
  - read
  - exec
  - grep
permissions:
  allow:
    - Exec(yarn lint)
    - Exec(yarn build)
    - Exec(yarn test)
    - Exec(yarn install)
---

Verify the project is in a healthy state by running the standard checks for this Angular 9 codebase.

Run the following in order and report the result of each step. If any step fails, stop and surface the error with enough context to debug.

1. **Lint:** `yarn lint`
2. **Build:** `yarn build` (Angular production build via `@angular/cli`)
3. **Unit tests:** `yarn test --watch=false --browsers=ChromeHeadless` (Karma + Jasmine; do not leave the watcher running)

Notes:
- If `node_modules` is missing, run `yarn install` first.
- Do not run `yarn e2e` here — Protractor is slow and requires a browser; only run it if explicitly requested.
- Do not modify any source files; this skill is read-only verification.

Provide a short summary at the end: which steps passed, which failed, and any actionable next steps.
