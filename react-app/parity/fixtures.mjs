import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const baseUrl = 'https://node-hnapi.herokuapp.com';

const here = dirname(fileURLToPath(import.meta.url));

async function readJson(name) {
    return JSON.parse(await readFile(join(here, 'fixtures', name), 'utf8'));
}

/** Recorded responses with the hand-written ones layered on top. */
export async function loadFixtures() {
    const [recorded, handwritten] = await Promise.all([
        readJson('recorded.json'),
        readJson('handwritten.json'),
    ]);
    return { ...recorded, ...handwritten };
}

/**
 * Replays the fixtures into a browser context and keeps the run offline:
 * anything not covered by a fixture fails the same way in both apps.
 */
export async function installFixtures(context, fixtures) {
    await context.route(`${baseUrl}/**`, async (route) => {
        const { pathname, search } = new URL(route.request().url());
        const fixture = fixtures[pathname + search];
        if (fixture === undefined) {
            await route.fulfill({ status: 404, contentType: 'text/html', body: 'Not found' });
            return;
        }
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify(fixture) });
    });
    await context.route('**/www.google-analytics.com/**', (route) => route.abort());
}
