import { expect, test } from '@playwright/test';
import { emptyBody, errorBody, nullBody, objectBody, stubHnApi } from './support/api';

const offline = "If you are offline viewing, you'll need to visit this page with a network connection first before it can work offline.";

test('feed loading and non-JSON error states show the loader then exact offline error', async ({ page }) => {
    const errors: Error[] = [];
    page.on('pageerror', error => errors.push(error));
    await stubHnApi(page, { delay: 300 });
    await page.route('**node-hnapi.herokuapp.com/news?page=1', async route => {
        await new Promise(resolve => setTimeout(resolve, 300));
        await route.fulfill(errorBody());
    });
    await page.goto('/news/1');
    await expect(page.locator('div.loading-section .loader')).toHaveText('Loading...');
    await expect(page.locator('div.error-section p.strong')).toHaveText('Could not load news stories.');
    await expect(page.locator('.error-section')).toContainText(offline);
    expect(errors).toHaveLength(0);
});

test('empty feed body renders an empty list without pagination', async ({ page }) => {
    const errors: Error[] = [];
    page.on('pageerror', error => errors.push(error));
    await stubHnApi(page);
    await page.route('**node-hnapi.herokuapp.com/news?page=1', route =>
        route.fulfill({ contentType: 'application/json', body: JSON.stringify(emptyBody().body) }));
    await page.goto('/news/1');
    await expect(page.locator('ol')).toBeAttached();
    await expect(page.locator('li.post')).toHaveCount(0);
    await expect(page.locator('a.prev, a.more')).toHaveCount(0);
    expect(errors).toHaveLength(0);
});

test('null feed body leaves the loader visible without an error', async ({ page }) => {
    const errors: Error[] = [];
    page.on('pageerror', error => errors.push(error));
    await stubHnApi(page);
    await page.route('**node-hnapi.herokuapp.com/news?page=1', route =>
        route.fulfill({ contentType: 'application/json', body: JSON.stringify(nullBody().body) }));
    await page.goto('/news/1');
    await expect(page.locator('.loading-section .loader')).toBeVisible();
    await expect(page.locator('.error-section')).toHaveCount(0);
    expect(errors).toHaveLength(0);
});

test('object feed body does not crash and renders no items', async ({ page }) => {
    const errors: Error[] = [];
    page.on('pageerror', error => errors.push(error));
    await stubHnApi(page);
    await page.route('**node-hnapi.herokuapp.com/news?page=1', route =>
        route.fulfill({ contentType: 'application/json', body: JSON.stringify(objectBody()) }));
    await page.goto('/news/1');
    await expect(page.locator('ol')).toBeAttached();
    await expect(page.locator('li.post')).toHaveCount(0);
    expect(errors).toHaveLength(0);
});

for (const [kind, url, message] of [
    ['item', '/item/49195231', 'Could not load item comments.'],
    ['user', '/user/missing-user', 'Could not load user missing-user.'],
] as const) {
    test(`${kind} loading and non-JSON error state`, async ({ page }) => {
        const errors: Error[] = [];
        page.on('pageerror', error => errors.push(error));
        await stubHnApi(page);
        await page.route(`**node-hnapi.herokuapp.com/${kind === 'item' ? 'item/49195231' : 'user/missing-user'}`,
            async route => {
                await new Promise(resolve => setTimeout(resolve, 300));
                await route.fulfill(errorBody());
            });
        await page.goto(url);
        await expect(page.locator('.loading-section .loader')).toHaveText('Loading...');
        await expect(page.locator('.error-section p.strong')).toHaveText(message);
        await expect(page.locator('.error-section')).toContainText(offline);
        expect(errors).toHaveLength(0);
    });
}

test('null user remains loading while null item becomes an item error', async ({ page }) => {
    const errors: Error[] = [];
    page.on('pageerror', error => errors.push(error));
    await stubHnApi(page, {
        items: { '49195231': nullBody() },
        users: { 'fixture-user': nullBody() },
    });
    await page.goto('/item/49195231');
    await expect(page.locator('p.strong')).toHaveText('Could not load item comments.');
    await page.goto('/user/fixture-user');
    await expect(page.locator('.loader')).toBeVisible();
    await expect(page.locator('.error-section')).toHaveCount(0);
    expect(errors).toHaveLength(0);
});
