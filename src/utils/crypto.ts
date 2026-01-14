/**
 * Cryptographic utilities for secure random generation
 */

/**
 * Generate a cryptographically secure random ID
 * @param prefix Optional prefix to add before the ID
 * @returns A secure random ID string
 */
export const generateSecureId = (prefix?: string): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const id = Array.from(bytes)
    .map((b) => b.toString(36))
    .join("")
    .toUpperCase();

  return prefix ? `${prefix}-${id}` : id;
};

/**
 * Generate a cryptographically secure filename
 * @param extension File extension (without dot)
 * @returns A secure random filename
 */
export const generateSecureFileName = (extension: string): string => {
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  const randomHex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${randomHex}.${extension}`;
};

/**
 * Validate image file type and size
 * @param file The file to validate
 * @throws Error if validation fails
 */
export const validateImageFile = (file: File): void => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "File type not allowed. Only JPEG, PNG, WebP, and GIF are supported."
    );
  }

  if (file.size > maxSize) {
    throw new Error("File too large. Maximum size is 5MB.");
  }
};

/**
 * Get file extension from MIME type
 * @param mimeType The MIME type
 * @returns The file extension
 */
export const getExtensionFromMimeType = (mimeType: string): string => {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return mimeToExt[mimeType] || "jpg";
};

/**
 * Safely extract device info from navigator
 * @returns Device information string
 */
export const getDeviceInfo = (): string => {
  try {
    const ua = navigator.userAgent;
    const platform = navigator.platform || "Unknown";

    // Safely extract device info from user agent
    const match = ua.match(/\(([^)]+)\)/);
    const device = match ? match[1] : "Unknown Device";

    return `${platform} - ${device}`;
  } catch {
    return "Unknown Device";
  }
};
