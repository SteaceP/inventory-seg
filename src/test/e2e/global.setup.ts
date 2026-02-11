import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { test as setup, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authFile = path.join(__dirname, "../../../playwright/.auth/user.json");
const envPath = path.join(__dirname, "../../../.env.local");

// Simple dotenv parser fallback to read .env.local
const loadEnv = () => {
  console.log("Loading .env.local from:", envPath);
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (match) {
        let value = match[2].trim();
        // Remove surrounding quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        process.env[match[1]] = value;
      }
    });
    console.log(
      "Loaded keys:",
      Object.keys(process.env).filter((k) => k.includes("SUPABASE"))
    );
  } else {
    console.error(".env.local file not found at:", envPath);
  }
};

setup("authenticate", async ({ page }) => {
  loadEnv();

  const supabaseUrl =
    process.env.VITE_SUPABASE_URL || "https://127.0.0.1:54321";
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseSecretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY is required in .env.local for E2E tests."
    );
  }

  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const timestamp = Date.now();
  const email = `test-${timestamp}@s-e-g.ca`;
  const password = "Password123!";

  console.log(`Creating test user via Admin API: ${email}`);

  try {
    // Create user via Admin API
    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
  } catch (err: unknown) {
    console.error("Failed to create test user via API. Error details:");
    if (err instanceof Error) {
      console.error("Message:", err.message);
      console.error("Stack:", err.stack);

      // Cast to access potential extra properties
      const extendedErr = err as Error & { cause?: unknown; status?: number };
      if (extendedErr.cause) console.error("Cause:", extendedErr.cause);
      if (extendedErr.status) console.error("Status:", extendedErr.status);
    } else {
      console.error(JSON.stringify(err, null, 2));
    }
    throw err;
  }

  // Ensure auth directory exists
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  await page.goto("/login");

  // Check if we are already logged in
  const dashboardHeader = page.getByRole("heading", { name: "Dashboard" });
  if (await dashboardHeader.isVisible({ timeout: 2000 })) {
    await page.context().storageState({ path: authFile });
    return;
  }

  setup.setTimeout(60000);

  // Try to login via UI
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);

  // Wait for Turnstile logic (layout shift check)
  try {
    const turnstileFrame = page
      .locator('iframe[src*="challenges.cloudflare.com"]')
      .first()
      .contentFrame();
    await turnstileFrame
      .locator("body")
      .waitFor({ timeout: 5000 })
      .catch(() => {});
  } catch {
    // ignore
  }

  await page.getByRole("button", { name: /login|connecter|sign in/i }).click();

  // Wait for successful login (redirect to dashboard)
  await expect(page).toHaveURL("/", { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({
    timeout: 15000,
  });

  // Save storage state
  await page.context().storageState({ path: authFile });
});
