import { render, screen, fireEvent } from "@test/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import QuickActions from "../QuickActions";

// Mock translation hook
const mockT = vi.fn((key: string) => key);

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock hooks
vi.mock("@hooks/useScrollIndicators", () => ({
  useScrollIndicators: (isMobile: boolean) => ({
    showLeft: isMobile,
    showRight: isMobile,
    handleScroll: vi.fn(),
    scrollRef: { current: null },
  }),
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter, includeRouter: false });
};

const stubMatchMedia = (matches: boolean) => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
};

describe("QuickActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all action cards correctly", () => {
    stubMatchMedia(false);
    renderWithRouter(<QuickActions />);

    expect(screen.getByText("inventory.addButton")).toBeInTheDocument();
    expect(screen.getByText("inventory.scan")).toBeInTheDocument();
  });

  it("navigates to correct routes when clicked", () => {
    stubMatchMedia(false);
    renderWithRouter(<QuickActions />);

    fireEvent.click(screen.getByText("inventory.addButton"));
    expect(mockNavigate).toHaveBeenCalledWith("/inventory?action=add");

    fireEvent.click(screen.getByText("inventory.scan"));
    expect(mockNavigate).toHaveBeenCalledWith("/inventory?action=scan");
  });

  it("hides title on small screens", () => {
    stubMatchMedia(true);

    renderWithRouter(<QuickActions />);
    expect(
      screen.queryByText("dashboard.quickActions")
    ).not.toBeInTheDocument();
  });
});
