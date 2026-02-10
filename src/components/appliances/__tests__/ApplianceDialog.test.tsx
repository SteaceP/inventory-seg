import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { ThemeProvider, createTheme } from "@mui/material/styles";

import { mockSupabaseClient, setupCryptoUtilsMock } from "@test/mocks";
import { generateSecureId } from "@utils/crypto";

import ApplianceDialog from "../ApplianceDialog/ApplianceDialog";

// Mock Translation
vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Error Handler
vi.mock("@hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
  }),
}));

// Setup Crypto Mock
setupCryptoUtilsMock();

const theme = createTheme();

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("ApplianceDialog", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    initialData: {},
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.helpers.setStorageUploadSuccess("image.jpg");
  });

  it("renders correctly in add mode", () => {
    renderWithTheme(<ApplianceDialog {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: "appliances.add" })
    ).toBeInTheDocument();
    expect(screen.getByText("appliances.addPhoto")).toBeInTheDocument();
  });

  it("renders correctly in edit mode", () => {
    renderWithTheme(
      <ApplianceDialog
        {...defaultProps}
        initialData={{ id: "123", name: "Fridge" }}
      />
    );
    expect(screen.getByText("appliances.edit")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Fridge")).toBeInTheDocument();
  });

  it("calls onSave with form data", async () => {
    renderWithTheme(<ApplianceDialog {...defaultProps} />);

    fireEvent.change(screen.getByLabelText("appliances.nameLabel"), {
      target: { value: "New Appliance" },
    });
    fireEvent.change(screen.getByLabelText("appliances.brand"), {
      target: { value: "Samsung" },
    });

    // Use getByRole button to avoid ambiguity
    fireEvent.click(screen.getByRole("button", { name: "appliances.add" }));

    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Appliance",
          brand: "Samsung",
        })
      );
    });
  });

  it("generates SKU when button is clicked", async () => {
    renderWithTheme(<ApplianceDialog {...defaultProps} />);
    const generateButton = screen.getByTitle("appliances.generateSku");
    fireEvent.click(generateButton);

    expect(generateSecureId).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByDisplayValue("APP-12345")).toBeInTheDocument();
    });
  });

  it("handles image upload", async () => {
    renderWithTheme(<ApplianceDialog {...defaultProps} />);

    const file = new File(["dummy content"], "example.png", {
      type: "image/png",
    });
    // Input might be hidden, selecting by type is reliable if unique
    const fileInput = document.querySelector('input[type="file"]');

    if (!fileInput) throw new Error("File input not found");

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      // Check if upload was initiated
      // mockSupabaseClient.client.storage.from() is mocked to return the storage mock object
      // which has upload method.
      // But the test called `supabase.storage.from("...").upload(...)`
      // mockSupabaseClient makes `from` return a mock object that has `upload`.
      // The `mockSupabaseClient.mocks.upload` is that upload function.
      expect(mockSupabaseClient.mocks.upload).toHaveBeenCalled();
    });
  });
});
