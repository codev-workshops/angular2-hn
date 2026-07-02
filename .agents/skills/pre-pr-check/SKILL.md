---
name: pre-pr-check
description: Run the full pre-PR quality gate — lint, build, tests, and a
  self-review of the diff. Use before creating or updating any pull request.
---

# Pre-PR Quality Gate

Follow these steps in order. Do not skip steps.

1. Run `yarn lint` and fix any errors (not just warnings).
2. Run `yarn build` to catch Angular template and TypeScript type errors.
3. Run `yarn test --watch=false --browsers=ChromeHeadless` and ensure all tests pass (do not leave the Karma watcher running).
4. Review your own diff with `git diff` and check:
   - No debug statements (console.log, debugger) left behind
   - No commented-out code
   - All new files are TypeScript (.ts) — never plain JS
   - Variables, methods, and properties use camelCase
   - No edits to `src/assets/` brand assets
5. Summarize what was checked and the results before proceeding.
