import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ApplianceCard from "../ApplianceCard";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { Appliance } from "../../../types/appliances";

// Mock translation
vi.mock("../../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { days: number }) => {
      if (key === "appliances.warranty.expiringSoon" && options) {
        return `Expiring in ${options.days}d`;
      }
      return key;
    },
  }),
}));

const mockAppliance: Appliance = {
  id: "123",
  name: "Test Fridge",
  brand: "BrandX",
  model: "ModelY",
  serial_number: "SN123",
  type: "Refrigerator",
  purchase_date: "2023-01-01",
  warranty_expiry: "2024-01-01",
  expected_life: 10,
  status: "functional",
  notes: "Some notes",
  location: "Kitchen",
  photo_url: "http://example.com/photo.jpg",
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
  user_id: "user1",
  sku: null,
};

const defaultProps = {
  appliance: mockAppliance,
  compactView: false,
  selected: false,
  onToggle: vi.fn(),
  onViewRepairs: vi.fn(),
  onAddRepair: vi.fn(),
  onDelete: vi.fn(),
};

const theme = createTheme();

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("ApplianceCard", () => {
  it("renders appliance details correctly", () => {
    renderWithTheme(<ApplianceCard {...defaultProps} />);

    expect(screen.getByText("Test Fridge")).toBeInTheDocument();
    expect(screen.getByText("BrandX")).toBeInTheDocument();
    expect(screen.getByText("Refrigerator")).toBeInTheDocument();
    expect(
      screen.getByText("appliances.status.functional")
    ).toBeInTheDocument();
    expect(screen.getByText(/Kitchen/)).toBeInTheDocument();
  });

  it("calls onToggle when checkbox is clicked", () => {
    renderWithTheme(<ApplianceCard {...defaultProps} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(defaultProps.onToggle).toHaveBeenCalledWith("123", true);
  });

  it("calls action buttons correctly", () => {
    renderWithTheme(<ApplianceCard {...defaultProps} />);

    const historyButton = screen.getByText("appliances.history");
    fireEvent.click(historyButton);
    expect(defaultProps.onViewRepairs).toHaveBeenCalledWith(mockAppliance);

    const buttons = screen.getAllByRole("button");

    fireEvent.click(buttons[1]);
    expect(defaultProps.onAddRepair).toHaveBeenCalledWith(mockAppliance);

    fireEvent.click(buttons[2]);
    expect(defaultProps.onDelete).toHaveBeenCalledWith("123");
  });

  it("displays expired warranty correctly", () => {
    const expiredAppliance = {
      ...mockAppliance,
      warranty_expiry: "2020-01-01",
    };
    renderWithTheme(
      <ApplianceCard {...defaultProps} appliance={expiredAppliance} />
    );
    expect(screen.getByText("appliances.warranty.expired")).toBeInTheDocument();
  });

  it("displays expiring soon warranty correctly", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const expiringAppliance = {
      ...mockAppliance,
      warranty_expiry: futureDate.toISOString().split("T")[0],
    };

    renderWithTheme(
      <ApplianceCard {...defaultProps} appliance={expiringAppliance} />
    );
    // The mock translation should handle this
    expect(screen.getByText(/Expiring in 5d/)).toBeInTheDocument();
  });

  it("displays warning status correctly", () => {
    const brokenAppliance: Appliance = {
      ...mockAppliance,
      status: "broken",
    };
    renderWithTheme(
      <ApplianceCard {...defaultProps} appliance={brokenAppliance} />
    );
    expect(screen.getByText("appliances.status.broken")).toBeInTheDocument();
  });
});
