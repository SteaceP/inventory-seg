/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types/database.types";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const supabasePublishableKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || "";

export const supabase = createClient<Database>(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      // Persist session in localStorage for session restoration on page refresh
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      // Automatically refresh the token before it expires
      autoRefreshToken: true,
      // Enable session persistence
      persistSession: true,
      // Detect session from URL for OAuth flows
      detectSessionInUrl: true,
    },
  }
);
