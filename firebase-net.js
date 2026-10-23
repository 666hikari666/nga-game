// Онлайн через Firebase Realtime Database.
// Игра и слоты написаны под API claude.ai (`window.claude.use('db')`), поэтому здесь —
// маленькая прослойка с тем же API поверх Firebase. Если Firebase не загрузился
// (нет интернета или страница открыта на claude.ai), игра просто работает офлайн.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getDatabase, ref, set, get, remove, onValue }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDX7TwjhYIx2DFiVWl4KSyi-UEEIFMQJ2E',
  authDomain: 'nga-game.firebaseapp.com',
  databaseURL: 'https://nga-game-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'nga-game',
  storageBucket: 'nga-game.firebasestorage.app',
  messagingSenderId: '161018141051',
  appId: '1:161018141051:web:a9efe3a0fedf8c3c4c85de',
};
const fdb = getDatabase(initializeApp(firebaseConfig));

// Firebase выкидывает null и пустые массивы — кодируем их, чтобы «таймер выключен» и т.п. доходили
const NULL = '__null__', EMPTY = '__empty__';
const enc = v => v === null ? NULL : Array.isArray(v) ? (v.length ? v.map(enc) : EMPTY)
  : typeof v === 'object' ? Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => [k, enc(x)])) : v;
const dec = v => v === NULL ? null : v === EMPTY ? [] : Array.isArray(v) ? v.map(dec)
  : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dec(x)])) : v;

const docSnap = (id, val) => ({ id, exists: val != null, data: () => (val == null ? undefined : dec(val)) });
const colSnap = val => {
  const docs = Object.entries(val || {}).map(([id, v]) => docSnap(id, v));
  return { docs, size: docs.length, empty: !docs.length };
};
function doc(path) {
  const r = ref(fdb, path), id = path.split('/').pop();
  return {
    id, path,
    set: data => set(r, enc(data)),
    get: async () => docSnap(id, (await get(r)).val()),
    delete: () => remove(r),
    onSnapshot: (next, err) => onValue(r, s => next(docSnap(id, s.val())), err),
  };
}
function collection(path) {
  const r = ref(fdb, path);
  return {
    path,
    doc: id => doc(`${path}/${id}`),
    get: async () => colSnap((await get(r)).val()),
    onSnapshot: (next, err) => onValue(r, s => next(colSnap(s.val())), err),
  };
}
const db = { doc, collection };

// Картинки работ: Storage на бесплатном тарифе требует карту, поэтому храним
// уже сжатую картинку (data URL) прямо в записи трая.
const assets = {
  upload: blob => new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res({ id: '', url: fr.result, sizeBytes: blob.size, contentType: blob.type });
    fr.onerror = rej; fr.readAsDataURL(blob);
  }),
};

if (!window.claude) window.claude = { use: async name => ({ db, assets })[name] || null };
