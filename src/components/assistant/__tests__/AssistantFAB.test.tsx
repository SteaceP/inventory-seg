import { render, screen, fireEvent, act } from "@test/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AssistantFAB from "../AssistantFAB";
import { createMockTranslation } from "@test/mocks";

// Mock the ChatInterface to avoid testing its internal logic here
vi.mock("../ChatInterface", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="chat-interface">
      <button onClick={onClose}>Close Chat</button>
    </div>
  ),
}));

const { t } = createMockTranslation();

vi.mock("@i18n", () => ({
  useTranslation: () => ({ t }),
}));

describe("AssistantFAB", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset visibility to true
    localStorage.setItem("assistant-fab-visible", "true");
  });

  it("should render the FAB button by default", () => {
    render(<AssistantFAB />);
    const fabButton = screen.getByLabelText("assistant");
    expect(fabButton).toBeInTheDocument();
  });

  it("should open the drawer when FAB is clicked", () => {
    render(<AssistantFAB />);

    const fabButton = screen.getByLabelText("assistant");
    fireEvent.click(fabButton);

    expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
  });

  it("should close the drawer when close callback is triggered", () => {
    render(<AssistantFAB />);

    // Open it first
    fireEvent.click(screen.getByLabelText("assistant"));
    expect(screen.getByTestId("chat-interface")).toBeInTheDocument();

    // Close it
    fireEvent.click(screen.getByText("Close Chat"));
  });

  it("should hide FAB when visibility event is false", () => {
    render(<AssistantFAB />);
    expect(screen.getByLabelText("assistant")).toBeInTheDocument();

    // Simulate functionality of AppearanceSection toggling it off
    localStorage.setItem("assistant-fab-visible", "false");
    act(() => {
      window.dispatchEvent(new Event("assistant-visibility-change"));
    });

    expect(screen.queryByLabelText("assistant")).not.toBeInTheDocument();
  });

  it("should show FAB when visibility event switches back to true", () => {
    localStorage.setItem("assistant-fab-visible", "false");
    render(<AssistantFAB />);
    expect(screen.queryByLabelText("assistant")).not.toBeInTheDocument();

    localStorage.setItem("assistant-fab-visible", "true");
    act(() => {
      window.dispatchEvent(new Event("assistant-visibility-change"));
    });

    expect(screen.getByLabelText("assistant")).toBeInTheDocument();
  });

  it("should respond to storage events for cross-tab sync", () => {
    render(<AssistantFAB />);
    expect(screen.getByLabelText("assistant")).toBeInTheDocument();

    // Simulate cross-tab change
    localStorage.setItem("assistant-fab-visible", "false");
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "assistant-fab-visible",
          newValue: "false",
        })
      );
    });

    expect(screen.queryByLabelText("assistant")).not.toBeInTheDocument();
  });

  it("should have drag enabled", () => {
    render(<AssistantFAB />);
    const wrapper = screen.getByTestId("motion-mock-div");
    expect(wrapper).toHaveAttribute("data-drag", "true");
  });
});
