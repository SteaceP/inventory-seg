/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { supabase } from "@/supabaseClient";
import { createMockUserContext } from "@/test/mocks/contexts";

import { fireEvent, render, screen, waitFor } from "@test/test-utils";

import TwoFactorSettings from "../TwoFactorSettings";

// Hoisted mocks to ensure they are available in vi.mock
const { mockUseUserContext, mockSetMfaEnabled } = vi.hoisted(() => ({
  mockUseUserContext: vi.fn(),
  mockSetMfaEnabled: vi.fn(),
}));

const mockHandleError = vi.fn();

// Mock i18n relative path to ensure it catches the import
vi.mock("../../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@contexts/UserContextDefinition", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@contexts/UserContextDefinition")>();
  return {
    ...actual,
    useUserContext: mockUseUserContext,
  };
});

vi.mock("@hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
  }),
}));

vi.mock("../TwoFactorEnrollment", () => ({
  default: ({
    open,
    onClose,
    onSuccess,
  }: {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
  }) =>
    open ? (
      <div data-testid="enrollment-dialog">
        <button onClick={onClose}>Close Enrollment</button>
        <button onClick={onSuccess}>Success Enrollment</button>
      </div>
    ) : null,
}));

// Mock Supabase
vi.mock("@/supabaseClient", () => ({
  supabase: {
    auth: {
      mfa: {
        listFactors: vi.fn(),
        unenroll: vi.fn(),
      },
    },
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null })),
      })),
    })),
  },
}));

describe("TwoFactorSettings Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserContext.mockReturnValue(
      createMockUserContext({
        mfaEnabled: false,
        setMfaEnabled: mockSetMfaEnabled,
        userId: "test-user-id",
      })
    );
  });

  it("should render enable button when MFA is disabled", () => {
    render(<TwoFactorSettings />);
    expect(screen.getByText("mfa.enable")).toBeInTheDocument();
  });

  it("should open enrollment dialog when enable button is clicked", () => {
    render(<TwoFactorSettings />);
    fireEvent.click(screen.getByText("mfa.enable"));
    expect(screen.getByTestId("enrollment-dialog")).toBeInTheDocument();
  });

  it("should enable MFA when enrollment succeeds", async () => {
    render(<TwoFactorSettings />);
    fireEvent.click(screen.getByText("mfa.enable"));
    fireEvent.click(screen.getByText("Success Enrollment"));

    expect(mockSetMfaEnabled).toHaveBeenCalledWith(true);
    await waitFor(() => {
      expect(screen.queryByTestId("enrollment-dialog")).not.toBeInTheDocument();
    });
  });

  it("should render disable button when MFA is enabled", () => {
    mockUseUserContext.mockReturnValue(
      createMockUserContext({
        mfaEnabled: true,
        setMfaEnabled: mockSetMfaEnabled,
        userId: "test-user-id",
      })
    );

    render(<TwoFactorSettings />);
    expect(screen.getByText("mfa.disable")).toBeInTheDocument();
    expect(screen.getByText("mfa.currentlyEnabled")).toBeInTheDocument();
  });

  it("should open disable confirmation dialog", () => {
    mockUseUserContext.mockReturnValue(
      createMockUserContext({
        mfaEnabled: true,
        setMfaEnabled: mockSetMfaEnabled,
        userId: "test-user-id",
      })
    );

    render(<TwoFactorSettings />);
    fireEvent.click(screen.getByText("mfa.disable"));

    expect(screen.getByText("mfa.confirmDisable")).toBeInTheDocument();
  });

  it("should call unenroll and update settings when disabling MFA", async () => {
    mockUseUserContext.mockReturnValue(
      createMockUserContext({
        mfaEnabled: true,
        setMfaEnabled: mockSetMfaEnabled,
        userId: "test-user-id",
      })
    );

    // Mock factors list
    const factors = { totp: [{ id: "factor-1" }] };
    vi.mocked(supabase.auth.mfa.listFactors).mockResolvedValue({
      data: factors,
      error: null,
    } as any);
    vi.mocked(supabase.auth.mfa.unenroll).mockResolvedValue({
      error: null,
    } as any);

    render(<TwoFactorSettings />);
    fireEvent.click(screen.getByText("mfa.disable"));

    // Click confirm in dialog (the second "Disable" button)
    const disableButtons = screen.getAllByText("mfa.disable");
    // The dialog button causes the action
    fireEvent.click(disableButtons[1]);

    await waitFor(() => {
      expect(supabase.auth.mfa.listFactors).toHaveBeenCalled();
      expect(supabase.auth.mfa.unenroll).toHaveBeenCalledWith({
        factorId: "factor-1",
      });
      expect(mockSetMfaEnabled).toHaveBeenCalledWith(false);
    });
  });
});
