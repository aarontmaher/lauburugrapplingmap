// Service Worker — cache-first for offline support
const CACHE_VERSION = 'v2';
const CACHE_NAME = 'grappling-map-' + CACHE_VERSION;
const CACHE_URLS = [
  '/Chat-gpt/',
  '/Chat-gpt/index.html',
  '/Chat-gpt/manifest.json',
  '/Chat-gpt/grappling.opml',
  '/Chat-gpt/live-playlists.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('grappling-map-') && k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Only cache successful same-origin responses
        if (response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
