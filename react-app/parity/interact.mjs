/**
 * Interaction parity: every step is performed in both apps and, after each one,
 * the URL, `localStorage`, selected DOM assertions and a full page screenshot
 * must agree.
 *
 *     npm run parity:interact
 *     npm run parity:interact -- settings
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { chromium } from 'playwright';

import { apps, viewports } from './cases.mjs';
import { openApp, screenshot, settle } from './browser.mjs';
import { loadFixtures } from './fixtures.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const outputDir = join(here, 'screenshots-interact');

const desktop = viewports[0];
const mobile = viewports[1];

/**
 * A framework agnostic description of the focused element: Angular's
 * development build leaves `ng-reflect-*` and `routerlink` attributes in the
 * markup, so the raw HTML can never match.
 */
const focusedElement = (page) =>
    page.evaluate(() => {
        const element = document.activeElement;
        return element === null
            ? null
            : {
                  tag: element.tagName,
                  class: element.className,
                  href: element.getAttribute('href'),
                  text: element.textContent?.trim().slice(0, 40),
              };
    });

const linkAttributes = (page, selector) =>
    page.$eval(selector, (element) => ({
        target: element.getAttribute('target'),
        rel: element.getAttribute('rel'),
        href: element.getAttribute('href'),
    }));

/**
 * Each flow starts from `start` and runs `steps` in order. A step's `run`
 * performs the interaction and may return a JSON serialisable value that must
 * match between the two apps.
 */
const flows = [
    {
        name: 'header-navigation',
        start: { route: '/news/1', viewport: desktop, storage: { theme: 'default' } },
        steps: [
            {
                name: 'click-new',
                run: async (page) => {
                    await page.click('.header-nav a:has-text("new")');
                    await settle(page);
                    return { active: await page.$$eval('.header-nav .active', (all) => all.map((a) => a.textContent)) };
                },
            },
            {
                name: 'click-show',
                run: async (page) => {
                    await page.click('.header-nav a:has-text("show")');
                    await settle(page);
                    return { active: await page.$$eval('.header-nav .active', (all) => all.map((a) => a.textContent)) };
                },
            },
            {
                name: 'click-ask',
                run: async (page) => {
                    await page.click('.header-nav a:has-text("ask")');
                    await settle(page);
                    return {};
                },
            },
            {
                name: 'click-jobs',
                run: async (page) => {
                    await page.click('.header-nav a:has-text("jobs")');
                    await settle(page);
                    return {};
                },
            },
            {
                name: 'click-logo-home',
                run: async (page) => {
                    await page.click('.home-link');
                    await settle(page);
                    return { homeActive: await page.$eval('.home-link', (a) => a.className) };
                },
            },
        ],
    },
    {
        name: 'feed-pagination',
        start: { route: '/news/1', viewport: desktop, storage: { theme: 'default' } },
        steps: [
            {
                name: 'more',
                run: async (page) => {
                    await page.click('.nav .more');
                    await settle(page);
                    return { start: await page.$eval('ol', (ol) => ol.getAttribute('start')) };
                },
            },
            {
                name: 'prev',
                run: async (page) => {
                    await page.click('.nav .prev');
                    await settle(page);
                    return { start: await page.$eval('ol', (ol) => ol.getAttribute('start')) };
                },
            },
        ],
    },
    {
        name: 'feed-to-item-to-user',
        start: { route: '/news/1', viewport: desktop, storage: { theme: 'default' } },
        steps: [
            {
                name: 'open-story-comments',
                run: async (page) => {
                    await page.click('.subtext-laptop a[href="/item/49204060"]');
                    await settle(page);
                    return {};
                },
            },
            {
                name: 'collapse-first-comment',
                run: async (page) => {
                    await page.click('.comment-list > li .collapse');
                    await page.waitForTimeout(200);
                    return {
                        label: await page.$eval('.comment-list > li .collapse', (span) => span.textContent),
                        hidden: await page.$eval('.comment-list > li .comment-tree > div', (div) => div.hidden),
                    };
                },
            },
            {
                name: 'expand-first-comment',
                run: async (page) => {
                    await page.click('.comment-list > li .collapse');
                    await page.waitForTimeout(200);
                    return {
                        label: await page.$eval('.comment-list > li .collapse', (span) => span.textContent),
                        hidden: await page.$eval('.comment-list > li .comment-tree > div', (div) => div.hidden),
                    };
                },
            },
            {
                name: 'open-author-profile',
                run: async (page) => {
                    await page.click('.subtext a[href="/user/worik"]');
                    await settle(page);
                    return {};
                },
            },
        ],
    },
    {
        name: 'mobile-back-button',
        start: { route: '/news/1', viewport: mobile, storage: { theme: 'default' } },
        steps: [
            {
                name: 'open-item',
                run: async (page) => {
                    await page.click('.subtext-palm a[href="/item/49204060"]');
                    await settle(page);
                    return {};
                },
            },
            {
                name: 'press-back-button',
                run: async (page) => {
                    await page.click('.back-button');
                    await settle(page);
                    return {};
                },
            },
        ],
    },
    {
        name: 'settings-panel',
        start: { route: '/news/1', viewport: desktop, storage: { theme: 'default' } },
        steps: [
            {
                name: 'open-settings',
                run: async (page) => {
                    await page.click('.settings');
                    await page.waitForSelector('.popup');
                    return {};
                },
            },
            {
                name: 'select-night-theme',
                run: async (page) => {
                    await page.click('input[value="night"]');
                    await page.waitForTimeout(200);
                    return { theme: await page.$eval('.wrapper', (el) => el.parentElement.className) };
                },
            },
            {
                name: 'select-amoledblack-theme',
                run: async (page) => {
                    await page.click('input[value="amoledblack"]');
                    await page.waitForTimeout(200);
                    return { theme: await page.$eval('.wrapper', (el) => el.parentElement.className) };
                },
            },
            {
                name: 'toggle-open-links-in-new-tab',
                run: async (page) => {
                    await page.click('input[type="checkbox"]');
                    await page.waitForTimeout(200);
                    return { checked: await page.$eval('input[type="checkbox"]', (input) => input.checked) };
                },
            },
            {
                name: 'type-font-size',
                run: async (page) => {
                    const input = page.locator('.popup input[type="number"]').first();
                    await input.click();
                    await input.press('Control+a');
                    await input.type('24');
                    await page.waitForTimeout(200);
                    return { value: await input.inputValue() };
                },
            },
            {
                name: 'type-list-spacing',
                run: async (page) => {
                    const input = page.locator('.popup input[type="number"]').nth(1);
                    await input.click();
                    await input.press('Control+a');
                    await input.type('20');
                    await page.waitForTimeout(200);
                    return { value: await input.inputValue() };
                },
            },
            {
                name: 'close-settings',
                run: async (page) => {
                    await page.click('.popup .close');
                    await page.waitForTimeout(200);
                    return {
                        popup: (await page.$('.popup')) !== null,
                        title: await linkAttributes(page, '.item-block .title'),
                        titleStyle: await page.$eval('.item-block .title', (a) => a.getAttribute('style')),
                        itemStyle: await page.$eval('.item-block > div', (div) => div.getAttribute('style')),
                    };
                },
            },
            {
                name: 'reload-keeps-preferences',
                run: async (page) => {
                    await page.reload({ waitUntil: 'domcontentloaded' });
                    await settle(page);
                    return {
                        titleStyle: await page.$eval('.item-block .title', (a) => a.getAttribute('style')),
                        itemStyle: await page.$eval('.item-block > div', (div) => div.getAttribute('style')),
                        title: await linkAttributes(page, '.item-block .title'),
                    };
                },
            },
        ],
    },
    {
        name: 'hover-and-focus',
        start: { route: '/news/1', viewport: desktop, storage: { theme: 'default' } },
        steps: [
            {
                name: 'hover-title',
                run: async (page) => {
                    await page.hover('.item-block .title');
                    await page.waitForTimeout(200);
                    return {};
                },
            },
            {
                name: 'hover-comment-link',
                run: async (page) => {
                    await page.hover('.subtext-laptop a[href^="/item/"]');
                    await page.waitForTimeout(200);
                    return {};
                },
            },
            {
                name: 'hover-settings-cog',
                run: async (page) => {
                    await page.hover('.settings');
                    await page.waitForTimeout(200);
                    return {};
                },
            },
            {
                name: 'focus-first-link',
                run: async (page) => {
                    await page.keyboard.press('Tab');
                    await page.keyboard.press('Tab');
                    await page.waitForTimeout(200);
                    return { focused: await focusedElement(page) };
                },
            },
            {
                name: 'focus-header-nav-link',
                run: async (page) => {
                    await page.keyboard.press('Tab');
                    await page.waitForTimeout(200);
                    return { focused: await focusedElement(page) };
                },
            },
        ],
    },
    {
        name: 'poll-item',
        start: { route: '/item/12345678', viewport: desktop, storage: { theme: 'night' } },
        steps: [
            {
                name: 'poll-bars',
                run: async (page) => ({
                    widths: await page.$$eval('.pollBar', (bars) => bars.map((bar) => bar.style.width)),
                }),
            },
            {
                name: 'collapse-nested-comment',
                run: async (page) => {
                    await page.click('.subtree .collapse');
                    await page.waitForTimeout(200);
                    return { label: await page.$eval('.subtree .collapse', (span) => span.textContent) };
                },
            },
        ],
    },
];

const args = process.argv.slice(2);
const selected = flows.filter((flow) => args.length === 0 || args.some((arg) => flow.name.includes(arg)));

const fixtures = await loadFixtures();
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const failures = [];
let checks = 0;

for (const flow of selected) {
    const sessions = {};
    for (const [app, baseUrl] of Object.entries(apps)) {
        sessions[app] = await openApp(browser, baseUrl, flow.start, fixtures);
    }

    for (const step of flow.steps) {
        const results = {};
        const shots = {};
        for (const [app, session] of Object.entries(sessions)) {
            results[app] = await step.run(session.page);
            results[app] = {
                returned: results[app] ?? null,
                url: new URL(session.page.url()).pathname,
                storage: await session.page.evaluate(() => ({ ...localStorage })),
            };
            shots[app] = PNG.sync.read(await screenshot(session.page));
        }

        const name = `${flow.name}--${step.name}`;
        const stateEqual = JSON.stringify(results.angular) === JSON.stringify(results.react);
        let mismatch = Number.POSITIVE_INFINITY;
        let diff;
        if (shots.angular.width === shots.react.width && shots.angular.height === shots.react.height) {
            diff = new PNG({ width: shots.angular.width, height: shots.angular.height });
            mismatch = pixelmatch(
                shots.angular.data,
                shots.react.data,
                diff.data,
                shots.angular.width,
                shots.angular.height,
                { threshold: 0.1, includeAA: true }
            );
        }

        checks += 1;
        const passed = stateEqual && mismatch === 0;
        console.log(`${passed ? 'ok  ' : 'FAIL'} ${name} mismatch=${mismatch} state=${stateEqual ? 'equal' : 'DIFFERENT'}`);
        if (!passed) {
            const caseDir = join(outputDir, name);
            await mkdir(caseDir, { recursive: true });
            await writeFile(join(caseDir, 'angular.png'), PNG.sync.write(shots.angular));
            await writeFile(join(caseDir, 'react.png'), PNG.sync.write(shots.react));
            if (diff) {
                await writeFile(join(caseDir, 'diff.png'), PNG.sync.write(diff));
            }
            await writeFile(join(caseDir, 'state.json'), `${JSON.stringify(results, null, 2)}\n`);
            failures.push(name);
            console.log(`  angular: ${JSON.stringify(results.angular)}`);
            console.log(`  react:   ${JSON.stringify(results.react)}`);
        }
    }

    for (const session of Object.values(sessions)) {
        await session.context.close();
    }
}

await browser.close();

console.log(`\n${checks - failures.length}/${checks} interaction steps identical`);
if (failures.length > 0) {
    failures.forEach((name) => console.log(`  ${name}`));
    process.exitCode = 1;
}
