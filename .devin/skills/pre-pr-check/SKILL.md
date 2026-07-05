---
name: pre-pr-check
description: Run the full pre-PR quality gate — lint, build, tests, and a self-review of the diff. Use before creating or updating any pull request.
permissions:
  allow:
    - Exec(npm run lint)
    - Exec(npm run build)
    - Exec(npm test)
    - Exec(git diff)
---

# Pre-PR Quality Gate

Follow these steps in order. Do not skip steps.

1. Run `npm run lint` and fix any errors (not just warnings).
2. Run `npm run build` to catch Angular template and TypeScript type errors.
3. Run `npm test -- --watch=false --browsers=ChromeHeadless` and ensure all tests pass.
   (The repo's `karma.conf.js` defaults to watch mode with a non-headless browser, so these
   flags are required for the run to terminate in an automated/headless environment.)
4. Review your own diff with `git diff` and check:
   - No debug statements (console.log, debugger) left behind
   - No commented-out code
   - All new files are TypeScript (.ts) — never plain JS
   - Variables, methods, and properties use camelCase
   - No edits to `src/assets/` brand assets
5. Summarize what was checked and the results before proceeding.
