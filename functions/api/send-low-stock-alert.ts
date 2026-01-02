interface Env {
  BREVO_API_KEY: string;
  BREVO_SENDER_EMAIL: string;
}

interface RequestBody {
  itemName: string;
  currentStock: number;
  threshold: number;
  userEmail: string;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

  try {
    const { itemName, currentStock, threshold, userEmail } = await request.json() as RequestBody;

    const BREVO_API_KEY = env.BREVO_API_KEY;
    const SENDER_EMAIL = env.BREVO_SENDER_EMAIL || 'noreply@coderage.pro';

    if (!BREVO_API_KEY) {
      return new Response(JSON.stringify({ error: 'BREVO_API_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Inventory App', email: SENDER_EMAIL },
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
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
