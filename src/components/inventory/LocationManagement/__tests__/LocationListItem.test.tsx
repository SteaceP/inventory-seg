import { vi, describe, it, expect, beforeEach } from "vitest";

import { createMockLocation } from "@test/mocks/factories";
import { render, screen, fireEvent } from "@test/test-utils";

import LocationListItem from "../LocationListItem";

describe("LocationListItem", () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn().mockResolvedValue(undefined);
  const mockLocation = createMockLocation({
    id: "1",
    name: "Warehouse",
    parent_id: null,
    description: "Main Warehouse",
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render location details", () => {
    render(
      <LocationListItem
        location={mockLocation}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        depth={0}
      />
    );
    expect(screen.getByText("Warehouse")).toBeInTheDocument();
    expect(screen.getByText("Main Warehouse")).toBeInTheDocument();
  });

  it("should call onEdit when edit button is clicked", () => {
    render(
      <LocationListItem
        location={mockLocation}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        depth={0}
      />
    );
    // Find IconButton by finding the EditIcon inside it or using ARIA labels if available.
    // MUI IconButton usually renders a button.
    const editButton = screen.getAllByRole("button")[0];
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockLocation);
  });

  it("should call onDelete when delete button is clicked", () => {
    render(
      <LocationListItem
        location={mockLocation}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        depth={0}
      />
    );
    const deleteButton = screen.getAllByRole("button")[1];
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith("1");
  });
});
