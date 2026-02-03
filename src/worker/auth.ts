import type { Env } from "./types";

/**
 * Authentication utilities for the Cloudflare Worker
 */
export async function verifyAuth(request: Request, env: Env): Promise<boolean> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;

  const token = authHeader.split(" ")[1];
  try {
    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: env.SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Gets user details from Supabase Auth
 */
export async function getUser(
  request: Request,
  env: Env
): Promise<{ id: string; email?: string } | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: env.SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;

    const user: { id: string; email?: string } = await response.json();
    return user;
  } catch {
    return null;
  }
}
