import { test, expect } from '@playwright/test';

test('root URL redirects to /news/1', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/news\/1$/);
  await expect(page.locator('li.post').first()).toBeVisible();
});

test('app shell (header nav and footer) renders on every deep link', async ({ page }) => {
  for (const path of ['/ask/2', '/item/1', '/user/pg']) {
    await page.goto(path);
    await expect(page.locator('header a.home-link img.logo')).toBeVisible();
    const nav = page.locator('.header-nav');
    for (const link of ['new', 'show', 'ask', 'jobs']) {
      await expect(nav.locator('a', { hasText: link })).toBeVisible();
    }
    await expect(page.locator('#footer')).toContainText('Show this project some');
  }
});

test('header navigation links route to feed pages', async ({ page }) => {
  await page.goto('/news/1');
  await page.locator('.header-nav a', { hasText: 'ask' }).click();
  await expect(page).toHaveURL(/\/ask\/1$/);
  await expect(page.locator('li.post').first()).toBeVisible();
  await page.locator('a.home-link').click();
  await expect(page).toHaveURL(/\/news\/1$/);
});

test('deep link to a later feed page numbers items from the correct offset', async ({ page }) => {
  await page.goto('/newest/3');
  await expect(page.locator('li.post').first()).toBeVisible();
  await expect(page.locator('.main-content ol')).toHaveAttribute('start', '61');
});
