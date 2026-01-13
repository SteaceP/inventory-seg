const STATIC_CACHE_NAME = "inventory-seg-static-v4";
const DYNAMIC_CACHE_NAME = "inventory-seg-dynamic-v4";
const API_CACHE_NAME = "inventory-seg-api-v4";

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icon.svg",
];

const SUPABASE_IMAGE_URL_SIGNATURE =
  "/storage/v1/object/public/inventory-images";
const SUPABASE_API_URL_SIGNATURES = [
  "/rest/v1/inventory",
  "/rest/v1/appliances",
];
const NO_CACHE_API_SIGNATURES = ["/rest/v1/user_settings"];

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
          // If fetch fails, return the cached response if it exists
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
  // Force the waiting service worker to become active immediately
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE_NAME &&
            cacheName !== DYNAMIC_CACHE_NAME &&
            cacheName !== API_CACHE_NAME
          ) {
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

  // Handle navigation requests (html)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/");
      })
    );
    return;
  }

  // Ignore requests to other origins, unless it's Supabase API/storage
  if (
    !url.origin.startsWith(self.location.origin) &&
    !url.origin.includes("supabase")
  ) {
    return;
  }

  // Never cache user_settings - always fetch fresh from network
  if (NO_CACHE_API_SIGNATURES.some((sig) => url.pathname.includes(sig))) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: "Network error" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        });
      })
    );
    return;
  }

  // Strategy: Stale-While-Revalidate for Supabase Images
  if (url.pathname.startsWith(SUPABASE_IMAGE_URL_SIGNATURE)) {
    event.respondWith(staleWhileRevalidate(DYNAMIC_CACHE_NAME, event.request));
  }
  // Strategy: Stale-While-Revalidate for API calls
  else if (
    SUPABASE_API_URL_SIGNATURES.some((sig) => url.pathname.startsWith(sig))
  ) {
    event.respondWith(staleWhileRevalidate(API_CACHE_NAME, event.request));
  }
  // Strategy: Cache First for App Shell assets
  else if (ASSETS_TO_CACHE.includes(url.pathname) || url.pathname === "/") {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
  // For other requests (JS, CSS, etc.), use SWR to keep them up to date
  else {
    event.respondWith(staleWhileRevalidate(STATIC_CACHE_NAME, event.request));
  }
});

// Handle push event
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/icon.svg",
      badge: data.badge || "/icon.svg",
      vibrate: data.vibrate || [200, 100, 200],
      data: data.data || { url: "/" },
      tag: data.tag || "inventory-alert",
      requireInteraction: data.requireInteraction || false,
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  } catch (err) {
    console.error("Error receiving push notification:", err);
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
