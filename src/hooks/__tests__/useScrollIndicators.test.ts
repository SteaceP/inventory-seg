import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useScrollIndicators } from "../useScrollIndicators";

describe("useScrollIndicators", () => {
  it("should initialize with showLeft false and showRight true", () => {
    const { result } = renderHook(() => useScrollIndicators(true));
    expect(result.current.showLeft).toBe(false);
    expect(result.current.showRight).toBe(true);
  });

  it("should not attach scroll listener if isMobile is false", () => {
    const { result } = renderHook(() => useScrollIndicators(false));
    const element = document.createElement("div");
    result.current.scrollRef.current = element;

    const addEventListenerSpy = vi.spyOn(element, "addEventListener");

    // Re-render to trigger useEffect
    const { rerender } = renderHook(() => useScrollIndicators(false));
    rerender();

    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it("should update indicators correctly when scrolling", () => {
    const { result } = renderHook(() => useScrollIndicators(true));
    const element = document.createElement("div");

    // Mock properties
    Object.defineProperties(element, {
      scrollWidth: { value: 1000, configurable: true },
      clientWidth: { value: 200, configurable: true },
      scrollLeft: { value: 0, configurable: true, writable: true },
    });

    result.current.scrollRef.current = element;

    // Initial state check
    act(() => {
      result.current.handleScroll();
    });
    expect(result.current.showLeft).toBe(false);
    expect(result.current.showRight).toBe(true);

    // Scroll to middle
    element.scrollLeft = 500;
    act(() => {
      result.current.handleScroll();
    });
    expect(result.current.showLeft).toBe(true);
    expect(result.current.showRight).toBe(true);

    // Scroll to end
    element.scrollLeft = 800; // 1000 - 200 = 800
    act(() => {
      result.current.handleScroll();
    });
    expect(result.current.showLeft).toBe(true);
    expect(result.current.showRight).toBe(false);
  });
});
