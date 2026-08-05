import { test, expect } from '@playwright/test';

test('deep-linked user profile renders name, karma and created date', async ({ page }) => {
  await page.goto('/user/pg');
  const profile = page.locator('.profile');
  await expect(profile).toBeVisible();
  await expect(profile.locator('.main-details .name')).toHaveText('pg');
  await expect(profile.locator('.main-details .right')).toContainText('★');
  await expect(profile.locator('.main-details .age')).toContainText('Created');
});

test('user link on a story navigates to the profile page', async ({ page }) => {
  await page.goto('/news/1');
  const userLink = page.locator('li.post .subtext-laptop a[href^="/user/"]').first();
  await expect(userLink).toBeVisible();
  const userName = (await userLink.textContent())!.trim();
  await userLink.click();
  await expect(page).toHaveURL(new RegExp(`/user/${userName}$`));
  await expect(page.locator('.profile .main-details .name')).toHaveText(userName);
});
