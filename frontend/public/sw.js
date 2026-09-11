const CACHE = 'atm-shell-v4';
const APP_SHELL = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // Precache static APP_SHELL (which generate-sw.js populates with build assets)
      try {
        await cache.addAll(APP_SHELL);
      } catch (e) {
        console.warn('[SW] Initial APP_SHELL cache.addAll warning:', e);
      }

      // Dynamic safety net: fetch /index.html and precache any referenced bundle assets
      try {
        const res = await fetch('/index.html');
        if (res.ok) {
          await cache.put('/index.html', res.clone());
          await cache.put('/', res.clone());
          const html = await res.text();
          const assetMatches = html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g);
          const dynamicAssets = Array.from(assetMatches, (m) => m[1]);
          if (dynamicAssets.length > 0) {
            await cache.addAll(dynamicAssets);
          }
        }
      } catch (e) {
        // Offline during install or already cached
      }

      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Never intercept API requests or external origins
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  // SPA Navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => {
              cache.put(event.request, copy.clone());
              cache.put('/index.html', copy);
            });
          }
          return response;
        })
        .catch(async () => {
          const cached =
            (await caches.match(event.request)) ||
            (await caches.match('/index.html')) ||
            (await caches.match('/'));
          return (
            cached ||
            new Response('Offline - No cached version available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' },
            })
          );
        })
    );
    return;
  }

  // Static Assets (JS, CSS, images, fonts)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version immediately; refresh cache in background if online
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              caches.open(CACHE).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // If not in cache, fetch from network and save to cache
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return new Response('', { status: 408, statusText: 'Request timed out or offline' });
        });
    })
  );
});
