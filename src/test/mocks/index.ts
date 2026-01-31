/**
 * Centralized test mocks - barrel export
 * Import all mocks from a single location
 */

// Re-export all mocks from factories
export * from "./factories";

// Re-export contexts
export * from "./contexts";

// Re-export i18n
export * from "./i18n";

// Re-export router (rename createMockLocation to avoid conflict with factories)
export {
  createMockNavigate,
  createMockLocation as createMockRouterLocation,
  createMockParams,
  createMockSearchParams,
  createMockRouterContext,
  setupRouterMock,
} from "./router";

// Re-export all of supabase
export * from "./supabase";

// Re-export all of framer-motion
export * from "./framer-motion";

// Re-export all of storage
export * from "./storage";

// Re-export all of utils
export * from "./utils";
