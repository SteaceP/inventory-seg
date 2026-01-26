import { vi } from "vitest";
import type {
  InventoryItem,
  InventoryCategory,
  MasterLocation,
} from "../../types/inventory";

/**
 * Centralized context mocking utilities
 */

// AlertContext
export const createMockAlertContext = (overrides?: {
  showInfo?: ReturnType<typeof vi.fn>;
  showError?: ReturnType<typeof vi.fn>;
  showSuccess?: ReturnType<typeof vi.fn>;
  showWarning?: ReturnType<typeof vi.fn>;
}) => {
  return {
    showInfo: overrides?.showInfo || vi.fn(),
    showError: overrides?.showError || vi.fn(),
    showSuccess: overrides?.showSuccess || vi.fn(),
    showWarning: overrides?.showWarning || vi.fn(),
  };
};

export const mockAlertContext = createMockAlertContext();

// UserContext
export const createMockUserContext = (overrides?: {
  userId?: string | null;
  displayName?: string | null;
  role?: string | null;
  lowStockThreshold?: number;
  darkMode?: boolean;
  compactView?: boolean;
  language?: string;
  notifications?: boolean;
  emailAlerts?: boolean;
  toggleDarkMode?: ReturnType<typeof vi.fn>;
  toggleCompactView?: ReturnType<typeof vi.fn>;
  updateSettings?: ReturnType<typeof vi.fn>;
  refreshUser?: ReturnType<typeof vi.fn>;
}) => {
  return {
    userId: overrides?.userId ?? "test-user-123",
    displayName: overrides?.displayName ?? "Test User",
    role: overrides?.role ?? "admin",
    lowStockThreshold: overrides?.lowStockThreshold ?? 10,
    darkMode: overrides?.darkMode ?? false,
    compactView: overrides?.compactView ?? false,
    language: overrides?.language ?? "en",
    notifications: overrides?.notifications ?? true,
    emailAlerts: overrides?.emailAlerts ?? false,
    avatarUrl: null,
    toggleDarkMode: overrides?.toggleDarkMode ?? vi.fn(),
    toggleCompactView: overrides?.toggleCompactView ?? vi.fn(),
    updateSettings: overrides?.updateSettings ?? vi.fn(),
    refreshUser: overrides?.refreshUser ?? vi.fn(),
  };
};

export const mockUserContext = createMockUserContext();

// InventoryContext
export const createMockInventoryContext = (overrides?: {
  items?: InventoryItem[];
  categories?: InventoryCategory[];
  locations?: MasterLocation[];
  loading?: boolean;
  error?: string | null;
  refreshInventory?: ReturnType<typeof vi.fn>;
  updateCategoryThreshold?: ReturnType<typeof vi.fn>;
  broadcastInventoryChange?: ReturnType<typeof vi.fn>;
  setEditingId?: ReturnType<typeof vi.fn>;
}) => {
  return {
    items: overrides?.items ?? [],
    categories: overrides?.categories ?? [],
    locations: overrides?.locations ?? [],
    loading: overrides?.loading ?? false,
    error: overrides?.error ?? null,
    refreshInventory: overrides?.refreshInventory ?? vi.fn(),
    updateCategoryThreshold: overrides?.updateCategoryThreshold ?? vi.fn(),
    broadcastInventoryChange: overrides?.broadcastInventoryChange ?? vi.fn(),
    setEditingId: overrides?.setEditingId ?? vi.fn(),
    editingUser: null,
  };
};

export const mockInventoryContext = createMockInventoryContext();

// ThemeContext
export const createMockThemeContext = (overrides?: {
  darkMode?: boolean;
  compactView?: boolean;
  toggleDarkMode?: ReturnType<typeof vi.fn>;
  toggleCompactView?: ReturnType<typeof vi.fn>;
}) => {
  return {
    darkMode: overrides?.darkMode ?? false,
    compactView: overrides?.compactView ?? false,
    toggleDarkMode: overrides?.toggleDarkMode ?? vi.fn(),
    toggleCompactView: overrides?.toggleCompactView ?? vi.fn(),
  };
};

export const mockThemeContext = createMockThemeContext();
