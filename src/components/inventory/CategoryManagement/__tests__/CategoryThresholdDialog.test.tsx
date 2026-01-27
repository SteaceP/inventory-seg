import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CategoryThresholdDialog from "../CategoryThresholdDialog";

import { createMockTranslation } from "@test/mocks";

// Mock i18n
const { t } = createMockTranslation();
vi.mock("@i18n", () => ({
  useTranslation: () => ({ t }),
}));

describe("CategoryThresholdDialog", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    categoryName: "Test Category",
    currentThreshold: 10,
    onSave: vi.fn(),
  };

  it("renders with current threshold", () => {
    render(<CategoryThresholdDialog {...defaultProps} />);

    expect(
      screen.getByText(/inventory.categoryThresholdTitle: Test Category/)
    ).toBeInTheDocument();
    const input = screen.getByLabelText("inventory.threshold");
    expect(input).toHaveValue(10);
  });

  it("calls onSave with updated value", () => {
    render(<CategoryThresholdDialog {...defaultProps} />);

    const input = screen.getByLabelText("inventory.threshold");
    fireEvent.change(input, { target: { value: "20" } });

    fireEvent.click(screen.getByText("inventory.save"));
    expect(defaultProps.onSave).toHaveBeenCalledWith(20);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onSave with null when empty", () => {
    render(<CategoryThresholdDialog {...defaultProps} />);

    const input = screen.getByLabelText("inventory.threshold");
    fireEvent.change(input, { target: { value: "" } });

    fireEvent.click(screen.getByText("inventory.save"));
    expect(defaultProps.onSave).toHaveBeenCalledWith(null);
  });

  it("calls onClose when cancel is clicked", () => {
    render(<CategoryThresholdDialog {...defaultProps} />);

    fireEvent.click(screen.getByText("inventory.cancel"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
