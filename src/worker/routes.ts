/**
 * Route handlers for the Cloudflare Worker
 * This module contains all API route implementations
 */

import webpush from "web-push";
import postgres from "postgres";
import { reportError } from "./errorReporting";
import { verifyAuth } from "./auth";
import { createResponse } from "./helpers";
import {
  sanitizeHtml,
  validateEmail,
  validateItemName,
  validateStock,
  validateThreshold,
} from "./validators";
import type { Env, RequestBody, PushSubscriptionRow } from "./types";

/**
 * Handle activity log POST - creates a new activity entry
 */
export async function handleActivityLogPost(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    if (!(await verifyAuth(request, env))) {
      return createResponse({ error: "Unauthorized" }, 401, env, request);
    }

    const body: {
      inventory_id: string;
      user_id: string;
      action: string;
      item_name: string;
      changes: unknown;
    } = await request.json();

    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO inventory_activity (id, inventory_id, user_id, action, item_name, changes)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        body.inventory_id,
        body.user_id,
        body.action,
        body.item_name,
        JSON.stringify(body.changes)
      )
      .run();

    return createResponse({ success: true, id }, 201, env, request);
  } catch (err) {
    return createResponse({ error: (err as Error).message }, 500, env, request);
  }
}

/**
 * Handle activity log GET - retrieves filtered activity entries
 */
export async function handleActivityLogGet(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    if (!(await verifyAuth(request, env))) {
      return createResponse({ error: "Unauthorized" }, 401, env, request);
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "0");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const actionFilter = url.searchParams.get("actionFilter") || "all";
    const searchTerm = url.searchParams.get("searchTerm") || "";
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const location = url.searchParams.get("location");
    const actionType = url.searchParams.get("actionType");

    let query = `SELECT * FROM inventory_activity WHERE 1=1`;
    const params: unknown[] = [];

    if (actionFilter !== "all" && actionFilter !== "stock") {
      query += ` AND action = ?`;
      params.push(actionFilter);
    } else if (actionFilter === "stock") {
      query += ` AND json_extract(changes, '$.action_type') IS NOT NULL`;
    }

    if (searchTerm) {
      query += ` AND (item_name LIKE ? OR user_id LIKE ?)`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    if (startDate) {
      query += ` AND created_at >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND created_at < ?`;
      params.push(endDate);
    }

    if (location && location !== "all") {
      query += ` AND json_extract(changes, '$.destination_location') = ?`;
      params.push(location);
    }

    if (actionType) {
      query += ` AND json_extract(changes, '$.action_type') = ?`;
      params.push(actionType);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(pageSize, page * pageSize);

    const { results } = await env.DB.prepare(query)
      .bind(...params)
      .all();

    // Parse JSON changes
    const formattedResults = results.map((r) => ({
      ...r,
      changes: JSON.parse(r.changes as string) as Record<string, unknown>,
    }));

    return createResponse(formattedResults, 200, env, request);
  } catch (err) {
    return createResponse({ error: (err as Error).message }, 500, env, request);
  }
}

/**
 * Handle dashboard stats - calculates today's stock in/out
 */
export async function handleDashboardStats(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    if (!(await verifyAuth(request, env))) {
      return createResponse({ error: "Unauthorized" }, 401, env, request);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = today.toISOString();

    const { results } = await env.DB.prepare(
      `SELECT action, changes FROM inventory_activity WHERE created_at >= ?`
    )
      .bind(startDate)
      .all();

    let stockIn = 0;
    let stockOut = 0;

    const getNumber = (obj: Record<string, unknown>, key: string) => {
      const val = obj[key];
      return typeof val === "number" ? val : 0;
    };

    results.forEach((row) => {
      const action = row.action as string;
      const changes = JSON.parse(row.changes as string) as Record<
        string,
        unknown
      >;

      if (action === "created") {
        stockIn += getNumber(changes, "stock");
      } else if (action === "deleted") {
        stockOut += getNumber(changes, "stock");
      } else if (action === "updated") {
        const diff =
          getNumber(changes, "stock") - getNumber(changes, "old_stock");
        if (diff > 0) stockIn += diff;
        else if (diff < 0) stockOut += Math.abs(diff);
      }
    });

    return createResponse({ in: stockIn, out: stockOut }, 200, env, request);
  } catch (err) {
    return createResponse({ error: (err as Error).message }, 500, env, request);
  }
}

/**
 * Handle report stats - aggregates stock removal by item
 */
export async function handleReportStats(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    if (!(await verifyAuth(request, env))) {
      return createResponse({ error: "Unauthorized" }, 401, env, request);
    }

    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const location = url.searchParams.get("location");

    if (!startDate || !endDate) {
      return createResponse(
        { error: "Missing startDate or endDate" },
        400,
        env,
        request
      );
    }

    let query = `SELECT item_name, changes FROM inventory_activity 
                 WHERE created_at >= ? AND created_at < ? 
                 AND json_extract(changes, '$.action_type') = 'remove'`;
    const params: unknown[] = [startDate, endDate];

    if (location && location !== "all") {
      query += ` AND json_extract(changes, '$.destination_location') = ?`;
      params.push(location);
    }

    const { results } = await env.DB.prepare(query)
      .bind(...params)
      .all();

    const aggregation: Record<string, number> = {};

    results.forEach((row) => {
      const changes = JSON.parse(row.changes as string) as {
        old_stock?: unknown;
        stock?: unknown;
      };
      const oldStock = Number(changes.old_stock) || 0;
      const newStock = Number(changes.stock) || 0;
      const count = Math.abs(newStock - oldStock);

      const itemName = (row.item_name as string) || "Unknown Item";
      aggregation[itemName] = (aggregation[itemName] || 0) + count;
    });

    const result = Object.entries(aggregation)
      .map(([itemName, total]) => ({ itemName, total }))
      .sort((a, b) => b.total - a.total);

    return createResponse(result, 200, env, request);
  } catch (err) {
    return createResponse({ error: (err as Error).message }, 500, env, request);
  }
}

/**
 * Handle test push notification
 */
export async function handleTestPush(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    if (!(await verifyAuth(request, env))) {
      return createResponse({ error: "Unauthorized" }, 401, env, request);
    }

    const requestBody: { userId: string } = await request.json();
    const { userId } = requestBody;
    if (!userId) {
      return createResponse({ error: "Missing userId" }, 400, env, request);
    }

    if (userId && env.HYPERDRIVE) {
      const sql = postgres(env.HYPERDRIVE.connectionString);
      try {
        const subscriptions = await sql<PushSubscriptionRow[]>`
          SELECT * FROM push_subscriptions WHERE user_id = ${userId}
        `;

        if (
          subscriptions.length > 0 &&
          env.VAPID_PUBLIC_KEY &&
          env.VAPID_PRIVATE_KEY
        ) {
          const options = {
            vapidDetails: {
              subject: "mailto:admin@coderage.pro",
              publicKey: env.VAPID_PUBLIC_KEY,
              privateKey: env.VAPID_PRIVATE_KEY,
            },
          };

          const payload = JSON.stringify({
            title: "Push Notification Test",
            body: "This is a test notification sent from the server!",
            icon: "/icons/icon.svg",
            data: { url: "/settings" },
            tag: "test-notification",
            requireInteraction: true,
          });

          await Promise.allSettled(
            subscriptions.map((sub) =>
              webpush
                .sendNotification(sub.subscription, payload, options)
                .catch((error: unknown) => {
                  // If the subscription is no longer valid, delete it
                  const status = (error as { statusCode?: number })?.statusCode;
                  if (status === 410 || status === 404) {
                    void sql`
                        DELETE FROM push_subscriptions WHERE id = ${sub.id}
                      `.catch((err: unknown) => {
                      reportError(err);
                    });
                  }
                })
            )
          );
          return createResponse({ success: true }, 200, env, request);
        }
      } finally {
        await sql.end();
      }
    }
    return createResponse(
      { error: "No subscriptions found" },
      404,
      env,
      request
    );
  } catch (err) {
    reportError(err);
    return createResponse({ error: (err as Error).message }, 500, env, request);
  }
}

/**
 * Handle low stock alert - sends email and push notifications
 */
export async function handleLowStockAlert(
  request: Request,
  env: Env
): Promise<Response> {
  let sql: ReturnType<typeof postgres> | undefined;
  try {
    if (!(await verifyAuth(request, env))) {
      return createResponse({ error: "Unauthorized" }, 401, env, request);
    }

    let body: RequestBody;
    try {
      body = await request.json();
    } catch {
      return createResponse(
        { error: "Invalid or missing JSON body" },
        400,
        env,
        request
      );
    }

    const { itemName, currentStock, threshold, userEmail, userId } = body;

    // Validate all inputs
    if (!validateItemName(itemName)) {
      return createResponse({ error: "Invalid item name" }, 400, env, request);
    }

    if (!validateStock(currentStock)) {
      return createResponse(
        { error: "Invalid stock value" },
        400,
        env,
        request
      );
    }

    if (!validateThreshold(threshold)) {
      return createResponse(
        { error: "Invalid threshold value" },
        400,
        env,
        request
      );
    }

    if (userEmail && !validateEmail(userEmail)) {
      return createResponse(
        { error: "Invalid email address" },
        400,
        env,
        request
      );
    }

    if (!userId || typeof userId !== "string" || userId.length === 0) {
      return createResponse({ error: "Invalid user ID" }, 400, env, request);
    }

    // --- 0. FETCH USER SETTINGS (LANGUAGE) ---
    let language = "en";
    sql = postgres(env.HYPERDRIVE.connectionString);
    try {
      if (userId) {
        const settings = await sql<Array<{ language: string }>>`
          SELECT language FROM user_settings WHERE user_id = ${userId} LIMIT 1
        `;
        if (settings && settings[0]) {
          language = settings[0].language || "en";
        }
      }
    } catch (err) {
      reportError(err);
    }

    // Sanitize for HTML email
    const sanitizedItemName = sanitizeHtml(itemName);
    const sanitizedThreshold = sanitizeHtml(threshold.toString());
    const sanitizedStock = sanitizeHtml(currentStock.toString());

    // Translation dictionary
    const translations: Record<string, Record<string, string>> = {
      en: {
        subject: `Low Stock Alert: ${sanitizedItemName}`,
        title: "Low Stock Alert",
        body: `The item "${sanitizedItemName}" is at ${sanitizedStock} units.`,
        emailTitle: "Low Stock Alert",
        emailIntro: `The following item has fallen below your threshold of <strong>${sanitizedThreshold}</strong>:`,
        emailItem: "Item:",
        emailStock: "Current Stock:",
        emailFooter: "Please log in to your inventory dashboard to restock.",
      },
      fr: {
        subject: `Alerte Stock Faible: ${sanitizedItemName}`,
        title: "Alerte Stock Faible",
        body: `L'article "${sanitizedItemName}" est à ${sanitizedStock} unités.`,
        emailTitle: "Alerte Stock Faible",
        emailIntro: `L'article suivant est tombé en dessous de votre seuil de <strong>${sanitizedThreshold}</strong> :`,
        emailItem: "Article :",
        emailStock: "Stock Actuel :",
        emailFooter:
          "Veuillez vous connecter à votre tableau de bord d'inventaire pour vous réapprovisionner.",
      },
      ar: {
        subject: `تنبيه انخفاض المخزون: ${sanitizedItemName}`,
        title: "تنبيه انخفاض المخزون",
        body: `المنتج "${sanitizedItemName}" وصل إلى ${sanitizedStock} وحدة.`,
        emailTitle: "تنبيه انخفاض المخزون",
        emailIntro: `المنتج التالي انخفض عن الحد المسموح به <strong>${sanitizedThreshold}</strong>:`,
        emailItem: "المنتج:",
        emailStock: "المخزون الحالي:",
        emailFooter: "يرجى تسجيل الدخول إلى لوحة التحكم لإعادة التعبئة.",
      },
    };

    const t = translations[language] || translations.en;

    // --- 1. SEND EMAIL (BREVO) ---
    if (env.BREVO_API_KEY && userEmail) {
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": env.BREVO_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "Inventaire SEG",
            email: env.BREVO_SENDER_EMAIL || "noreply@coderage.pro",
          },
          to: [{ email: userEmail }],
          subject: t.subject,
          htmlContent: `
          <div style="font-family: sans-serif; padding: 20px; color: #333; direction: ${language === "ar" ? "rtl" : "ltr"};">
            <h2 style="color: #d32f2f;">${t.emailTitle}</h2>
            <p>${t.emailIntro}</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>${t.emailItem}</strong> ${sanitizedItemName}</p>
              <p style="margin: 5px 0;"><strong>${t.emailStock}</strong> ${sanitizedStock}</p>
            </div>
            <p>${t.emailFooter}</p>
          </div>
        `,
        }),
      });
    }

    // --- 2. BROADCAST PUSH NOTIFICATIONS ---
    if (userId && env.HYPERDRIVE && sql) {
      // Fetch subscriptions for this user from Hyperdrive
      try {
        const subscriptions = await sql<PushSubscriptionRow[]>`
          SELECT * FROM push_subscriptions WHERE user_id = ${userId}
        `;

        if (subscriptions.length > 0) {
          if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
            const options = {
              vapidDetails: {
                subject: "mailto:admin@coderage.pro",
                publicKey: env.VAPID_PUBLIC_KEY,
                privateKey: env.VAPID_PRIVATE_KEY,
              },
            };

            const payload = JSON.stringify({
              title: t.title,
              body: t.body,
              icon: "/icons/icon.svg",
              data: { url: "/inventory?filter=lowStock" },
              tag: `low-stock-${itemName}`,
              requireInteraction: true,
            });

            // Send to all devices
            const activeSql = sql;
            await Promise.allSettled(
              subscriptions.map((sub) =>
                webpush
                  .sendNotification(sub.subscription, payload, options)
                  .catch((error: unknown) => {
                    // If the subscription is no longer valid, delete it
                    const status = (error as { statusCode?: number })
                      ?.statusCode;
                    if ((status === 410 || status === 404) && activeSql) {
                      void activeSql`
                        DELETE FROM push_subscriptions WHERE id = ${sub.id}
                      `.catch((err: unknown) => {
                        reportError(err);
                      });
                    }
                  })
              )
            );
          } else {
            reportError(new Error("VAPID keys missing in env!"));
          }
        }
      } catch (err) {
        reportError(err);
      }
    }

    return createResponse({ success: true }, 200, env, request);
  } catch (error) {
    reportError(error);
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return createResponse(
      {
        error: message,
        timestamp: new Date().toISOString(),
      },
      500,
      env,
      request
    );
  } finally {
    if (sql) await sql.end();
  }
}
