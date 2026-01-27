import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AppliancesStats from "../AppliancesStats";
import type { Appliance } from "@/types/appliances";

// Mock translation
vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockAppliances: Appliance[] = [
  {
    id: "1",
    name: "Functional Fridge",
    status: "functional",
    user_id: "u1",
    created_at: "",
    updated_at: "",
    brand: null,
    model: null,
    serial_number: null,
    purchase_date: null,
    warranty_expiry: null,
    expected_life: null,
    photo_url: null,
    notes: null,
    location: null,
    sku: null,
    type: null,
  },

  {
    id: "2",
    name: "Broken Oven",
    status: "broken",
    user_id: "u1",
    created_at: "",
    updated_at: "",
    brand: null,
    model: null,
    serial_number: null,
    purchase_date: null,
    warranty_expiry: null,
    expected_life: null,
    photo_url: null,
    notes: null,
    location: null,
    sku: null,
    type: null,
  },

  {
    id: "3",
    name: "Service Dishwasher",
    status: "needs_service",
    user_id: "u1",
    created_at: "",
    updated_at: "",
    brand: null,
    model: null,
    serial_number: null,
    purchase_date: null,
    warranty_expiry: null,
    expected_life: null,
    photo_url: null,
    notes: null,
    location: null,
    sku: null,
    type: null,
  },

  {
    id: "4",
    name: "Warranty Expiring Soon",
    status: "functional",
    warranty_expiry: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
    user_id: "u1",
    created_at: "",
    updated_at: "",
    brand: null,
    model: null,
    serial_number: null,
    purchase_date: null,
    expected_life: null,
    photo_url: null,
    notes: null,
    location: null,
    sku: null,
    type: null,
  },

  {
    id: "5",
    name: "Warranty Safe",
    status: "functional",
    warranty_expiry: new Date(Date.now() + 86400000 * 60).toISOString(), // 60 days from now
    user_id: "u1",
    created_at: "",
    updated_at: "",
    brand: null,
    model: null,
    serial_number: null,
    purchase_date: null,
    expected_life: null,
    photo_url: null,
    notes: null,
    location: null,
    sku: null,
    type: null,
  },
];

describe("AppliancesStats", () => {
  it("renders total count correctly", () => {
    render(<AppliancesStats appliances={mockAppliances} compactView={false} />);
    expect(screen.getByText("appliances.stats.total")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("calculates healthy appliances correctly", () => {
    // 3 functional items
    render(<AppliancesStats appliances={mockAppliances} compactView={false} />);
    expect(screen.getByText("appliances.stats.healthy")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calculates attention required correctly (broken + needs_service)", () => {
    // 1 broken + 1 needs_service = 2
    render(<AppliancesStats appliances={mockAppliances} compactView={false} />);
    expect(screen.getByText("appliances.stats.attention")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("calculates warranty alerts correctly (expires <= 30 days)", () => {
    // 1 item expiring in 5 days
    render(<AppliancesStats appliances={mockAppliances} compactView={false} />);
    expect(screen.getByText("appliances.stats.warranty")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders with compact view spacing", () => {
    const { container } = render(
      <AppliancesStats appliances={mockAppliances} compactView={true} />
    );
    // verifying via class presence or structure if needed, but mainly verifying it renders without error
    expect(container.firstChild).toBeInTheDocument();
  });
});
