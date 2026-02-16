/// <reference lib="webworker" />
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import {
  StaleWhileRevalidate,
  CacheFirst,
  NetworkFirst,
  NetworkOnly,
} from "workbox-strategies";

import type { PushData } from "./types/worker";

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: (string | { url: string; revision: string | null })[];
};

// Cleanup old caches from the previous manual implementation
cleanupOutdatedCaches();

// --- Bypassing ---

// 0. Bypass Vite internal development paths and node_modules
// This prevents the SW from intercepting logic during dev that it shouldn't touch
registerRoute(
  ({ url }) =>
    url.pathname.startsWith("/@vite") ||
    url.pathname.startsWith("/@fs") ||
    url.pathname.includes("node_modules"),
  new NetworkOnly()
);

// Precaching Vite assets
// In development, this might be empty or contain only a few static assets
precacheAndRoute(self.__WB_MANIFEST || []);

// 1. Supabase Images (Stale-While-Revalidate)
registerRoute(
  ({ url }: { url: URL }) =>
    url.pathname.includes("/storage/v1/object/public/inventory-images"),
  new StaleWhileRevalidate({
    cacheName: "inventory-images",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  })
);

// 2. Supabase API (Network-First)
const API_URL_SIGNATURES = [
  "/rest/v1/inventory",
  "/rest/v1/appliances",
  "/rest/v1/inventory_categories",
  "/rest/v1/inventory_locations",
  "/rest/v1/inventory_activity",
  "/rest/v1/repairs",
];

registerRoute(
  ({ url }: { url: URL }) =>
    url.hostname.endsWith(".supabase.co") &&
    API_URL_SIGNATURES.some((sig) => url.pathname.includes(sig)),
  new NetworkFirst({
    cacheName: "supabase-api",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 24 Hours
      }),
    ],
  })
);

// 3. Google Fonts (Cache-First for fonts, Stale-While-Revalidate for CSS)
registerRoute(
  ({ url }: { url: URL }) => url.hostname === "fonts.gstatic.com",
  new CacheFirst({
    cacheName: "google-fonts-webfonts",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 Year
      }),
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  })
);

registerRoute(
  ({ url }: { url: URL }) => url.hostname === "fonts.googleapis.com",
  new StaleWhileRevalidate({
    cacheName: "google-fonts-stylesheets",
  })
);

// 4. SPA Navigation (Fallback to index.html)
// Use a more resilient approach for navigation
registerRoute(
  new NavigationRoute(async (params) => {
    // Try to serve the precached index.html if possible (Production)
    try {
      const handler = createHandlerBoundToURL("/index.html");
      const response = await handler(params);
      if (response) return response;
    } catch {
      // Fallback for development where index.html is not precached
    }

    // Default to network for navigation
    return fetch(params.request).catch(async () => {
      // Offline fallback: try to find index.html in any cache
      const cachedIndex = await caches.match("/index.html");
      if (cachedIndex) return cachedIndex;

      return new Response("Offline: Page not available", {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "text/plain" },
      });
    });
  })
);

// --- Custom Logic (Push & Notifications) ---

self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;

  try {
    const data = event.data.json() as PushData;

    // Security: Validate URL to prevent open redirects
    let url = data.data?.url || "/";
    try {
      const urlObj = new URL(url, self.location.origin);
      if (urlObj.origin !== self.location.origin) {
        url = "/";
      }
    } catch {
      url = "/";
    }

    const options: NotificationOptions & { vibrate?: number[] } = {
      body: data.body,
      icon: data.icon || "/icons/icon.svg",
      badge: data.badge || "/icons/icon.svg",
      vibrate: data.vibrate || [200, 100, 200],
      data: { url },
      tag: data.tag || "inventory-alert",
      requireInteraction: data.requireInteraction || false,
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  } catch (err) {
    console.error("Push notification error:", err);
  }
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const urlToOpen = (event.notification.data as { url?: string })?.url || "/";
  const targetUrl = new URL(urlToOpen, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (clientList) => {
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) {
            await client.focus();
            return;
          }
        }
        if (self.clients.openWindow) {
          await self.clients.openWindow(targetUrl);
        }
      })
  );
});

self.addEventListener("install", () => {
  void self.skipWaiting();
});

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim());
});
