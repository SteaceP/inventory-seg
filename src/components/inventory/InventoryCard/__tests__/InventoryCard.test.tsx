/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, vi } from "vitest";

import type {
  InventoryContextType,
  InventoryCategory,
} from "@/types/inventory";
import type { UserContextType } from "@/types/user";

import * as InventoryContextModule from "@contexts/InventoryContext";
import * as UserContextModule from "@contexts/UserContext";
import {
  createMockInventoryItem,
  createMockInventoryContext,
  createMockUserContext,
} from "@test/mocks";
import { render, screen } from "@test/test-utils";

import InventoryCard from "../InventoryCard";

import type { Session } from "@supabase/supabase-js";

const { mockPresence, UserContextMock } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  return {
    mockPresence: {
      "user-2": {
        userId: "user-2",
        displayName: "Jane Smith",
        editingId: "1",
      },
    },
    UserContextMock: React.createContext({
      lowStockThreshold: 5,
      language: "fr",
    }),
  };
});

const mockItem = createMockInventoryItem({
  id: "1",
  name: "Test Item",
  sku: "SKU123",
  category: "Tools",
  stock: 10,
});

// Mock i18n
vi.mock("@/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock contexts
vi.mock("@contexts/InventoryContext", () => ({
  useInventoryContext: vi.fn(),
}));

vi.mock("@contexts/UserContext", () => ({
  UserContext: UserContextMock,
  useUserContext: vi
    .fn()
    .mockReturnValue({ lowStockThreshold: 5, language: "fr" }),
}));

describe("InventoryCard Integration", () => {
  const onToggle = vi.fn();
  const onEdit = vi.fn();

  it("should render item basic information", () => {
    vi.mocked(InventoryContextModule.useInventoryContext).mockReturnValue(
      createMockInventoryContext({
        presence: {},
      }) as unknown as InventoryContextType
    );

    render(
      <InventoryCard
        item={mockItem}
        isSelected={false}
        onToggle={onToggle}
        onEdit={onEdit}
      />
    );

    expect(screen.getByText("Test Item")).toBeInTheDocument();
    expect(screen.getByText("SKU123")).toBeInTheDocument();
    // Use getAllByText since "Tools" appears both in chip and caption
    const toolsElements = screen.getAllByText("Tools");
    expect(toolsElements.length).toBeGreaterThan(0);
  });

  it("should calculate effective threshold: Item > Category > Global", () => {
    const itemWithThreshold = createMockInventoryItem({
      ...mockItem,
      low_stock_threshold: 8,
      stock: 5,
    });

    vi.mocked(UserContextModule.useUserContext).mockReturnValue(
      createMockUserContext({
        lowStockThreshold: 2,
      }) as unknown as UserContextType & { session: Session | null }
    );

    vi.mocked(InventoryContextModule.useInventoryContext).mockReturnValue(
      createMockInventoryContext({
        categories: [
          {
            name: "Tools",
            low_stock_threshold: 15,
            created_at: null,
            updated_at: null,
          } as unknown as InventoryCategory,
        ],
        presence: {},
      }) as unknown as InventoryContextType
    );

    render(
      <InventoryCard
        item={itemWithThreshold}
        isSelected={false}
        onToggle={onToggle}
        onEdit={onEdit}
      />
    );

    // Should indicate low stock based on item threshold (8) even though global (2) is lower
    // The actual rendered text is "inventory.stats.lowStock" in the chip
    expect(screen.getByText("inventory.stats.lowStock")).toBeInTheDocument();
  });

  it("should pass presence data to sub-components", () => {
    vi.mocked(InventoryContextModule.useInventoryContext).mockReturnValue(
      createMockInventoryContext({
        presence: mockPresence,
      }) as unknown as InventoryContextType
    );

    render(
      <InventoryCard
        item={mockItem}
        isSelected={false}
        onToggle={onToggle}
        onEdit={onEdit}
      />
    );

    // Presence overlay should be triggered
    expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
  });
});
