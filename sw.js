/* Garde l'appli disponible hors ligne. Change le numéro de version à chaque mise à jour des fichiers. */
const CACHE = 'je-fais-quoi-v1';
const ASSETS = [
  './', 'index.html', 'app.js', 'art.js', 'manifest.webmanifest',
  'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png',
  'bungee.woff2', 'figtree-400.woff2', 'figtree-600.woff2', 'figtree-700.woff2', 'figtree-800.woff2'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req, { ignoreSearch: true }).then((hit) => {
        const net = fetch(req)
          .then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; })
          .catch(() => hit || (req.mode === 'navigate' ? cache.match('index.html') : Response.error()));
        if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
        return net;
      })
    )
  );
});
