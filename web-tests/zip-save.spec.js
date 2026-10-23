import {test} from '@playwright/test';
import {runParityCase} from './zip-parity-cases.js';
test('ZIP save gives progress and permits retry after failure or cancellation',async({page})=>{await page.goto('/pwa/');await page.locator('#openAddFigure').waitFor();await runParityCase(page,{root:'/pwa/',fixture:'/web-tests/fixtures/clip.mp4',scenario:'zip-save-feedback'});});
