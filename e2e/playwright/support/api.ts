import { Page, Route } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const fixtureDir = path.resolve(__dirname, '../fixtures');

type Body = unknown;
type Override = Body | { body?: Body; delay?: number; status?: number; contentType?: string };

export type ApiOverrides = {
    feeds?: Record<string, Override>;
    items?: Record<string, Override>;
    users?: Record<string, Override>;
    delay?: number;
};

export const errorBody = (status = 500, html = '<html><body>offline</body></html>') => ({
    body: html,
    status,
    contentType: 'text/html',
});
export const emptyBody = () => ({ body: [], contentType: 'application/json' });
export const nullBody = () => ({ body: null, contentType: 'application/json' });
export const objectBody = (body = { malformed: true }) => ({ body, contentType: 'application/json' });

function fixture(name: string): Body {
    return JSON.parse(fs.readFileSync(path.join(fixtureDir, name), 'utf8'));
}
export const shortFeed = fixture('feed-short.json');

function responseFor(route: Route, value: Body, override?: Override, defaultDelay = 0) {
    const config = override && typeof override === 'object' && !Array.isArray(override) &&
        ('body' in override || 'delay' in override || 'status' in override || 'contentType' in override)
        ? override as Exclude<Override, Body>
        : { body: override ?? value };
    const body = config.body === undefined ? value : config.body;
    const delay = config.delay ?? defaultDelay;
    return new Promise<void>(resolve => {
        setTimeout(async () => {
            await route.fulfill({
                status: config.status ?? 200,
                contentType: config.contentType ?? 'application/json',
                body: typeof body === 'string' ? body : JSON.stringify(body),
            });
            resolve();
        }, delay);
    });
}

export async function stubHnApi(page: Page, overrides: ApiOverrides = {}) {
    await page.route('**/*', route => {
        const url = route.request().url();
        if (url.includes('node-hnapi.herokuapp.com') || url.includes('google-analytics.com')) {
            throw new Error(`Unstubbed external request: ${url}`);
        }
        return route.continue();
    });
    await page.route('**/analytics.js', route => route.abort());
    await page.route('**google-analytics.com/**', route => route.abort());
    await page.route('**node-hnapi.herokuapp.com/**', async route => {
        const url = new URL(route.request().url());
        const parts = url.pathname.split('/').filter(Boolean);
        const category = parts[0];
        if (category === 'item') {
            const id = parts[1];
            const name = id === '7000' ? 'item-poll-7000.json' : id === '7001' ? 'item-poll-7001.json' :
                id === '7002' ? 'item-poll-7002.json' : id === '7003' ? 'item-job-7003.json' :
                id === '49195232' ? 'item-deleted-content.json' :
                'item-49195231.json';
            return responseFor(route, fixture(name), overrides.items?.[id], overrides.delay);
        }
        if (category === 'user') {
            const id = parts[1];
            const name = id === 'quiet-user' ? 'user-no-about.json' : 'user-fixture.json';
            return responseFor(route, fixture(name), overrides.users?.[id], overrides.delay);
        }
        const pageNum = url.searchParams.get('page') ?? '1';
        const key = `${category}:${pageNum}`;
        const name = category === 'news' && pageNum === '2' ? 'news-page-2.json' :
            category === 'newest' ? 'newest-page-1.json' :
            category === 'show' ? 'show-page-1.json' :
            category === 'ask' ? 'ask-page-1.json' :
            category === 'jobs' ? 'jobs-page-1.json' : 'news-page-1.json';
        return responseFor(route, fixture(name), overrides.feeds?.[key], overrides.delay);
    });
}
