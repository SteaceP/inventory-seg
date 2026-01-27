// Add custom matchers from @testing-library/jest-dom
// Examples: toBeInTheDocument(), toHaveTextContent(), etc.
import "@testing-library/jest-dom";
import { vi } from "vitest";

/**
 * Global test setup
 * This file runs before every test file
 */

// Mock window.matchMedia (commonly used by MUI components)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver (used by some components)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

// Mock navigator.onLine
Object.defineProperty(navigator, "onLine", {
  writable: true,
  value: true,
  configurable: true,
});

// Suppress console errors in tests (optional, comment out if you want to see them)
// global.console.error = vi.fn();
