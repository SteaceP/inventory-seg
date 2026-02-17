/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from "react";

import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

import { mockSupabaseClient as mockClient } from "@test/mocks/supabase";
import { validateImageFile } from "@utils/crypto";

import { useInventoryImage } from "../useInventoryImage";

// Setup i18n mock
vi.mock("@/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    lang: "en",
  }),

  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock supabaseClient
vi.mock("@/supabaseClient", () => ({
  supabase: mockClient.client,
}));

// Mock contexts
const mockAlert = { showError: vi.fn(), showSuccess: vi.fn() };
vi.mock("@contexts/AlertContext", () => ({ useAlert: () => mockAlert }));

// Mock crypto
vi.mock("@utils/crypto", () => ({
  validateImageFile: vi.fn(),
  generateSecureFileName: vi.fn((ext: string) => `mock-file.${ext}`),
  getExtensionFromMimeType: vi.fn(() => "png"),
}));

describe("useInventoryImage", () => {
  const setFormData = vi.fn();
  const mockFile = new File(["test"], "test.png", { type: "image/png" });

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    // Setup valid session for all tests
    mockClient.helpers.setAuthSession({ access_token: "valid-token" });
  });

  it("should handle successful image upload", async () => {
    // Mock successful fetch response
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: "http://example.com/mock-file.png" }),
    } as Response);

    const { result } = renderHook(() => useInventoryImage(setFormData));

    await act(async () => {
      const event = {
        target: { files: [mockFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      await result.current.handleImageUpload(event);
    });

    // Check if fetch was called with correct arguments
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/storage/upload"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer valid-token",
        }),
        body: expect.any(FormData),
      })
    );

    // Handle functional update
    expect(setFormData).toHaveBeenCalledWith(expect.any(Function));
    const updateFn = vi.mocked(setFormData).mock.calls[0][0] as (
      prev: Record<string, unknown>
    ) => Record<string, unknown>;
    const newState = updateFn({});
    expect(newState.image_url).toBe("http://example.com/mock-file.png");

    expect(result.current.uploading).toBe(false);
  });

  it("should handle upload error", async () => {
    // Mock failed fetch response
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Upload failed" }),
    } as Response);

    const { result } = renderHook(() => useInventoryImage(setFormData));

    await act(async () => {
      const event = {
        target: { files: [mockFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      await result.current.handleImageUpload(event);
    });

    expect(mockAlert.showError).toHaveBeenCalledWith(
      expect.stringContaining("Upload failed")
    );
    expect(result.current.uploading).toBe(false);
  });

  it("should show error for invalid file", async () => {
    vi.mocked(validateImageFile).mockImplementation(() => {
      throw new Error("Invalid file");
    });

    const { result } = renderHook(() => useInventoryImage(setFormData));

    await act(async () => {
      const event = {
        target: { files: [mockFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      await result.current.handleImageUpload(event);
    });

    expect(mockAlert.showError).toHaveBeenCalledWith(
      expect.stringContaining("Invalid file")
    );
  });
});
