import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e-playwright',
    timeout: 30000,
    expect: {
        timeout: 10000,
    },
    fullyParallel: false,
    retries: 1,
    reporter: 'html',
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
    webServer: {
        command: 'NODE_OPTIONS=--openssl-legacy-provider yarn start',
        url: 'http://localhost:4200',
        reuseExistingServer: true,
        timeout: 120000,
    },
});
