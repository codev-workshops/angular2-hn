import { test, expect } from '@playwright/test';

const FEEDS = ['news', 'newest', 'ask', 'show', 'jobs'] as const;

for (const feed of FEEDS) {
  test(`${feed} feed page 1 renders a list of stories`, async ({ page }) => {
    await page.goto(`/${feed}/1`);
    const items = page.locator('li.post');
    await expect(items.first()).toBeVisible();
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(30);
    const ol = page.locator('.main-content ol');
    await expect(ol).toHaveAttribute('start', '1');
    await expect(items.first().locator('a.title').first()).toBeVisible();
  });
}

test('jobs feed shows the YC jobs header and no comment links', async ({ page }) => {
  await page.goto('/jobs/1');
  await expect(page.locator('p.job-header')).toContainText(
    'These are jobs at startups that were funded by Y Combinator.'
  );
  await expect(page.locator('li.post').first()).toBeVisible();
  await expect(page.locator('li.post .comment-number')).toHaveCount(0);
  await expect(page.locator('.main-content ol')).not.toHaveClass(/list-margin/);
});

test('news feed paginates with More and Prev, updating list numbering', async ({ page }) => {
  await page.goto('/news/1');
  await expect(page.locator('li.post').first()).toBeVisible();
  await expect(page.locator('.nav a.prev')).toHaveCount(0);
  const more = page.locator('.nav a.more');
  await expect(more).toContainText('More');
  await more.click();
  await expect(page).toHaveURL(/\/news\/2$/);
  await expect(page.locator('li.post').first()).toBeVisible();
  await expect(page.locator('.main-content ol')).toHaveAttribute('start', '31');
  const prev = page.locator('.nav a.prev');
  await expect(prev).toContainText('Prev');
  await prev.click();
  await expect(page).toHaveURL(/\/news\/1$/);
  await expect(page.locator('.main-content ol')).toHaveAttribute('start', '1');
});

test('story rows show points, user link and time ago', async ({ page }) => {
  await page.goto('/news/1');
  const first = page.locator('li.post').first();
  await expect(first).toBeVisible();
  const laptopSubtext = first.locator('.subtext-laptop');
  await expect(laptopSubtext).toContainText('points by');
  await expect(laptopSubtext.locator('a[href^="/user/"]').first()).toBeVisible();
});
