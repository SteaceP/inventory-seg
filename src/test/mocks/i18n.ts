import { vi } from "vitest";

/**
 * Centralized i18n mocking utilities
 */

// Create a stable mock instance at module level to prevent re-renders
const stableMockInstance = () => {
  const t = (key: string) => key;
  return {
    t,
    lang: "en" as const,
  };
};

// Single stable instance
const mockInstance = stableMockInstance();

export const createMockTranslation = (customT?: (key: string) => string) => {
  if (customT) {
    return {
      t: customT,
      lang: "en" as const,
    };
  }
  // Return the stable instance
  return mockInstance;
};

export const mockI18n = {
  getTranslation: () => createMockTranslation(),
};

/**
 * Pre-configured vi.mock for i18n module
 * Use this in test files that need i18n mocking
 */
export const setupI18nMock = () => {
  vi.mock("@i18n", () => ({
    useTranslation: () => mockInstance,
  }));
  vi.mock("@/i18n", () => ({
    useTranslation: () => mockInstance,
  }));
};
