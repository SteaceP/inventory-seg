import { describe, it, expect } from "vitest";
import {
  generateSecureId,
  generateSecureFileName,
  validateImageFile,
  getExtensionFromMimeType,
  getDeviceInfo,
} from "./crypto";

describe("crypto utilities", () => {
  describe("generateSecureId", () => {
    it("should generate an ID without prefix", () => {
      const id = generateSecureId();
      expect(id).toBeDefined();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });

    it("should generate an ID with prefix", () => {
      const id = generateSecureId("user");
      expect(id).toContain("user-");
      expect(id.startsWith("user-")).toBe(true);
    });

    it("should generate different IDs on consecutive calls", () => {
      const id1 = generateSecureId();
      const id2 = generateSecureId();
      expect(id1).not.toBe(id2);
    });

    it("should generate uppercase IDs", () => {
      const id = generateSecureId();
      const idPart = id.includes("-") ? id.split("-")[1] : id;
      expect(idPart).toBe(idPart.toUpperCase());
    });

    it("should generate IDs using base36 encoding", () => {
      const id = generateSecureId();
      const idPart = id.includes("-") ? id.split("-")[1] : id;
      expect(idPart).toMatch(/^[0-9A-Z]+$/);
    });
  });

  describe("generateSecureFileName", () => {
    it("should generate filename with extension", () => {
      const filename = generateSecureFileName("png");
      expect(filename).toMatch(/^[0-9a-f]+\.png$/);
    });

    it("should generate filename with different extensions", () => {
      const jpgFile = generateSecureFileName("jpg");
      const webpFile = generateSecureFileName("webp");

      expect(jpgFile).toMatch(/\.jpg$/);
      expect(webpFile).toMatch(/\.webp$/);
    });

    it("should generate hex string for filename", () => {
      const filename = generateSecureFileName("png");
      const nameWithoutExt = filename.split(".")[0];

      expect(nameWithoutExt).toMatch(/^[0-9a-f]+$/);
      expect(nameWithoutExt.length).toBe(32);
    });

    it("should generate different filenames on consecutive calls", () => {
      const file1 = generateSecureFileName("png");
      const file2 = generateSecureFileName("png");
      expect(file1).not.toBe(file2);
    });
  });

  describe("validateImageFile", () => {
    it("should accept valid JPEG file", () => {
      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      expect(() => validateImageFile(file)).not.toThrow();
    });

    it("should accept valid PNG file", () => {
      const file = new File(["content"], "test.png", { type: "image/png" });
      expect(() => validateImageFile(file)).not.toThrow();
    });

    it("should accept valid WebP file", () => {
      const file = new File(["content"], "test.webp", { type: "image/webp" });
      expect(() => validateImageFile(file)).not.toThrow();
    });

    it("should accept valid GIF file", () => {
      const file = new File(["content"], "test.gif", { type: "image/gif" });
      expect(() => validateImageFile(file)).not.toThrow();
    });

    it("should reject invalid file type", () => {
      const file = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });
      expect(() => validateImageFile(file)).toThrow(
        "File type not allowed. Only JPEG, PNG, WebP, and GIF are supported."
      );
    });

    it("should reject file that is too large", () => {
      const largeContent = new Array(6 * 1024 * 1024).fill("a").join("");
      const file = new File([largeContent], "test.jpg", {
        type: "image/jpeg",
      });

      expect(() => validateImageFile(file)).toThrow(
        "File too large. Maximum size is 5MB."
      );
    });

    it("should accept file at exactly 5MB", () => {
      const content = new Array(5 * 1024 * 1024).fill("a").join("");
      const file = new File([content], "test.jpg", {
        type: "image/jpeg",
      });

      expect(() => validateImageFile(file)).not.toThrow();
    });

    it("should reject SVG files", () => {
      const file = new File(["<svg></svg>"], "test.svg", {
        type: "image/svg+xml",
      });
      expect(() => validateImageFile(file)).toThrow();
    });
  });

  describe("getExtensionFromMimeType", () => {
    it("should return jpg for image/jpeg", () => {
      expect(getExtensionFromMimeType("image/jpeg")).toBe("jpg");
    });

    it("should return png for image/png", () => {
      expect(getExtensionFromMimeType("image/png")).toBe("png");
    });

    it("should return webp for image/webp", () => {
      expect(getExtensionFromMimeType("image/webp")).toBe("webp");
    });

    it("should return gif for image/gif", () => {
      expect(getExtensionFromMimeType("image/gif")).toBe("gif");
    });

    it("should return jpg as default for unknown MIME type", () => {
      expect(getExtensionFromMimeType("image/unknown")).toBe("jpg");
      expect(getExtensionFromMimeType("application/pdf")).toBe("jpg");
      expect(getExtensionFromMimeType("")).toBe("jpg");
    });
  });

  describe("getDeviceInfo", () => {
    it("should return device info string", () => {
      const info = getDeviceInfo();
      expect(info).toBeDefined();
      expect(typeof info).toBe("string");
      expect(info.length).toBeGreaterThan(0);
    });

    it("should include separator in output", () => {
      const info = getDeviceInfo();
      expect(info).toContain("-");
    });

    it("should not throw errors", () => {
      expect(() => getDeviceInfo()).not.toThrow();
    });
  });
});
