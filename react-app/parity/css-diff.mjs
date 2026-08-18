/**
 * Diagnostic: dumps every CSS rule both apps apply, with the per-component
 * encapsulation attribute normalised away, so the emulated encapsulation
 * rewrite can be compared against what the Angular compiler emits.
 *
 * Usage: node parity/css-diff.mjs /item/1
 */
import { chromium } from 'playwright';

const route = process.argv[2] ?? '/news/1';
const browser = await chromium.launch();

async function rules(baseUrl) {
    const page = await browser.newPage();
    await page.goto(baseUrl + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const collected = await page.evaluate(() => {
        const out = [];
        const walk = (list) => {
            for (const rule of list) {
                if (rule.cssRules && rule.type !== 1) {
                    walk(rule.cssRules);
                } else if (rule.selectorText) {
                    out.push(rule.cssText);
                }
            }
        };
        for (const sheet of document.styleSheets) {
            try {
                walk(sheet.cssRules);
            } catch {
                /* cross-origin */
            }
        }
        return out;
    });
    await page.close();
    return collected.map((text) => text.replace(/\[(?:_ngcontent-[a-z]{3}-c\d+|data-ng-[a-z-]+)\]/g, '[NG]')).toSorted();
}

const angular = await rules('http://localhost:4200');
const react = await rules('http://localhost:5173');
await browser.close();

const onlyAngular = angular.filter((rule) => !react.includes(rule));
const onlyReact = react.filter((rule) => !angular.includes(rule));
console.log(`angular rules: ${angular.length}, react rules: ${react.length}`);
console.log(`\n--- only in Angular (${onlyAngular.length}) ---`);
onlyAngular.forEach((rule) => console.log(rule));
console.log(`\n--- only in React (${onlyReact.length}) ---`);
onlyReact.forEach((rule) => console.log(rule));
