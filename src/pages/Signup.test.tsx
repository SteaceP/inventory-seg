import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Signup from "./Signup";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mocks
const mockSignUp = vi.fn();
const mockSetLanguage = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../supabaseClient", () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args) as Promise<unknown>,
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
  };
});

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<"div">) => (
      <div {...props}>{children}</div>
    ),
  },
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <BrowserRouter>{ui}</BrowserRouter>
    </ThemeProvider>
  );
};

describe("Signup Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders signup form correctly", () => {
    renderWithProviders(<Signup />);

    expect(screen.getByLabelText(/signup.displayName/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/signup.email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/signup.password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /signup.createAccount/i })
    ).toBeInTheDocument();
  });

  it("updates input fields", () => {
    renderWithProviders(<Signup />);

    const nameInput = screen.getByLabelText(/signup.displayName/i);
    const emailInput = screen.getByLabelText(/signup.email/i);
    const passwordInput = screen.getByLabelText(/signup.password/i);

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "test@s-e-g.ca" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(nameInput).toHaveValue("John Doe");
    expect(emailInput).toHaveValue("test@s-e-g.ca");
    expect(passwordInput).toHaveValue("password123");
  });

  it("validates email domain", async () => {
    renderWithProviders(<Signup />);

    fireEvent.change(screen.getByLabelText(/signup.displayName/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/signup.email/i), {
      target: { value: "test@gmail.com" }, // Invalid domain
    });
    fireEvent.change(screen.getByLabelText(/signup.password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /signup.createAccount/i })
    );

    await waitFor(() => {
      expect(screen.getByText(/signup.invalidDomain/i)).toBeInTheDocument();
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("handles successful signup", async () => {
    mockSignUp.mockResolvedValueOnce({ error: null });
    renderWithProviders(<Signup />);

    fireEvent.change(screen.getByLabelText(/signup.displayName/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/signup.email/i), {
      target: { value: "test@s-e-g.ca" },
    });
    fireEvent.change(screen.getByLabelText(/signup.password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /signup.createAccount/i })
    );

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "test@s-e-g.ca",
        password: "password123",
        options: {
          data: {
            display_name: "John Doe",
            lang: expect.any(String) as string,
          },
        },
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/signup.success/i)).toBeInTheDocument();
    });

    const signInButton = screen.getByRole("button", { name: /login.signIn/i });
    fireEvent.click(signInButton);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("handles signup error", async () => {
    mockSignUp.mockResolvedValueOnce({
      error: { message: "User already registered" },
    });

    renderWithProviders(<Signup />);

    fireEvent.change(screen.getByLabelText(/signup.displayName/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/signup.email/i), {
      target: { value: "test@s-e-g.ca" },
    });
    fireEvent.change(screen.getByLabelText(/signup.password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /signup.createAccount/i })
    );

    await waitFor(() => {
      expect(screen.getByText("User already registered")).toBeInTheDocument();
    });
  });

  it("toggles password visibility", () => {
    renderWithProviders(<Signup />);

    const passwordInput = screen.getByLabelText(/signup.password/i);
    const toggleButton = screen.getByLabelText(
      /basculer la visibilité du mot de passe/i
    );

    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(toggleButton);
    expect(screen.getByLabelText(/signup.password/i)).toHaveAttribute(
      "type",
      "text"
    );

    fireEvent.click(toggleButton);
    expect(screen.getByLabelText(/signup.password/i)).toHaveAttribute(
      "type",
      "password"
    );
  });

  it("changes language", () => {
    renderWithProviders(<Signup />);

    const frButton = screen.getByRole("button", { name: /FR/i });
    fireEvent.click(frButton);

    expect(mockSetLanguage).toHaveBeenCalledWith("fr");
  });
});
