import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import OfflineFallback from "../OfflineFallback";

// Mock the i18n hook
vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "common.offline": "You're Offline",
        "common.offlineMessage":
          "Please check your internet connection and try again.",
        "common.retry": "Retry",
      };
      return translations[key] || key;
    },
  }),
}));

describe("OfflineFallback", () => {
  it("should render offline message", () => {
    render(<OfflineFallback />);

    expect(screen.getByText("You're Offline")).toBeInTheDocument();
    expect(
      screen.getByText("Please check your internet connection and try again.")
    ).toBeInTheDocument();
  });

  it("should render retry button", () => {
    render(<OfflineFallback />);

    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it("should reload page when retry button is clicked", async () => {
    const user = userEvent.setup();
    const reloadSpy = vi.spyOn(window.location, "reload");

    render(<OfflineFallback />);

    const retryButton = screen.getByRole("button", { name: /retry/i });
    await user.click(retryButton);

    expect(reloadSpy).toHaveBeenCalled();

    reloadSpy.mockRestore();
  });

  it("should display WiFi off icon", () => {
    const { container } = render(<OfflineFallback />);

    // MUI icons are rendered as SVGs with specific test IDs
    const icon = container.querySelector('[data-testid="WifiOffIcon"]');
    expect(icon).toBeInTheDocument();
  });

  it("should render inside a Paper component", () => {
    const { container } = render(<OfflineFallback />);

    const paper = container.querySelector(".MuiPaper-root");
    expect(paper).toBeInTheDocument();
  });

  it("should have centered layout", () => {
    const { container } = render(<OfflineFallback />);

    const mainBox = container.firstChild as HTMLElement;
    expect(mainBox).toHaveStyle({
      display: "flex",
      "flex-direction": "column",
      "align-items": "center",
      "justify-content": "center",
    });
  });
});
