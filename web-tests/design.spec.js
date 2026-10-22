import {test,expect} from '@playwright/test';

test('local app keeps the header and last figure menu visible without cloud controls or requests',async({page},info)=>{
 const external=[];page.on('request',r=>{if(new URL(r.url()).protocol.startsWith('http')&&!r.url().startsWith('http://127.0.0.1:4173/'))external.push(r.url());});
 await page.goto('/pwa/');await expect(page.getByRole('heading',{name:'Step by Step',exact:true})).toBeVisible();
 await page.evaluate(async()=>{
  const {saveFigure}=await import('/pwa/storage.js');const blob=await(await fetch('/web-tests/fixtures/clip.mp4')).blob();
  for(let i=0;i<10;i++)await saveFigure({id:crypto.randomUUID(),title:`Figur ${i}`,description:'Lokal lernen',tags:['Salsa'],status:'Neu'},[{id:crypto.randomUUID(),name:'Video',blob,duration:6,confirmed:true,existing:false}]);
 });
 await page.reload();await expect(page.locator('.figure-card')).toHaveCount(10);
 const nav=page.locator('body > .bottom-nav');await expect(nav.getByRole('button')).toHaveText(['Figuren']);
 await expect(page.locator('[data-nav=cloud],#cloudDialog')).toHaveCount(0);
 const last=page.locator('.card-options').last();await last.scrollIntoViewIfNeeded();
 const heading=await page.locator('.overview > .heading').boundingBox();expect(Math.abs(heading.y)).toBeLessThan(2);
 const intro=await page.locator('.page-intro').boundingBox();expect(Math.abs(intro.y-heading.height)).toBeLessThan(2);
 for(const theme of ['dark','light']){
  await page.evaluate(t=>window.stepAppearance.set(t),theme);await last.tap();
  const menu=page.locator('.card-menu');await expect(menu).toBeVisible();await expect(menu).not.toContainText('Cloud');
  const box=await menu.boundingBox(),footer=await nav.boundingBox();expect(box.y).toBeGreaterThanOrEqual(intro.y+intro.height);expect(box.y+box.height).toBeLessThanOrEqual(footer.y);
  await page.screenshot({path:info.outputPath(`${theme}-local-menu.png`)});
  await menu.getByRole('button',{name:'Löschen',exact:true}).tap();await expect(page.locator('#confirmMessage')).toContainText('App-Speicher');await page.locator('#confirmCancel').tap();
 }
 await page.locator('#infoButton').tap();await expect(page.locator('#infoDialog')).not.toContainText('Cloud');await page.locator('#closeInfo').tap();
 expect(external).toEqual([]);
});
