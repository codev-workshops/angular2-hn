---
name: review
description: Review staged/unstaged changes for issues before committing
allowed-tools:
  - read
  - grep
  - glob
  - exec
permissions:
  allow:
    - Exec(git diff)
    - Exec(git diff --staged)
    - Exec(git status)
    - Exec(git log)
    - Exec(yarn lint)
---

Review the current changes in this Angular 9 codebase before they are committed.

Gather context:

!`git status`

!`git diff --staged`

!`git diff`

Evaluate the diff for:

1. **Correctness** — Logic errors, missed edge cases, broken RxJS subscriptions / missing `unsubscribe` or `takeUntil`, incorrect change detection assumptions.
2. **Angular conventions** — Components/services/pipes registered in the right module; `providedIn: 'root'` where appropriate; inputs/outputs typed; templates avoid heavy expressions.
3. **Style** — Matches the project Prettier config (`package.json`: 4-space indent, single quotes, 120 print width, trailing commas `es5`) and passes TSLint.
4. **Service worker / PWA impact** — Any change that affects assets, routes, or caching may need updates to `ngsw-config.json`.
5. **Security** — No leaked keys, no unsafe innerHTML/bypassSecurityTrust without justification.
6. **Tests** — `*.spec.ts` updated alongside component/service changes when behavior changes.

Then run `yarn lint` and include the result.

Report findings as a concise list with `file:line` references and concrete suggestions. Do not modify files — review only.
