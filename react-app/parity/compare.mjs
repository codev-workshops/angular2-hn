import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const FIXTURES = path.join(ROOT, 'fixtures');
const SHOTS = path.join(ROOT, 'shots');
fs.mkdirSync(FIXTURES, { recursive: true });
fs.mkdirSync(SHOTS, { recursive: true });

const APPS = {
    angular: 'http://localhost:4200',
    react: 'http://localhost:5173',
};

const ROUTES = ['/news/1', '/newest/1', '/show/1', '/ask/1', '/jobs/1', '/item/8863', '/item/126809', '/user/pg'];

const VIEWPORTS = {
    desktop: { width: 1280, height: 900 },
    mobile: { width: 375, height: 812 },
};

const THEMES = ['default', 'night', 'amoledblack'];

const cases = [];
for (const route of ROUTES) {
    for (const viewport of Object.keys(VIEWPORTS)) {
        for (const theme of THEMES) {
            cases.push({ route, viewport, storage: { theme } });
        }
    }
}
// settings panel open, every theme + viewport
for (const viewport of Object.keys(VIEWPORTS)) {
    for (const theme of THEMES) {
        cases.push({ route: '/news/1', viewport, storage: { theme }, openSettings: true, label: 'settings' });
    }
    // non-default settings values (font size, list spacing, open links in new tab)
    cases.push({
        route: '/news/1',
        viewport,
        storage: { theme: 'default', titleFontSize: '22', listSpacing: '30', openLinkInNewTab: 'true' },
        label: 'tweaked',
    });
    cases.push({
        route: '/news/1',
        viewport,
        storage: { theme: 'night', titleFontSize: '11', listSpacing: '0', openLinkInNewTab: 'false' },
        label: 'tweaked-small',
    });
    // pagination (prev + more links) and a synthetic user profile
    cases.push({ route: '/news/2', viewport, storage: { theme: 'default' } });
    cases.push({ route: '/user/testuser', viewport, storage: { theme: 'default' } });
    cases.push({ route: '/user/testuser', viewport, storage: { theme: 'night' } });
}

function fixturePath(url) {
    return path.join(FIXTURES, encodeURIComponent(url) + '.json');
}

async function getFixture(url) {
    const file = fixturePath(url);
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
    let record;
    for (let attempt = 0; attempt < 4; attempt++) {
        try {
            const res = await fetch(url);
            record = {
                status: res.status,
                contentType: res.headers.get('content-type') ?? 'application/json',
                body: await res.text(),
            };
            break;
        } catch (err) {
            console.warn('fixture fetch failed', url, String(err));
            await new Promise((r) => setTimeout(r, 2000));
        }
    }
    if (!record) throw new Error('could not fetch fixture ' + url);
    fs.writeFileSync(file, JSON.stringify(record));
    return record;
}

function labelFor(testCase) {
    const themeBits = Object.entries(testCase.storage)
        .map(([k, v]) => (k === 'theme' ? v : `${k}-${v}`))
        .join('_');
    return [testCase.route.replace(/\//g, '_'), themeBits, testCase.viewport, testCase.label]
        .filter(Boolean)
        .join('__');
}

async function shoot(browser, app, testCase, name) {
    const context = await browser.newContext({ viewport: VIEWPORTS[testCase.viewport], deviceScaleFactor: 1 });
    await context.addInitScript((storage) => {
        for (const [key, value] of Object.entries(storage)) localStorage.setItem(key, value);
    }, testCase.storage);
    await context.route('**://node-hnapi.herokuapp.com/**', async (r) => {
        const record = await getFixture(r.request().url());
        await r.fulfill({ status: record.status, contentType: record.contentType, body: record.body });
    });
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(APPS[app] + testCase.route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    if (testCase.openSettings) {
        await page.click('img.settings');
        await page.waitForTimeout(400);
    }
    await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; }' });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(SHOTS, `${name}__${app}.png`), fullPage: true });
    await context.close();
}

function diff(name) {
    const a = PNG.sync.read(fs.readFileSync(path.join(SHOTS, `${name}__angular.png`)));
    const b = PNG.sync.read(fs.readFileSync(path.join(SHOTS, `${name}__react.png`)));
    const width = Math.max(a.width, b.width);
    const height = Math.max(a.height, b.height);
    const pad = (img) => {
        if (img.width === width && img.height === height) return img;
        const out = new PNG({ width, height });
        PNG.bitblt(img, out, 0, 0, Math.min(img.width, width), Math.min(img.height, height), 0, 0);
        return out;
    };
    const out = new PNG({ width, height });
    const mismatch = pixelmatch(pad(a).data, pad(b).data, out.data, width, height, { threshold: 0.12 });
    if (mismatch > 0) fs.writeFileSync(path.join(SHOTS, `${name}__diff.png`), PNG.sync.write(out));
    return { name, mismatch, sizes: `${a.width}x${a.height} vs ${b.width}x${b.height}` };
}

const only = process.argv.slice(2);
const browser = await chromium.launch();
const results = [];
for (const testCase of cases) {
    const name = labelFor(testCase);
    if (only.length && !only.some((o) => name.includes(o))) continue;
    for (const app of ['angular', 'react']) await shoot(browser, app, testCase, name);
    const result = diff(name);
    results.push(result);
    console.log(`${result.mismatch === 0 ? 'OK  ' : 'DIFF'} ${name} mismatch=${result.mismatch} ${result.sizes}`);
}
await browser.close();

const failed = results.filter((r) => r.mismatch > 0);
console.log(`\n${results.length - failed.length}/${results.length} identical`);
for (const r of failed) console.log(`  ${r.name}: ${r.mismatch} px ${r.sizes}`);
fs.writeFileSync(path.join(ROOT, 'results.json'), JSON.stringify(results, null, 2));
