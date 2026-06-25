import { test, expect } from '@playwright/test';

test.describe('Angular HN PWA', () => {
    test('news feed loads and displays stories', async ({ page }) => {
        await page.goto('/news/1');
        await page.waitForSelector('ol li.post', { timeout: 15000 });

        const posts = page.locator('ol li.post');
        await expect(posts.first()).toBeVisible();

        const header = page.locator('#header');
        await expect(header).toBeVisible();

        await page.screenshot({ path: 'e2e-playwright/screenshots/news-feed.png', fullPage: true });
    });

    test('navigate to newest feed', async ({ page }) => {
        await page.goto('/news/1');
        await page.waitForSelector('ol li.post', { timeout: 15000 });

        await page.click('a[routerLink="/newest/1"]');
        await page.waitForSelector('ol li.post', { timeout: 15000 });
        await expect(page).toHaveURL(/\/newest\/1/);

        await page.screenshot({ path: 'e2e-playwright/screenshots/newest-feed.png', fullPage: true });
    });

    test('navigate to show feed', async ({ page }) => {
        await page.goto('/show/1');
        await page.waitForSelector('ol li.post', { timeout: 15000 });
        await expect(page).toHaveURL(/\/show\/1/);

        await page.screenshot({ path: 'e2e-playwright/screenshots/show-feed.png', fullPage: true });
    });

    test('navigate to ask feed', async ({ page }) => {
        await page.goto('/ask/1');
        await page.waitForSelector('ol li.post', { timeout: 15000 });
        await expect(page).toHaveURL(/\/ask\/1/);

        await page.screenshot({ path: 'e2e-playwright/screenshots/ask-feed.png', fullPage: true });
    });

    test('navigate to jobs feed', async ({ page }) => {
        await page.goto('/jobs/1');
        await page.waitForSelector('.main-content', { timeout: 15000 });
        await expect(page).toHaveURL(/\/jobs\/1/);

        const jobHeader = page.locator('p.job-header');
        await expect(jobHeader).toBeVisible();

        await page.screenshot({ path: 'e2e-playwright/screenshots/jobs-feed.png', fullPage: true });
    });

    test('pagination works on news feed', async ({ page }) => {
        await page.goto('/news/1');
        await page.waitForSelector('ol li.post', { timeout: 15000 });

        const moreLink = page.locator('a.more');
        await expect(moreLink).toBeVisible();

        await moreLink.click();
        await page.waitForSelector('ol li.post', { timeout: 15000 });
        await expect(page).toHaveURL(/\/news\/2/);

        await page.screenshot({ path: 'e2e-playwright/screenshots/news-page-2.png', fullPage: true });
    });

    test('settings panel toggles', async ({ page }) => {
        await page.goto('/news/1');
        await page.waitForSelector('#header', { timeout: 15000 });

        await page.click('img.settings');
        await page.waitForSelector('app-settings .overlay', { timeout: 5000 });

        await page.screenshot({ path: 'e2e-playwright/screenshots/settings-open.png', fullPage: true });
    });

    test('home page redirects to news/1', async ({ page }) => {
        await page.goto('/');
        await page.waitForURL(/\/news\/1/, { timeout: 15000 });
        await page.waitForSelector('ol li.post', { timeout: 15000 });

        await expect(page).toHaveURL(/\/news\/1/);
        await page.screenshot({ path: 'e2e-playwright/screenshots/home-redirect.png', fullPage: true });
    });
});
