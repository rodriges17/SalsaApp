import { test } from '@playwright/test';
import { runNavigationHoverCase } from './navigation-hover-case.js';
test('returning from settings leaves only the current navigation indication on touch', async ({ page }) => {
 await page.goto('/pwa/');await page.waitForFunction(()=>document.querySelector('#infoButton')?.onclick);
 await runNavigationHoverCase(page,{root:'/pwa/',cloud:false});
});
