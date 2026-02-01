const STATIC_CACHE_NAME = "inventory-seg-static-v11";
const IMAGE_CACHE_NAME = "inventory-seg-images-v11";
const API_CACHE_NAME = "inventory-seg-api-v11";
const FONT_CACHE_NAME = "inventory-seg-fonts-v11";

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

// Helper function for cache-first strategy (Immutable assets)
async function cacheFirst(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

// Helper function for network-first strategy (APIs)
async function networkFirst(cacheName, request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return caches.match(request);
  }
}

// Helper function for stale-while-revalidate strategy (Mutable assets)
async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

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

  // Security: Prevent request hijacking by ensuring origin is trusted
  // We allow requests to:
  // 1. Same origin (self.location.origin)
  // 2. Supabase (backend)
  // 3. Google Fonts/Gstatic (fonts)
  // 4. Cloudflare Insights/Challenges (security/analytics)
  // 5. Brevo API (email - usually server-side but checking anyway if mistakenly called from here)
  const isSameOrigin = url.origin === self.location.origin;
  const isSupabase = url.hostname.endsWith(".supabase.co");
  const isGoogleFonts =
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com");
  const isCloudflare =
    url.hostname.includes("cloudflareinsights.com") ||
    url.hostname.includes("challenges.cloudflare.com");

  if (!isSameOrigin && !isSupabase && !isGoogleFonts && !isCloudflare) {
    // Treat unknown cross-origin requests as network-only (no caching)
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

  // Strategy: Cache-First for Fonts (Immutable usually)
  // Google Fonts CSS is mutable, but woff2 files are immutable
  if (url.pathname.endsWith(".woff2")) {
    event.respondWith(cacheFirst(FONT_CACHE_NAME, event.request));
    return;
  }
  if (
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com")
  ) {
    event.respondWith(staleWhileRevalidate(FONT_CACHE_NAME, event.request));
    return;
  }

  // Strategy: Cache-First for local static assets (Vite hashed assets)
  // Vite assets in /assets/ usually have hashes like index.1234.js, making them immutable.
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(STATIC_CACHE_NAME, event.request));
    return;
  }

  // Strategy: Cache-First for explicitly defined static assets
  if (ASSETS_TO_CACHE.includes(url.pathname)) {
    event.respondWith(cacheFirst(STATIC_CACHE_NAME, event.request));
    return;
  }

  // Handle navigation requests (SPA) - Stale-While-Revalidate for index.html availability
  // But generally Network-First preference for HTML to get latest version, falling back to cache
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/index.html") || caches.match("/");
      })
    );
    return;
  }

  // Fallback for other same-origin requests (e.g., manifest, icons not in ASSETS_TO_CACHE)
  if (isSameOrigin) {
    event.respondWith(staleWhileRevalidate(STATIC_CACHE_NAME, event.request));
  }
});

// Handle push event
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    // Security: Validate URL to prevent open redirects/phishing
    let url = data.data?.url || "/";
    try {
      const urlObj = new URL(url, self.location.origin);
      // Only allow same-origin URLs
      if (urlObj.origin !== self.location.origin) {
        url = "/";
      }
    } catch (e) {
      url = "/";
    }

    const options = {
      body: data.body,
      icon: data.icon || "/icons/icon.png", // Corrected extension
      badge: data.badge || "/icons/icon.png",
      vibrate: data.vibrate || [200, 100, 200],
      data: { url }, // Validated URL
      tag: data.tag || "inventory-alert",
      requireInteraction: data.requireInteraction || false,
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  } catch (err) {
    console.error("Push notification error:", err);
  }
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/";

  // Security: Final check ensuring we only open same-origin
  const targetUrl = new URL(urlToOpen, self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
