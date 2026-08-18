/**
 * Screenshot parity between the Angular app (:4200) and the React app (:5173).
 *
 *     npm run parity                 # every case
 *     npm run parity -- feed-news    # only cases whose name contains "feed-news"
 *     npm run parity -- --keep       # also write the PNGs of passing cases
 *
 * Both apps are driven with the same replayed API fixtures, the same seeded
 * `localStorage` and the same viewport, then their full page screenshots are
 * diffed. Any non-zero pixel count fails the run.
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { chromium } from 'playwright';

import { apps, staticCases } from './cases.mjs';
import { capture } from './browser.mjs';
import { loadFixtures } from './fixtures.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const outputDir = join(here, 'screenshots');

const args = process.argv.slice(2);
const keepAll = args.includes('--keep');
const filters = args.filter((arg) => !arg.startsWith('--'));

const cases = staticCases().filter(
    (testCase) => filters.length === 0 || filters.some((filter) => testCase.name.includes(filter))
);

const fixtures = await loadFixtures();
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const failures = [];

for (const testCase of cases) {
    const angular = PNG.sync.read(await capture(browser, apps.angular, testCase, fixtures));
    const react = PNG.sync.read(await capture(browser, apps.react, testCase, fixtures));

    let mismatch;
    let diff;
    if (angular.width !== react.width || angular.height !== react.height) {
        mismatch = Number.POSITIVE_INFINITY;
    } else {
        diff = new PNG({ width: angular.width, height: angular.height });
        mismatch = pixelmatch(angular.data, react.data, diff.data, angular.width, angular.height, {
            threshold: 0.1,
            includeAA: true,
        });
    }

    const size = `${angular.width}x${angular.height} vs ${react.width}x${react.height}`;
    const passed = mismatch === 0;
    console.log(`${passed ? 'ok  ' : 'FAIL'} ${testCase.name} mismatch=${mismatch} ${passed ? '' : size}`);

    if (!passed || keepAll) {
        const caseDir = join(outputDir, testCase.name);
        await mkdir(caseDir, { recursive: true });
        await writeFile(join(caseDir, 'angular.png'), PNG.sync.write(angular));
        await writeFile(join(caseDir, 'react.png'), PNG.sync.write(react));
        if (diff) {
            await writeFile(join(caseDir, 'diff.png'), PNG.sync.write(diff));
        }
    }
    if (!passed) {
        failures.push({ name: testCase.name, mismatch, size });
    }
}

await browser.close();

console.log(`\n${cases.length - failures.length}/${cases.length} cases at zero mismatched pixels`);
if (failures.length > 0) {
    console.log('failures:');
    failures.forEach(({ name, mismatch, size }) => console.log(`  ${name} mismatch=${mismatch} ${size}`));
    process.exitCode = 1;
}
