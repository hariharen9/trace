// Mapz Service Worker — v1.0.0
const CACHE_NAME = 'mapz-v1';
const TILE_CACHE = 'mapz-tiles-v1';
const DATA_CACHE = 'mapz-data-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
];

// ── Install: pre-cache core shell ──
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Mapz SW] Pre-caching app shell');
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
  const url = new URL(e.request.url);

  // Map tiles → cache-first with long TTL
  if (url.hostname.includes('maptiler') || url.pathname.includes('/tiles/')) {
    e.respondWith(tileStrategy(e.request));
    return;
  }

  // API calls → network-first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(networkFirstStrategy(e.request, DATA_CACHE));
    return;
  }

  // App shell → cache-first, fallback to network
  e.respondWith(cacheFirstStrategy(e.request));
});

async function tileStrategy(request) {
  const cache = await caches.open(TILE_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
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
    return cached || new Response(JSON.stringify({ error: 'Offline', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    // Offline fallback — return app shell
    const shell = await cache.match('/index.html');
    return shell || new Response('Offline', { status: 503 });
  }
}

// ── Background sync: save offline-added places ──
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-places') {
    e.waitUntil(syncPendingPlaces());
  }
});

async function syncPendingPlaces() {
  // Would read from IndexedDB and POST to backend
  console.log('[Mapz SW] Syncing pending places...');
}

// ── Push notifications: check-in reminders ──
self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || 'Mapz';
  const options = {
    body: data.body || "You're near a saved spot!",
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: data.tag || 'mapz-notification',
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Open Mapz' },
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
