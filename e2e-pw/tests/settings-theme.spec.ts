import { test, expect } from '@playwright/test';

async function openSettings(page) {
  await page.locator('img.settings').click();
  await expect(page.locator('.popup h1')).toHaveText('Settings');
}

test('theme switching applies the theme class and persists across reloads', async ({ page }) => {
  await page.goto('/news/1');
  await expect(page.locator('li.post').first()).toBeVisible();
  await openSettings(page);
  await page.locator('input[type=radio][value=night]').check();
  await expect(page.locator('div.night .wrapper')).toBeVisible();
  await page.locator('.popup .close').click();
  await page.reload();
  await expect(page.locator('div.night .wrapper')).toBeVisible();
  await openSettings(page);
  await page.locator('input[type=radio][value=amoledblack]').check();
  await expect(page.locator('div.amoledblack .wrapper')).toBeVisible();
  await page.reload();
  await expect(page.locator('div.amoledblack .wrapper')).toBeVisible();
  await openSettings(page);
  await page.locator('input[type=radio][value=default]').check();
  await expect(page.locator('div.default .wrapper')).toBeVisible();
});

test('open links in new tab setting adds target=_blank to story links', async ({ page }) => {
  await page.goto('/news/1');
  await expect(page.locator('li.post').first()).toBeVisible();
  const externalTitle = page.locator('li.post a.title[href^="http"]').first();
  await expect(externalTitle).not.toHaveAttribute('target', '_blank');
  await openSettings(page);
  await page.locator('.control-section input[type=checkbox]').check();
  await page.locator('.popup .close').click();
  await expect(externalTitle).toHaveAttribute('target', '_blank');
  await expect(externalTitle).toHaveAttribute('rel', 'noopener');
  await page.reload();
  await expect(page.locator('li.post a.title[href^="http"]').first()).toHaveAttribute('target', '_blank');
});

test('font size setting changes story title font size', async ({ page }) => {
  await page.goto('/news/1');
  await expect(page.locator('li.post').first()).toBeVisible();
  await openSettings(page);
  const fontInput = page.locator('.control-section label', { hasText: 'Font size:' }).locator('input');
  await fontInput.fill('20');
  await fontInput.press('ArrowRight');
  const title = page.locator('li.post a.title').first();
  await expect(title).toHaveCSS('font-size', '20px');
});
