import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SecuritySection from "./SecuritySection";

// Mock hooks
const mockHandleError = vi.fn();
vi.mock("../../hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
  }),
}));

vi.mock("../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const defaultProps = {
  onSignOut: vi.fn(),
  onChangePassword: vi.fn(),
};

describe("SecuritySection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render security section buttons", () => {
    render(<SecuritySection {...defaultProps} />);

    expect(screen.getByText("security.title")).toBeInTheDocument();
    expect(screen.getByText("security.changePassword")).toBeInTheDocument();
    expect(screen.getByText("security.signOut")).toBeInTheDocument();
  });

  it("should call onSignOut when sign out button is clicked", () => {
    render(<SecuritySection {...defaultProps} />);

    fireEvent.click(screen.getByText("security.signOut"));
    expect(defaultProps.onSignOut).toHaveBeenCalled();
  });

  it("should open and close change password dialog", async () => {
    render(<SecuritySection {...defaultProps} />);

    fireEvent.click(screen.getByText("security.changePassword"));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByText("common.cancel"));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("should validate password length", async () => {
    render(<SecuritySection {...defaultProps} />);

    fireEvent.click(screen.getByText("security.changePassword"));

    const newPass = await screen.findByLabelText(/security.newPassword/i);
    const confirmPass = screen.getByLabelText(/security.confirmPassword/i);

    fireEvent.change(newPass, { target: { value: "123" } });
    fireEvent.change(confirmPass, { target: { value: "123" } });

    fireEvent.click(screen.getByText("common.save"));

    expect(
      await screen.findByText("security.passwordTooShort")
    ).toBeInTheDocument();
    expect(defaultProps.onChangePassword).not.toHaveBeenCalled();
  });

  it("should validate password mismatch", async () => {
    render(<SecuritySection {...defaultProps} />);

    fireEvent.click(screen.getByText("security.changePassword"));

    const newPass = await screen.findByLabelText(/security.newPassword/i);
    const confirmPass = screen.getByLabelText(/security.confirmPassword/i);

    fireEvent.change(newPass, { target: { value: "password123" } });
    fireEvent.change(confirmPass, { target: { value: "password456" } });

    fireEvent.click(screen.getByText("common.save"));

    expect(
      await screen.findByText("security.passwordsDoNotMatch")
    ).toBeInTheDocument();
  });

  it("should call onChangePassword and close dialog on success", async () => {
    defaultProps.onChangePassword.mockResolvedValueOnce(undefined);
    render(<SecuritySection {...defaultProps} />);

    fireEvent.click(screen.getByText("security.changePassword"));

    const newPass = await screen.findByLabelText(/security.newPassword/i);
    const confirmPass = screen.getByLabelText(/security.confirmPassword/i);

    fireEvent.change(newPass, { target: { value: "validpassword" } });
    fireEvent.change(confirmPass, { target: { value: "validpassword" } });

    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() => {
      expect(defaultProps.onChangePassword).toHaveBeenCalledWith(
        "validpassword"
      );
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("should handle error during password change", async () => {
    const error = new Error("Failed");
    defaultProps.onChangePassword.mockRejectedValueOnce(error);
    render(<SecuritySection {...defaultProps} />);

    fireEvent.click(screen.getByText("security.changePassword"));

    const newPass = await screen.findByLabelText(/security.newPassword/i);
    const confirmPass = screen.getByLabelText(/security.confirmPassword/i);

    fireEvent.change(newPass, { target: { value: "validpassword" } });
    fireEvent.change(confirmPass, { target: { value: "validpassword" } });

    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(
        error,
        "security.errorChangingPassword"
      );
    });
  });
});
