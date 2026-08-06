import { expect, test } from '@playwright/test';
import { stubHnApi } from './support/api';

async function openSettings(page: import('@playwright/test').Page) {
    await page.locator('img.settings').click();
    await expect(page.locator('#popup1.overlay .popup')).toBeVisible();
}

test.describe('settings', () => {
    test.beforeEach(async ({ page }) => {
        await stubHnApi(page);
        await page.goto('/news/1');
    });

    test('opens and closes the settings popup and persists themes', async ({ page }) => {
        await openSettings(page);
        await page.locator('span.close').click();
        await expect(page.locator('#popup1')).toBeHidden();
        for (const theme of ['night', 'amoledblack', 'default']) {
            await openSettings(page);
            await page.locator(`input[type=radio][value=${theme}]`).click();
            await expect(page.locator(`div.${theme}`)).toBeVisible();
            await expect.poll(() => page.evaluate(() => localStorage.getItem('theme'))).toBe(theme);
            await page.locator('span.close').click();
        }
        await page.reload();
        await openSettings(page);
        await expect(page.locator('input[type=radio][value=default]')).toBeChecked();
    });

    test('persists font size, spacing, and new-tab links through reload', async ({ page }) => {
        await openSettings(page);
        const font = page.locator('input[type=number]').nth(0);
        const spacing = page.locator('input[type=number]').nth(1);
        await font.fill('22'); await font.press('End');
        await spacing.fill('9'); await spacing.press('End');
        await expect(page.locator('a.title').first()).toHaveCSS('font-size', '22px');
        await expect(page.locator('li.post > .item-block > div').first()).toHaveCSS('margin-bottom', '9px');
        await expect.poll(() => page.evaluate(() => localStorage.getItem('titleFontSize'))).toBe('22');
        await expect.poll(() => page.evaluate(() => localStorage.getItem('listSpacing'))).toBe('9');
        await page.locator('input[type=checkbox]').check();
        await expect(page.locator('a.title').first()).toHaveAttribute('target', '_blank');
        await expect(page.locator('a.title').first()).toHaveAttribute('rel', 'noopener');
        await expect.poll(() => page.evaluate(() => localStorage.getItem('openLinkInNewTab'))).toBe('true');
        await page.reload();
        await openSettings(page);
        await expect(font).toHaveValue('22');
        await expect(spacing).toHaveValue('9');
        await expect(page.locator('input[type=checkbox]')).toBeChecked();
        await page.locator('span.close').click();
        await expect(page.locator('a.title').first()).toHaveAttribute('target', '_blank');
        await page.goto('/item/49195231');
        await expect(page.locator('.laptop a.title').first()).toHaveAttribute('target', '_blank');
        await expect(page.locator('.laptop a.title').first()).toHaveAttribute('rel', 'noopener');
        await page.goto('/news/1');
        await openSettings(page);
        await page.locator('input[type=checkbox]').uncheck();
        await page.locator('span.close').click();
        await expect(page.locator('a.title').first()).not.toHaveAttribute('target', '_blank');
        await expect(page.locator('a.title').first()).not.toHaveAttribute('rel', 'noopener');
    });

    test('pre-seeded settings initialize the controls', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('theme', 'amoledblack');
            localStorage.setItem('titleFontSize', '19');
            localStorage.setItem('listSpacing', '4');
            localStorage.setItem('openLinkInNewTab', 'true');
        });
        await page.reload();
        await expect(page.locator('div.amoledblack')).toBeVisible();
        await openSettings(page);
        await expect(page.locator('input[value=amoledblack]')).toBeChecked();
        await expect(page.locator('input[type=number]').nth(0)).toHaveValue('19');
        await expect(page.locator('input[type=number]').nth(1)).toHaveValue('4');
        await expect(page.locator('input[type=checkbox]')).toBeChecked();
    });
});

test.describe('system theme defaults', () => {
    test.use({ colorScheme: 'dark' });
    test('dark prefers night and light prefers default', async ({ page }) => {
        await stubHnApi(page);
        await page.goto('/news/1');
        await expect(page.locator('div.night')).toBeVisible();
    });
});

test.describe('light system theme default', () => {
    test.use({ colorScheme: 'light' });
    test('light prefers default', async ({ page }) => {
        await stubHnApi(page);
        await page.goto('/news/1');
        await expect(page.locator('div.default')).toBeVisible();
    });
});
