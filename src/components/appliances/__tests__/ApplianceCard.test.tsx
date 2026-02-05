import { describe, it, expect, vi } from "vitest";

import type { Appliance } from "@/types/appliances";

import { render, screen, fireEvent } from "@test/test-utils";

import ApplianceCard from "../ApplianceCard/ApplianceCard";

const mockAppliance: Appliance = {
  id: "1",
  name: "Dishwasher Name",
  brand: "Bosch",
  model: "Series 4",
  serial_number: "BSH123",
  purchase_date: "2023-01-01",
  warranty_expiry: "2025-01-01",
  expected_life: 10,
  status: "functional",
  notes: "Quiet model",
  photo_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  location: "Kitchen",
  sku: "APP-001",
  type: "Dishwasher Type",
  user_id: "user-1",
};

// Mock i18n
vi.mock("@/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("ApplianceCard", () => {
  const onToggle = vi.fn();
  const onHistory = vi.fn();
  const onRepair = vi.fn();
  const onDelete = vi.fn();

  const renderCard = (appliance = mockAppliance, selected = false) => {
    return render(
      <ApplianceCard
        appliance={appliance}
        compactView={false}
        selected={selected}
        onToggle={onToggle}
        onViewRepairs={onHistory}
        onAddRepair={onRepair}
        onDelete={onDelete}
      />
    );
  };

  it("renders appliance details correctly", () => {
    renderCard();
    expect(screen.getByText("Dishwasher Name")).toBeInTheDocument();
    expect(screen.getByText("Bosch")).toBeInTheDocument();
    expect(screen.getByText("Dishwasher Type")).toBeInTheDocument();
    expect(screen.getByText("Kitchen")).toBeInTheDocument();
  });

  it("calls onToggle when checkbox is clicked", () => {
    renderCard();
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(onToggle).toHaveBeenCalledWith("1", true);
  });

  it("calls action buttons correctly", () => {
    renderCard();

    fireEvent.click(screen.getByText("appliances.history"));
    expect(onHistory).toHaveBeenCalledWith(mockAppliance);

    fireEvent.click(screen.getByLabelText("appliances.addRepair"));
    expect(onRepair).toHaveBeenCalledWith(mockAppliance);

    fireEvent.click(screen.getByLabelText("appliances.delete"));
    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("displays expired warranty status correctly", () => {
    const expiredAppliance = {
      ...mockAppliance,
      warranty_expiry: "2022-01-01",
    };
    renderCard(expiredAppliance);
    // Looking for translation key returned by mock
    expect(screen.getByText("appliances.warranty.expired")).toBeInTheDocument();
  });
});
