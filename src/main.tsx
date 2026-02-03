import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";

const SENTRY_DSN: string = String(import.meta.env.VITE_SENTRY_DSN || "");

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 0.1, //  Capture 10% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/inv\.coderage\.pro/,
    /^https:\/\/inventory-seg\.pages\.dev/,
    /^https:\/\/nidebcwouohczncxrgfv\.supabase\.co/,
  ],
  // Session Replay
  replaysSessionSampleRate: 0.01, // This sets the sample rate at 1%.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  sendDefaultPii: true,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register the service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void Sentry.startSpan(
      {
        op: "serviceWorker.register",
        name: "Service Worker Registration",
      },
      async () => {
        try {
          await navigator.serviceWorker.register("/sw.js");
          // SW registered successfully
        } catch (error) {
          Sentry.captureException(error);
        }
      }
    );
  });
}
