# Design system migration plan

Plan of record for moving `angular2-hn` from ad-hoc component SCSS onto a token-based design
system. Two milestones, then a list of explicitly out-of-scope follow-ups.

Hard constraint throughout: **no visual change**. Every token value is lifted verbatim from a
value that already exists in the codebase, so each migration step is a refactor with identical
rendered output.

## Current state

* Angular 9 / `@angular/cli` 9. SCSS uses legacy `@import`; no `@use`.
* `src/app/shared/scss/_media.scss` holds three media query strings (768 / 769 / 1024px).
* `src/app/shared/scss/_theme_variables.scss` holds the day / night / amoledblack color sets
  plus `$skull-size`.
* `src/app/shared/scss/_themes.scss` defines a 12-argument positional `theme()` mixin and
  includes it once per theme; it is the only file emitting themed CSS.
* Eleven component stylesheets hardcode spacing (2, 4, 5, 8, 10, 20, 40px), type sizes
  (12, 13, 15, 16, 17, 18, 32px), two font stacks, letter spacings (0.5, 1.8, 2px), border
  widths (1, 2px), and colors (`#696969`, `#fff`, `#CECECB`, `rgba(...)`).
* Two breakpoint deviations: `700px` in `settings.component.scss`, a raw `768px` in
  `src/styles.scss`.

## Milestone 1 — tokens, specs, and rules (additive only)

Goal: land the vocabulary and the contract without touching a single rendered pixel.

**Adds**

* `src/app/shared/scss/_tokens.scss` — spacing scale, type scale, font families, line height,
  letter spacing, border widths, and semantic color aliases that point at the existing
  `_theme_variables.scss` values (plus names for the few literals with no theme variable, e.g.
  `$color-hairline: #CECECB`).
* `src/app/shared/scss/_breakpoints.scss` — documented re-exports of the three sanctioned
  media strings, with the deviations called out in comments.
* `src/app/shared/scss/README.md` — token reference and a description of the theme model.
* `docs/component-specs.md` — one table per component (all 11) listing selector, owned
  classes, and the token each hardcoded property should map to. This is the migration
  contract consumed by Milestone 2.
* `AGENTS.md` — five contributor rules plus grep guards.
* `docs/design-system-migration-plan.md` — this document.

**Changes**

* `_theme_variables.scss` — one header comment pointing at `_tokens.scss`. No value changes.
* `src/styles.scss` — one `@import "./app/shared/scss/tokens";` line so the new files are
  compiled by the real build. Tokens only declare variables, so output is unchanged.

**Exit criteria**

* `npm run build`, `npm test`, and `npm run lint` pass.
* `git diff` shows zero changed values in existing SCSS — only the added comment and import.
* `docs/component-specs.md` covers all 11 components.

## Milestone 2 — migrate the feeds pilot family

Goal: prove the tokens on the smallest self-contained family before touching the rest.

**Scope:** `src/app/feeds/feed/feed.component.scss` and
`src/app/feeds/item/item.component.scss` (`FeedComponent` + `ItemComponent`).

Why these two: they cover every token category (spacing, type, font family, letter spacing,
border width, subtext color, hairline color, all three breakpoints) in ~200 lines, and the
feed is the app's landing view, so a regression is immediately obvious.

**Work**

1. Swap `@import "../../shared/scss/media"` / `theme_variables` for `tokens` + `breakpoints`.
2. Replace each hardcoded value with the token named in `docs/component-specs.md`, leaving the
   rows marked **keep literal** alone with a one-line comment explaining why.
3. Replace `#{$mobile-only}` / `#{$laptop-only}` with `#{$breakpoint-mobile}` /
   `#{$breakpoint-laptop}`.
4. Verify pixel neutrality by diffing the compiled CSS: build before and after and compare the
   emitted component styles; the diff must be empty modulo declaration order.
5. Run the grep guards from `AGENTS.md`; the two migrated files must come back clean.

**Exit criteria**

* Compiled-CSS diff for the two components is empty.
* Guards 1–3 report nothing for `feeds/**`.
* Build, tests, and lint pass.

After Milestone 2, the remaining components migrate the same way, one family per PR, in this
order: `AppComponent` + `HeaderComponent` + `FooterComponent` (shell), then
`ItemDetailsComponent` + `CommentComponent`, then `UserComponent`, then
`LoaderComponent` + `ErrorMessageComponent`, then `SettingsComponent` (last, because it is
entangled with the theme switcher and the 700px deviation).

## Out of scope — future PRs

Each of these is deliberately excluded from Milestones 1 and 2:

1. **Theme map refactor.** Replace the 12-argument positional `theme()` mixin with one Sass
   map per theme (`$themes: (default: (...), night: (...), amoledblack: (...))`) iterated with
   `@each`, so adding a property no longer means editing every call site. Prerequisite for any
   new theme.
2. **Breakpoint deviations.** Migrate `settings.component.scss` from `700px` to
   `$breakpoint-mobile` and `src/styles.scss` from its raw `768px` literal. Both change actual
   query boundaries, so they need design sign-off and cannot ride along in a refactor PR.
3. **Off-scale value normalization.** 6px, 0.7px, 14px, 15px, 24px, 25px, 30px and friends
   either join the scale or are documented as intentional one-offs. Visual sign-off required.
4. **CSS custom properties.** Emit tokens as `--*` custom properties so theming can happen at
   runtime without recompiling per-theme class trees.
5. **Radius and shadow tokens.** `5px` radii and the loader/back-button shadows currently have
   no token category.
6. **`@use` migration.** Move the whole SCSS layer off `@import` in one pass, which also means
   moving off `node-sass` if it is still in play.
7. **Automated guards in CI.** Promote the `AGENTS.md` grep guards into a lint script and a CI
   step, plus a stylelint config, so violations fail the build rather than relying on habit.
8. **Component template audit.** Some spacing lives in templates as inline styles or utility
   classes; fold those into the component stylesheets once tokens are in place.
