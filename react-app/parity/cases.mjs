/** The case matrix both parity scripts share. */

export const apps = {
    angular: 'http://localhost:4200',
    react: 'http://localhost:5173',
};

export const viewports = [
    { name: 'desktop', size: { width: 1280, height: 900 } },
    { name: 'mobile', size: { width: 375, height: 667 } },
];

export const themes = ['default', 'night', 'amoledblack'];

/** Ids come from `parity/fixtures/*.json`; `12345678` is the hand-written poll. */
export const routes = [
    { name: 'feed-news-1', route: '/news/1' },
    { name: 'feed-news-2', route: '/news/2' },
    { name: 'feed-newest', route: '/newest/1' },
    { name: 'feed-show', route: '/show/1' },
    { name: 'feed-ask', route: '/ask/1' },
    { name: 'feed-jobs', route: '/jobs/1' },
    { name: 'feed-empty', route: '/news/9' },
    { name: 'feed-error', route: '/news/404' },
    { name: 'item-story', route: '/item/49204060' },
    { name: 'item-ask', route: '/item/49192693' },
    { name: 'item-job', route: '/item/49171650' },
    { name: 'item-poll', route: '/item/12345678' },
    { name: 'item-error', route: '/item/99999999' },
    { name: 'user', route: '/user/worik' },
    { name: 'user-no-about', route: '/user/nobody' },
    { name: 'user-error', route: '/user/missing' },
    { name: 'redirect-root', route: '/' },
];

/** Static screenshot cases: every route x every theme x desktop + mobile. */
export function staticCases() {
    const cases = [];
    for (const { name, route } of routes) {
        for (const theme of themes) {
            for (const viewport of viewports) {
                cases.push({
                    name: `${name}--${theme}--${viewport.name}`,
                    route,
                    viewport,
                    storage: { theme },
                });
            }
        }
    }

    // Preference values that are not the defaults.
    for (const viewport of viewports) {
        cases.push({
            name: `settings-open--default--${viewport.name}`,
            route: '/news/1',
            viewport,
            storage: { theme: 'default' },
            openSettings: true,
        });
        cases.push({
            name: `settings-open--night--${viewport.name}`,
            route: '/news/1',
            viewport,
            storage: { theme: 'night' },
            openSettings: true,
        });
        cases.push({
            name: `settings-open--amoledblack--${viewport.name}`,
            route: '/news/1',
            viewport,
            storage: { theme: 'amoledblack' },
            openSettings: true,
        });
        cases.push({
            name: `settings-open-custom-prefs--${viewport.name}`,
            route: '/news/1',
            viewport,
            storage: { theme: 'night', titleFontSize: '22', listSpacing: '12', openLinkInNewTab: 'true' },
            openSettings: true,
        });
        cases.push({
            name: `feed-custom-font-spacing--${viewport.name}`,
            route: '/news/1',
            viewport,
            storage: { theme: 'default', titleFontSize: '22', listSpacing: '12' },
        });
        // Emptying a preference box stores an empty string; both apps must fall
        // back to the defaults, which is visible in the panel's number inputs.
        cases.push({
            name: `settings-open-empty-stored-prefs--${viewport.name}`,
            route: '/news/1',
            viewport,
            storage: { theme: 'default', titleFontSize: '', listSpacing: '' },
            openSettings: true,
        });
        cases.push({
            name: `item-open-links-in-new-tab--${viewport.name}`,
            route: '/item/49204060',
            viewport,
            storage: { theme: 'default', openLinkInNewTab: 'true' },
        });
        // No stored theme at all: both apps must follow the OS colour scheme.
        cases.push({
            name: `system-dark-scheme--${viewport.name}`,
            route: '/news/1',
            viewport,
            storage: {},
            colorScheme: 'dark',
        });
        cases.push({
            name: `system-light-scheme--${viewport.name}`,
            route: '/news/1',
            viewport,
            storage: {},
            colorScheme: 'light',
        });
        // The loader, with its animation frozen so the comparison is stable.
        cases.push({
            name: `loading--default--${viewport.name}`,
            route: '/news/1',
            viewport,
            storage: { theme: 'default' },
            hangApi: true,
        });
    }

    return cases;
}
