const STATIC_CACHE_NAME = "inventory-seg-static-v8";
const IMAGE_CACHE_NAME = "inventory-seg-images-v8";
const API_CACHE_NAME = "inventory-seg-api-v8";
const FONT_CACHE_NAME = "inventory-seg-fonts-v8";

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon.svg",
];

const SUPABASE_IMAGE_URL_SIGNATURE =
  "/storage/v1/object/public/inventory-images";

const SUPABASE_API_URL_SIGNATURES = [
  "/rest/v1/inventory",
  "/rest/v1/appliances",
  "/rest/v1/inventory_categories",
  "/rest/v1/inventory_locations",
  "/rest/v1/inventory_activity",
  "/rest/v1/repairs",
];

const BYPASS_CACHE_SIGNATURES = ["/rest/v1/user_settings", "/auth/v1/"];

// Helper function for network-first strategy
function networkFirst(cacheName, request) {
  return fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const responseClone = networkResponse.clone();
        caches.open(cacheName).then((cache) => {
          cache.put(request, responseClone);
        });
      }
      return networkResponse;
    })
    .catch(() => {
      return caches.match(request);
    });
}

// Helper function for stale-while-revalidate strategy
function staleWhileRevalidate(cacheName, request) {
  return caches.open(cacheName).then((cache) => {
    return cache.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => {
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    });
  });
}

// Install event: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const activeCaches = [
        STATIC_CACHE_NAME,
        IMAGE_CACHE_NAME,
        API_CACHE_NAME,
        FONT_CACHE_NAME,
      ];
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!activeCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event: handle requests
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Ignore non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Strategy: Network-First for API calls (excluding sensitive ones)
  if (SUPABASE_API_URL_SIGNATURES.some((sig) => url.pathname.includes(sig))) {
    event.respondWith(networkFirst(API_CACHE_NAME, event.request));
    return;
  }

  // Explicitly bypass caching for sensitive endpoints
  if (BYPASS_CACHE_SIGNATURES.some((sig) => url.pathname.includes(sig))) {
    return;
  }

  // Strategy: Stale-While-Revalidate for Supabase Images
  if (url.pathname.startsWith(SUPABASE_IMAGE_URL_SIGNATURE)) {
    event.respondWith(staleWhileRevalidate(IMAGE_CACHE_NAME, event.request));
    return;
  }

  // Strategy: Stale-While-Revalidate for Fonts (External + Local)
  if (
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(staleWhileRevalidate(FONT_CACHE_NAME, event.request));
    return;
  }

  // Strategy: Cache-First for local static assets
  if (ASSETS_TO_CACHE.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
    return;
  }

  // Strategy: Stale-While-Revalidate for built assets (JS, CSS)
  if (
    url.pathname.includes("/assets/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css")
  ) {
    event.respondWith(staleWhileRevalidate(STATIC_CACHE_NAME, event.request));
    return;
  }

  // Handle navigation requests (SPA)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/index.html") || caches.match("/");
      })
    );
  }
});

// Handle push event
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/icons/icon.svg",
      badge: data.badge || "/icons/icon.svg",
      vibrate: data.vibrate || [200, 100, 200],
      data: data.data || { url: "/" },
      tag: data.tag || "inventory-alert",
      requireInteraction: data.requireInteraction || false,
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  } catch (err) {
    // Error handling for push notification
  }
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen =
    (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
