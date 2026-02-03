import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@test/test-utils";
import Signup from "../Signup";
import {
  createMockTranslation,
  createMockUserContext,
  createMockErrorHandler,
  createMockPerformance,
} from "@test/mocks";
const mockSignUp = vi.fn();
vi.mock("@supabaseClient", () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args) as Promise<unknown>,
    },
  },
}));

// Mock UserContext
const mockSetLanguage = vi.fn();
const mockUser = createMockUserContext({
  language: "en",
});
mockUser.setLanguage = mockSetLanguage;

vi.mock("@contexts/UserContext", () => ({
  useUserContext: () => mockUser,
}));

// Mock i18n
const { t } = createMockTranslation();
vi.mock("@i18n", () => ({
  useTranslation: () => ({ t }),
}));

// Mock hooks
const { handleError } = createMockErrorHandler();
const { measureOperation } = createMockPerformance();

vi.mock("@hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({ handleError }),
}));

vi.mock("@hooks/usePerformance", () => ({
  usePerformance: () => ({ measureOperation }),
}));

// Mock router
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: {} }),
  };
});

// Mock Turnstile
vi.mock("@marsidev/react-turnstile", () => ({
  Turnstile: ({
    onSuccess,
    ref,
  }: {
    onSuccess: (token: string) => void;
    ref?: React.Ref<{ reset: () => void }>;
  }) => {
    React.useImperativeHandle(ref, () => ({
      reset: vi.fn(),
    }));
    return (
      <button
        type="button"
        data-testid="turnstile-mock"
        onClick={() => onSuccess("test-token")}
      >
        Mock Turnstile
      </button>
    );
  },
}));

describe("Signup Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders signup form correctly", () => {
    render(<Signup />);

    expect(screen.getByLabelText(/signup.displayName/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/signup.email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/signup.password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /signup.createAccount/i })
    ).toBeInTheDocument();
  });

  it("updates input fields", () => {
    render(<Signup />);

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
    render(<Signup />);

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
      expect(handleError).toHaveBeenCalledWith(
        expect.any(Error),
        "signup.invalidDomain",
        expect.any(Object)
      );
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("handles successful signup", async () => {
    mockSignUp.mockResolvedValueOnce({ error: null });
    render(<Signup />);

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
      expect(measureOperation).toHaveBeenCalledWith(
        "auth.signup",
        "Sign Up with Password",
        expect.any(Function)
      );
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "test@s-e-g.ca",
        password: "password123",
        options: {
          captchaToken: undefined,
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
    const error = { message: "User already registered", status: 422 };
    mockSignUp.mockResolvedValueOnce({
      error,
    });

    render(<Signup />);

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
      expect(handleError).toHaveBeenCalledWith(
        error,
        "errors.signup",
        expect.any(Object)
      );
    });
  });

  it("toggles password visibility", () => {
    render(<Signup />);

    const passwordInput = screen.getByLabelText(/signup.password/i);
    const toggleButton = screen.getByLabelText(/common.togglePassword/i);

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
    render(<Signup />);

    const frButton = screen.getByRole("button", { name: /FR/i });
    fireEvent.click(frButton);

    expect(mockSetLanguage).toHaveBeenCalledWith("fr");
  });
});
