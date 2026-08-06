import { expect, test } from '@playwright/test';
import { errorBody, stubHnApi } from './support/api';

test.describe('users', () => {
    test.beforeEach(async ({ page }) => stubHnApi(page));

    test('renders profile details and trusted about HTML', async ({ page }) => {
        await page.goto('/user/fixture-user');
        await expect(page.locator('.profile')).toBeVisible();
        await expect(page.locator('.title-block')).toContainText('Profile: fixture-user');
        await expect(page.locator('.main-details .name')).toHaveText('fixture-user');
        await expect(page.locator('.main-details .right')).toContainText('1234 ★');
        await expect(page.locator('.age')).toHaveText('Created Nov 14, 2023');
        await expect(page.locator('.other-details strong')).toBeAttached();
        await expect(page.locator('.other-details a')).toBeAttached();
    });

    test('omits absent about and reports user errors', async ({ page }) => {
        await page.goto('/user/quiet-user');
        await expect(page.locator('.profile')).toBeVisible();
        await expect(page.locator('.other-details')).toHaveCount(0);
        await page.route('**node-hnapi.herokuapp.com/user/missing-user', route =>
            route.fulfill(errorBody()));
        await page.goto('/user/missing-user');
        await expect(page.locator('p.strong')).toHaveText('Could not load user missing-user.');
    });
});
