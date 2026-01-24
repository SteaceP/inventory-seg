import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AppliancesHeader from "./AppliancesHeader";

// Mock translation
vi.mock("../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("AppliancesHeader", () => {
  const defaultProps = {
    compactView: false,
    selectedCount: 0,
    onPrintLabels: vi.fn(),
    onScan: vi.fn(),
    onAddAppliance: vi.fn(),
  };

  it("renders title correctly", () => {
    render(<AppliancesHeader {...defaultProps} />);
    expect(screen.getByText("menu.appliances")).toBeInTheDocument();
  });

  it("renders 'Add' and 'Scan' buttons always", () => {
    render(<AppliancesHeader {...defaultProps} />);
    expect(screen.getByText("appliances.add")).toBeInTheDocument();
    expect(screen.getByText("inventory.scan")).toBeInTheDocument();
  });

  it("does not render 'Print Labels' button when selectedCount is 0", () => {
    render(<AppliancesHeader {...defaultProps} selectedCount={0} />);
    expect(screen.queryByText(/inventory.printLabels/)).not.toBeInTheDocument();
  });

  it("renders 'Print Labels' button when selectedCount > 0", () => {
    render(<AppliancesHeader {...defaultProps} selectedCount={3} />);
    expect(screen.getByText("inventory.printLabels (3)")).toBeInTheDocument();
  });

  it("calls onAddAppliance when Add button is clicked", () => {
    render(<AppliancesHeader {...defaultProps} />);
    fireEvent.click(screen.getByText("appliances.add"));
    expect(defaultProps.onAddAppliance).toHaveBeenCalled();
  });

  it("calls onScan when Scan button is clicked", () => {
    render(<AppliancesHeader {...defaultProps} />);
    fireEvent.click(screen.getByText("inventory.scan"));
    expect(defaultProps.onScan).toHaveBeenCalled();
  });

  it("calls onPrintLabels when Print Labels button is clicked", () => {
    render(<AppliancesHeader {...defaultProps} selectedCount={1} />);
    fireEvent.click(screen.getByText(/inventory.printLabels/));
    expect(defaultProps.onPrintLabels).toHaveBeenCalled();
  });

  it("renders smaller title in compact view", () => {
    render(<AppliancesHeader {...defaultProps} compactView={true} />);
    const title = screen.getByText("menu.appliances");
    expect(title).toHaveClass("MuiTypography-h5");
  });

  it("renders larger title in normal view", () => {
    render(<AppliancesHeader {...defaultProps} compactView={false} />);
    const title = screen.getByText("menu.appliances");
    expect(title).toHaveClass("MuiTypography-h4");
  });
});
