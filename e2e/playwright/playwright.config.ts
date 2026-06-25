import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: '.',
    outputDir: './test-results',
    timeout: 30_000,
    expect: { timeout: 10_000 },
    fullyParallel: false,
    retries: 0,
    use: {
        baseURL: 'http://localhost:4200',
        screenshot: 'on',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
