import { describe, it, expect, vi, beforeEach } from "vitest";

import { render, screen, waitFor, fireEvent } from "@test/test-utils";

import ReportsPage from "../ReportsPage";

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
globalThis.fetch = mockFetch;

// Mock window.print
const mockPrint = vi.fn();
window.print = mockPrint;

describe("ReportsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });

  it("renders reports page title", () => {
    render(<ReportsPage />);
    expect(screen.getAllByText("reports.title")[0]).toBeInTheDocument();
  });

  it("renders filter controls", () => {
    render(<ReportsPage />);
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

    render(<ReportsPage />);

    // Select location using MUI Autocomplete
    const locationAutocomplete = screen.getByLabelText("reports.location");
    fireEvent.mouseDown(locationAutocomplete);
    const option = await screen.findByText("Warehouse A");
    fireEvent.click(option);

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

    render(<ReportsPage />);

    const locationAutocomplete = screen.getByLabelText("reports.location");
    fireEvent.mouseDown(locationAutocomplete);
    const option = await screen.findByText("Warehouse A");
    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.getByText("15")).toBeInTheDocument();
    });
  });

  it("handles print button", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ itemName: "Item 1", total: 10 }]),
    });

    render(<ReportsPage />);

    const locationAutocomplete = screen.getByLabelText("reports.location");
    fireEvent.mouseDown(locationAutocomplete);
    const option = await screen.findByText("Warehouse A");
    fireEvent.click(option);

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

    render(<ReportsPage />);

    const locationAutocomplete = screen.getByLabelText("reports.location");
    fireEvent.mouseDown(locationAutocomplete);
    const option = await screen.findByText("Warehouse A");
    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.getByText("reports.noData")).toBeInTheDocument();
    });
  });

  it("handles fetch errors", async () => {
    const error = new Error("Fetch failed");
    mockFetch.mockRejectedValue(error);

    render(<ReportsPage />);

    const locationAutocomplete = screen.getByLabelText("reports.location");
    fireEvent.mouseDown(locationAutocomplete);
    const option = await screen.findByText("Warehouse A");
    fireEvent.click(option);

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(
        error,
        expect.stringContaining("errors.fetchReport")
      );
    });
  });
});
