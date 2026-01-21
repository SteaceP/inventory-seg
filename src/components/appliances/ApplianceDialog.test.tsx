import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ApplianceDialog from "./ApplianceDialog";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mock Translation
vi.mock("../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Error Handler
vi.mock("../../hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
  }),
}));

// Mock Supabase
const { mockFrom, mockUpload } = vi.hoisted(() => {
  const mockUpload = vi.fn().mockResolvedValue({ error: null });
  const mockGetPublicUrl = vi
    .fn()
    .mockReturnValue({ data: { publicUrl: "http://example.com/image.jpg" } });
  const mockFrom = vi.fn(() => ({
    upload: mockUpload,
    getPublicUrl: mockGetPublicUrl,
  }));
  return { mockFrom, mockUpload, mockGetPublicUrl };
});

vi.mock("../../supabaseClient", () => ({
  supabase: {
    storage: {
      from: mockFrom,
    },
  },
}));

// Mock Utils
vi.mock("../../utils/crypto", () => ({
  validateImageFile: vi.fn(),
  generateSecureFileName: vi.fn().mockReturnValue("secure-name.jpg"),
  generateSecureId: vi.fn().mockReturnValue("APP-12345"),
  getExtensionFromMimeType: vi.fn().mockReturnValue("jpg"),
}));

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

  it("generates SKU when button is clicked", () => {
    renderWithTheme(<ApplianceDialog {...defaultProps} />);
    const generateButton = screen.getByTitle("appliances.generateSku");
    fireEvent.click(generateButton);
    expect(screen.getByDisplayValue("APP-12345")).toBeInTheDocument();
  });

  it.skip("handles image upload", async () => {
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
      expect(mockFrom).toHaveBeenCalledWith("appliance-images");
      expect(mockUpload).toHaveBeenCalled();
    });
  });
});
