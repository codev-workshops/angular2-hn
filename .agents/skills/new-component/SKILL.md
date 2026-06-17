---
name: new-component
description: Scaffold a new Angular component following project conventions
argument-hint: "<component-name> [feature-folder]"
allowed-tools:
  - read
  - edit
  - grep
  - glob
  - exec
---

Create a new Angular component named `$1` in this Angular 9 project.

Before creating anything:

1. Look at existing components under `src/app/` (e.g. `src/app/feeds/feed/`, `src/app/shared/components/`, `src/app/item-details/`) to match conventions for:
   - File layout (`*.component.ts`, `*.component.html`, `*.component.scss`)
   - Selector prefix
   - Module registration (`declarations`/`exports`)
   - Use of `ChangeDetectionStrategy`, inputs/outputs, and RxJS patterns
2. Check `angular.json`, `tsconfig.json`, and the `prettier` block in `package.json` (4-space indent, single quotes, 120 print width, trailing commas `es5`).

Then either:

- **Preferred:** Use the Angular CLI to scaffold the component so it is wired into the right module automatically:
  ```
  yarn ng generate component <path>/$1 --style=scss --skip-tests=false
  ```
  Choose `<path>` based on `$2` if provided, otherwise pick the most appropriate folder under `src/app/` based on what the component does and ask the user if unclear.

- **Fallback:** If the CLI is not usable, hand-create the four files (`.ts`, `.html`, `.scss`, `.spec.ts`) and register the component in the nearest `NgModule`.

Finally:
- Apply existing styling and import patterns from sibling components.
- Run `yarn lint` on the changes.
- Summarize what was created and where it was registered.
