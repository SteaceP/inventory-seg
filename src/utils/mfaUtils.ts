import QRCode from "qrcode";

/**
 * Generates a QR code data URL from a TOTP URI
 * @param uri - The TOTP URI (e.g., otpauth://totp/...)
 * @returns Data URL for the QR code image
 */
export async function generateQRCode(uri: string): Promise<string> {
  try {
    return await QRCode.toDataURL(uri, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 300,
    });
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Formats a TOTP secret for manual entry display
 * Groups the secret into chunks of 4 characters for easier manual entry
 * @param secret - The base32-encoded TOTP secret
 * @returns Formatted secret string (e.g., "ABCD EFGH IJKL")
 */
export function formatTOTPSecret(secret: string): string {
  return secret.match(/.{1,4}/g)?.join(" ") || secret;
}

/**
 * Validates a TOTP code format (6 digits)
 * @param code - The code to validate
 * @returns True if valid format
 */
export function isValidTOTPCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}
