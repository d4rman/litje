// Service worker: офлайн-работа. При изменении файлов — поднять VERSION.
const VERSION = 'mc-v1.0.0';
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/app.js', 'js/core.js', 'js/store.js', 'js/ui.js', 'js/timers-core.js',
  'js/svg/icons.js', 'js/svg/scenes.js',
  'js/data/wizards.js', 'js/data/gear.js', 'js/data/modeling.js', 'js/data/defects.js',
  'js/views/home.js', 'js/views/metals.js', 'js/views/gear.js', 'js/views/modeling.js', 'js/views/process.js',
  'js/views/wizard.js', 'js/views/safety.js', 'js/views/calc.js', 'js/views/timers.js', 'js/views/defects.js',
  'js/views/journal.js', 'js/views/data.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Сначала кэш (мгновенно и офлайн), в фоне — обновление из сети
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req)
      .then(res => { if (res.ok) cache.put(req, res.clone()); return res; })
      .catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net;
    if (res) return res;
    if (req.mode === 'navigate') return cache.match('index.html');
    return new Response('', { status: 504, statusText: 'offline' });
  })());
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(ws => (ws[0] ? ws[0].focus() : self.clients.openWindow('./#/timers'))),
  );
});
