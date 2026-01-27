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

vi.mock("@contexts/InventoryContext", () => ({
  useInventoryContext: () => ({
    locations: mockLocations,
  }),
}));

const mockT = (key: string) => key;
const mockTranslation = {
  t: mockT,
  lang: "en",
};

vi.mock("@/i18n", () => ({
  useTranslation: () => mockTranslation,
}));

const mockErrorHandler = {
  handleError: mockHandleError,
};

vi.mock("@hooks/useErrorHandler", () => ({
  useErrorHandler: () => mockErrorHandler,
}));

vi.mock("@mui/material", () => {
  interface MockProps {
    children?: React.ReactNode;
    startIcon?: React.ReactNode;
    fullWidth?: boolean;
    container?: boolean;
    alignItems?: string;
    gutterBottom?: boolean;
    maxWidth?: string;
    component?: React.ElementType;
    size?: unknown;
    sx?: unknown;
    elevation?: number;
    exclusive?: boolean;
    [key: string]: unknown;
  }

  const MockComponent = (props: MockProps) => {
    const { children, ...rest } = props;
    const cleanProps = { ...rest };
    delete cleanProps.startIcon;
    delete cleanProps.fullWidth;
    delete cleanProps.container;
    delete cleanProps.alignItems;
    delete cleanProps.gutterBottom;
    delete cleanProps.maxWidth;
    delete cleanProps.component;
    delete cleanProps.size;
    delete cleanProps.sx;
    delete cleanProps.elevation;
    delete cleanProps.exclusive;

    return (
      <div {...(cleanProps as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  };

  return {
    Box: MockComponent,
    Container: MockComponent,
    Typography: MockComponent,
    Paper: MockComponent,
    Grid: MockComponent,
    TextField: (props: MockProps) => {
      const { ...rest } = props;
      const cleanProps = { ...rest };
      delete cleanProps.fullWidth;
      return (
        <input
          {...(cleanProps as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      );
    },
    Autocomplete: ({
      options,
      getOptionLabel,
      value,
      onChange,
      renderInput,
    }: {
      options: unknown[];
      getOptionLabel?: (option: unknown) => string;
      value: { value: string | number; label: string } | string | number | null;
      onChange: (event: null, newValue: unknown) => void;
      renderInput: (params: Record<string, unknown>) => React.ReactNode;
    }) => {
      const getValue = () => {
        if (!value) return "";
        if (typeof value === "string") return value;
        if (typeof value === "number") return String(value);
        return String((value as { value?: string | number }).value || "");
      };

      return (
        <div data-testid="mock-autocomplete">
          {renderInput({})}
          <select
            data-testid="mock-autocomplete-select"
            value={getValue()}
            onChange={(e) => {
              const val = e.target.value;
              const option = options.find((o) => {
                if (o === null || o === undefined) return false;
                let oVal: string | number;
                if (typeof o === "object") {
                  oVal = (o as { value?: string | number }).value ?? "";
                } else {
                  oVal = o as string | number;
                }
                return String(oVal) === val;
              });
              onChange(null, option ?? val);
            }}
          >
            <option value="">Select...</option>
            {options.map((opt) => {
              const optVal =
                typeof opt === "object" && opt !== null
                  ? (opt as { value?: string | number }).value || opt
                  : opt;
              const label = getOptionLabel ? getOptionLabel(opt) : String(opt);
              return (
                <option key={String(optVal)} value={String(optVal)}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      );
    },
    Button: (props: MockProps) => {
      const { ...rest } = props;
      const cleanProps = { ...rest };
      delete cleanProps.startIcon;
      return (
        <button
          {...(cleanProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        />
      );
    },
    Table: MockComponent,
    TableBody: MockComponent,
    TableCell: MockComponent,
    TableContainer: MockComponent,
    TableHead: MockComponent,
    TableRow: MockComponent,
    CircularProgress: () => <div role="progressbar" />,
    Divider: () => <hr />,
    ToggleButtonGroup: ({
      children,
      onChange,
    }: {
      children: React.ReactNode;
      onChange: (event: null, value: string) => void;
    }) => (
      <div
        data-testid="mock-toggle-group"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName === "BUTTON") {
            onChange(null, target.getAttribute("value") || "");
          }
        }}
      >
        {children}
      </div>
    ),
    ToggleButton: ({
      children,
      value,
    }: {
      children: React.ReactNode;
      value: string;
    }) => <button value={value}>{children}</button>,
  };
});

vi.mock("@/supabaseClient", () => ({
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

// The Autocomplete tests are skipped, so we don't need a complex mock.

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
  });

  it("fetches report data when filters are selected", async () => {
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
    const select = screen.getAllByTestId("mock-autocomplete-select")[1]; // Second autocomplete is location

    fireEvent.change(select, { target: { value: "Warehouse A" } });

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

  it("calculates total correctly", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          { itemName: "Item 1", total: 10 },
          { itemName: "Item 2", total: 5 },
        ]),
    });

    renderWithTheme(<ReportsPage />);

    const select = screen.getAllByTestId("mock-autocomplete-select")[1];
    fireEvent.change(select, { target: { value: "Warehouse A" } });

    await waitFor(() => {
      expect(screen.getByText("15")).toBeInTheDocument();
    });
  });

  it("handles print button", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ itemName: "Item 1", total: 10 }]),
    });

    renderWithTheme(<ReportsPage />);

    const select = screen.getAllByTestId("mock-autocomplete-select")[1];
    fireEvent.change(select, { target: { value: "Warehouse A" } });

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    const printButton = screen.getByText("reports.print");
    fireEvent.click(printButton);
    expect(mockPrint).toHaveBeenCalled();
  });

  it("displays no data message when result is empty", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    renderWithTheme(<ReportsPage />);

    const select = screen.getAllByTestId("mock-autocomplete-select")[1];
    fireEvent.change(select, { target: { value: "Warehouse A" } });

    await waitFor(() => {
      expect(screen.getByText("reports.noData")).toBeInTheDocument();
    });
  });

  it("handles fetch errors", async () => {
    const error = new Error("Fetch failed");
    mockFetch.mockRejectedValue(error);

    renderWithTheme(<ReportsPage />);

    const select = screen.getAllByTestId("mock-autocomplete-select")[1];
    fireEvent.change(select, { target: { value: "Warehouse A" } });

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(
        error,
        expect.stringContaining("errors.fetchReport")
      );
    });
  });
});
