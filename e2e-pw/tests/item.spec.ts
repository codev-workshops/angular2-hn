import { test, expect } from '@playwright/test';

// Item 1 is the first HN story ever; it is stable and has comments.
const ITEM_WITH_COMMENTS = 1;

test('deep-linked item page renders title and comment thread', async ({ page }) => {
  await page.goto(`/item/${ITEM_WITH_COMMENTS}`);
  const item = page.locator('.item');
  await expect(item).toBeVisible();
  await expect(item.locator('.laptop a.title')).toBeVisible();
  const comments = page.locator('ul.comment-list > li');
  expect(await comments.count()).toBeGreaterThan(0);
  const firstMeta = comments.first().locator('.meta').first();
  await expect(firstMeta.locator('a[href^="/user/"]')).toBeVisible();
  await expect(firstMeta.locator('span.time')).toBeVisible();
});

test('comments can be collapsed and expanded', async ({ page }) => {
  await page.goto(`/item/${ITEM_WITH_COMMENTS}`);
  const firstComment = page.locator('ul.comment-list > li').first();
  const toggle = firstComment.locator('span.collapse').first();
  await expect(toggle).toHaveText('[-]');
  const text = firstComment.locator('p.comment-text').first();
  await expect(text).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveText('[+]');
  await expect(text).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveText('[-]');
  await expect(text).toBeVisible();
});

test('navigating from feed to an item shows its details', async ({ page }) => {
  await page.goto('/news/1');
  const commentLink = page.locator('li.post .subtext-laptop a[href^="/item/"]').first();
  await expect(commentLink).toBeVisible();
  await commentLink.click();
  await expect(page).toHaveURL(/\/item\/\d+$/);
  await expect(page.locator('.item')).toBeVisible();
  await expect(page.locator('.item .laptop a.title')).toBeVisible();
});
