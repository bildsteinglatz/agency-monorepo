import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.PORT || '3000';
const HOSTNAME = process.env.HOSTNAME || '127.0.0.1';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://${HOSTNAME}:${PORT}`;

export default defineConfig({
  testDir: './tests',
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  use: {
    baseURL,
    acceptDownloads: true,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  webServer: {
    command: `PORT=${PORT} HOSTNAME=${HOSTNAME} npm run dev -- --hostname ${HOSTNAME} --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 120 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
