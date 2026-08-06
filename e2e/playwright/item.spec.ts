import { expect, test } from '@playwright/test';
import { stubHnApi } from './support/api';

test.describe('item details', () => {
    test.beforeEach(async ({ page }) => stubHnApi(page));

    test('renders title, subject HTML, nested comments, and collapse behavior', async ({ page }) => {
        await page.goto('/item/49195231');
        await expect(page.locator('div.item')).toBeVisible();
        await expect(page.locator('.mobile .title-block .back-button')).toBeAttached();
        await expect(page.locator('.mobile .title-block a.title')).toHaveAttribute('href',
            'https://www.mayerowitz.io/blog/mario-meets-pareto');
        await expect(page.locator('.laptop .subtext')).toContainText('points by');
        await expect(page.locator('ul.comment-list')).toBeVisible();
        expect(await page.locator('ul.subtree').count()).toBeGreaterThan(2);
        await expect(page.locator('.comment-text i, .comment-text a').first()).toBeAttached();
        const parent = page.locator('.meta').filter({ has: page.locator('a[href="/user/jerf"]') }).first();
        await expect(parent.locator('span.collapse')).toHaveText('[-]');
        await expect(parent.locator('a')).toHaveAttribute('href', '/user/jerf');
        await expect(parent.locator('span.time')).toHaveText('3 hours ago');
        await expect(page.locator('.meta').filter({ has: page.locator('a[href="/user/Agentlien"]') }).first()).toBeVisible();
        await parent.locator('span.collapse').click();
        await expect(parent).toHaveClass(/meta-collapse/);
        await expect(parent.locator('span.collapse')).toHaveText('[+]');
        await expect(parent.locator('xpath=..').locator('.comment-tree > div').first()).toBeHidden();
        await expect(page.locator('.meta').filter({ has: page.locator('a[href="/user/Agentlien"]') }).first()).toBeVisible();
        await parent.locator('span.collapse').click();
        await expect(parent.locator('span.collapse')).toHaveText('[-]');
        await expect(page.locator('.deleted-meta')).toHaveCount(0);

        await page.goto('/item/49195232');
        await expect(page.locator('p.subject')).toContainText('Subject HTML');
        await expect(page.locator('p.subject strong')).toBeAttached();
        await expect(page.locator('.deleted-meta')).toHaveCount(1);
        await expect(page.locator('.deleted-meta')).toContainText('[deleted] | Comment Deleted');
    });

    test('poll fan-out renders options and percentage bars', async ({ page }) => {
        const requests: string[] = [];
        page.on('request', request => requests.push(request.url()));
        await page.goto('/item/7000');
        await expect(page.locator('.pollResults .pollContent')).toHaveCount(2);
        await expect(page.locator('.pollContent').nth(0)).toContainText('Option A');
        await expect(page.locator('.pollContent').nth(0).locator('b')).toHaveText('Option A');
        await expect(page.locator('.pollContent').nth(0)).toContainText('3 points');
        await expect(page.locator('.pollContent').nth(1)).toContainText('7 points');
        await expect(page.locator('.pollBar').nth(0)).toHaveAttribute('style', /width:\s*30%/);
        await expect(page.locator('.pollBar').nth(1)).toHaveAttribute('style', /width:\s*70%/);
        expect(requests.some(url => url.endsWith('/item/7001'))).toBeTruthy();
        expect(requests.some(url => url.endsWith('/item/7002'))).toBeTruthy();
        await expect(page.locator('.laptop')).not.toHaveClass(/item-header/);
        await expect(page.locator('.laptop')).toHaveClass(/head-margin/);
        await page.goto('/item/7003');
        await expect(page.locator('.laptop')).toHaveClass(/item-header/);
        await expect(page.locator('.laptop')).not.toHaveClass(/head-margin/);
    });

    test('back button returns to history', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 800 });
        await page.goto('/news/1');
        await page.goto('/item/49195231');
        await page.locator('.mobile .back-button').click();
        await expect(page).toHaveURL(/\/news\/1$/);
    });
});
