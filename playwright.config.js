import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './web-tests', testMatch: '**/*.spec.js', timeout: 60000, expect: { timeout: 12000 },
  fullyParallel: false, workers: 1, retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'retain-on-failure' },
  projects: [
    { name: 'chromium-mobile', use: { browserName: 'chromium', ...devices['Pixel 7'] } },
    { name: 'webkit-iphone', use: { browserName: 'webkit', ...devices['iPhone 13'] } }
  ],
  webServer: { command: 'python3 -m http.server 4173 --bind 127.0.0.1', url: 'http://127.0.0.1:4173/pwa/', reuseExistingServer: false }
});
