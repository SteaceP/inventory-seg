import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdjustmentModeSelector from "../AdjustmentModeSelector";

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("AdjustmentModeSelector", () => {
  const mockOnAddClick = vi.fn();
  const mockOnRemoveClick = vi.fn();
  const containerVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render add and remove buttons", () => {
    render(
      <AdjustmentModeSelector
        onAddClick={mockOnAddClick}
        onRemoveClick={mockOnRemoveClick}
        containerVariants={containerVariants}
      />
    );

    expect(screen.getByText("inventory.addStock")).toBeInTheDocument();
    expect(screen.getByText("inventory.removeStock")).toBeInTheDocument();
  });

  it("should call onAddClick when add button is clicked", () => {
    render(
      <AdjustmentModeSelector
        onAddClick={mockOnAddClick}
        onRemoveClick={mockOnRemoveClick}
        containerVariants={containerVariants}
      />
    );

    const addButton = screen.getByRole("button", { name: /addStock/i });
    fireEvent.click(addButton);

    expect(mockOnAddClick).toHaveBeenCalled();
  });

  it("should call onRemoveClick when remove button is clicked", () => {
    render(
      <AdjustmentModeSelector
        onAddClick={mockOnAddClick}
        onRemoveClick={mockOnRemoveClick}
        containerVariants={containerVariants}
      />
    );

    const removeButton = screen.getByRole("button", { name: /removeStock/i });
    fireEvent.click(removeButton);

    expect(mockOnRemoveClick).toHaveBeenCalled();
  });
});
