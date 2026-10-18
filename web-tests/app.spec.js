import { test, expect } from '@playwright/test';
import path from 'node:path';

const clip = path.resolve('web-tests/fixtures/clip.mp4');
const portrait = path.resolve('web-tests/fixtures/portrait.mp4');
async function start(page) {
  await page.goto('/pwa/'); await expect(page.getByRole('heading', { name: 'Salsa Figuren' })).toBeVisible();
  await expect(page.locator('#offlineStatus')).toContainText('Offline bereit');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })); });
}
async function addFigure(page) {
  await page.getByRole('button', { name: '＋ Figur hinzufügen' }).click();
  await page.locator('#figureTitle').fill('Ocho'); await page.locator('#figureDescription').fill('Links drehen');
  await page.locator('#figureTags').fill('Drehung, Anfänger');
  await page.locator('#videoFiles').setInputFiles([clip, portrait]);
  await expect(page.locator('#saveFigure')).toBeDisabled();
  await page.getByRole('button', { name: 'Alle neuen Videos prüfen' }).click();
  for (let i = 0; i < 2; i++) {
    await expect(page.locator('#acceptVideo')).toBeEnabled();
    await page.locator('#previewVideo').evaluate(v => { v.currentTime = 0.25; });
    await page.getByRole('button', { name: 'Video übernehmen', exact: true }).click();
    if (i === 0) await expect(page.locator('#previewTitle')).toHaveText('portrait');
  }
  await expect(page.locator('#preview')).not.toBeVisible();
  await page.locator('#saveFigure').click(); await expect(page.locator('#editor')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Ocho lernen' })).toBeVisible();
}
async function openEdit(page) { await page.getByRole('button', { name: 'Optionen für Ocho' }).click(); await page.getByRole('button', { name: 'Bearbeiten', exact: true }).click(); await expect(page.locator('#editor')).toBeVisible(); }

test('multi-video import, player settings, loops, rotation, reload and offline playback', async ({ page, context }, info) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await start(page); await addFigure(page);
  await page.screenshot({ path: info.outputPath('overview.png'), fullPage: true });
  await page.getByRole('button', { name: 'Ocho lernen' }).click();
  await expect(page.locator('#learningVideo')).toHaveJSProperty('videoWidth', 320);
  await page.locator('#playPause').click();
  await expect.poll(() => page.locator('#learningVideo').evaluate(v => v.paused)).toBe(false);
  await page.locator('#speed').selectOption('0.5'); await page.locator('#fitCrop').click(); await page.locator('#rotatePlayer').click();
  await expect(page.locator('#playerScreen')).toHaveClass(/is-landscape/); await expect(page.locator('#videoStage')).toHaveClass(/crop/);
  await page.locator('#playPause').click(); await page.locator('#learningVideo').evaluate(v => { v.currentTime = 1; }); await page.locator('#markA').click();
  await page.locator('#learningVideo').evaluate(v => { v.currentTime = 2.5; }); await expect(page.locator('#markB')).toBeEnabled(); await page.locator('#markB').click();
  await expect(page.locator('#abStatus')).toContainText('B 0:02');
  await page.locator('#fullLoop').click(); await expect(page.locator('#abStatus')).toHaveText('');
  await expect(page.locator('#fullLoop')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#playerVideoChoice').selectOption('1');
  await expect(page.locator('#learningVideo')).toHaveJSProperty('videoWidth', 180);
  await expect(page.locator('#learningVideo')).toHaveJSProperty('playbackRate', 0.5);
  await expect(page.locator('#fitCrop')).toHaveText('Crop'); await expect(page.locator('#fullLoop')).toHaveAttribute('aria-pressed', 'true');
  await page.screenshot({ path: info.outputPath('player-landscape.png') });
  await page.locator('#rewind').click(); await expect(page.locator('#learningVideo')).toHaveJSProperty('currentTime', 0);
  await page.locator('#playerBack').click(); await page.reload();
  await expect(page.getByRole('button', { name: 'Ocho lernen' })).toBeVisible();
  await context.setOffline(true); await page.reload();
  await expect(page.getByRole('button', { name: 'Ocho lernen' })).toBeVisible();
  await page.getByRole('button', { name: 'Ocho lernen' }).click(); await page.locator('#playPause').click();
  await expect.poll(() => page.locator('#learningVideo').evaluate(v => v.currentTime)).toBeGreaterThan(0.1);
  expect(errors).toEqual([]);
});

test('rename, reorder, preview replacement cancellation, discard and deletion', async ({ page }) => {
  await start(page); await addFigure(page); await openEdit(page);
  await page.getByRole('textbox', { name: 'Name von Video 2', exact: true }).fill('Andere Perspektive');
  await page.getByRole('button', { name: 'Video 2 nach oben', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Name von Video 1', exact: true })).toHaveValue('Andere Perspektive');
  await page.locator('#saveFigure').click(); await expect(page.locator('#editor')).not.toBeVisible();
  await page.getByRole('button', { name: 'Ocho lernen' }).click(); await expect(page.locator('#learningVideo')).toHaveJSProperty('videoWidth', 180); await page.locator('#playerBack').click();
  await openEdit(page);
  await page.locator('.draft-card').first().getByRole('button', { name: 'Ersetzen', exact: true }).click({ noWaitAfter: true });
  await page.locator('#videoFiles').setInputFiles(clip); await expect(page.locator('#preview')).toBeVisible();
  await page.locator('#previewBack').click(); await expect(page.locator('#preview')).not.toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Name von Video 1', exact: true })).toHaveValue('Andere Perspektive');
  await page.locator('.draft-card').first().getByRole('button', { name: 'Entfernen', exact: true }).click();
  await expect(page.locator('.draft-card').getByRole('button', { name: 'Entfernen', exact: true })).toBeDisabled();
  await page.locator('#editorBack').click(); await page.getByRole('button', { name: 'Weiter bearbeiten', exact: true }).click(); await expect(page.locator('.draft-card')).toHaveCount(1);
  await page.locator('#editorBack').click(); await page.getByRole('button', { name: 'Änderungen verwerfen', exact: true }).click();
  await expect(page.locator('#editor')).not.toBeVisible(); await openEdit(page); await expect(page.locator('.draft-card')).toHaveCount(2);
  await page.locator('#editorBack').click(); await expect(page.locator('#editor')).not.toBeVisible();
  await page.getByRole('button', { name: 'Optionen für Ocho' }).click(); await page.getByRole('button', { name: 'Löschen', exact: true }).click(); await page.locator('#confirmOK').click();
  await expect(page.locator('#figureCount')).toHaveText('0 Figuren');
  expect(await page.evaluate(async () => {
    const { database } = await import('./storage.js'); const db = await database();
    return new Promise(resolve => { const request = db.transaction('videos').objectStore('videos').count(); request.onsuccess = () => resolve(request.result); });
  })).toBe(0);
});

test('invalid preview cannot be saved and metadata conflicts roll back new blobs', async ({ page }) => {
  await start(page); await page.locator('#addFigure').click(); await page.locator('#figureTitle').fill('Invalid');
  await page.locator('#videoFiles').setInputFiles({ name: 'broken.mp4', mimeType: 'video/mp4', buffer: Buffer.from('not a movie') });
  await page.locator('.draft-card').getByRole('button', { name: 'Vorschau', exact: true }).click();
  await expect(page.locator('#previewError')).toBeVisible(); await expect(page.locator('#acceptVideo')).toBeDisabled();
  await page.locator('#previewBack').click(); await expect(page.locator('#saveFigure')).toBeDisabled();
  await page.locator('#editorBack').click(); await page.locator('#confirmOK').click(); await expect(page.locator('#editor')).not.toBeVisible();
  const result = await page.evaluate(async () => {
    const { saveFigure, listFigures, database, figureVideos } = await import('./storage.js');
    const first = { id: crypto.randomUUID(), title: 'Conflict', description: '', status: 'Neu', tags: [] };
    const draft = { id: crypto.randomUUID(), blob: new Blob(['bytes']), name: 'One', confirmed: true, duration: 1, width: 10, height: 10 };
    const saved = await saveFigure(first, [draft]); const records = await figureVideos(saved);
    await saveFigure({ ...first, title: 'New name' }, records.map(v => ({ ...v, existing: true, confirmed: true })), saved.revision);
    let rejected = false;
    try { await saveFigure(first, [{ ...draft, id: crypto.randomUUID() }], saved.revision); } catch { rejected = true; }
    const db = await database(); const count = await new Promise(resolve => { const r = db.transaction('videos').objectStore('videos').count(); r.onsuccess = () => resolve(r.result); });
    return { rejected, count, title: (await listFigures())[0].title };
  });
  expect(result).toEqual({ rejected: true, count: 1, title: 'New name' });
});
