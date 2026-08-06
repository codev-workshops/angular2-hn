import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
    testDir: '.',
    fullyParallel: true,
    retries: 0,
    reporter: [['list'], ['json', { outputFile: path.resolve(__dirname, '../../test-results/e2e-results.json') }]],
    use: {
        baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:4200',
        browserName: 'chromium',
        trace: 'on-first-retry',
        ...devices['Desktop Chrome'],
    },
});
