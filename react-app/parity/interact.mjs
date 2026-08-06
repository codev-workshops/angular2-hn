import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const FIXTURES = path.join(ROOT, 'fixtures');
const SHOTS = path.join(ROOT, 'shots-interact');
fs.mkdirSync(SHOTS, { recursive: true });

const APPS = { angular: 'http://localhost:4200', react: 'http://localhost:5173' };

const FLOWS = {
    'collapse-comments': {
        route: '/item/8863',
        steps: [
            ['collapse-first', async (page) => page.click('.comment-list > li:first-child .collapse')],
            ['collapse-nested', async (page) => page.locator('.subtree .collapse').locator('visible=true').first().click()],
            ['expand-first', async (page) => page.click('.comment-list > li:first-child .collapse')],
        ],
    },
    settings: {
        route: '/news/1',
        steps: [
            ['open', async (page) => page.click('img.settings')],
            ['new-tab', async (page) => page.click('input[type=checkbox]')],
            ['night', async (page) => page.click('input[value=night]')],
            ['amoled', async (page) => page.click('input[value=amoledblack]')],
            [
                'font-20',
                async (page) => {
                    const input = page.locator('input[type=number]').first();
                    await input.click();
                    await input.press('Control+a');
                    await input.pressSequentially('20');
                },
            ],
            [
                'spacing-24',
                async (page) => {
                    const input = page.locator('input[type=number]').nth(1);
                    await input.click();
                    await input.press('Control+a');
                    await input.pressSequentially('24');
                },
            ],
            ['close', async (page) => page.click('.close')],
        ],
    },
    hover: {
        route: '/news/1',
        steps: [
            ['hover-title', async (page) => page.locator('a.title').first().hover()],
            ['hover-nav', async (page) => page.locator('.header-nav a').first().hover()],
            ['hover-comments', async (page) => page.locator('.subtext-laptop a').last().hover()],
            ['hover-cog', async (page) => page.locator('img.settings').hover()],
            ['focus-title', async (page) => page.locator('a.title').first().focus()],
        ],
    },
    navigate: {
        route: '/news/1',
        steps: [
            ['more', async (page) => page.click('.more')],
            ['prev', async (page) => page.click('.prev')],
            ['first-item', async (page) => page.click('ol > li:first-child .subtext-laptop a:last-child')],
            ['back-nav-jobs', async (page) => page.click('.header-nav a:last-child')],
        ],
    },
};

async function run(app, flowName, flow) {
    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await context.route('**://node-hnapi.herokuapp.com/**', async (r) => {
        const file = path.join(FIXTURES, encodeURIComponent(r.request().url()) + '.json');
        if (!fs.existsSync(file)) {
            const res = await fetch(r.request().url());
            fs.writeFileSync(
                file,
                JSON.stringify({
                    status: res.status,
                    contentType: res.headers.get('content-type') ?? 'application/json',
                    body: await res.text(),
                })
            );
        }
        const record = JSON.parse(fs.readFileSync(file, 'utf8'));
        await r.fulfill({ status: record.status, contentType: record.contentType, body: record.body });
    });
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(APPS[app] + flow.route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const state = [];
    for (const [stepName, action] of flow.steps) {
        await action(page);
        await page.waitForTimeout(700);
        await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; }' });
        await page.screenshot({ path: path.join(SHOTS, `${flowName}__${stepName}__${app}.png`), fullPage: true });
        state.push({
            step: stepName,
            url: new URL(page.url()).pathname,
            storage: await page.evaluate(() => ({ ...localStorage })),
            openInNewTab: await page.evaluate(() => {
                const link = document.querySelector('.title[href^="http"]');
                return link ? `${link.getAttribute('target')}/${link.getAttribute('rel')}` : null;
            }),
        });
    }
    await browser.close();
    return state;
}

let failures = 0;
for (const [flowName, flow] of Object.entries(FLOWS)) {
    const angular = await run('angular', flowName, flow);
    const react = await run('react', flowName, flow);
    for (let i = 0; i < flow.steps.length; i++) {
        const stepName = flow.steps[i][0];
        const a = PNG.sync.read(fs.readFileSync(path.join(SHOTS, `${flowName}__${stepName}__angular.png`)));
        const b = PNG.sync.read(fs.readFileSync(path.join(SHOTS, `${flowName}__${stepName}__react.png`)));
        let mismatch = 'SIZE-MISMATCH';
        if (a.width === b.width && a.height === b.height) {
            const out = new PNG({ width: a.width, height: a.height });
            mismatch = pixelmatch(a.data, b.data, out.data, a.width, a.height, { threshold: 0.12 });
            if (mismatch > 0) {
                fs.writeFileSync(path.join(SHOTS, `${flowName}__${stepName}__diff.png`), PNG.sync.write(out));
            }
        }
        const stateEqual = JSON.stringify(angular[i]) === JSON.stringify(react[i]);
        const ok = mismatch === 0 && stateEqual;
        if (!ok) failures++;
        console.log(
            `${ok ? 'OK  ' : 'DIFF'} ${flowName}/${stepName} px=${mismatch} ${a.width}x${a.height} vs ${b.width}x${b.height} state=${stateEqual ? 'same' : 'DIFF'}`
        );
        if (!stateEqual) {
            console.log('   angular:', JSON.stringify(angular[i]));
            console.log('   react  :', JSON.stringify(react[i]));
        }
    }
}
console.log(failures === 0 ? '\nall interaction steps identical' : `\n${failures} steps differ`);
