import { vi, describe, it, expect } from "vitest";
import { render, screen } from "@test/test-utils";
import LocationList from "../LocationList";
import { createMockLocation } from "@test/mocks/factories";

describe("LocationList", () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn().mockResolvedValue(undefined);
  const mockLocations = [
    createMockLocation({
      id: "1",
      name: "Warehouse",
      parent_id: null,
      description: "Main",
    }),
    createMockLocation({
      id: "2",
      name: "Shelf 1",
      parent_id: "1",
      description: "In Warehouse",
    }),
  ];

  it("should render list of locations in hierarchy", () => {
    render(
      <LocationList
        locations={mockLocations}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByText("Warehouse")).toBeInTheDocument();
    expect(screen.getByText("Shelf 1")).toBeInTheDocument();
  });

  it("should filter children by parent_id correctly", () => {
    // This is implicitly tested by the buildHierarchy logic which uses filter
    const { rerender } = render(
      <LocationList
        locations={mockLocations}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);

    // Filtered to only show root
    rerender(
      <LocationList
        locations={[mockLocations[0]]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.queryByText("Shelf 1")).not.toBeInTheDocument();
  });
});
