import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { ThemeProvider, createTheme } from "@mui/material/styles";

import {
  createMockTranslation,
  createMockInventoryContext,
  createMockCategory,
  mockSupabaseClient,
} from "@test/mocks";

import CategoryManagementDialog from "../CategoryManagementDialog";

// Mock i18n
const { t } = createMockTranslation();
vi.mock("@i18n", () => ({
  useTranslation: () => ({ t }),
}));

// Mock ErrorHandler
vi.mock("@hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
  }),
}));

// Supabase is mocked globally

// Mock InventoryContext using centralized utilities
const mockInventory = createMockInventoryContext({
  categories: [
    createMockCategory({ name: "Electronics", low_stock_threshold: 5 }),
    createMockCategory({ name: "Furniture", low_stock_threshold: 10 }),
  ],
});

vi.mock("@contexts/InventoryContext", () => ({
  useInventoryContext: () => mockInventory,
}));

const theme = createTheme();
const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("CategoryManagementDialog", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders existing categories", () => {
    renderWithTheme(<CategoryManagementDialog {...defaultProps} />);
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Furniture")).toBeInTheDocument();
  });

  it("adds a new category", async () => {
    renderWithTheme(<CategoryManagementDialog {...defaultProps} />);

    const input = screen.getByLabelText("inventory.categories.newName");
    fireEvent.change(input, { target: { value: "Books" } });

    const addButton = screen.getByText("common.add");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockSupabaseClient.mocks.insert).toHaveBeenCalledWith({
        name: "Books",
      });
      expect(mockInventory.refreshInventory).toHaveBeenCalled();
    });
  });

  it("deletes a category", async () => {
    renderWithTheme(<CategoryManagementDialog {...defaultProps} />);

    // Find delete buttons. There are 2 categories.
    const rows = screen.getAllByRole("listitem");
    const electronicsRow = rows[0];
    const deleteBtn = electronicsRow.querySelector("button");
    if (!deleteBtn) throw new Error("Delete button not found");

    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockSupabaseClient.mocks.eq).toHaveBeenCalledWith(
        "name",
        "Electronics"
      ); // eq("name", name)
      expect(mockInventory.refreshInventory).toHaveBeenCalled();
    });
  });

  it("updates threshold", async () => {
    renderWithTheme(<CategoryManagementDialog {...defaultProps} />);

    // Use more specific query or wait for it
    await waitFor(() => {
      expect(screen.getByDisplayValue("5")).toBeInTheDocument();
    });

    const input = screen.getByDisplayValue("5");

    fireEvent.change(input, { target: { value: "8" } });

    // Wait for the input to reflect changes (ensure re-render happened so onBlur uses new closure)
    await screen.findByDisplayValue("8");

    fireEvent.blur(input);

    await waitFor(() => {
      expect(mockSupabaseClient.mocks.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Electronics",
          low_stock_threshold: 8,
        }),
        expect.objectContaining({
          onConflict: "name",
        })
      );
      expect(mockInventory.refreshInventory).toHaveBeenCalled();
    });
  });
});
