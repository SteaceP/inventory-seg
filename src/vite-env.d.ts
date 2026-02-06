/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_VAPID_PUBLIC_KEY: string;
  readonly VITE_VAPID_PRIVATE_KEY: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_TURNSTILE_SITE_KEY: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_COMPANY_NAME: string;
  readonly VITE_COMPANY_URL: string;
  readonly VITE_MAINTAINER_EMAIL: string;
  readonly VITE_APP_URL: string;
  readonly VITE_WORKER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
