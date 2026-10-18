import { validateDraft } from './logic.js';
let dbPromise;
export const DB_NAME = 'salsa-trainer-local-v1';
export function database() {
  if (!globalThis.indexedDB) return Promise.reject(new Error('Dieser Browser bietet keinen lokalen App-Speicher. Bitte Safari im normalen Modus verwenden.'));
  if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => { request.result.createObjectStore('figures', { keyPath: 'id' }); request.result.createObjectStore('videos', { keyPath: 'id' }); };
    request.onsuccess = () => { const db = request.result; db.onversionchange = () => { db.close(); dbPromise = null; }; resolve(db); };
    request.onerror = () => { dbPromise = null; reject(request.error); };
    request.onblocked = () => { dbPromise = null; reject(new Error('Bitte andere Tabs dieser App schließen und erneut versuchen.')); };
  });
  return dbPromise;
}
function read(store, key) { return database().then(db => new Promise((resolve, reject) => { const tx = db.transaction(store); const request = key === undefined ? tx.objectStore(store).getAll() : tx.objectStore(store).get(key); let value; request.onsuccess = () => { value = request.result; }; tx.oncomplete = () => resolve(value); tx.onabort = () => reject(tx.error); tx.onerror = () => {}; })); }
export const listFigures = () => read('figures');
export const getVideo = id => read('videos', id);
export async function figureVideos(figure) { const records = await Promise.all(figure.videoIds.map(getVideo)); if (records.some(v => !v || v.figureId !== figure.id)) throw new Error('Eine lokale Videodatei fehlt. Bitte die Figur bearbeiten.'); return records; }
export async function saveFigure(figure, drafts, expectedRevision = null) {
  validateDraft(figure.title, drafts);
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['figures', 'videos'], 'readwrite');
    const figures = tx.objectStore('figures'), videos = tx.objectStore('videos');
    let error, saved;
    const abort = message => { error = new Error(message); tx.abort(); };
    tx.onabort = () => reject(error ?? tx.error ?? new Error('Speichern abgebrochen.'));
    tx.onerror = () => {}; // The transaction's abort handler reports quota and copy errors.
    tx.oncomplete = () => resolve(saved);
    const request = figures.get(figure.id);
    request.onsuccess = () => {
      const previous = request.result;
      if ((previous?.revision ?? null) !== expectedRevision) return abort('Diese Figur wurde inzwischen geändert. Bitte den Entwurf schließen und erneut öffnen.');
      const owned = new Set(previous?.videoIds ?? []);
      if (drafts.some(d => d.existing && !owned.has(d.id))) return abort('Ein Video gehört nicht zu dieser Figur.');
      const videoIds = drafts.map(d => d.id);
      for (const draft of drafts) {
        if (draft.existing) {
          const existing = videos.get(draft.id);
          existing.onsuccess = () => {
            if (!existing.result || existing.result.figureId !== figure.id) return abort('Ein gespeichertes Video fehlt.');
            videos.put({ ...existing.result, name: draft.name.trim() });
          };
        } else {
          videos.put({ id: draft.id, figureId: figure.id, name: draft.name.trim(), blob: draft.blob, duration: draft.duration, width: draft.width, height: draft.height, poster: draft.poster ?? null });
        }
      }
      for (const id of owned) if (!videoIds.includes(id)) videos.delete(id);
      const first = drafts[0];
      saved = { id: figure.id, title: figure.title.trim(), description: figure.description, status: figure.status, tags: figure.tags, createdAt: previous?.createdAt ?? Date.now(), revision: crypto.randomUUID(), videoIds, duration: first.duration, poster: first.poster ?? null };
      figures.put(saved);
    };
  });
}
export async function deleteFigure(figure) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['figures', 'videos'], 'readwrite'); let error;
    tx.onabort = () => reject(error ?? tx.error); tx.onerror = () => {}; tx.oncomplete = () => resolve();
    const figures = tx.objectStore('figures'); const request = figures.get(figure.id);
    request.onsuccess = () => {
      if (request.result?.revision !== figure.revision) { error = new Error('Die Figur wurde inzwischen geändert. Bitte neu laden.'); tx.abort(); return; }
      request.result.videoIds.forEach(id => tx.objectStore('videos').delete(id)); figures.delete(figure.id);
    };
  });
}
export function storageMessage(error) { return error?.name === 'QuotaExceededError' ? 'Der lokale Speicher ist voll. Bitte Speicher auf dem Gerät freigeben oder nicht mehr benötigte Figuren entfernen. Deine bisher gespeicherten Figuren bleiben erhalten.' : error?.message ?? 'Der lokale Speicher ist nicht verfügbar.'; }
