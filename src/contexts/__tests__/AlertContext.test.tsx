import { render, screen, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { AlertProvider, useAlert } from "../AlertContext";

describe("AlertContext", () => {
  describe("AlertProvider", () => {
    it("should render children", () => {
      render(
        <AlertProvider>
          <div>Test Child</div>
        </AlertProvider>
      );

      expect(screen.getByText("Test Child")).toBeInTheDocument();
    });

    it("should not show alert initially", () => {
      render(
        <AlertProvider>
          <div>Content</div>
        </AlertProvider>
      );

      // Snackbar should be in the DOM but not visible
      const alerts = screen.queryAllByRole("alert");
      expect(alerts.length).toBe(0);
    });
  });

  describe("useAlert hook", () => {
    it("should throw error when used outside AlertProvider", () => {
      // Suppress console error for this test
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const TestComponent = () => {
        useAlert();
        return <div>Test</div>;
      };

      expect(() => render(<TestComponent />)).toThrow(
        "useAlert must be used within an AlertProvider"
      );

      consoleSpy.mockRestore();
    });

    it("should provide alert methods when used within AlertProvider", () => {
      const capturedMethods: Array<ReturnType<typeof useAlert>> = [];

      const TestComponent = () => {
        const methods = useAlert();
        // Store in array (arrays are allowed to be mutated in tests)
        capturedMethods.push(methods);
        return <div>Test</div>;
      };

      render(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );

      expect(capturedMethods.length).toBeGreaterThan(0);
      const methods = capturedMethods[0];
      expect(methods.showSuccess).toBeDefined();
      expect(methods.showError).toBeDefined();
      expect(methods.showInfo).toBeDefined();
      expect(methods.showWarning).toBeDefined();
    });
  });

  describe("Alert actions", () => {
    const TestComponent = () => {
      const { showSuccess, showError, showInfo, showWarning } = useAlert();

      return (
        <div>
          <button onClick={() => showSuccess("Success message")}>
            Show Success
          </button>
          <button onClick={() => showError("Error message")}>Show Error</button>
          <button onClick={() => showInfo("Info message")}>Show Info</button>
          <button onClick={() => showWarning("Warning message")}>
            Show Warning
          </button>
        </div>
      );
    };

    it("should display success alert", async () => {
      render(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );

      const button = screen.getByText("Show Success");

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(screen.getByText("Success message")).toBeInTheDocument();
      });

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("MuiAlert-standardSuccess");
    });

    it("should display error alert", async () => {
      render(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );

      const button = screen.getByText("Show Error");

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(screen.getByText("Error message")).toBeInTheDocument();
      });

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("MuiAlert-standardError");
    });

    it("should display info alert", async () => {
      render(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );

      const button = screen.getByText("Show Info");

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(screen.getByText("Info message")).toBeInTheDocument();
      });

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("MuiAlert-standardInfo");
    });

    it("should display warning alert", async () => {
      render(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );

      const button = screen.getByText("Show Warning");

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(screen.getByText("Warning message")).toBeInTheDocument();
      });

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("MuiAlert-standardWarning");
    });

    it("should replace previous alert with new one", async () => {
      render(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );

      // Show first alert
      act(() => {
        screen.getByText("Show Success").click();
      });

      await waitFor(() => {
        expect(screen.getByText("Success message")).toBeInTheDocument();
      });

      // Show second alert
      act(() => {
        screen.getByText("Show Error").click();
      });

      await waitFor(() => {
        expect(screen.getByText("Error message")).toBeInTheDocument();
      });

      // First alert should be replaced
      expect(screen.queryByText("Success message")).not.toBeInTheDocument();
    });
  });

  describe("callback stability", () => {
    it("should maintain stable callback references", () => {
      const captures: Array<ReturnType<typeof useAlert>> = [];

      const TestComponent = () => {
        const callbacks = useAlert();
        // Store each render in array
        captures.push(callbacks);
        return <div>Test</div>;
      };

      const { rerender } = render(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );

      rerender(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );

      expect(captures.length).toBe(2);
      const [first, second] = captures;
      expect(first.showSuccess).toBe(second.showSuccess);
      expect(first.showError).toBe(second.showError);
      expect(first.showInfo).toBe(second.showInfo);
      expect(first.showWarning).toBe(second.showWarning);
    });
  });
});
