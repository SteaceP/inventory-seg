import webpush from "web-push";

interface Env {
  BREVO_API_KEY: string;
  BREVO_SENDER_EMAIL: string;
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  ASSETS: { fetch: typeof fetch };
}

interface RequestBody {
  itemName: string;
  currentStock: number;
  threshold: number;
  userEmail: string;
  userId: string;
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface PushSubscriptionRow {
  id: string;
  user_id: string;
  subscription: PushSubscription;
  device_info: string;
  created_at: string;
}

// Input validation helper functions
function sanitizeHtml(text: string): string {
  return text.replace(/[<>&'"]/g, (c) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[c] || c;
  });
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

function validateItemName(name: string): boolean {
  return typeof name === "string" && name.length > 0 && name.length <= 255;
}

function validateStock(stock: number): boolean {
  return typeof stock === "number" && stock >= 0 && stock < 1000000;
}

function validateThreshold(threshold: number): boolean {
  return typeof threshold === "number" && threshold >= 0 && threshold < 10000;
}

interface TestPushBody {
  userId: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle Test Push
    if (url.pathname === "/api/send-test-push" && request.method === "POST") {
      try {
        const { userId } = (await request.json()) as TestPushBody;

        if (userId && env.SUPABASE_URL && env.SUPABASE_SECRET_KEY) {
          const subResponse = await fetch(
            `${env.SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${userId}`,
            {
              headers: {
                apikey: env.SUPABASE_SECRET_KEY,
                Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
              },
            }
          );

          if (subResponse.ok) {
            const subscriptions =
              (await subResponse.json()) as PushSubscriptionRow[];

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
                title: "Test de Notification",
                body: "Ceci est une notification de test envoyée depuis le serveur !",
                icon: "/icon.svg",
                data: { url: "/settings" },
                tag: "test-notification",
                requireInteraction: true,
              });

              await Promise.allSettled(
                subscriptions.map((sub) =>
                  webpush
                    .sendNotification(sub.subscription, payload, options)
                    .catch(() => {})
                )
              );
              return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" },
              });
            }
          }
        }
        return new Response(
          JSON.stringify({ error: "No subscriptions found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch (err) {
        return new Response(JSON.stringify({ error: (err as Error).message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Handle API routes
    if (
      url.pathname === "/api/send-low-stock-alert" &&
      request.method === "POST"
    ) {
      try {
        let body: RequestBody;
        try {
          body = (await request.json()) as RequestBody;
        } catch {
          return new Response(
            JSON.stringify({ error: "Invalid or missing JSON body" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const { itemName, currentStock, threshold, userEmail, userId } = body;

        // Validate all inputs
        if (!validateItemName(itemName)) {
          return new Response(JSON.stringify({ error: "Invalid item name" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (!validateStock(currentStock)) {
          return new Response(
            JSON.stringify({ error: "Invalid stock value" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        if (!validateThreshold(threshold)) {
          return new Response(
            JSON.stringify({ error: "Invalid threshold value" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        if (userEmail && !validateEmail(userEmail)) {
          return new Response(
            JSON.stringify({ error: "Invalid email address" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        if (!userId || typeof userId !== "string" || userId.length === 0) {
          return new Response(JSON.stringify({ error: "Invalid user ID" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Sanitize for HTML email
        const sanitizedItemName = sanitizeHtml(itemName);
        const sanitizedThreshold = sanitizeHtml(threshold.toString());
        const sanitizedStock = sanitizeHtml(currentStock.toString());

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
              subject: `Alerte Stock Faible: ${sanitizedItemName}`,
              htmlContent: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                  <h2 style="color: #d32f2f;">Alerte Stock Faible</h2>
                  <p>L'article suivant est tombé en dessous de votre seuil de <strong>${sanitizedThreshold}</strong> :</p>
                  <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Article :</strong> ${sanitizedItemName}</p>
                    <p style="margin: 5px 0;"><strong>Stock Actuel :</strong> ${sanitizedStock}</p>
                  </div>
                  <p>Veuillez vous connecter à votre tableau de bord d'inventaire pour vous réapprovisionner.</p>
                </div>
              `,
            }),
          });
        }

        // --- 2. BROADCAST PUSH NOTIFICATIONS ---
        if (userId && env.SUPABASE_URL && env.SUPABASE_SECRET_KEY) {
          // Fetch subscriptions for this user from Supabase
          const subResponse = await fetch(
            `${env.SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${userId}`,
            {
              headers: {
                apikey: env.SUPABASE_SECRET_KEY,
                Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
              },
            }
          );

          if (subResponse.ok) {
            const subscriptions =
              (await subResponse.json()) as PushSubscriptionRow[];

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
                  title: "Alerte Stock Faible",
                  body: `L'article "${sanitizedItemName}" est à ${sanitizedStock} unités.`,
                  icon: "/icon.svg",
                  data: { url: "/inventory?filter=lowStock" },
                  tag: `low-stock-${itemName}`,
                  requireInteraction: true,
                });

                // Send to all devices
                await Promise.allSettled(
                  subscriptions.map((sub) =>
                    webpush
                      .sendNotification(sub.subscription, payload, options)
                      .catch((error: unknown) => {
                        // If the subscription is no longer valid, we should ideally delete it
                        const status = (error as { statusCode?: number })
                          ?.statusCode;
                        if (status === 410 || status === 404) {
                          void fetch(
                            `${env.SUPABASE_URL}/rest/v1/push_subscriptions?id=eq.${sub.id}`,
                            {
                              method: "DELETE",
                              headers: {
                                apikey: env.SUPABASE_SECRET_KEY,
                                Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
                              },
                            }
                          ).catch(() => {});
                        }
                      })
                  )
                );
              } else {
                console.error("VAPID keys missing in env!");
              }
            }
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Worker Error:", error);
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return new Response(
          JSON.stringify({
            error: message,
            timestamp: new Date().toISOString(),
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Default: fall back to static assets
    const response = await env.ASSETS.fetch(request);

    // If the asset is not found (404) and it's a navigation request, serve index.html
    if (
      (response.status === 404 || response.status === 403) &&
      request.method === "GET" &&
      request.headers.get("accept")?.includes("text/html")
    ) {
      const indexRequest = new Request(url.origin + "/index.html", request);
      return env.ASSETS.fetch(indexRequest);
    }

    return response;
  },
};
