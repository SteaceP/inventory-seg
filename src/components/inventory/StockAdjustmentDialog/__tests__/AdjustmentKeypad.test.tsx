import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdjustmentKeypad from "../AdjustmentKeypad";

describe("AdjustmentKeypad", () => {
  it("should render all digit buttons", () => {
    const mockOnDigit = vi.fn();
    const mockOnBackspace = vi.fn();

    render(
      <AdjustmentKeypad onDigit={mockOnDigit} onBackspace={mockOnBackspace} />
    );

    for (let i = 0; i <= 9; i++) {
      expect(
        screen.getByRole("button", { name: i.toString() })
      ).toBeInTheDocument();
    }
  });

  it("should render backspace button", () => {
    const mockOnDigit = vi.fn();
    const mockOnBackspace = vi.fn();

    render(
      <AdjustmentKeypad onDigit={mockOnDigit} onBackspace={mockOnBackspace} />
    );

    const buttons = screen.getAllByRole("button");
    const backspaceButton = buttons.find((btn) =>
      btn.querySelector('[data-testid="BackspaceIcon"]')
    );
    expect(backspaceButton).toBeInTheDocument();
  });

  it("should call onDigit when digit button is clicked", () => {
    const mockOnDigit = vi.fn();
    const mockOnBackspace = vi.fn();

    render(
      <AdjustmentKeypad onDigit={mockOnDigit} onBackspace={mockOnBackspace} />
    );

    const button5 = screen.getByRole("button", { name: "5" });
    fireEvent.click(button5);

    expect(mockOnDigit).toHaveBeenCalledWith("5");
  });

  it("should call onBackspace when backspace button is clicked", () => {
    const mockOnDigit = vi.fn();
    const mockOnBackspace = vi.fn();

    render(
      <AdjustmentKeypad onDigit={mockOnDigit} onBackspace={mockOnBackspace} />
    );

    const buttons = screen.getAllByRole("button");
    const backspaceButton = buttons.find((btn) =>
      btn.querySelector('[data-testid="BackspaceIcon"]')
    );

    if (backspaceButton) {
      fireEvent.click(backspaceButton);
      expect(mockOnBackspace).toHaveBeenCalled();
    }
  });

  it("should call onDigit for all digits 0-9", () => {
    const mockOnDigit = vi.fn();
    const mockOnBackspace = vi.fn();

    render(
      <AdjustmentKeypad onDigit={mockOnDigit} onBackspace={mockOnBackspace} />
    );

    for (let i = 0; i <= 9; i++) {
      const button = screen.getByRole("button", { name: i.toString() });
      fireEvent.click(button);
      expect(mockOnDigit).toHaveBeenCalledWith(i.toString());
    }

    expect(mockOnDigit).toHaveBeenCalledTimes(10);
  });
});
