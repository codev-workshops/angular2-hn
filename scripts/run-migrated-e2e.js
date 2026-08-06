const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const passWithNoTests = process.argv.includes('--pass-with-no-tests');
const specRoot = path.resolve(__dirname, '../e2e/playwright');
const entries = fs
    .readFileSync(path.resolve(__dirname, '../e2e-migrated-specs.txt'), 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

const specs = entries.map((entry) => {
    const resolved = path.resolve(specRoot, entry);
    if (!resolved.startsWith(`${specRoot}${path.sep}`) || !fs.existsSync(resolved)) {
        throw new Error(`Migrated Playwright spec does not exist under e2e/playwright: ${entry}`);
    }
    return resolved;
});

if (specs.length === 0 && passWithNoTests) {
    process.exit(0);
}

const playwright = path.resolve(__dirname, '../node_modules/.bin/playwright');
const result = spawnSync(
    playwright,
    [
        'test',
        '-c',
        path.resolve(__dirname, '../e2e/playwright/playwright.config.ts'),
        ...specs,
        ...(passWithNoTests ? ['--pass-with-no-tests'] : []),
    ],
    { stdio: 'inherit' }
);

process.exit(result.status ?? 1);
