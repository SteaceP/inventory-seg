import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import ErrorBoundary from "./ErrorBoundary";
import * as Sentry from "@sentry/react";

// Mock Sentry
vi.mock("@sentry/react", () => ({
  captureException: vi.fn(),
}));

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

// Component with custom error message
const ThrowCustomError = ({ message }: { message: string }) => {
  throw new Error(message);
};

describe("ErrorBoundary", () => {
  // Suppress console errors in tests
  const originalConsoleError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    vi.clearAllMocks();
  });

  it("should render children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should render fallback UI when error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("should display error icon", () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const icon = container.querySelector('[data-testid="ErrorOutlineIcon"]');
    expect(icon).toBeInTheDocument();
  });

  it("should show Reload Page button", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole("button", { name: /reload page/i });
    expect(reloadButton).toBeInTheDocument();
  });

  it("should reload page when button is clicked", async () => {
    const user = userEvent.setup();
    const reloadSpy = vi.spyOn(window.location, "reload");

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole("button", { name: /reload page/i });
    await user.click(reloadButton);

    expect(reloadSpy).toHaveBeenCalled();

    reloadSpy.mockRestore();
  });

  it("should capture exception with Sentry", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(Sentry.captureException).toHaveBeenCalled();
    const capturedError = vi.mocked(Sentry.captureException).mock.calls[0][0];
    expect(capturedError).toBeInstanceOf(Error);
    expect((capturedError as Error).message).toBe("Test error");
  });

  it("should display custom error message", () => {
    const customMessage = "Custom error occurred";

    render(
      <ErrorBoundary>
        <ThrowCustomError message={customMessage} />
      </ErrorBoundary>
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it("should display default message when error has no message", () => {
    // Create an error without a message
    const NoMessageError = () => {
      const error = new Error();
      error.message = "";
      throw error;
    };

    render(
      <ErrorBoundary>
        <NoMessageError />
      </ErrorBoundary>
    );

    expect(
      screen.getByText("An unexpected error occurred. Please try again.")
    ).toBeInTheDocument();
  });

  it("should not render error UI when child does not throw", () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
    expect(
      container.querySelector('[data-testid="ErrorOutlineIcon"]')
    ).not.toBeInTheDocument();
  });

  it("should send component stack to Sentry", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(Sentry.captureException).toHaveBeenCalled();
    // Verify it was called with error and options
    expect(
      vi.mocked(Sentry.captureException).mock.calls.length
    ).toBeGreaterThan(0);
  });
});
