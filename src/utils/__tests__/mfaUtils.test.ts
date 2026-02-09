import QRCode from "qrcode";
import { describe, it, expect, vi } from "vitest";

import { generateQRCode, formatTOTPSecret, isValidTOTPCode } from "../mfaUtils";

// Mock qrcode module
vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn(),
  },
}));

describe("mfaUtils", () => {
  describe("generateQRCode", () => {
    it("should generate a QR code data URL successfully", async () => {
      const mockUri =
        "otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example";
      const mockDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...";

      // Setup mock to return success
      vi.mocked(QRCode.toDataURL).mockResolvedValue(mockDataUrl as never);

      const result = await generateQRCode(mockUri);

      expect(QRCode.toDataURL).toHaveBeenCalledWith(mockUri, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 300,
      });
      expect(result).toBe(mockDataUrl);
    });

    it("should throw an error when QR code generation fails", async () => {
      const mockUri = "invalid-uri";
      const mockError = new Error("Generation failed");

      // Setup mock to throw error
      vi.mocked(QRCode.toDataURL).mockRejectedValue(mockError);

      // Spy on console.error to suppress output during test
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation((): void => {});

      await expect(generateQRCode(mockUri)).rejects.toThrow(
        "Failed to generate QR code"
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error generating QR code:",
        mockError
      );
      consoleSpy.mockRestore();
    });
  });

  describe("formatTOTPSecret", () => {
    it("should format a secret with spaces every 4 characters", () => {
      const secret = "JBSWY3DPEHPK3PXP";
      const expected = "JBSW Y3DP EHPK 3PXP";
      expect(formatTOTPSecret(secret)).toBe(expected);
    });

    it("should handle secrets that are not multiples of 4", () => {
      const secret = "ABCDE";
      const expected = "ABCD E";
      expect(formatTOTPSecret(secret)).toBe(expected);
    });

    it("should return the secret itself if matching fails or secret is empty", () => {
      // Though based on the regex logic `.{1,4}` matches any non-empty string.
      // Let's test empty string.
      expect(formatTOTPSecret("")).toBe("");

      // Test short string
      expect(formatTOTPSecret("ABC")).toBe("ABC");
    });
  });

  describe("isValidTOTPCode", () => {
    it("should return true for a valid 6-digit code", () => {
      expect(isValidTOTPCode("123456")).toBe(true);
      expect(isValidTOTPCode("000000")).toBe(true);
      expect(isValidTOTPCode("999999")).toBe(true);
    });

    it("should return false for code with less than 6 digits", () => {
      expect(isValidTOTPCode("12345")).toBe(false);
    });

    it("should return false for code with more than 6 digits", () => {
      expect(isValidTOTPCode("1234567")).toBe(false);
    });

    it("should return false for code with non-digits", () => {
      expect(isValidTOTPCode("12345a")).toBe(false);
      expect(isValidTOTPCode("12 456")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isValidTOTPCode("")).toBe(false);
    });
  });
});
