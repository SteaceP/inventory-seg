import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import ConfirmDialog from "./ConfirmDialog";

// Mock the i18n hook
vi.mock("../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "common.cancel": "Cancel",
        "common.confirm": "Confirm",
      };
      return translations[key] || key;
    },
  }),
}));

describe("ConfirmDialog", () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    open: true,
    title: "Confirm Action",
    content: "Are you sure you want to proceed?",
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render when open is true", () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to proceed?")
    ).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  it("should not render when open is false", () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);

    expect(screen.queryByText("Confirm Action")).not.toBeInTheDocument();
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);

    const confirmButton = screen.getByText("Confirm");
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it("should call onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);

    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("should render with error color by default", () => {
    render(<ConfirmDialog {...defaultProps} />);

    const confirmButton = screen.getByText("Confirm");
    expect(confirmButton).toHaveClass("MuiButton-containedError");
  });

  it("should render with primary color when specified", () => {
    render(<ConfirmDialog {...defaultProps} confirmColor="primary" />);

    const confirmButton = screen.getByText("Confirm");
    expect(confirmButton).toHaveClass("MuiButton-containedPrimary");
  });

  it("should render with success color when specified", () => {
    render(<ConfirmDialog {...defaultProps} confirmColor="success" />);

    const confirmButton = screen.getByText("Confirm");
    expect(confirmButton).toHaveClass("MuiButton-containedSuccess");
  });

  it("should render with warning color when specified", () => {
    render(<ConfirmDialog {...defaultProps} confirmColor="warning" />);

    const confirmButton = screen.getByText("Confirm");
    expect(confirmButton).toHaveClass("MuiButton-containedWarning");
  });

  it("should display custom title", () => {
    render(<ConfirmDialog {...defaultProps} title="Delete Item?" />);

    expect(screen.getByText("Delete Item?")).toBeInTheDocument();
  });

  it("should display custom content", () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        content="This action cannot be undone."
      />
    );

    expect(
      screen.getByText("This action cannot be undone.")
    ).toBeInTheDocument();
  });
});
