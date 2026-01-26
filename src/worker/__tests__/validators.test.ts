import { describe, it, expect } from "vitest";
import {
  sanitizeHtml,
  validateEmail,
  validateItemName,
  validateStock,
  validateThreshold,
} from "../validators";

describe("sanitizeHtml", () => {
  it("should escape HTML special characters", () => {
    const input = '<script>alert("XSS")</script>';
    const expected = "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;";
    expect(sanitizeHtml(input)).toBe(expected);
  });

  it("should escape ampersands", () => {
    expect(sanitizeHtml("foo & bar")).toBe("foo &amp; bar");
  });

  it("should escape single quotes", () => {
    expect(sanitizeHtml("it's")).toBe("it&#39;s");
  });

  it("should return empty string for empty input", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("should handle text without special characters", () => {
    const input = "Hello World";
    expect(sanitizeHtml(input)).toBe(input);
  });
});

describe("validateEmail", () => {
  it("should accept valid email addresses", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("test.user@example.co.uk")).toBe(true);
    expect(validateEmail("admin@s-e-g.ca")).toBe(true);
  });

  it("should reject emails without @", () => {
    expect(validateEmail("invalidemail.com")).toBe(false);
  });

  it("should reject emails without domain", () => {
    expect(validateEmail("user@")).toBe(false);
  });

  it("should reject emails without TLD", () => {
    expect(validateEmail("user@domain")).toBe(false);
  });

  it("should reject emails with spaces", () => {
    expect(validateEmail("user name@example.com")).toBe(false);
  });

  it("should reject emails exceeding 254 characters", () => {
    const longEmail = "a".repeat(250) + "@example.com"; // 262 characters
    expect(validateEmail(longEmail)).toBe(false);
  });

  it("should accept email at maximum length (254 chars)", () => {
    const maxEmail = "a".repeat(242) + "@example.com"; // exactly 254 characters
    expect(validateEmail(maxEmail)).toBe(true);
  });
});

describe("validateItemName", () => {
  it("should accept valid item names", () => {
    expect(validateItemName("Laptop")).toBe(true);
    expect(validateItemName("HP ProBook 450 G8")).toBe(true);
  });

  it("should reject empty strings", () => {
    expect(validateItemName("")).toBe(false);
  });

  it("should reject names exceeding 255 characters", () => {
    const longName = "a".repeat(256);
    expect(validateItemName(longName)).toBe(false);
  });

  it("should accept names at maximum length (255 chars)", () => {
    const maxName = "a".repeat(255);
    expect(validateItemName(maxName)).toBe(true);
  });

  it("should reject non-string types", () => {
    expect(validateItemName(123 as unknown as string)).toBe(false);
    expect(validateItemName(null as unknown as string)).toBe(false);
    expect(validateItemName(undefined as unknown as string)).toBe(false);
  });
});

describe("validateStock", () => {
  it("should accept valid stock numbers", () => {
    expect(validateStock(0)).toBe(true);
    expect(validateStock(10)).toBe(true);
    expect(validateStock(999999)).toBe(true);
  });

  it("should reject negative numbers", () => {
    expect(validateStock(-1)).toBe(false);
    expect(validateStock(-100)).toBe(false);
  });

  it("should reject stock at or above 1,000,000", () => {
    expect(validateStock(1000000)).toBe(false);
    expect(validateStock(1000001)).toBe(false);
  });

  it("should accept stock just below limit", () => {
    expect(validateStock(999999)).toBe(true);
  });

  it("should reject non-number types", () => {
    expect(validateStock("100" as unknown as number)).toBe(false);
    expect(validateStock(null as unknown as number)).toBe(false);
    expect(validateStock(undefined as unknown as number)).toBe(false);
  });
});

describe("validateThreshold", () => {
  it("should accept valid thresholds", () => {
    expect(validateThreshold(0)).toBe(true);
    expect(validateThreshold(5)).toBe(true);
    expect(validateThreshold(9999)).toBe(true);
  });

  it("should reject negative numbers", () => {
    expect(validateThreshold(-1)).toBe(false);
  });

  it("should reject threshold at or above 10,000", () => {
    expect(validateThreshold(10000)).toBe(false);
    expect(validateThreshold(10001)).toBe(false);
  });

  it("should accept threshold just below limit", () => {
    expect(validateThreshold(9999)).toBe(true);
  });

  it("should reject non-number types", () => {
    expect(validateThreshold("50" as unknown as number)).toBe(false);
    expect(validateThreshold(null as unknown as number)).toBe(false);
    expect(validateThreshold(undefined as unknown as number)).toBe(false);
  });
});
