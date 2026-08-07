/**
 * Builds labelled "Angular | React" composites for eyeballing.
 *
 *     npm run parity:side-by-side
 *     npm run parity:side-by-side -- item-story
 *
 * Output: `parity/side-by-side/<case>.png`. The pixel verdict comes from
 * `npm run parity`; this script only makes the result reviewable.
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

import { apps, staticCases } from './cases.mjs';
import { capture } from './browser.mjs';
import { loadFixtures } from './fixtures.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const outputDir = join(here, 'side-by-side');

/** A readable default selection; pass arguments to pick other cases. */
const defaultCases = [
    'feed-news-1--default--desktop',
    'feed-news-1--night--mobile',
    'item-story--default--desktop',
    'item-poll--amoledblack--desktop',
    'user--night--desktop',
    'settings-open--default--desktop',
    'feed-error--default--desktop',
    'loading--default--desktop',
];

const filters = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const cases = staticCases().filter((testCase) =>
    filters.length === 0 ? defaultCases.includes(testCase.name) : filters.some((f) => testCase.name.includes(f))
);

const fixtures = await loadFixtures();
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();

for (const testCase of cases) {
    const angular = (await capture(browser, apps.angular, testCase, fixtures)).toString('base64');
    const react = (await capture(browser, apps.react, testCase, fixtures)).toString('base64');

    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    await page.setContent(`<!doctype html>
<style>
  body { margin: 0; font: 14px/1.4 -apple-system, Arial, sans-serif; background: #222; color: #fff; }
  h1 { font-size: 15px; margin: 0; padding: 10px 12px; }
  .split { display: flex; align-items: flex-start; }
  .half { flex: 1 1 0; min-width: 0; }
  .half + .half { border-left: 3px solid #b92b27; }
  .half h2 { font-size: 13px; margin: 0; padding: 8px 12px; background: #b92b27; }
  img { display: block; width: 100%; }
</style>
<h1>${testCase.name}</h1>
<div class="split">
  <div class="half"><h2>Angular (:4200)</h2><img src="data:image/png;base64,${angular}"></div>
  <div class="half"><h2>React (:5173)</h2><img src="data:image/png;base64,${react}"></div>
</div>`);
    await page.waitForTimeout(300);
    const composite = await page.screenshot({ fullPage: true });
    await writeFile(join(outputDir, `${testCase.name}.png`), composite);
    await page.close();
    console.log(`wrote ${testCase.name}.png`);
}

await browser.close();
