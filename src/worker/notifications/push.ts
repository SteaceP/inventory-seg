import postgres from "postgres";
import webpush from "web-push";

import { reportError } from "../errorReporting";

import type { Env, PushSubscriptionRow, PushOptions } from "../types";

export async function broadcastPush(
  options: PushOptions,
  env: Env
): Promise<void> {
  if (!env.HYPERDRIVE) {
    const error = new Error(
      "Database connection (HYPERDRIVE) is not configured"
    );
    reportError(error);
    throw error;
  }

  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    const error = new Error(
      "VAPID keys are not configured for push notifications"
    );
    reportError(error);
    throw error;
  }

  const sql = postgres(env.HYPERDRIVE.connectionString);
  try {
    const subscriptions = await sql<PushSubscriptionRow[]>`
      SELECT * FROM push_subscriptions WHERE user_id = ${options.userId}
    `;

    if (subscriptions.length === 0) {
      throw new Error("No push subscriptions found for this user");
    }

    const pushOptions = {
      vapidDetails: {
        subject: `mailto:${env.ADMIN_EMAIL}`,
        publicKey: env.VAPID_PUBLIC_KEY,
        privateKey: env.VAPID_PRIVATE_KEY,
      },
    };

    const payload = JSON.stringify({
      title: options.title,
      body: options.body,
      icon: "/icons/icon.svg",
      data: { url: options.url },
      tag: options.tag,
      requireInteraction: options.requireInteraction ?? true,
    });

    await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush
          .sendNotification(sub.subscription, payload, pushOptions)
          .catch((error: unknown) => {
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
  } finally {
    await sql.end();
  }
}
