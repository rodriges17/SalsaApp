// The same behavior contract runs against the PWA and the bundled Android UI.
export const PARITY_CASES = ['zip-save-feedback', 'menus-and-short-windows', 'cloud-repair-missing', 'cloud-repair-modified', 'player-orientation-and-exit', 'csp-and-storage-styles', 'cloud-cache-fast-reopen', 'cloud-cache-refresh', 'cloud-cache-account-isolation', 'cloud-cache-permission-change', 'cloud-cache-frame-reuse'];
export async function runParityCase(page, { root, fixture, native = false, scenario, consoleErrors = [], browserName = 'chromium' }) {
 const assert = (value, message) => { if (!value) throw new Error(message); };
 const frame = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
 if(native||scenario==='menus-and-short-windows'||scenario==='player-orientation-and-exit')await page.setViewportSize({width:390,height:844});
 await frame();
 await page.route('**/functions/v1/cloud',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({me:null,libraries:[],own_figures:[]})}));
 const seed = async (count=1,fingerprint=null) => {
  await page.evaluate(async ({root,fixture,count,fingerprint})=>{
   const s=await import(root+'storage.js'),blob=await(await fetch(fixture)).blob();
   for(let i=0;i<count;i++)await s.saveFigure({id:'parity-'+i,title:i?'Figur '+i:'Cloud Drehung',description:'Beschreibung zum Üben',tags:[],status:'Sitzt',importFingerprint:fingerprint},[{id:'parity-video-'+i,name:'Führung',blob,confirmed:true,duration:6,width:320,height:180}]);
   window.dispatchEvent(new Event('focus'));
  },{root,fixture,count,fingerprint});
  await page.waitForFunction(count=>document.querySelectorAll('.figure-card').length===count,count);
 };
 if(scenario==='zip-save-feedback'){
  await seed();await page.locator('.card-options').click();await page.getByRole('button',{name:'Figur teilen',exact:true}).click();
  await page.evaluate(()=>{const original=Blob.prototype.arrayBuffer;window.releaseZip=null;Blob.prototype.arrayBuffer=function(){Blob.prototype.arrayBuffer=original;return new Promise(resolve=>window.releaseZip=()=>resolve(original.call(this)));};});
  await page.locator('#preparePackage').click();await page.waitForFunction(()=>!!window.releaseZip);
  assert(await page.locator('#shareProgress').isVisible(),'ZIP preparation has no status');
  assert(await page.locator('#shareProgress').evaluate(e=>e.classList.contains('is-busy')),'ZIP preparation has no spinner');
  await page.evaluate(()=>window.releaseZip());await page.locator('#downloadPackage').waitFor();
  assert(await page.locator('#downloadPackage').evaluate(e=>e.tagName==='BUTTON'),'Save must be a real button');
  await page.evaluate(()=>{window.saveCalls=0;window.stepFileDelivery={save(file){window.savedZip=file;window.saveCalls++;return new Promise((resolve,reject)=>{window.finishZipSave=resolve;window.failZipSave=reject;});}};});
  await page.locator('#downloadPackage').click();await page.waitForFunction(()=>!!window.finishZipSave);
  assert(await page.locator('#shareProgress').evaluate(e=>e.classList.contains('is-busy')),'Save has no spinner');
  assert(await page.locator('#downloadPackage').isDisabled()&&await page.locator('#sendPackage').isDisabled(),'Repeated save/share is not blocked');
  assert((await page.locator('#shareProgress').textContent()).includes('Speichern'),'Save lacks an immediate message');
  await page.evaluate(()=>window.failZipSave(new Error('Test: Speicher voll')));await page.locator('#downloadPackage').waitFor({state:'visible'});
  await page.waitForFunction(()=>!document.querySelector('#downloadPackage').disabled);
  assert((await page.locator('#shareError').textContent()).includes('Speicher voll'),'Save failure is not visible');
  await page.locator('#downloadPackage').click();await page.evaluate(()=>window.failZipSave(new DOMException('Abgebrochen','AbortError')));
  await page.waitForFunction(()=>!document.querySelector('#downloadPackage').disabled);
  assert((await page.locator('#shareProgress').textContent()).includes('abgebrochen'),'Canceled picker lacks a status');
  assert(!await page.locator('#shareError').isVisible(),'Cancellation was presented as an error');
  await page.locator('#downloadPackage').click();await page.evaluate(()=>window.finishZipSave('saved'));
  await page.waitForFunction(()=>!document.querySelector('#downloadPackage').disabled);
  assert((await page.locator('#shareProgress').textContent()).includes('gespeichert'),'Saved result not shown');
  assert(await page.evaluate(()=>saveCalls===3&&savedZip.name==='Cloud Drehung.zip'&&savedZip.size>0),'Retry lost the ZIP or created duplicate saves');
  await page.locator('#closeShare').click();return;
 }
 throw new Error('Unsupported local ZIP scenario');
}
