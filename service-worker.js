const CACHE_NAME = 'morning-brew-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/main.js',
  '/js/cart-system.js',
  '/js/accessibility.js',
  '/js/performance-monitor.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then(networkResponse => {
            const responseClone = networkResponse.clone();

            if (networkResponse.ok && networkResponse.status < 400) {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseClone);
                })
                .catch(error => {
                  console.error('Caching failed:', error);
                });
            }

            return networkResponse;
          })
          .catch(() => {
            return new Response('Network error. Please try again later.', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCartWithServer());
  }
});

async function syncCartWithServer() {
  try {
    const cart = await caches.match('/cart-data.json');
    if (cart) {
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: await cart.json()
      });

      if (response.ok) {
        await caches.delete('/cart-data.json');
      }
    }
  } catch (error) {
    console.error('Cart sync failed:', error);
  }
}
