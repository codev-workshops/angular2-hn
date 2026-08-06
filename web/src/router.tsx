import { createBrowserRouter, redirect } from 'react-router';
import { App } from './App';
import { Placeholder } from './features/placeholder';

export const router = createBrowserRouter([
    {
        path: '/',
        Component: App,
        children: [
            {
                index: true,
                loader: () => redirect('/news/1'),
                lazy: async () => ({ Component: Placeholder }),
            },
            {
                path: 'news/:page',
                handle: { feedType: 'news' },
                lazy: async () => ({ Component: Placeholder }),
            },
            {
                path: 'newest/:page',
                handle: { feedType: 'newest' },
                lazy: async () => ({ Component: Placeholder }),
            },
            {
                path: 'show/:page',
                handle: { feedType: 'show' },
                lazy: async () => ({ Component: Placeholder }),
            },
            {
                path: 'ask/:page',
                handle: { feedType: 'ask' },
                lazy: async () => ({ Component: Placeholder }),
            },
            {
                path: 'jobs/:page',
                handle: { feedType: 'jobs' },
                lazy: async () => ({ Component: Placeholder }),
            },
            {
                path: 'item/:id',
                lazy: async () => ({ Component: Placeholder }),
            },
            {
                path: 'user/:id',
                lazy: async () => ({ Component: Placeholder }),
            },
        ],
    },
]);
