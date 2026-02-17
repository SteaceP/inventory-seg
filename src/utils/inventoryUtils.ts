import type { BarcodeProps } from "react-barcode";

/**
 * Determines the appropriate barcode format based on the SKU string.
 */
export const getBarcodeFormat = (sku: string): BarcodeProps["format"] => {
  const cleanSku = (sku || "").trim();
  if (/^\d{12}$/.test(cleanSku)) return "UPC" as const;
  if (/^\d{13}$/.test(cleanSku)) return "EAN13" as const;
  if (/^\d{8}$/.test(cleanSku)) return "EAN8" as const;
  return "CODE128" as const;
};

/**
 * Calculates the effective low stock threshold based on item, category, and global settings.
 * Precedence: Item-level > Category-level > Global threshold
 */
export const calculateEffectiveThreshold = (
  itemThreshold: number | null | undefined,
  categoryThreshold: number | null | undefined,
  globalThreshold: number
): number => {
  return itemThreshold ?? categoryThreshold ?? globalThreshold;
};
