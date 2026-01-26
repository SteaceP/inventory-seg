import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import InventorySearch from "../InventorySearch";

// Mock translation hook
vi.mock("../../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("InventorySearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should render with initial value", () => {
    render(<InventorySearch value="initial" onChange={vi.fn()} />);

    const input = screen.getByDisplayValue("initial");
    expect(input).toBeInTheDocument();
  });

  it("should render with placeholder", () => {
    render(<InventorySearch value="" onChange={vi.fn()} />);

    const input = screen.getByPlaceholderText("inventory.searchPlaceholder");
    expect(input).toBeInTheDocument();
  });

  it("should update input value immediately but debounce onChange callback", () => {
    const handleChange = vi.fn();
    render(<InventorySearch value="" onChange={handleChange} />);

    const input = screen.getByPlaceholderText("inventory.searchPlaceholder");

    fireEvent.change(input, { target: { value: "test" } });

    // Input should update immediately
    expect(input).toHaveValue("test");

    // Callback should not be called yet
    expect(handleChange).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(handleChange).toHaveBeenCalledWith("test");
  });

  it("should sync internal state when external value changes", () => {
    const { rerender } = render(
      <InventorySearch value="initial" onChange={vi.fn()} />
    );

    // Update props
    rerender(<InventorySearch value="updated" onChange={vi.fn()} />);

    // Since TextField has key={value}, it remounts. We need to get the new element.
    const input = screen.getByDisplayValue("updated");
    expect(input).toBeInTheDocument();
  });

  it("should not trigger onChange when syncing from external value", () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <InventorySearch value="initial" onChange={handleChange} />
    );

    // Update props
    rerender(<InventorySearch value="updated" onChange={handleChange} />);

    // Fast-forward time for the sync effect (0ms timeout) first
    act(() => {
      vi.advanceTimersByTime(10);
    });

    // Then fast-forward the rest of the debounce time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // The logic inside InventorySearch has a check: `if (local !== value) onChange(local)`
    // When props update, local updates to match value, so onChange should NOT be called
    expect(handleChange).not.toHaveBeenCalled();
  });
});
