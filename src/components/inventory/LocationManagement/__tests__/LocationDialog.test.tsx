import { vi, describe, it, expect, beforeEach } from "vitest";

import type { MasterLocation } from "@/types/inventory";

import { createMockLocation } from "@test/mocks/factories";
import { render, screen, fireEvent } from "@test/test-utils";

import LocationDialog from "../LocationDialog";

// Standard top-level mocks
vi.mock("@/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    lang: "en",
  }),
}));

describe("LocationDialog", () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn().mockResolvedValue(undefined);
  const mockLocations: MasterLocation[] = [
    createMockLocation({
      id: "1",
      name: "Warehouse",
      parent_id: null,
      description: "Main",
    }),
  ];

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    editingLocation: null,
    locations: mockLocations,
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render add title when not editing", () => {
    render(<LocationDialog {...defaultProps} />);
    expect(screen.getByText("inventory.locations.add")).toBeInTheDocument();
  });

  it("should render edit title when editing", () => {
    render(
      <LocationDialog {...defaultProps} editingLocation={mockLocations[0]} />
    );
    expect(screen.getByText("inventory.locations.edit")).toBeInTheDocument();
  });

  it("should call onSave with form data when save is clicked", () => {
    render(<LocationDialog {...defaultProps} />);

    fireEvent.change(screen.getByLabelText("inventory.locations.name"), {
      target: { value: "New Location" },
    });

    // Using exact: false to be more resilient to MUI transformations
    const saveButton = screen.getByText("common.save", { exact: false });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith({
      name: "New Location",
      parent_id: null,
      description: "",
    });
  });

  it("should call onClose when cancel is clicked", () => {
    render(<LocationDialog {...defaultProps} />);
    const cancelButton = screen.getByText("common.cancel", { exact: false });
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
