import webpush from "web-push";

interface Env {
  BREVO_API_KEY: string;
  BREVO_SENDER_EMAIL: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

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
              subject: `Alerte Stock Faible: ${itemName}`,
              htmlContent: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                  <h2 style="color: #d32f2f;">Alerte Stock Faible</h2>
                  <p>L'article suivant est tombé en dessous de votre seuil de <strong>${threshold}</strong> :</p>
                  <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Article :</strong> ${itemName}</p>
                    <p style="margin: 5px 0;"><strong>Stock Actuel :</strong> ${currentStock}</p>
                  </div>
                  <p>Veuillez vous connecter à votre tableau de bord d'inventaire pour vous réapprovisionner.</p>
                </div>
              `,
            }),
          });
        }

        // --- 2. BROADCAST PUSH NOTIFICATIONS ---
        if (userId && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
          // Fetch subscriptions for this user from Supabase
          const subResponse = await fetch(
            `${env.SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${userId}`,
            {
              headers: {
                apikey: env.SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
              },
            }
          );

          if (subResponse.ok) {
            const subscriptions = await subResponse.json() as PushSubscriptionRow[];
            
            if (subscriptions.length > 0 && env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
              webpush.setVapidDetails(
                "mailto:admin@coderage.pro",
                env.VAPID_PUBLIC_KEY,
                env.VAPID_PRIVATE_KEY
              );

              const payload = JSON.stringify({
                title: "Alerte Stock Faible",
                body: `L'article "${itemName}" est à ${currentStock} unités.`,
                icon: "/icon.svg",
                data: { url: "/inventory?filter=lowStock" },
                tag: `low-stock-${itemName}`,
                requireInteraction: true
              });

              // Send to all devices
              await Promise.allSettled(
                subscriptions.map(sub => 
                  webpush.sendNotification(sub.subscription, payload)
                    .catch(error => {
                      console.error("Push Error:", error);
                      // If the subscription is no longer valid, we should ideally delete it
                      if (error.statusCode === 410 || error.statusCode === 404) {
                        fetch(
                          `${env.SUPABASE_URL}/rest/v1/push_subscriptions?id=eq.${sub.id}`,
                          {
                            method: "DELETE",
                            headers: {
                              apikey: env.SUPABASE_SERVICE_ROLE_KEY,
                              Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
                            },
                          }
                        ).catch(console.error);
                      }
                    })
                )
              );
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
    return env.ASSETS.fetch(request);
  },
};
