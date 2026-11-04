const CACHE = 'etde27-okr-v3';

// Solo cacheamos assets estáticos que no cambian (imágenes, Chart.js)
const STATIC = [
  '/etde27-okr/assets/logo-junta-oficial.png',
  '/etde27-okr/assets/logo-cofinanciado.png',
  '/etde27-okr/assets/icon-192.png',
  '/etde27-okr/assets/icon-512.png',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // GitHub API y datos: siempre red
  if (url.includes('api.github.com') || url.includes('raw.githubusercontent.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{}', { headers: { 'Content-Type': 'application/json' } })));
    return;
  }

  // Código de la app (HTML, CSS, JS): red primero → caché si falla (offline)
  if (url.includes('/etde27-okr/') && (url.endsWith('.html') || url.endsWith('/') || url.includes('.js') || url.includes('.css'))) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Assets estáticos: caché primero
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
