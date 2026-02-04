/**
 * Shared types for the Cloudflare Worker
 */
import type { Ai, D1Database } from "@cloudflare/workers-types";

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
  AI_SERVICE: Ai;
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

export interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
}

export interface WorkerAssistantMessage {
  role: string;
  content: string;
}

export interface WorkerChatRequest {
  messages: WorkerAssistantMessage[];
  language?: string;
}

export interface ProductParams {
  name: string;
  category?: string;
  stock?: number;
  unit_cost?: number;
  notes?: string;
}

export interface ApplianceParams {
  name: string;
  brand?: string;
  model?: string;
  type?: string;
  location?: string;
  notes?: string;
}

export interface PushOptions {
  userId: string;
  title: string;
  body: string;
  url: string;
  tag: string;
  requireInteraction?: boolean;
}
