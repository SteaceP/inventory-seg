interface Env {
  BREVO_API_KEY: string;
  BREVO_SENDER_EMAIL: string;
  ASSETS: { fetch: typeof fetch };
}

interface RequestBody {
  itemName: string;
  currentStock: number;
  threshold: number;
  userEmail: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle API routes
    if (url.pathname === '/api/send-low-stock-alert' && request.method === 'POST') {
      try {
        let body: RequestBody;
        try {
          body = await request.json() as RequestBody;
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid or missing JSON body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const { itemName, currentStock, threshold, userEmail } = body;

        if (!env.BREVO_API_KEY) {
          console.error("BREVO_API_KEY is missing from environment variables");
          return new Response(JSON.stringify({ error: 'BREVO_API_KEY not configured on server' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        if (!userEmail || !itemName) {
          return new Response(JSON.stringify({ error: 'Missing required fields (itemName or userEmail)' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': env.BREVO_API_KEY,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'Inventory App', email: env.BREVO_SENDER_EMAIL || 'noreply@coderage.pro' },
            to: [{ email: userEmail }],
            subject: `Low Stock Alert: ${itemName}`,
            htmlContent: `
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #d32f2f;">Low Stock Alert</h2>
                <p>The following item has fallen below your threshold of <strong>${threshold}</strong>:</p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Item:</strong> ${itemName}</p>
                  <p style="margin: 5px 0;"><strong>Current Stock:</strong> ${currentStock}</p>
                </div>
                <p>Please log in to your inventory dashboard to restock.</p>
              </div>
            `,
          }),
        });

        const result = await response.json() as { message?: string };

        if (!response.ok) {
          throw new Error(result.message || 'Failed to send email');
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error("Worker Error:", error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return new Response(JSON.stringify({ 
          error: message,
          timestamp: new Date().toISOString()
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Default: fall back to static assets
    return env.ASSETS.fetch(request);
  },
};
