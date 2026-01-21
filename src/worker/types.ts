/**
 * Shared types for the Cloudflare Worker
 */

export interface Env {
  BREVO_API_KEY: string;
  BREVO_SENDER_EMAIL: string;
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  fetch: typeof fetch;
  ALLOWED_ORIGIN?: string;
  SENTRY_DSN: string;
  HYPERDRIVE: { connectionString: string };
  DB: D1Database;
}

export interface RequestBody {
  itemName: string;
  currentStock: number;
  threshold: number;
  userEmail: string;
  userId: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  subscription: PushSubscription;
  device_info: string;
  created_at: string;
}
