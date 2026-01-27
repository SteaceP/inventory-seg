import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ApplianceHistoryDialog from "../ApplianceHistoryDialog/ApplianceHistoryDialog";
import type { Appliance, Repair } from "@/types/appliances";

// Mock translation
vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockAppliance: Appliance = {
  id: "1",
  name: "Test Fridge",
  brand: "Samsung",
  model: "RF28",
  serial_number: "12345",
  purchase_date: "2023-01-01",
  warranty_expiry: "2025-01-01",
  expected_life: 10,
  status: "functional",
  photo_url: "http://example.com/photo.jpg",
  notes: "Test notes",
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
  location: null,
  sku: null,
  type: null,
  user_id: "user1",
};

const mockRepairs: Repair[] = [
  {
    id: "r1",
    appliance_id: "1",
    repair_date: "2024-02-01",
    description: "Fixed compressor",
    cost: 150.0,
    parts: [
      { name: "Compressor", price: 100 },
      { name: "Labor", price: 50 },
    ],
    service_provider: "TechFix Inc.",
    created_at: "2024-02-01T00:00:00Z",
  },
];

describe("ApplianceHistoryDialog", () => {
  it("renders correctly when open", () => {
    render(
      <ApplianceHistoryDialog
        open={true}
        onClose={() => {}}
        appliance={mockAppliance}
        repairs={mockRepairs}
        loading={false}
      />
    );

    expect(
      screen.getByText("appliances.history: Test Fridge")
    ).toBeInTheDocument();
    expect(screen.getByText("Fixed compressor")).toBeInTheDocument();
    expect(
      screen.getByText("TechFix Inc.", { exact: false })
    ).toBeInTheDocument();
  });

  it("shows loading state when loading prop is true", () => {
    render(
      <ApplianceHistoryDialog
        open={true}
        onClose={() => {}}
        appliance={mockAppliance}
        repairs={[]}
        loading={true}
      />
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows empty state message when no repairs provided", () => {
    render(
      <ApplianceHistoryDialog
        open={true}
        onClose={() => {}}
        appliance={mockAppliance}
        repairs={[]}
        loading={false}
      />
    );

    expect(screen.getByText("appliances.noRepairs")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <ApplianceHistoryDialog
        open={true}
        onClose={handleClose}
        appliance={mockAppliance}
        repairs={mockRepairs}
        loading={false}
      />
    );

    fireEvent.click(screen.getByText("appliances.close"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("displays part details correctly", () => {
    render(
      <ApplianceHistoryDialog
        open={true}
        onClose={() => {}}
        appliance={mockAppliance}
        repairs={mockRepairs}
        loading={false}
      />
    );

    expect(screen.getByText("appliances.parts:")).toBeInTheDocument();
    expect(
      screen.getByText("- Compressor", { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByText("100.00 $", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("150.00 $", { exact: false })).toBeInTheDocument(); // Total cost
  });
});
