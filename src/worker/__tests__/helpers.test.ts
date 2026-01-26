// @vitest-environment node
import { describe, it, expect } from "vitest";
import { getSecurityHeaders, createResponse } from "../helpers";

describe("worker/helpers", () => {
  describe("getSecurityHeaders", () => {
    it("should return correct security headers", () => {
      const headers = getSecurityHeaders("https://example.com");

      expect(headers["Access-Control-Allow-Origin"]).toBe(
        "https://example.com"
      );
      expect(headers["X-Frame-Options"]).toBe("DENY");
      expect(headers["Content-Security-Policy"]).toContain(
        "default-src 'none'"
      );
    });

    it("should default origin to * if not provided", () => {
      const headers = getSecurityHeaders();
      expect(headers["Access-Control-Allow-Origin"]).toBe("*");
    });
  });

  describe("createResponse", () => {
    const mockEnv = {
      ALLOWED_ORIGIN: "https://allowed.com",
    };

    it("should create a response with string body", () => {
      const request = new Request("https://api.example.com");
      const response = createResponse("hello", 200, mockEnv, request);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/json");
    });

    it("should create a response with object body", async () => {
      const request = new Request("https://api.example.com");
      const data = { foo: "bar" };
      const response = createResponse(data, 201, mockEnv, request);

      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json).toEqual(data);
    });

    it("should set CORS headers for allowed origin", () => {
      const request = new Request("https://api.example.com", {
        headers: { Origin: "https://allowed.com" },
      });
      const response = createResponse({}, 200, mockEnv, request);

      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
        "https://allowed.com"
      );
    });

    it("should set CORS headers for whitelisted origin", () => {
      const request = new Request("https://api.example.com", {
        headers: { Origin: "https://inv.coderage.pro" },
      });
      const response = createResponse({}, 200, mockEnv, request);

      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
        "https://inv.coderage.pro"
      );
    });

    it("should set CORS headers to null for disallowed origin", () => {
      const request = new Request("https://api.example.com", {
        headers: { Origin: "https://evil.com" },
      });
      const response = createResponse({}, 200, mockEnv, request);

      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("null");
    });
  });
});
