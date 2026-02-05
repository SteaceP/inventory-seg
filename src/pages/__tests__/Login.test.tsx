import React from "react";

import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  createMockTranslation,
  createMockUserContext,
  createMockErrorHandler,
  createMockPerformance,
} from "@test/mocks";
import { render, screen, fireEvent, waitFor } from "@test/test-utils";

import Login from "../Login";

// Mock Supabase
const mockSignInWithPassword = vi.fn();
vi.mock("@supabaseClient", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) =>
        mockSignInWithPassword(...args) as Promise<unknown>,
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

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form correctly", () => {
    render(<Login />);

    expect(screen.getByLabelText(/login.email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/login.password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login.signIn/i })
    ).toBeInTheDocument();
  });

  it("updates input fields", () => {
    render(<Login />);

    const emailInput = screen.getByLabelText(/login.email/i);
    const passwordInput = screen.getByLabelText(/login.password/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("handles successful login", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { session: { user: { id: "test" } } },
      error: null,
    });
    render(<Login />);

    fireEvent.change(screen.getByLabelText(/login.email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/login.password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login.signIn/i }));

    await waitFor(() => {
      expect(measureOperation).toHaveBeenCalledWith(
        "auth.login",
        "Sign In with Password",
        expect.any(Function)
      );
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: {
          captchaToken: undefined,
        },
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("handles successful login with captcha", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { session: { user: { id: "test" } } },
      error: null,
    });
    render(<Login />);

    fireEvent.change(screen.getByLabelText(/login.email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/login.password/i), {
      target: { value: "password123" },
    });

    // Simulate Turnstile success
    fireEvent.click(screen.getByTestId("turnstile-mock"));

    fireEvent.click(screen.getByRole("button", { name: /login.signIn/i }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: {
          captchaToken: "test-token",
        },
      });
    });
  });

  it("handles failed login", async () => {
    const error = { message: "Invalid credentials", status: 400 };
    mockSignInWithPassword.mockResolvedValueOnce({
      error,
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText(/login.email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/login.password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login.signIn/i }));

    await waitFor(() => {
      expect(handleError).toHaveBeenCalledWith(
        error,
        "errors.login",
        expect.any(Object)
      );
    });
  });

  it("toggles password visibility", () => {
    render(<Login />);

    const passwordInput = screen.getByLabelText(/login.password/i);
    const toggleButton = screen.getByLabelText(/common.togglePassword/i);

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
    render(<Login />);

    const frButton = screen.getByRole("button", { name: /FR/i });
    fireEvent.click(frButton);

    expect(mockSetLanguage).toHaveBeenCalledWith("fr");
  });
});
