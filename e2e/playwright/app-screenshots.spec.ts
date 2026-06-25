import { test, expect } from '@playwright/test';
import path from 'path';

const screenshotsDir = path.join(__dirname, 'screenshots');

test.describe('Angular 2 HN - Page Screenshots', () => {

    test('01 - News feed (home page)', async ({ page }) => {
        await page.goto('/news/1');
        await page.waitForSelector('.main-content ol li', { timeout: 15_000 });
        await page.screenshot({ path: path.join(screenshotsDir, '01-news-feed.png'), fullPage: true });
        await expect(page.locator('.main-content ol')).toBeVisible();
    });

    test('02 - News feed page 2', async ({ page }) => {
        await page.goto('/news/2');
        await page.waitForSelector('.main-content ol li', { timeout: 15_000 });
        await page.screenshot({ path: path.join(screenshotsDir, '02-news-feed-page2.png'), fullPage: true });
    });

    test('03 - Newest feed', async ({ page }) => {
        await page.goto('/newest/1');
        await page.waitForSelector('.main-content ol li', { timeout: 15_000 });
        await page.screenshot({ path: path.join(screenshotsDir, '03-newest-feed.png'), fullPage: true });
    });

    test('04 - Show HN feed', async ({ page }) => {
        await page.goto('/show/1');
        await page.waitForSelector('.main-content ol li', { timeout: 15_000 });
        await page.screenshot({ path: path.join(screenshotsDir, '04-show-feed.png'), fullPage: true });
    });

    test('05 - Ask HN feed', async ({ page }) => {
        await page.goto('/ask/1');
        await page.waitForSelector('.main-content ol li', { timeout: 15_000 });
        await page.screenshot({ path: path.join(screenshotsDir, '05-ask-feed.png'), fullPage: true });
    });

    test('06 - Jobs feed', async ({ page }) => {
        await page.goto('/jobs/1');
        await page.waitForSelector('.main-content .job-header', { timeout: 15_000 });
        await page.screenshot({ path: path.join(screenshotsDir, '06-jobs-feed.png'), fullPage: true });
    });

    test('07 - Item detail page', async ({ page }) => {
        await page.goto('/news/1');
        await page.waitForSelector('.main-content ol li', { timeout: 15_000 });
        const commentsLink = page.locator('.subtext-laptop a[href^="/item/"]').first();
        await commentsLink.click();
        await page.waitForSelector('app-item-details', { timeout: 15_000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotsDir, '07-item-detail.png'), fullPage: true });
    });

    test('08 - User profile page', async ({ page }) => {
        await page.goto('/news/1');
        await page.waitForSelector('.main-content ol li', { timeout: 15_000 });
        const userLink = page.locator('.subtext-laptop a[href^="/user/"]').first();
        await userLink.click();
        await page.waitForSelector('app-user', { timeout: 15_000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotsDir, '08-user-profile.png'), fullPage: true });
    });

    test('09 - Mobile viewport - News feed', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/news/1');
        await page.waitForSelector('.main-content ol li', { timeout: 15_000 });
        await page.screenshot({ path: path.join(screenshotsDir, '09-mobile-news-feed.png'), fullPage: true });
    });

    test('10 - Tablet viewport - News feed', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/news/1');
        await page.waitForSelector('.main-content ol li', { timeout: 15_000 });
        await page.screenshot({ path: path.join(screenshotsDir, '10-tablet-news-feed.png'), fullPage: true });
    });

});
