/**
 * Input validation utilities for the Cloudflare Worker
 */

/**
 * Sanitizes HTML by escaping special characters
 */
export function sanitizeHtml(text: string): string {
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

/**
 * Validates email format and length
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validates item name is non-empty and within length limit
 */
export function validateItemName(name: string): boolean {
  return typeof name === "string" && name.length > 0 && name.length <= 255;
}

/**
 * Validates stock is a non-negative number within reasonable range
 */
export function validateStock(stock: number): boolean {
  return typeof stock === "number" && stock >= 0 && stock < 1000000;
}

/**
 * Validates threshold is a non-negative number within reasonable range
 */
export function validateThreshold(threshold: number): boolean {
  return typeof threshold === "number" && threshold >= 0 && threshold < 10000;
}
