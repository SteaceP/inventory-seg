import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ReportsPage from "../ReportsPage";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mocks
const mockHandleError = vi.fn();
const mockLocations = [
  { id: "1", name: "Warehouse A", parent_id: null },
  { id: "2", name: "Shelf 1", parent_id: "1" },
];

vi.mock("../../contexts/InventoryContext", () => ({
  useInventoryContext: () => ({
    locations: mockLocations,
  }),
}));

vi.mock("../../hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
  }),
}));

vi.mock("../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    lang: "en",
  }),
}));

vi.mock("../../supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: "fake-token" } },
      }),
    },
  },
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.print
const mockPrint = vi.fn();
window.print = mockPrint;

// Mock Mui Autocomplete
vi.mock("@mui/material", async () => {
  const actual = await vi.importActual("@mui/material");
  return {
    ...actual,
    Autocomplete: (props: {
      onChange: (event: React.SyntheticEvent, value: unknown) => void;
      options: (string | { label?: string; name?: string })[];
      value: string | { label?: string; name?: string } | null;
      renderInput: (params: unknown) => React.ReactNode;
      id?: string;
    }) => {
      const { onChange, options, value, renderInput } = props;
      // We render the input to keep label accessible
      const inputParams = {
        id: props.id || "mock-autocomplete",
        inputProps: {},
        InputProps: {},
      };

      return (
        <div data-testid="mock-autocomplete-container">
          {renderInput(inputParams)}
          <select
            data-testid={`select-${props.value ? "has-value" : "empty"}`}
            value={
              value && typeof value === "object"
                ? value.label || value.name || ""
                : (value as string) || ""
            }
            onChange={(e) => {
              const targetValue = e.target.value;
              const val = options.find((o) => {
                const optLabel =
                  typeof o === "string"
                    ? o
                    : o.label || o.name || JSON.stringify(o);
                return String(optLabel) === targetValue;
              });
              // If selected "all" or manual string, handled here
              if (!val && options.includes(targetValue)) {
                onChange(e, targetValue);
              } else {
                onChange(e, val);
              }
            }}
            className="mock-select"
          >
            <option value="">Select...</option>
            {options.map((o) => {
              const label =
                typeof o === "string"
                  ? o
                  : o.label || o.name || JSON.stringify(o);
              return (
                <option key={String(label)} value={String(label)}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      );
    },
  };
});

const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe("ReportsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });

  it("renders reports page title", () => {
    renderWithTheme(<ReportsPage />);
    expect(screen.getAllByText("reports.title")[0]).toBeInTheDocument();
  });

  it("renders filter controls", () => {
    renderWithTheme(<ReportsPage />);
    expect(screen.getByText("reports.monthly")).toBeInTheDocument();
    expect(screen.getByLabelText("reports.location")).toBeInTheDocument();
  });

  it.skip("fetches report data when filters are selected", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          { itemName: "Item 1", total: 10 },
          { itemName: "Item 2", total: 5 },
        ]),
    });

    renderWithTheme(<ReportsPage />);

    // Select location using our mock select
    const locationInput = screen.getByLabelText("reports.location");
    const container = locationInput.closest(
      "div[data-testid='mock-autocomplete-container']"
    );
    const select = container?.querySelector("select");

    if (select) {
      fireEvent.change(select, { target: { value: "Warehouse A" } });
    }

    // Wait for fetch
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/activity/report-stats"),
        expect.any(Object)
      );
    });

    // Check results
    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
    });
  });

  it.skip("calculates total correctly", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          { itemName: "Item 1", total: 10 },
          { itemName: "Item 2", total: 5 },
        ]),
    });

    renderWithTheme(<ReportsPage />);

    const locationInput = screen.getByLabelText("reports.location");
    const container = locationInput.closest(
      "div[data-testid='mock-autocomplete-container']"
    );
    const select = container?.querySelector("select");

    if (select) {
      fireEvent.change(select, { target: { value: "Warehouse A" } });
    }

    await waitFor(() => {
      expect(screen.getByText("15")).toBeInTheDocument();
    });
  });

  it.skip("handles print button", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ itemName: "Item 1", total: 10 }]),
    });

    renderWithTheme(<ReportsPage />);

    const locationInput = screen.getByLabelText("reports.location");
    const container = locationInput.closest(
      "div[data-testid='mock-autocomplete-container']"
    );
    const select = container?.querySelector("select");

    if (select) {
      fireEvent.change(select, { target: { value: "Warehouse A" } });
    }

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    const printButton = screen.getByText("reports.print");
    fireEvent.click(printButton);
    expect(mockPrint).toHaveBeenCalled();
  });

  it.skip("displays no data message when result is empty", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    renderWithTheme(<ReportsPage />);

    const locationInput = screen.getByLabelText("reports.location");
    const container = locationInput.closest(
      "div[data-testid='mock-autocomplete-container']"
    );
    const select = container?.querySelector("select");

    if (select) {
      fireEvent.change(select, { target: { value: "Warehouse A" } });
    }

    await waitFor(() => {
      expect(screen.getByText("reports.noData")).toBeInTheDocument();
    });
  });

  it.skip("handles fetch errors", async () => {
    const error = new Error("Fetch failed");
    mockFetch.mockRejectedValue(error);

    renderWithTheme(<ReportsPage />);

    const locationInput = screen.getByLabelText("reports.location");
    const container = locationInput.closest(
      "div[data-testid='mock-autocomplete-container']"
    );
    const select = container?.querySelector("select");

    if (select) {
      fireEvent.change(select, { target: { value: "Warehouse A" } });
    }

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(
        error,
        expect.stringContaining("errors.fetchReport")
      );
    });
  });
});
