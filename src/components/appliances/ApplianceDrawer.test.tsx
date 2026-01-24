import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ApplianceDrawer from "./ApplianceDrawer";
import type { Appliance, Repair } from "../../types/appliances";

// Mock dependencies
vi.mock("../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockAppliance: Appliance = {
  id: "123",
  name: "Test Fridge",
  brand: "CoolBrand",
  model: "CB-2000",
  serial_number: "SN123456",
  purchase_date: "2023-01-01",
  warranty_expiry: "2025-01-01",
  expected_life: 10,
  status: "functional",
  photo_url: "http://example.com/fridge.jpg",
  notes: "Some notes",
  user_id: "user1",
  created_at: "2023-01-01T00:00:00Z",
  location: "Kitchen",
  sku: "SKU123",
  type: "Fridge",
  updated_at: "2023-01-02T00:00:00Z",
};

const mockRepair: Repair = {
  id: "r1",
  appliance_id: "123",
  repair_date: "2024-06-01",
  description: "Fixed door handle",
  cost: 50,
  parts: [
    { name: "Handle", price: 20 },
    { name: "Labor", price: 30 },
  ],
  service_provider: "FixItPro",
  created_at: "2024-06-01T10:00:00Z",
};

describe("ApplianceDrawer", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    appliance: mockAppliance,
    repairs: [mockRepair],
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onAddRepair: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when appliance is null", () => {
    const { container } = render(
      <ApplianceDrawer {...defaultProps} appliance={null} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders appliance details correctly", () => {
    render(<ApplianceDrawer {...defaultProps} />);

    expect(screen.getByText("Test Fridge")).toBeInTheDocument();
    expect(screen.getByText("CoolBrand")).toBeInTheDocument();
    expect(screen.getByText("CB-2000")).toBeInTheDocument();
    expect(screen.getByText("SN123456")).toBeInTheDocument();
  });

  it("renders correct status chip", () => {
    render(<ApplianceDrawer {...defaultProps} />);
    // Translation key is "appliances.status.functional"
    expect(
      screen.getByText("appliances.status.functional")
    ).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<ApplianceDrawer {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    // Close button is expected to be the first one in DOM order (in AppBar)
    fireEvent.click(buttons[0]);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onEdit when edit button is clicked", () => {
    render(<ApplianceDrawer {...defaultProps} />);
    const editButton = screen.getByText("appliances.edit");
    fireEvent.click(editButton);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockAppliance);
  });

  it("calls onDelete when delete button is clicked", () => {
    render(<ApplianceDrawer {...defaultProps} />);
    const deleteButton = screen.getByText("appliances.delete");
    fireEvent.click(deleteButton);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockAppliance.id);
  });

  it("calls onAddRepair when add repair button is clicked", () => {
    render(<ApplianceDrawer {...defaultProps} />);
    const addButton = screen.getByText("appliances.addRepair");
    fireEvent.click(addButton);
    expect(defaultProps.onAddRepair).toHaveBeenCalledWith(mockAppliance);
  });

  it("renders repairs list", () => {
    render(<ApplianceDrawer {...defaultProps} />);
    expect(screen.getByText("Fixed door handle")).toBeInTheDocument();
    expect(screen.getByText("50.00 $")).toBeInTheDocument();
  });

  it("renders no repairs message when repairs list is empty", () => {
    render(<ApplianceDrawer {...defaultProps} repairs={[]} />);
    expect(screen.getByText("appliances.noRepairs")).toBeInTheDocument();
  });
});
