import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import StockLocationsPage from "../StockLocations";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  createMockAlertContext,
  createMockTranslation,
  createMockInventoryContext,
  createMockLocation,
} from "@test/mocks";

// Create mock data using factories
const mockLocations = [
  createMockLocation({
    id: "1",
    name: "Warehouse A",
    parent_id: null,
    description: "Main Warehouse",
  }),
  createMockLocation({
    id: "2",
    name: "Shelf 1",
    parent_id: "1",
    description: "Top Shelf",
  }),
  createMockLocation({
    id: "3",
    name: "Store B",
    parent_id: null,
    description: "Retail Store",
  }),
];

// Centralized mocks
const mockHandleError = vi.fn();
const mockAlert = createMockAlertContext();
const mockInventory = createMockInventoryContext({
  locations: mockLocations,
  refreshInventory: vi.fn(),
});
const { t } = createMockTranslation();

vi.mock("../../contexts/InventoryContext", () => ({
  useInventoryContext: () => mockInventory,
}));

vi.mock("../../contexts/AlertContext", () => ({
  useAlert: () => mockAlert,
}));

vi.mock("../../hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
  }),
}));

vi.mock("../../i18n", () => ({
  useTranslation: () => ({ t }),
}));

const mockSupabaseSelect = vi.fn();
const mockSupabaseInsert = vi.fn();
const mockSupabaseUpdate = vi.fn();
const mockSupabaseDelete = vi.fn();
const mockSupabaseEq = vi.fn();

vi.mock("../../supabaseClient", () => ({
  supabase: {
    from: (table: string) => {
      if (table === "inventory_locations") {
        return {
          select: mockSupabaseSelect,
          insert: mockSupabaseInsert,
          update: mockSupabaseUpdate,
          delete: mockSupabaseDelete,
        };
      }
      return {};
    },
  },
}));

// Setup chainable mocks
mockSupabaseSelect.mockReturnValue({
  order: vi.fn(),
});
mockSupabaseInsert.mockReturnValue({
  error: null,
});
mockSupabaseUpdate.mockReturnValue({
  eq: mockSupabaseEq.mockReturnValue({ error: null }),
});
mockSupabaseDelete.mockReturnValue({
  eq: mockSupabaseEq.mockReturnValue({ error: null }),
});

const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe("StockLocationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders location hierarchy correctly", () => {
    renderWithTheme(<StockLocationsPage />);

    expect(
      screen.getByText("inventory.locations.management")
    ).toBeInTheDocument();

    // Check root locations
    expect(screen.getByText("Warehouse A")).toBeInTheDocument();
    expect(screen.getByText("Store B")).toBeInTheDocument();

    // Check child location
    expect(screen.getByText("Shelf 1")).toBeInTheDocument();
  });

  it("opens add dialog when Add button is clicked", () => {
    renderWithTheme(<StockLocationsPage />);

    const addButton = screen.getByText("inventory.locations.add");
    fireEvent.click(addButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getAllByText("inventory.locations.add")[1]
    ).toBeInTheDocument(); // Title in dialog
    expect(
      screen.getByLabelText("inventory.locations.name")
    ).toBeInTheDocument();
  });

  it("adds a new location", async () => {
    renderWithTheme(<StockLocationsPage />);

    // Open Dialog
    const addButton = screen.getByText("inventory.locations.add");
    fireEvent.click(addButton);

    // Fill Form
    const nameInput = screen.getByLabelText("inventory.locations.name");
    fireEvent.change(nameInput, { target: { value: "New Location" } });

    const descInput = screen.getByLabelText("Description");
    fireEvent.change(descInput, { target: { value: "New Desc" } });

    // Save
    const saveButton = screen.getByText("common.save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSupabaseInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          name: "New Location",
          description: "New Desc",
          parent_id: null,
        }),
      ]);
      expect(mockAlert.showSuccess).toHaveBeenCalledWith(
        "inventory.locations.success.add"
      );
      expect(mockInventory.refreshInventory).toHaveBeenCalled();
    });
  });

  it("edits an existing location", async () => {
    renderWithTheme(<StockLocationsPage />);

    // Find edit button for Warehouse A
    // We can use `within`.
    const warehouseText = screen.getByText("Warehouse A");
    const listItem = warehouseText.closest(".MuiListItem-root");
    expect(listItem).toBeInTheDocument();

    if (listItem) {
      const editButton = within(listItem as HTMLElement).getAllByRole(
        "button"
      )[0]; // First button is Edit, second is Delete
      fireEvent.click(editButton);
    }

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Warehouse A")).toBeInTheDocument();

    // Modify
    const nameInput = screen.getByLabelText("inventory.locations.name");
    fireEvent.change(nameInput, { target: { value: "Warehouse A Updated" } });

    const saveButton = screen.getByText("common.save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSupabaseUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Warehouse A Updated" })
      );
      expect(mockSupabaseEq).toHaveBeenCalledWith("id", "1"); // Warehouse A id
      expect(mockAlert.showSuccess).toHaveBeenCalledWith(
        "inventory.locations.success.edit"
      );
    });
  });

  it("deletes a location", async () => {
    // Mock confirm
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    renderWithTheme(<StockLocationsPage />);

    const warehouseText = screen.getByText("Warehouse A");
    const listItem = warehouseText.closest(".MuiListItem-root");

    if (listItem) {
      const deleteButton = within(listItem as HTMLElement).getAllByRole(
        "button"
      )[1]; // Second button is Delete
      fireEvent.click(deleteButton);
    }

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
      expect(mockSupabaseDelete).toHaveBeenCalled();
      expect(mockSupabaseEq).toHaveBeenCalledWith("id", "1");
      expect(mockAlert.showSuccess).toHaveBeenCalledWith(
        "inventory.locations.success.delete"
      );
    });
  });
});
