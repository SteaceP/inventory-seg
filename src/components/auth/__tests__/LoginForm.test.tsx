import React, { useState } from "react";

import { describe, it, expect, vi } from "vitest";

import { render, screen, fireEvent } from "@test/test-utils";

import LoginForm, { type LoginFormProps } from "../LoginForm";

// Wrapper component to handle state for controlled inputs
const LoginFormWrapper = (props: Partial<LoginFormProps>) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const defaultProps: LoginFormProps = {
    email,
    onEmailChange: setEmail,
    password,
    onPasswordChange: setPassword,
    showPassword,
    onTogglePassword: () => setShowPassword(!showPassword),
    loading: false,
    captchaToken: undefined,
    onCaptchaSuccess: vi.fn(),
    onCaptchaError: vi.fn(),
    onCaptchaExpire: vi.fn(),
    turnstileRef: { current: null },
    turnstileSiteKey: "dummy-site-key",
    labels: {
      email: "Email Address",
      password: "Password",
      togglePassword: "Toggle password visibility",
      signIn: "Sign In",
      signingIn: "Signing In...",
      captchaError: "Captcha Error",
    },
    isDev: false,
    onSubmit: vi.fn((e: React.SyntheticEvent) => e.preventDefault()),
    ...props,
  };

  return <LoginForm {...defaultProps} />;
};

describe("LoginForm Component", () => {
  it("should render email and password fields", () => {
    render(<LoginFormWrapper />);

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Password/i, { selector: "input" })
    ).toBeInTheDocument();
  });

  it("should update inputs when typing", () => {
    render(<LoginFormWrapper />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput).toHaveValue("test@example.com");

    const passwordInput = screen.getByLabelText(/Password/i, {
      selector: "input",
    });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    expect(passwordInput).toHaveValue("password123");
  });

  it("should toggle password visibility", () => {
    render(<LoginFormWrapper />);

    const toggleButton = screen.getByLabelText(/Toggle password visibility/i);
    const passwordInput = screen.getByLabelText(/Password/i, {
      selector: "input",
    });

    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("should disable submit button when loading", () => {
    render(<LoginFormWrapper loading={true} />);

    const submitButton = screen.getByRole("button", { name: /Signing In.../i });
    expect(submitButton).toBeDisabled();
  });

  it("should disable submit button when captcha is missing and not in dev mode", () => {
    render(<LoginFormWrapper captchaToken={undefined} isDev={false} />);

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    expect(submitButton).toBeDisabled();
  });

  it("should enable submit button when captcha is present", () => {
    render(<LoginFormWrapper captchaToken="valid-token" isDev={false} />);

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    expect(submitButton).toBeEnabled();
  });

  it("should call onSubmit when form is submitted", () => {
    const handleSubmit = vi.fn((e: React.SyntheticEvent) => e.preventDefault());
    render(
      <LoginFormWrapper captchaToken="valid-token" onSubmit={handleSubmit} />
    );

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(
      screen.getByLabelText(/Password/i, { selector: "input" }),
      {
        target: { value: "password123" },
      }
    );

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    expect(submitButton).toBeEnabled();

    fireEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalled();
  });
});
