// TRACE Service Worker — v1.0.1
const CACHE_NAME = 'trace-shell-v1';
const TILE_CACHE = 'trace-tiles-v1';
const DATA_CACHE = 'trace-data-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=JetBrains+Mono:wght@400;500&display=swap'
];

// ── Install: pre-cache core assets ──
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[TRACE SW] Pre-caching core shell');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ──
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== TILE_CACHE && k !== DATA_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch strategy ──
self.addEventListener('fetch', (e) => {
  // Safeguard: Only handle HTTP/HTTPS protocols (ignores chrome-extension, etc.)
  if (!e.request.url.startsWith('http')) {
    return;
  }

  // CRITICAL: Only handle GET requests. Caching POST/PUT/DELETE throws errors.
  if (e.request.method !== 'GET') {
    return;
  }

  const url = new URL(e.request.url);

  // MapLibre / MapTiler vector tiles caching
  if (url.hostname.includes('maptiler') || url.pathname.includes('/tiles/')) {
    e.respondWith(tileStrategy(e.request));
    return;
  }

  // Firebase auth calls or database API routes - network first
  if (url.pathname.startsWith('/api/') || url.hostname.includes('googleapis.com') || url.hostname.includes('firebaseapp.com')) {
    e.respondWith(networkFirstStrategy(e.request, DATA_CACHE));
    return;
  }

  // index.html / main entrypoint - network first to ensure new asset hashes are loaded
  if (url.pathname === '/' || url.pathname === '/index.html') {
    e.respondWith(networkFirstStrategy(e.request, CACHE_NAME));
    return;
  }

  // Static assets (Vite hashed bundles, images, icons, fonts) - stale while revalidate
  e.respondWith(staleWhileRevalidateStrategy(e.request, CACHE_NAME));
});

async function tileStrategy(request) {
  const cache = await caches.open(TILE_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const networkFetch = fetch(request).then(async (response) => {
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  return cached || networkFetch;
}

// ── Background sync ──
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-places') {
    e.waitUntil(syncPendingPlaces());
  }
});

async function syncPendingPlaces() {
  console.log('[TRACE SW] Syncing pending places...');
}

// ── Push notifications ──
self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || 'TRACE';
  const options = {
    body: data.body || "You're near a saved spot!",
    icon: '/favicon.svg',
    tag: data.tag || 'trace-notification',
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Open TRACE' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  if (e.action === 'open' || !e.action) {
    const url = e.notification.data?.url || '/';
    e.waitUntil(clients.openWindow(url));
  }
});
