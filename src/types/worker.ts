/**
 * Shared types for the Cloudflare Worker
 */
import type { Ai, D1Database } from "@cloudflare/workers-types";

/** Environment variables and bindings for the Cloudflare Worker */
export interface Env {
  BREVO_API_KEY: string;
  BREVO_SENDER_EMAIL: string;
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  fetch: typeof fetch;
  /** Custom CORS origin if set */
  ALLOWED_ORIGIN?: string;
  APP_URL: string;
  COMPANY_NAME: string;
  ADMIN_EMAIL: string;
  SENTRY_DSN: string;
  /** Cloudflare Hyperdrive connection to Supabase */
  HYPERDRIVE: { connectionString: string };
  /** D1 database instance for local state if needed */
  DB: D1Database;
  /** AI Service binding for Llama analysis */
  AI_SERVICE: Ai;
}

/** Payload for low stock notification requests */
export interface RequestBody {
  itemName: string;
  currentStock: number;
  threshold: number;
  userEmail: string;
  userId: string;
}

/** Web Push subscription object format */
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/** Database representation of a push subscription */
export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  subscription: PushSubscription;
  device_info: string;
  created_at: string;
}

/** Options for sending transactional emails */
export interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
}

/** Individual message in the worker's AI context */
export interface WorkerAssistantMessage {
  role: string;
  content: string;
}

/** Request payload for AI-powered assistant features */
export interface WorkerChatRequest {
  messages: WorkerAssistantMessage[];
  language?: string;
}

/** Parameters for creating/updating products via worker */
export interface ProductParams {
  name: string;
  category?: string;
  stock?: number;
  unit_cost?: number;
  notes?: string;
}

/** Parameters for creating/updating appliances via worker */
export interface ApplianceParams {
  name: string;
  brand?: string;
  model?: string;
  type?: string;
  location?: string;
  notes?: string;
}

/** Input for sending a push notification */
export interface PushOptions {
  userId: string;
  title: string;
  body: string;
  url: string;
  tag: string;
  requireInteraction?: boolean;
}

/** Standard Web Push API message structure */
export interface PushData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  vibrate?: number[];
  tag?: string;
  requireInteraction?: boolean;
  data?: {
    url?: string;
  };
}

/** Standard error response format for API endpoints */
export interface ApiResponseError {
  error?: string;
  errorType?: string;
}
