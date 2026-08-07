import { installFixtures } from './fixtures.mjs';

/** Frozen animations and transitions, so a screenshot is reproducible. */
const freeze = `
*, *::before, *::after {
    transition: none !important;
    animation-play-state: paused !important;
}
.loader, .loader::before, .loader::after {
    animation: none !important;
}
`;

/**
 * Opens one case in one app: the API is served from fixtures, analytics is
 * blocked and `localStorage` is seeded before the first navigation, so both apps
 * see byte identical input.
 */
export async function openApp(browser, baseUrl, testCase, fixtures) {
    const context = await browser.newContext({
        viewport: testCase.viewport.size,
        deviceScaleFactor: 1,
        colorScheme: testCase.colorScheme ?? 'light',
    });
    await installFixtures(context, fixtures);
    if (testCase.hangApi) {
        await context.route('**/node-hnapi.herokuapp.com/**', () => {});
    }
    const page = await context.newPage();
    await page.addInitScript((storage) => {
        localStorage.clear();
        for (const [key, value] of Object.entries(storage)) {
            localStorage.setItem(key, value);
        }
    }, testCase.storage ?? {});
    await page.goto(baseUrl + testCase.route, { waitUntil: 'domcontentloaded' });
    await settle(page, testCase);
    return { context, page };
}

export async function screenshot(page) {
    await page.addStyleTag({ content: freeze });
    await page.waitForTimeout(150);
    return page.screenshot({ fullPage: true });
}

/** Full page PNG for one case in one app. */
export async function capture(browser, baseUrl, testCase, fixtures) {
    const { context, page } = await openApp(browser, baseUrl, testCase, fixtures);
    try {
        if (testCase.openSettings) {
            await page.click('.settings');
            await page.waitForSelector('.popup');
            await page.waitForTimeout(150);
        }
        return await screenshot(page);
    } finally {
        await context.close();
    }
}

export async function settle(page, testCase = {}) {
    if (testCase.hangApi) {
        // The API request never resolves, so the page never reaches network idle.
        await page.waitForSelector('.loading-section');
        await page.waitForTimeout(1000);
        return;
    } else {
        // Either the app rendered its content or it rendered the error state.
        await page.waitForFunction(
            () => {
                const root = document.querySelector('app-root');
                return (
                    root !== null &&
                    root.children.length > 0 &&
                    document.querySelector('.main-content > div, .profile, .error-section') !== null
                );
            },
            undefined,
            { timeout: 30000 }
        );
    }
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(
        () => document.fonts.status === 'loaded' && [...document.images].every((image) => image.complete),
        undefined,
        { timeout: 30000 }
    );
    await page.waitForTimeout(300);
}
