import postgres from "postgres";
import { reportError } from "../errorReporting";
import { verifyAuth } from "../auth";
import { createResponse } from "../helpers";
import {
  sanitizeHtml,
  validateEmail,
  validateItemName,
  validateStock,
  validateThreshold,
} from "../validators";
import type { Env, RequestBody } from "../types";
import { getTranslation } from "../notifications/translations";
import { sendEmail } from "../notifications/email";
import { broadcastPush } from "../notifications/push";

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

    try {
      await broadcastPush(
        {
          userId,
          title: "Push Notification Test",
          body: "This is a test notification sent from the server!",
          url: "/settings",
          tag: "test-notification",
        },
        env
      );

      return createResponse({ success: true }, 200, env, request);
    } catch (broadcastErr) {
      const errorMessage = (broadcastErr as Error).message;

      // Handle specific error cases with appropriate status codes
      if (errorMessage.includes("No push subscriptions")) {
        return createResponse(
          {
            error:
              "No push subscriptions found. Please enable push notifications in settings first.",
            errorType: "NO_SUBSCRIPTION",
          },
          400,
          env,
          request
        );
      }

      if (errorMessage.includes("VAPID keys")) {
        reportError(broadcastErr);
        return createResponse(
          {
            error:
              "Push notifications are not properly configured on the server.",
            errorType: "CONFIG_ERROR",
          },
          500,
          env,
          request
        );
      }

      if (
        errorMessage.includes("HYPERDRIVE") ||
        errorMessage.includes("Database")
      ) {
        reportError(broadcastErr);
        return createResponse(
          {
            error: "Database connection error. Please try again later.",
            errorType: "DB_ERROR",
          },
          500,
          env,
          request
        );
      }

      // Unknown error
      reportError(broadcastErr);
      return createResponse({ error: errorMessage }, 500, env, request);
    }
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
      const settings = await sql<Array<{ language: string }>>`
        SELECT language FROM user_settings WHERE user_id = ${userId} LIMIT 1
      `;
      if (settings && settings[0]) {
        language = settings[0].language || "en";
      }
    } catch (err) {
      reportError(err);
    } finally {
      await sql.end();
      sql = undefined;
    }

    // Sanitize for HTML email
    const sanitizedItemName = sanitizeHtml(itemName);
    const sanitizedThreshold = sanitizeHtml(threshold.toString());
    const sanitizedStock = sanitizeHtml(currentStock.toString());

    // --- 1. SEND EMAIL (BREVO) ---
    if (userEmail) {
      const emailOptions = {
        to: userEmail,
        subject: getTranslation(language, "subject", {
          itemName: sanitizedItemName,
        }),
        htmlContent: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #d32f2f;">${getTranslation(language, "emailTitle")}</h2>
            <p>${getTranslation(language, "emailIntro", { threshold: sanitizedThreshold })}</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>${getTranslation(language, "emailItem")}</strong> ${sanitizedItemName}</p>
              <p style="margin: 5px 0;"><strong>${getTranslation(language, "emailStock")}</strong> ${sanitizedStock}</p>
            </div>
            <p>${getTranslation(language, "emailFooter")}</p>
          </div>
        `,
      };
      await sendEmail(emailOptions, env).catch(reportError);
    }

    // --- 2. BROADCAST PUSH NOTIFICATIONS ---
    await broadcastPush(
      {
        userId,
        title: getTranslation(language, "title"),
        body: getTranslation(language, "body", {
          itemName: sanitizedItemName,
          currentStock: sanitizedStock,
        }),
        url: "/inventory?filter=lowStock",
        tag: `low-stock-${itemName}`,
      },
      env
    ).catch(reportError);

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
