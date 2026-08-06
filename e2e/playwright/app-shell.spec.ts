import { expect, test } from '@playwright/test';
import { stubHnApi } from './support/api';

test.beforeEach(async ({ page }) => stubHnApi(page));

test('renders the theme wrapper and booted app shell', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page).toHaveTitle('Angular 2 HN');
    await expect(page.locator('div.default')).toBeVisible();
    await expect(page.locator('div.body-cover')).toBeAttached();
    await expect(page.locator('div.wrapper')).toBeAttached();
    await expect(page.locator('div.app-loader#content > img.logo')).toBeAttached();
    await expect.poll(() => page.locator('app-root').evaluate(element => element.innerHTML.trim().length)).toBeGreaterThan(0);
});

test('renders header navigation and applies the active class to the current route', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('a.home-link')).toHaveAttribute('href', '/news/1');
    await expect(page.locator('div.logo-inner')).toBeAttached();
    await expect(page.locator('a.home-link img.logo')).toHaveAttribute('alt', 'Logo');
    const nav = page.locator('.header-nav');
    for (const [text, href] of [['new', '/newest/1'], ['show', '/show/1'], ['ask', '/ask/1'], ['jobs', '/jobs/1']] as const) {
        await expect(nav.locator(`a:has-text("${text}")`)).toHaveAttribute('href', href);
    }
    await expect(nav).toContainText('|');
    await expect(page.locator('img.settings')).toHaveAttribute('alt', 'Settings');
    await expect(page.locator('a.home-link')).toHaveClass(/active/);
    for (const [text, route] of [['new', '/newest/1'], ['show', '/show/1'], ['ask', '/ask/1'], ['jobs', '/jobs/1']] as const) {
        await nav.locator(`a:has-text("${text}")`).click();
        await expect(page).toHaveURL(new RegExp(`${route.replace('/', '\\/')}$`));
        await expect(nav.locator(`a:has-text("${text}")`)).toHaveClass(/active/);
    }
});

test('renders the footer and skip link', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('#footer')).toContainText('Show this project some ❤ on');
    await expect(page.locator('#footer a')).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
    await expect(page.locator('#footer a')).toHaveAttribute('target', '_blank');
    await expect(page.locator('#footer a')).toHaveAttribute('rel', 'noopener');
    await expect(page.locator('#skip a')).toHaveAttribute('href', '#content');
    await expect(page.locator('#skip a')).toHaveText('skip to navigation');
});

test('pins the legacy head, PWA metadata, icons, and noscript shell', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('base')).toHaveAttribute('href', '/');
    await expect(page.locator('meta[name=description]')).toHaveAttribute('content',
        'A Hacker News client built with Angular CLI, RxJS and Webpack');
    await expect(page.locator('meta[name=viewport]')).toHaveAttribute('content', 'width=device-width, initial-scale=1');
    for (const [name, content] of [
        ['twitter:card', 'summary'],
        ['twitter:site', '@hdjirdeh'],
        ['twitter:title', 'Angular 2 HN'],
        ['twitter:description', 'A Hacker News client built with Angular CLI, RxJS and Webpack'],
        ['twitter:creator', '@hdjirdeh'],
        ['twitter:image', 'assets/images/logo-loading.png'],
    ] as const) {
        await expect(page.locator(`meta[name="${name}"]`)).toHaveAttribute('content', content);
    }
    for (const [property, content] of [
        ['og:title', 'Angular 2 HN'],
        ['og:type', 'website'],
        ['og:url', 'https://angular2-hn.firebaseapp.com/'],
        ['og:image', 'assets/images/logo-loading.png'],
        ['og:description', 'A Hacker News client built with Angular CLI, RxJS and Webpack'],
        ['og:site_name', 'Angular 2 HN'],
    ] as const) {
        await expect(page.locator(`meta[property="${property}"]`)).toHaveAttribute('content', content);
    }
    await expect(page.locator('meta[name=theme-color]').first()).toHaveAttribute('content', '#b92b27');
    await expect(page.locator('meta[name=theme-color]').nth(1)).toHaveAttribute('content', '#1976d2');
    await expect(page.locator('link[rel=manifest][href="/manifest.json"]')).toHaveCount(1);
    await expect(page.locator('link[rel=manifest][href="manifest.webmanifest"]')).toHaveCount(1);
    await expect(page.locator('link[rel="mask-icon"]')).toHaveAttribute('href', 'assets/icons/safari-pinned-tab.svg');
    await expect(page.locator('link[rel=icon][type="image/x-icon"]')).toHaveAttribute('href', 'favicon.ico');
    await expect(page.locator('link[rel=icon][sizes="32x32"]')).toHaveAttribute('href', 'assets/icons/favicon-32x32.png');
    await expect(page.locator('link[rel=icon][sizes="16x16"]')).toHaveAttribute('href', 'assets/icons/favicon-16x16.png');
    await expect(page.locator('link[rel=apple-touch-icon]')).toHaveCount(4);
    await expect.poll(() => page.locator('div.app-loader#content noscript').evaluate(element => element.innerHTML))
        .toContain('Sorry, JavaScript needs to be enabled in order to run this application.');
});

test('navigates client-side without losing window state', async ({ page }) => {
    await page.addInitScript(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        if (navigation?.type !== 'reload') {
            (window as Window & { __paritySentinel?: string }).__paritySentinel = 'alive';
        }
    });
    await page.goto('/news/1');
    await expect(page).toHaveURL(/\/news\/1$/);
    await page.locator('.header-nav a:has-text("show")').click();
    await expect(page).toHaveURL(/\/show\/1$/);
    await expect.poll(() => page.evaluate(() => (window as Window & { __paritySentinel?: string }).__paritySentinel))
        .toBe('alive');
    await page.reload();
    await expect(page).toHaveURL(/\/show\/1$/);
    await expect.poll(() => page.evaluate(() => (window as Window & { __paritySentinel?: string }).__paritySentinel))
        .toBeUndefined();
});
