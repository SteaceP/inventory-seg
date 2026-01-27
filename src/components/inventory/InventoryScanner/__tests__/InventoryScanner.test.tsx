import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import InventoryScanner from "../InventoryScanner";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mock Translation
import { createMockTranslation } from "@test/mocks";

const { t } = createMockTranslation();
vi.mock("@i18n", () => ({
  useTranslation: () => ({ t }),
}));

// Mock Html5Qrcode
const { mockStart, mockHtml5Qrcode } = vi.hoisted(() => {
  const start = vi.fn();
  const stop = vi.fn().mockResolvedValue(true);
  const mock = vi.fn().mockImplementation(() => ({
    start: start,
    stop: stop,
    isScanning: false,
  }));
  return { mockStart: start, mockStop: stop, mockHtml5Qrcode: mock };
});

vi.mock("html5-qrcode", () => ({
  Html5Qrcode: mockHtml5Qrcode,
}));

const theme = createTheme();
const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("InventoryScanner", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onScanSuccess: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly when open", () => {
    renderWithTheme(<InventoryScanner {...defaultProps} />);
    expect(screen.getByText("inventory.scanner.title")).toBeInTheDocument();
    expect(
      screen.getByText("inventory.scanner.instructions")
    ).toBeInTheDocument();
    expect(screen.getByText("inventory.cancel")).toBeInTheDocument();
  });

  it("initializes scanner when open", async () => {
    renderWithTheme(<InventoryScanner {...defaultProps} />);

    // Wait for the timeout in useEffect
    await waitFor(() => {
      expect(mockHtml5Qrcode).toHaveBeenCalledWith("reader");
      expect(mockStart).toHaveBeenCalled();
    });
  });

  it("does not initialize scanner when closed", () => {
    renderWithTheme(<InventoryScanner {...defaultProps} open={false} />);
    expect(mockHtml5Qrcode).not.toHaveBeenCalled();
  });

  it("calls onClose when cancel button is clicked", () => {
    renderWithTheme(<InventoryScanner {...defaultProps} />);
    const cancelButton = screen.getByText("inventory.cancel");
    fireEvent.click(cancelButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onClose when close icon is clicked", () => {
    renderWithTheme(<InventoryScanner {...defaultProps} />);
    // Close icon usually is a button
    const buttons = screen.getAllByRole("button");
    const closeIconButton = buttons[0];
    fireEvent.click(closeIconButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  // Cleaning up mocks is handled by beforeEach/afterEach hooks if implicit, but we set explicit clear in beforeEach.
});
