import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ThemeProvider, useThemeContext, ThemeContext } from "./ThemeContext";

// Mock Supabase
vi.mock("../supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({ data: { session: null }, error: null })
      ),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: { dark_mode: true, compact_view: false },
              error: null,
            })
          ),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

// Mock AlertContext
vi.mock("./AlertContext", () => ({
  useAlert: () => ({
    showError: vi.fn(),
  }),
}));

describe("ThemeContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ThemeProvider", () => {
    it("should render children", () => {
      render(
        <ThemeProvider>
          <div>Test Content</div>
        </ThemeProvider>
      );

      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("should provide default dark mode as true", () => {
      const TestComponent = () => {
        const { darkMode } = useThemeContext();
        return <div>Dark Mode: {darkMode.toString()}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByText("Dark Mode: true")).toBeInTheDocument();
    });

    it("should provide default compact view as false", () => {
      const TestComponent = () => {
        const { compactView } = useThemeContext();
        return <div>Compact: {compactView.toString()}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByText("Compact: false")).toBeInTheDocument();
    });
  });

  describe("useThemeContext", () => {
    it("should throw error when used outside ThemeProvider", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const TestComponent = () => {
        useThemeContext();
        return <div>Test</div>;
      };

      expect(() => render(<TestComponent />)).toThrow(
        "useThemeContext must be used within a ThemeProvider"
      );

      consoleSpy.mockRestore();
    });

    it("should provide theme methods when used within ThemeProvider", () => {
      const capturedMethods: Array<ReturnType<typeof useThemeContext>> = [];

      const TestComponent = () => {
        const methods = useThemeContext();
        capturedMethods.push(methods);
        return <div>Test</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(capturedMethods.length).toBeGreaterThan(0);
      const methods = capturedMethods[0];
      expect(methods.toggleDarkMode).toBeDefined();
      expect(methods.toggleCompactView).toBeDefined();
      expect(typeof methods.darkMode).toBe("boolean");
      expect(typeof methods.compactView).toBe("boolean");
    });
  });

  describe("Theme toggle functions", () => {
    it("should toggle dark mode", async () => {
      const TestComponent = () => {
        const { darkMode, toggleDarkMode } = useThemeContext();
        return (
          <div>
            <div>Dark: {darkMode.toString()}</div>
            <button onClick={() => toggleDarkMode(false)}>Toggle</button>
          </div>
        );
      };

      const user = userEvent.setup();
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByText("Dark: true")).toBeInTheDocument();

      const button = screen.getByRole("button", { name: /toggle/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Dark: false")).toBeInTheDocument();
      });
    });

    it("should toggle compact view", async () => {
      const TestComponent = () => {
        const { compactView, toggleCompactView } = useThemeContext();
        return (
          <div>
            <div>Compact: {compactView.toString()}</div>
            <button onClick={() => toggleCompactView(true)}>Toggle</button>
          </div>
        );
      };

      const user = userEvent.setup();
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByText("Compact: false")).toBeInTheDocument();

      const button = screen.getByRole("button", { name: /toggle/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Compact: true")).toBeInTheDocument();
      });
    });
  });

  describe("Context value", () => {
    it("should expose ThemeContext for advanced usage", () => {
      expect(ThemeContext).toBeDefined();
    });
  });
});
