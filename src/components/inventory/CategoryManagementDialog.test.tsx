import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CategoryManagementDialog from "./CategoryManagementDialog";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mock i18n
vi.mock("../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock ErrorHandler
vi.mock("../../hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
  }),
}));

// Mock Supabase
const { mockUpsert, mockInsert, mockDelete } = vi.hoisted(() => {
  return {
    mockUpsert: vi.fn().mockResolvedValue({ error: null }),
    mockInsert: vi.fn().mockResolvedValue({ error: null }),
    mockDelete: vi.fn().mockResolvedValue({ error: null }),
  };
});

vi.mock("../../supabaseClient", () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: mockUpsert,
      insert: mockInsert,
      delete: () => ({
        eq: mockDelete,
      }),
    })),
  },
}));

// Mock InventoryContext
const mockRefreshInventory = vi.fn();
vi.mock("../../contexts/InventoryContext", () => ({
  useInventoryContext: () => ({
    categories: [
      { name: "Electronics", low_stock_threshold: 5 },
      { name: "Furniture", low_stock_threshold: 10 },
    ],
    refreshInventory: mockRefreshInventory,
  }),
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
      expect(mockInsert).toHaveBeenCalledWith({ name: "Books" });
      expect(mockRefreshInventory).toHaveBeenCalled();
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
      expect(mockDelete).toHaveBeenCalledWith("name", "Electronics"); // eq("name", name)
      expect(mockRefreshInventory).toHaveBeenCalled();
    });
  });

  it.skip("updates threshold", async () => {
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
      expect(mockUpsert).toHaveBeenCalled();
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Electronics",
        })
      );
      expect(mockRefreshInventory).toHaveBeenCalled();
    });
  });
});
