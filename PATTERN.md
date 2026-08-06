# React migration pattern

| Angular                          | React                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------ |
| Injectable service               | Module of async functions plus a zustand store for state                       |
| `@Input()`                       | Props                                                                          |
| `@Output()`                      | Callback props                                                                 |
| `*ngIf`                          | `&&` or an early return                                                        |
| `*ngFor`                         | `.map` with stable keys                                                        |
| `[ngClass]` / `[class.x]`        | Template-literal string building; do not add a class utility                   |
| `[ngStyle]`                      | `style={{}}`                                                                   |
| `[innerHTML]`                    | `sanitizeHtml` from `web/src/lib/html.ts`; never raw `dangerouslySetInnerHTML` |
| Content projection               | `children`                                                                     |
| `routerLink`                     | `<Link>`                                                                       |
| `routerLinkActive="active"`      | `<NavLink className={({ isActive }) => (isActive ? 'active' : '')}>`           |
| `Location.back()`                | `useNavigate()(-1)`                                                            |
| `ActivatedRoute.params` / `data` | `useParams()` plus route-level static data                                     |

## Gotchas

- Use route-level `lazy` in the data router, never bare `React.lazy`: React.lazy commits the URL before
  the chunk mounts, while the frozen specs assert immediately after navigation.
- React unmounts the whole tree on a render error where Angular silently ignored a bad response shape.
  Every list and field read must tolerate `null` and non-array bodies explicitly.
- The class names and element structure in `MIGRATION-INVARIANTS.md` are a frozen contract. Never rename
  or restructure them for convenience.
- `window.ga` may be undefined. Guard analytics calls before invoking them.
