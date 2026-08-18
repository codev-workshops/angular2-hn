/**
 * Records the API responses the parity run replays into both apps.
 *
 *     node parity/record-fixtures.mjs
 *
 * Recorded responses land in `parity/fixtures/recorded.json`, keyed by the
 * request path. `parity/fixtures/handwritten.json` is layered on top of them by
 * `parity/fixtures.mjs` and covers what the live API cannot serve (the removed
 * `/user/:id` endpoint, a poll item, an empty feed).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { baseUrl } from './fixtures.mjs';

const here = dirname(fileURLToPath(import.meta.url));

async function get(path) {
    const response = await fetch(baseUrl + path);
    if (!response.ok) {
        throw new Error(`${path} -> ${response.status}`);
    }
    return response.json();
}

const recorded = {};

async function record(path) {
    recorded[path] = await get(path);
    return recorded[path];
}

const news = await record('/news?page=1');
await record('/news?page=2');
await record('/newest?page=1');
await record('/show?page=1');
const ask = await record('/ask?page=1');
const jobs = await record('/jobs?page=1');

// A story with a moderate number of comments keeps the screenshots manageable.
const story = news.find((item) => item.comments_count > 5 && item.comments_count < 30) ?? news[0];
await record(`/item/${story.id}`);

// An "Ask HN" style item: no external URL, so the title links back to the item.
const askItem =
    ask.find((item) => !String(item.url).startsWith('http') && item.comments_count < 30) ?? ask[0];
await record(`/item/${askItem.id}`);

await record(`/item/${jobs[0].id}`);

await mkdir(join(here, 'fixtures'), { recursive: true });
await writeFile(join(here, 'fixtures', 'recorded.json'), `${JSON.stringify(recorded, null, 2)}\n`);

console.log(`recorded ${Object.keys(recorded).length} responses`);
console.log(
    JSON.stringify(
        { story: story.id, askItem: askItem.id, job: jobs[0].id, user: story.user },
        null,
        2
    )
);
