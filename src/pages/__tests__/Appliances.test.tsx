import { describe, it, expect, vi, beforeEach } from "vitest";

import type { Appliance } from "@/types/appliances";

import { render, screen, waitFor } from "@test/test-utils";

import Appliances from "../Appliances";

// Mock dependencies
vi.mock("@hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
  }),
}));

vi.mock("@contexts/UserContextDefinition", () => ({
  useUserContext: () => ({
    compactView: false,
    role: "admin",
  }),
}));

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock components
vi.mock("@components/appliances/AppliancesHeader", () => ({
  default: () => <div data-testid="appliances-header">Header</div>,
}));

vi.mock("@components/appliances/ApplianceCard", () => ({
  default: ({ appliance }: { appliance: Appliance }) => (
    <div data-testid="appliance-card">{appliance.name}</div>
  ),
}));

vi.mock("@components/appliances/AppliancesStats", () => ({
  default: () => <div data-testid="appliances-stats">Stats</div>,
}));

// Mock Supabase
const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  order: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock("@supabaseClient", () => ({
  supabase: {
    from: mocks.from,
    auth: {
      getUser: mocks.getUser,
    },
  },
}));

describe("Appliances Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getUser.mockResolvedValue({ data: { user: { id: "123" } } });

    mocks.from.mockReturnValue({
      select: mocks.select,
    });
    mocks.select.mockReturnValue({
      order: mocks.order,
    });

    // Default success response
    mocks.order.mockResolvedValue({
      data: [],
      error: null,
    });
  });

  const renderComponent = () => {
    render(<Appliances />);
  };

  it("renders headers and stats", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId("appliances-header")).toBeInTheDocument();
      expect(screen.getByTestId("appliances-stats")).toBeInTheDocument();
    });
  });

  it("fetches and displays appliances", async () => {
    const mockData = [
      { id: "1", name: "Dishwasher" },
      { id: "2", name: "Fridge" },
    ];

    mocks.order.mockResolvedValue({
      data: mockData,
      error: null,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Dishwasher")).toBeInTheDocument();
      expect(screen.getByText("Fridge")).toBeInTheDocument();
    });
  });

  it("handles loading state", () => {
    // Make promise not resolve immediately to show loading
    mocks.order.mockReturnValue(new Promise(() => {}));

    renderComponent();

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows empty state when no appliances", async () => {
    mocks.order.mockResolvedValue({
      data: [],
      error: null,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("appliances.empty")).toBeInTheDocument();
    });
  });
});
