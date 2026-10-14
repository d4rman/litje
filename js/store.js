// Хранилище: всё в localStorage (префикс mc.), фото журнала — в IndexedDB
// (localStorage ≈5 МБ, его хватило бы примерно на 30 фото).

const P = 'mc.';

export const store = {
  get(key, def) {
    try {
      const v = localStorage.getItem(P + key);
      return v == null ? def : JSON.parse(v);
    } catch {
      return def;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(P + key, JSON.stringify(value));
      return true;
    } catch (e) {
      window.dispatchEvent(new CustomEvent('mc:storage-error', { detail: e }));
      return false;
    }
  },
  del(key) {
    try { localStorage.removeItem(P + key); } catch {}
  },
  // обновить объект по ключу: store.patch('calc', c => ({...c, volume: 2}))
  patch(key, fn, def = {}) {
    const next = fn(store.get(key, def));
    store.set(key, next);
    return next;
  },
  dump() {
    const out = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(P)) out[k.slice(P.length)] = localStorage.getItem(k);
    }
    return out;
  },
  restore(obj) {
    for (const [k, v] of Object.entries(obj)) localStorage.setItem(P + k, v);
  },
  clearAll() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(P)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
  },
  bytes() {
    let n = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(P)) n += (k.length + (localStorage.getItem(k) || '').length) * 2;
    }
    return n;
  },
};

// ---------- IndexedDB для фото (dataURL) ----------
const DB_NAME = 'mc-photos';
const ST = 'photos';
let dbPromise = null;

function db() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(ST);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function tx(mode, fn) {
  return db().then(d => new Promise((resolve, reject) => {
    const t = d.transaction(ST, mode);
    const s = t.objectStore(ST);
    const r = fn(s);
    t.oncomplete = () => resolve(r && 'result' in r ? r.result : undefined);
    t.onerror = () => reject(t.error);
  }));
}

export const photos = {
  put: (id, dataURL) => tx('readwrite', s => s.put(dataURL, id)),
  get: id => tx('readonly', s => s.get(id)),
  del: id => tx('readwrite', s => s.delete(id)),
  async all() {
    const d = await db();
    return new Promise((resolve, reject) => {
      const out = {};
      const t = d.transaction(ST, 'readonly');
      const req = t.objectStore(ST).openCursor();
      req.onsuccess = () => {
        const c = req.result;
        if (c) { out[c.key] = c.value; c.continue(); } else resolve(out);
      };
      req.onerror = () => reject(req.error);
    });
  },
  clear: () => tx('readwrite', s => s.clear()),
};

// Уменьшить фото до maxSide и сжать в JPEG → dataURL
export function compressImage(file, maxSide = 1280, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.round(img.naturalWidth * k);
      const h = Math.round(img.naturalHeight * k);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Не удалось прочитать изображение')); };
    img.src = url;
  });
}
