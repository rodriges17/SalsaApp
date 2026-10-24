import { test } from '@playwright/test';
import { runStorageSettingsCase } from './storage-settings-case.js';
test('storage settings confirm the current destination and real folder grant', async ({ page, browserName }) => {
 await page.goto('/pwa/');
 await page.waitForFunction(() => document.querySelector('#infoButton')?.onclick);
 await runStorageSettingsCase(page, { root: '/pwa/', browserName });
});
