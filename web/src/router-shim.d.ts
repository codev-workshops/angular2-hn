declare module 'react-router' {
    export function createBrowserRouter(routes: unknown[]): unknown;
    export function RouterProvider(props: { router: unknown }): JSX.Element;
}
