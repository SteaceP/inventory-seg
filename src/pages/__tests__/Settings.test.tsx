import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import Settings from "../Settings";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mocks
const mockSetLanguage = vi.fn();
const mockSetUserProfile = vi.fn();
const mockUpdateUser = vi.fn();
const mockUpsert = vi.fn();
const mockGetUser = vi.fn();
const mockSelect = vi.fn();

vi.mock("@contexts/UserContext", () => ({
  useUserContext: () => ({
    displayName: "Test User",
    avatarUrl: "https://example.com/avatar.jpg",
    language: "en",
    setLanguage: mockSetLanguage,
    setUserProfile: mockSetUserProfile,
    darkMode: false,
    compactView: false,
  }),
}));

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args) as Promise<unknown>,
      updateUser: (...args: unknown[]) =>
        mockUpdateUser(...args) as Promise<unknown>,
      signOut: vi.fn(),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: (...args: unknown[]) =>
            mockSelect(...args) as Promise<unknown>,
        }),
      }),
      upsert: (...args: unknown[]) => mockUpsert(...args) as Promise<unknown>,
    }),
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "https://new-avatar.com" } }),
      }),
    },
  },
}));

vi.mock("@utils/crypto", () => ({
  validateImageFile: vi.fn(),
  generateSecureFileName: () => "secure_filename.jpg",
  getExtensionFromMimeType: () => "jpg",
}));

vi.mock("@hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
  }),
}));

// Mock child components
vi.mock("@components/settings/ProfileSection", () => ({
  default: () => <div data-testid="profile-section">Profile Section</div>,
}));
vi.mock("@components/settings/NotificationSection", () => ({
  default: () => (
    <div data-testid="notification-section">Notification Section</div>
  ),
}));
vi.mock("@components/settings/AppearanceSection", () => ({
  default: () => <div data-testid="appearance-section">Appearance Section</div>,
}));
vi.mock("@components/settings/SecuritySection", () => ({
  default: () => <div data-testid="security-section">Security Section</div>,
}));

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const renderWithProviders = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe("Settings Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user123", email: "test@example.com" } },
    });
    mockSelect.mockResolvedValue({
      data: { email_alerts: true, low_stock_threshold: 10 },
    });
    mockUpsert.mockResolvedValue({ error: null });
  });

  it("renders all setting sections", async () => {
    renderWithProviders(<Settings />);

    expect(screen.getByText("settings.title")).toBeInTheDocument();
    expect(screen.getByTestId("profile-section")).toBeInTheDocument();
    expect(screen.getByTestId("notification-section")).toBeInTheDocument();
    expect(screen.getByTestId("appearance-section")).toBeInTheDocument();
    expect(screen.getByTestId("security-section")).toBeInTheDocument();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  it("renders save button", async () => {
    renderWithProviders(<Settings />);
    expect(
      screen.getByRole("button", { name: /settings.save/i })
    ).toBeInTheDocument();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  it("loads user data on mount", async () => {
    renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockGetUser).toHaveBeenCalled();
    });
  });
});
