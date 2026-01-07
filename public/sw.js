const STATIC_CACHE_NAME = 'inventory-seg-static-v3';
const DYNAMIC_CACHE_NAME = 'inventory-seg-dynamic-v3';
const API_CACHE_NAME = 'inventory-seg-api-v3';

const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/icon.svg'
];

const SUPABASE_IMAGE_URL_SIGNATURE = '/storage/v1/object/public/inventory-images';
const SUPABASE_API_URL_SIGNATURES = ['/rest/v1/inventory', '/rest/v1/appliances'];

// Helper function for stale-while-revalidate strategy
function staleWhileRevalidate(cacheName, request) {
    return caches.open(cacheName).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request).then((networkResponse) => {
                if (networkResponse.ok) {
                    cache.put(request, networkResponse.clone());
                }
                return networkResponse;
            }).catch(err => {
                console.error('[Service Worker] Fetch failed:', err, request.url);
                // If fetch fails, return the cached response if it exists
                return cachedResponse;
            });

            return cachedResponse || fetchPromise;
        });
    });
}

// Install event: cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Pre-caching App Shell');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME && cacheName !== API_CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch event: handle requests
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Ignore non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Ignore requests to other origins, unless it's our Supabase API/storage
    if (!url.origin.startsWith(self.location.origin) && !url.origin.includes('supabase')) {
        return;
    }

    // Strategy: Stale-While-Revalidate for Supabase Images
    if (url.pathname.startsWith(SUPABASE_IMAGE_URL_SIGNATURE)) {
        event.respondWith(staleWhileRevalidate(DYNAMIC_CACHE_NAME, event.request));
    }
    // Strategy: Stale-While-Revalidate for API calls
    else if (SUPABASE_API_URL_SIGNATURES.some(sig => url.pathname.startsWith(sig))) {
        event.respondWith(staleWhileRevalidate(API_CACHE_NAME, event.request));
    }
    // Strategy: Cache First for App Shell assets
    else if (ASSETS_TO_CACHE.includes(url.pathname) || url.pathname === '/') {
        event.respondWith(caches.match(event.request));
    }
    // For other requests, just fetch from network
    else {
        event.respondWith(fetch(event.request));
    }
});


// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
