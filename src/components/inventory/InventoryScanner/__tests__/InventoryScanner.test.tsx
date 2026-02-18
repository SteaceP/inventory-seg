import React from "react";

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mock Translation
import { createMockTranslation } from "@test/mocks";

import InventoryScanner from "../InventoryScanner";

const { t } = createMockTranslation();
vi.mock("@/i18n", () => ({
  useTranslation: () => ({ t }),
}));

// Mock zxing library
const mockListVideoInputDevices = vi.fn();
const mockDecodeFromVideoDevice = vi.fn();
const mockReset = vi.fn();

vi.mock("@zxing/library", () => ({
  BrowserMultiFormatReader: vi.fn().mockImplementation(() => ({
    listVideoInputDevices: mockListVideoInputDevices,
    decodeFromVideoDevice: mockDecodeFromVideoDevice,
    reset: mockReset,
  })),
  NotFoundException: class NotFoundException {},
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
    mockListVideoInputDevices.mockResolvedValue([
      { deviceId: "1", label: "Back Camera" },
    ]);
  });

  it("renders correctly when open", () => {
    renderWithTheme(<InventoryScanner {...defaultProps} />);
    expect(screen.getByText("inventory.scanner.title")).toBeInTheDocument();
    expect(
      screen.getByText("inventory.scanner.instructions")
    ).toBeInTheDocument();
    expect(screen.getByText("inventory.cancel")).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", () => {
    renderWithTheme(<InventoryScanner {...defaultProps} />);
    const cancelButton = screen.getByText("inventory.cancel");
    fireEvent.click(cancelButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("shows switch camera button when multiple devices are available", async () => {
    mockListVideoInputDevices.mockResolvedValue([
      { deviceId: "1", label: "Back Camera" },
      { deviceId: "2", label: "Front Camera" },
    ]);

    renderWithTheme(<InventoryScanner {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByTitle("inventory.scanner.switchCamera")
      ).toBeInTheDocument();
    });
  });

  it("does not show switch camera button when only one device is available", async () => {
    mockListVideoInputDevices.mockResolvedValue([
      { deviceId: "1", label: "Back Camera" },
    ]);

    renderWithTheme(<InventoryScanner {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.queryByTitle("inventory.scanner.switchCamera")
      ).not.toBeInTheDocument();
    });
  });

  it("cycles through cameras when switch button is clicked", async () => {
    const devices = [
      { deviceId: "1", label: "Back Camera" },
      { deviceId: "2", label: "Front Camera" },
    ];
    mockListVideoInputDevices.mockResolvedValue(devices);

    renderWithTheme(<InventoryScanner {...defaultProps} />);

    const switchButton = await screen.findByTitle(
      "inventory.scanner.switchCamera"
    );

    // Initial call (after listVideoInputDevices)
    await waitFor(() => {
      expect(mockDecodeFromVideoDevice).toHaveBeenCalledWith(
        "1",
        expect.anything(),
        expect.anything()
      );
    });

    fireEvent.click(switchButton);

    await waitFor(
      () => {
        expect(mockReset).toHaveBeenCalled();
        const lastCall =
          mockDecodeFromVideoDevice.mock.calls[
            mockDecodeFromVideoDevice.mock.calls.length - 1
          ];
        expect(lastCall[0]).toBe("2");
      },
      { timeout: 3000 }
    );
  });
});
