import type { Env } from "../types";
import { logInfo } from "../errorReporting";

export interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
}

export async function sendEmail(
  options: EmailOptions,
  env: Env
): Promise<void> {
  if (!env.BREVO_API_KEY) {
    logInfo("BREVO_API_KEY is missing, skipping email.");
    return;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
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
      to: [{ email: options.to }],
      subject: options.subject,
      htmlContent: options.htmlContent,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send email: ${response.status} ${errorText}`);
  }
}
