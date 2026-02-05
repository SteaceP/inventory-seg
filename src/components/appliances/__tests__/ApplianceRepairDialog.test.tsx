import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import ApplianceRepairDialog from "../ApplianceRepairDialog/ApplianceRepairDialog";

// Mock translation
vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("ApplianceRepairDialog", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    appliance: {
      id: "1",
      name: "Washer",
    } as unknown as import("@/types/appliances").Appliance,
    loading: false,
  };

  it("should not render when open is false", () => {
    render(<ApplianceRepairDialog {...defaultProps} open={false} />);
    expect(screen.queryByText(/appliances.addRepair/)).not.toBeInTheDocument();
  });

  it("should render dialog title with appliance name", () => {
    render(<ApplianceRepairDialog {...defaultProps} />);
    expect(screen.getByText("appliances.addRepair Washer")).toBeInTheDocument();
  });

  it("should initialize with default empty form", () => {
    render(<ApplianceRepairDialog {...defaultProps} />);
    expect(screen.getByLabelText("appliances.repairDescription")).toHaveValue(
      ""
    );
    expect(screen.getByLabelText("appliances.serviceProvider")).toHaveValue("");
    // Date defaults to today, hard to test exact string without mocking Date,
    // but check it's not empty
    expect(screen.getByLabelText("appliances.date")).not.toHaveValue("");
  });

  it("should update form fields", () => {
    render(<ApplianceRepairDialog {...defaultProps} />);

    const descInput = screen.getByLabelText("appliances.repairDescription");
    fireEvent.change(descInput, { target: { value: "Broken seal" } });
    expect(descInput).toHaveValue("Broken seal");

    const providerInput = screen.getByLabelText("appliances.serviceProvider");
    fireEvent.change(providerInput, { target: { value: "FixItPro" } });
    expect(providerInput).toHaveValue("FixItPro");
  });

  it("should handle parts management (add/remove/update)", () => {
    render(<ApplianceRepairDialog {...defaultProps} />);

    // Add part
    fireEvent.click(screen.getByText("appliances.addPart"));
    expect(screen.getAllByLabelText("appliances.partName")).toHaveLength(1);
    expect(screen.getAllByLabelText("appliances.partPrice")).toHaveLength(1);

    // Update part
    const nameInput = screen.getAllByLabelText("appliances.partName")[0];
    fireEvent.change(nameInput, { target: { value: "Seal" } });
    expect(nameInput).toHaveValue("Seal");

    const priceInput = screen.getAllByLabelText("appliances.partPrice")[0];
    fireEvent.change(priceInput, { target: { value: 50 } });
    expect(priceInput).toHaveValue(50);

    // Total calculation
    expect(
      screen.getByText("appliances.totalCost: 50.00 $")
    ).toBeInTheDocument();

    // Remove part
    const removeBtn = screen.getByTestId("DeleteIcon").closest("button");
    fireEvent.click(removeBtn!);

    expect(
      screen.queryByLabelText("appliances.partName")
    ).not.toBeInTheDocument();
  });

  it("should disable save button if description is empty", () => {
    render(<ApplianceRepairDialog {...defaultProps} />);
    const saveBtn = screen.getByText("appliances.save").closest("button");
    expect(saveBtn).toBeDisabled();

    fireEvent.change(screen.getByLabelText("appliances.repairDescription"), {
      target: { value: "Fix" },
    });
    expect(saveBtn).not.toBeDisabled();
  });

  it("should call onSave with form data", () => {
    render(<ApplianceRepairDialog {...defaultProps} />);

    fireEvent.change(screen.getByLabelText("appliances.repairDescription"), {
      target: { value: "Fix" },
    });
    fireEvent.change(screen.getByLabelText("appliances.serviceProvider"), {
      target: { value: "Bob" },
    });

    fireEvent.click(screen.getByText("appliances.save"));

    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Fix",
        service_provider: "Bob",
        parts: [],
      })
    );
  });

  it("should show loading state", () => {
    render(<ApplianceRepairDialog {...defaultProps} loading={true} />);

    // Since save button might be disabled or contain progress, check progress existence
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(
      screen.getByText("appliances.save").closest("button")
    ).toBeDisabled();
  });
});
