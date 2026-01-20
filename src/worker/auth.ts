/**
 * Authentication utilities for the Cloudflare Worker
 */

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
}

/**
 * Verifies JWT token with Supabase
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
