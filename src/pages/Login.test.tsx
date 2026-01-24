import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./Login";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mocks
const mockSignInWithPassword = vi.fn();
const mockSetLanguage = vi.fn();
const mockNavigate = vi.fn();
const mockLocation = { state: null };

vi.mock("../supabaseClient", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) =>
        mockSignInWithPassword(...args) as Promise<unknown>,
    },
  },
}));

vi.mock("../contexts/UserContext", () => ({
  useUserContext: () => ({
    language: "en",
    setLanguage: mockSetLanguage,
  }),
}));

vi.mock("../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

const renderWithProviders = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <BrowserRouter>{ui}</BrowserRouter>
    </ThemeProvider>
  );
};

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form correctly", () => {
    renderWithProviders(<Login />);

    expect(screen.getByLabelText(/login.email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/login.password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login.signIn/i })
    ).toBeInTheDocument();
  });

  it("updates input fields", () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText(/login.email/i);
    const passwordInput = screen.getByLabelText(/login.password/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("handles successful login", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: null });
    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/login.email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/login.password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login.signIn/i }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("handles failed login", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { message: "Invalid credentials" },
    });

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/login.email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/login.password/i), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login.signIn/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("toggles password visibility", () => {
    renderWithProviders(<Login />);

    const passwordInput = screen.getByLabelText(/login.password/i);
    const toggleButton = screen.getByLabelText(
      /basculer la visibilité du mot de passe/i
    );

    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(toggleButton);
    expect(screen.getByLabelText(/login.password/i)).toHaveAttribute(
      "type",
      "text"
    );

    fireEvent.click(toggleButton);
    expect(screen.getByLabelText(/login.password/i)).toHaveAttribute(
      "type",
      "password"
    );
  });

  it("changes language", () => {
    renderWithProviders(<Login />);

    const frButton = screen.getByRole("button", { name: /FR/i });
    fireEvent.click(frButton);

    expect(mockSetLanguage).toHaveBeenCalledWith("fr");
  });
});
