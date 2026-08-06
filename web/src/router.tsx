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
            },
            {
                path: 'news/:page',
                handle: { feedType: 'news' },
                lazy: async () =>
                    import('./features/feeds/FeedPage').then(({ FeedPage: Component }) => ({ Component })),
            },
            {
                path: 'newest/:page',
                handle: { feedType: 'newest' },
                lazy: async () =>
                    import('./features/feeds/FeedPage').then(({ FeedPage: Component }) => ({ Component })),
            },
            {
                path: 'show/:page',
                handle: { feedType: 'show' },
                lazy: async () =>
                    import('./features/feeds/FeedPage').then(({ FeedPage: Component }) => ({ Component })),
            },
            {
                path: 'ask/:page',
                handle: { feedType: 'ask' },
                lazy: async () =>
                    import('./features/feeds/FeedPage').then(({ FeedPage: Component }) => ({ Component })),
            },
            {
                path: 'jobs/:page',
                handle: { feedType: 'jobs' },
                lazy: async () =>
                    import('./features/feeds/FeedPage').then(({ FeedPage: Component }) => ({ Component })),
            },
            {
                path: 'item/:id',
                lazy: async () => ({ Component: (await import('./features/item/ItemDetailsPage')).ItemDetailsPage }),
            },
            {
                path: 'user/:id',
                lazy: async () => ({ Component: (await import('./features/user/UserPage')).UserPage }),
            },
        ],
    },
]);
