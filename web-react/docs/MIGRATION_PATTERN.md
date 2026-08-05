# Migration Pattern: Angular → React (angular2-hn → web-react)

Read this before writing any code. The canonical reference implementation is the
`Item` slice: `src/components/Item.tsx` (+ `Item.scss`, `Item.test.tsx`),
`src/api/hackernews.ts`, `src/models/index.ts`, `src/stores/settings.ts`,
`src/utils/comment-label.ts`, and the harness route in `src/harness/ItemHarness.tsx`.
Copy its patterns exactly.

## THE HARD RULE: DOM fidelity

The frozen e2e suite in `../e2e-pw/tests/` selects on CSS classes and literal text.
Copy CSS classes, element structure, and user-visible strings **verbatim** from the
Angular templates in `../src/app/**`. If your task description and the Angular template
disagree, **the template wins** — note the discrepancy in your PR description.
Never modify anything under `../e2e-pw/` or `../src/` (the Angular app).

## Translation table

| Angular | React (this repo) |
|---|---|
| `@Input() item: Story` | props: `function Item({ item }: { item: Story })` |
| `@Output() x = new EventEmitter()` | callback prop `onX: () => void` |
| Component field mutated in template | `useState` |
| `SettingsService` (shared mutable singleton) | `useSettingsStore` (zustand) — select individual fields |
| Service HTTP method returning Observable | plain async function in `src/api/hackernews.ts` returning a Promise |
| `HttpClient`/`unfetch` | the shared axios instance `http` in `src/api/hackernews.ts` |
| `.subscribe(...)` in `ngOnInit` | `useQuery` (TanStack Query) with a stable `queryKey` |
| `*ngIf="cond"` | `{cond && (...)}` or ternary |
| `*ngFor="let x of xs"` | `xs.map((x) => <... key={x.id} />)` |
| `[ngStyle]="{'font-size': v+'px'}"` | `style={{ fontSize: `${v}px` }}` |
| `[class.foo]="cond"` | `className={cond ? 'base foo' : 'base'}` |
| `[routerLink]="['/item', id]"` | `<Link to={`/item/${id}`}>` |
| `ActivatedRoute.params` | `useParams()` |
| route `data: {feedType}` | passed as a prop from the route table |
| `Location.back()` | `useNavigate()` → `navigate(-1)` |
| pipe (`comment`) | plain function in `src/utils/` (`commentLabel`) |
| `[innerHTML]="html"` | `dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}` (dompurify) |
| `[hidden]="cond"` | `hidden={cond}` attribute (keeps element in DOM — required for the comment-collapse e2e test) |
| component `.scss` | copy verbatim next to the component, fix the two `@import` paths to `../styles/media` / `../styles/theme_variables`, and `import './X.scss'` |
| `window.scrollTo(0, 0)` on load/nav | `useEffect` on the relevant dep |

## Conventions

- Loading state: render `<Loader />`; error state: `<ErrorMessage message="..." />`
  with the **exact** error strings from the Angular components
  (e.g. `'Could not load ' + feedType + ' stories.'`, `'Could not load item comments.'`,
  `'Could not load user ' + userID + '.'`).
- API base URL is `https://node-hnapi.herokuapp.com` — already configured in
  `src/api/hackernews.ts`. Add missing API functions there ONLY if your wave owns them.
- Settings are read via `useSettingsStore((s) => s.field)` — one selector per field.
- Unit tests: Vitest + Testing Library, colocated `X.test.tsx`. Wrap components using
  `<Link>` in `<MemoryRouter>`. `window.matchMedia` is stubbed in `src/test/setup.ts`.
- Validation before PR (all must pass, run from `web-react/`, Node ≥20):
  `npm run build && npm run lint && npm run typecheck && npm test`.

## Orchestrator-owned files (DO NOT EDIT)

- `web-react/package.json`, `package-lock.json`, all `tsconfig*.json`,
  `vite.config.ts`, `eslint.config.js`, `index.html`
- `web-react/src/main.tsx` and `web-react/src/App.tsx` (route table)
- everything under `../e2e-pw/` and the Angular app `../src/`

If you need a dependency added or a route/entrypoint change, append a
`## Requested orchestrator edits` section to your PR description with the exact edit.
Temporary harness routes: add your harness component under `src/harness/` and request
the route wiring in that section.

## Known quirks

- Angular's `time_ago` etc. come pre-formatted from the node-hnapi API — no date logic needed.
- The jobs feed has no user/points/comments links and shows the YC `p.job-header` text.
- `ol` numbering: `start = (page - 1) * 30 + 1` (`listStart`); `list-margin` class is
  applied unless feedType is `jobs`.
- Theme = class (`default` | `night` | `amoledblack`) on the top-level div in `App.tsx`,
  persisted to `localStorage.theme`; system `prefers-color-scheme` fallback is handled
  in `src/stores/settings.ts`.
- The live API's `/user/:id` endpoint currently returns 404 — the user page must render
  the error state exactly like Angular does (see `docs/E2E_BASELINE.md`).
