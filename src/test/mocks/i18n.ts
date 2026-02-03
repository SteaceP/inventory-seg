import { vi } from "vitest";

/**
 * Centralized i18n mocking utilities
 */

export const createMockTranslation = (customT?: (key: string) => string) => {
  const t = customT || ((key: string) => key);
  return {
    t,
    lang: "en",
  };
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
    useTranslation: () => createMockTranslation(),
  }));
  vi.mock("@/i18n", () => ({
    useTranslation: () => createMockTranslation(),
  }));
};
