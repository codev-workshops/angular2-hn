import { expect, test } from '@playwright/test';
import { emptyBody, shortFeed, stubHnApi } from './support/api';

const feeds = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

test.describe('feeds', () => {
    test.beforeEach(async ({ page }) => stubHnApi(page));

    for (const feed of feeds) {
        test(`${feed} renders its 30-item feed`, async ({ page }) => {
            await page.goto(`/${feed}/1`);
            await expect(page.locator('li.post')).toHaveCount(30);
            await expect(page.locator('ol')).toHaveAttribute('start', '1');
            if (feed === 'jobs') {
                await expect(page.locator('ol')).not.toHaveClass(/list-margin/);
                await expect(page.locator('p.job-header')).toContainText('These are jobs at startups');
                await expect(page.locator('p.job-header a')).toHaveAttribute('href', 'https://triplebyte.com/?ref=yc_jobs');
            } else {
                await expect(page.locator('ol')).toHaveClass(/list-margin/);
                await expect(page.locator('p.job-header')).toHaveCount(0);
            }
        });
    }

    test('renders story branches, mobile/laptop metadata, and job omissions', async ({ page }) => {
        await page.goto('/ask/1');
        const first = page.locator('li.post').first();
        await expect(first.locator('a.title')).toHaveAttribute('href', /\/item\//);
        await expect(first.locator('span.domain')).toHaveCount(0);
        await expect(first.locator('.subtext-laptop')).toContainText('8 points by spottedmarley');
        await expect(first.locator('.subtext-laptop')).toContainText('4 comments');
        await expect(first.locator('.subtext-laptop span.item-details')).toContainText('2 hours ago');
        await expect(first.locator('.subtext-palm')).toContainText('8 ★');
        await expect(first.locator('.subtext-palm .details').nth(1)).toContainText('2 hours ago');
        await expect(first.locator('.subtext-palm a.comment-number')).toContainText('•');
        await expect(first.locator('.subtext-laptop span.item-details')).toHaveClass(/item-details/);
        await page.goto('/jobs/1');
        const jobs = page.locator('li.post').filter({ hasText: 'Truemetrics' }).first();
        await expect(jobs.locator('.subtext-laptop')).not.toContainText('points by');
        await expect(jobs.locator('.subtext-laptop span.item-details')).toHaveCount(0);
        await expect(jobs.locator('.subtext-palm .name')).toHaveCount(0);
        await expect(jobs.locator('.comment-number')).toHaveCount(0);
        await expect(jobs.locator('.subtext-palm .details')).toHaveCount(1);
    });

    test('renders discuss, singular comment, and plural comments labels', async ({ page }) => {
        await page.route('**node-hnapi.herokuapp.com/news?page=1', route =>
            route.fulfill({ contentType: 'application/json', body: JSON.stringify(shortFeed) }));
        await page.goto('/news/1');
        await expect(page.locator('li.post').nth(0).locator('.subtext-laptop')).toContainText('discuss');
        await expect(page.locator('li.post').nth(1).locator('.subtext-laptop')).toContainText('1 comment');
        await expect(page.locator('li.post').nth(2).locator('.subtext-laptop')).toContainText('7 comments');
    });

    test('paginates and handles a short feed without More', async ({ page }) => {
        await page.goto('/news/1');
        await expect(page.locator('a.prev')).toHaveCount(0);
        await expect(page.locator('a.more')).toHaveCount(1);
        await page.locator('a.more').click();
        await expect(page).toHaveURL(/\/news\/2$/);
        await expect(page.locator('ol')).toHaveAttribute('start', '31');
        await expect(page.locator('a.prev')).toHaveCount(1);
        await page.locator('a.prev').click();
        await expect(page).toHaveURL(/\/news\/1$/);

        await page.route('**node-hnapi.herokuapp.com/news?page=1', route =>
            route.fulfill({ contentType: 'application/json', body: JSON.stringify(emptyBody().body) }));
        await page.reload();
        await expect(page.locator('li.post')).toHaveCount(0);
        await expect(page.locator('a.prev, a.more')).toHaveCount(0);

        await page.unroute('**node-hnapi.herokuapp.com/news?page=1');
        await page.route('**node-hnapi.herokuapp.com/news?page=1', route =>
            route.fulfill({ contentType: 'application/json', body: JSON.stringify(shortFeed) }));
        await page.reload();
        await expect(page.locator('li.post')).toHaveCount(12);
        await expect(page.locator('a.more')).toHaveCount(0);
    });
});
