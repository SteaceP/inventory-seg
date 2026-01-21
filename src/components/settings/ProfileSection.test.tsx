import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ProfileSection from "./ProfileSection";

// Mock translation hook
vi.mock("../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("ProfileSection", () => {
  const defaultProps = {
    displayName: "John Doe",
    avatarUrl: "",
    email: "john@example.com",
    onDisplayNameChange: vi.fn(),
    onAvatarChange: vi.fn(),
  };

  it("should render profile information correctly", () => {
    render(<ProfileSection {...defaultProps} />);

    expect(screen.getByText(/profile.title/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();

    // Check initials in Avatar (when no avatarUrl provided)
    expect(screen.getByText(/JO/i)).toBeInTheDocument();
  });

  it("should render initials from email if name is missing", () => {
    render(
      <ProfileSection
        {...defaultProps}
        displayName=""
        email="alice@example.com"
      />
    );
    expect(screen.getByText(/AL/i)).toBeInTheDocument();
  });

  it("should call onDisplayNameChange when text is entered", () => {
    render(<ProfileSection {...defaultProps} />);

    const input = screen.getByLabelText(/profile.displayName/i);
    fireEvent.change(input, { target: { value: "Jane Doe" } });

    expect(defaultProps.onDisplayNameChange).toHaveBeenCalledWith("Jane Doe");
  });

  it("should trigger file input when avatar is clicked", () => {
    render(<ProfileSection {...defaultProps} />);

    const avatarContainer = screen.getByTestId("avatar-container");
    fireEvent.click(avatarContainer);

    const fileInput = screen.getByTestId("avatar-input");
    const file = new File(["test"], "test.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(defaultProps.onAvatarChange).toHaveBeenCalledWith(file);
  });
});
