---
name: verify-before-pr
description: Build, lint, test and smoke-check this Angular 9 app before opening a PR. Use for any code change in this repo, and whenever the toolchain (install, ng serve, ng test, ng lint) needs to be run.
---

# Verify before PR

This repo is Angular 9 / Angular CLI 9 / TypeScript 3.7 with tslint and Karma. Modern Node and
modern Angular habits do **not** work here. Follow these steps in order.

## 1. Use Node 16

Angular CLI 9 crashes on Node 18+ (`ERR_OSSL_EVP_UNSUPPORTED` / webpack 4 hash errors).

```bash
source ~/.nvm/nvm.sh && nvm use 16
```

If Node 16 is not installed: `nvm install 16`.

## 2. Install with yarn, not npm

`yarn.lock` is the committed lockfile; there is no `package-lock.json`.

```bash
yarn install --frozen-lockfile
```

## 3. Build

```bash
npx ng build --prod   # ~40s, must exit 0
```

`ng build` (dev) is fine for a fast inner loop, but the production build is the one that catches
template type errors and budget failures, so run it before opening a PR.

## 4. Lint — do not increase the baseline

`npx ng lint` **fails on a clean checkout**: the repo carries 46 pre-existing tslint errors
(quotemark, whitespace, missing semicolons). Do not "fix lint" repo-wide as part of an unrelated
change, and do not treat these as your regression. Compare counts instead:

```bash
npx ng lint 2>&1 | grep -c '^ERROR'   # must be <= 46
```

Fix every error in files you touched, and make sure the total did not go up.

## 5. Tests

There are currently **no `*.spec.ts` files**, so `npx ng test` exits non-zero with
`Executed 0 of 0 ERROR`. That is the expected baseline, not a broken toolchain.

- If your change adds or modifies a spec, run it headless:
  ```bash
  CHROME_BIN=$(which google-chrome) npx ng test --watch=false --browsers=ChromeHeadless
  ```
  (`karma.conf.js` defaults to `browsers: ['Chrome']` and `singleRun: false` — always pass both
  flags, otherwise the run hangs waiting for a headful browser.)
- If it does not, state in the PR that the repo has no unit tests rather than reporting a test failure.

## 6. Smoke-check the running app

Any UI change must be verified in a browser, not just compiled.

```bash
npx ng serve --port 4200 --host 0.0.0.0   # wait for "Compiled successfully"
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4200   # expect 200
```

Then open `http://localhost:4200`, exercise the affected route, and attach a screenshot of the
rendered change to the PR. Feed data comes from the live API at `https://node-hnapi.herokuapp.com`
(`src/app/shared/services/hackernews-api.service.ts`); if the feed is empty, check that endpoint
before suspecting your change.

Routes worth checking: `/news`, `/newest`, `/show`, `/ask`, `/jobs`, `/item/:id`, `/user/:id`.

## 7. PR checklist

- [ ] Node 16, `yarn install --frozen-lockfile`
- [ ] `ng build --prod` exits 0
- [ ] tslint error count did not increase above 46, and files you touched are clean
- [ ] specs run headless (or noted that none exist)
- [ ] app loads on :4200, affected route exercised, screenshot attached for UI changes
- [ ] `yarn.lock` committed if dependencies changed; never add `package-lock.json`
