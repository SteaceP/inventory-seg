import * as Sentry from "@sentry/react";
import { renderHook } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";

import { usePerformance } from "../usePerformance";

// Mock Sentry
vi.mock("@sentry/react", () => ({
  startSpan: vi.fn((_config: unknown, callback: () => unknown) => callback()),
}));

describe("usePerformance", () => {
  it("should call Sentry.startSpan with correct arguments", async () => {
    const { result } = renderHook(() => usePerformance());
    const op = "test.op";
    const name = "test.name";
    const mockResult = "test-result";
    const callback = vi.fn().mockResolvedValue(mockResult);

    const response = await result.current.measureOperation(op, name, callback);

    expect(Sentry.startSpan).toHaveBeenCalledWith({ op, name }, callback);
    expect(callback).toHaveBeenCalled();
    expect(response).toBe(mockResult);
  });

  it("should return the result of the callback", async () => {
    const { result } = renderHook(() => usePerformance());
    const expectedValue = { data: "success" };
    const callback = () => Promise.resolve(expectedValue);

    const response = await result.current.measureOperation(
      "op",
      "name",
      callback
    );

    expect(response).toEqual(expectedValue);
  });
});
