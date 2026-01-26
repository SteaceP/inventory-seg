import { vi } from "vitest";

/**
 * Centralized utility function mocking
 */

// Error handler mock
export const createMockErrorHandler = (overrides?: {
  handleError?: ReturnType<typeof vi.fn>;
}) => {
  return {
    handleError: overrides?.handleError ?? vi.fn(),
  };
};

export const mockErrorHandler = createMockErrorHandler();

// Activity logging mock
export const mockLogActivity = vi.fn();

export const setupActivityUtilsMock = () => {
  vi.mock("../../utils/activityUtils", () => ({
    logActivity: mockLogActivity,
    getStockChange: vi.fn(),
    getActivityNarrative: vi.fn(),
  }));
};

// Crypto utilities mock
export const mockValidateImageFile = vi.fn();
export const mockGenerateSecureFileName = vi.fn(() => "secure-file.jpg");
export const mockGetExtensionFromMimeType = vi.fn(() => "jpg");

export const setupCryptoUtilsMock = () => {
  vi.mock("../../utils/crypto", () => ({
    validateImageFile: mockValidateImageFile,
    generateSecureFileName: mockGenerateSecureFileName,
    getExtensionFromMimeType: mockGetExtensionFromMimeType,
  }));
};

// Web Push mock
export const mockSendNotification = vi.fn().mockResolvedValue({});

export const setupWebPushMock = () => {
  vi.mock("web-push", () => ({
    default: {
      sendNotification: mockSendNotification,
      setVapidDetails: vi.fn(),
    },
  }));
};

// Fetch mock helper
export const createMockFetchResponse = <T>(data: T, ok = true) => {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    status: ok ? 200 : 400,
    statusText: ok ? "OK" : "Bad Request",
  } as Response);
};

export const setupFetchMock = (defaultResponse?: unknown) => {
  const mockFetch = vi.fn();
  if (defaultResponse !== undefined) {
    mockFetch.mockResolvedValue(createMockFetchResponse(defaultResponse));
  }
  global.fetch = mockFetch;
  return mockFetch;
};
