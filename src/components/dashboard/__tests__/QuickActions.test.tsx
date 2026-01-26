import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import QuickActions from "../QuickActions";

// Mock translation hook
const mockT = vi.fn((key: string) => key);

vi.mock("../../../i18n", () => ({
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
vi.mock("../../../hooks/useScrollIndicators", () => ({
  useScrollIndicators: (isMobile: boolean) => ({
    showLeft: isMobile,
    showRight: isMobile,
    handleScroll: vi.fn(),
    scrollRef: { current: null },
  }),
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe("QuickActions", () => {
  it("renders all action cards correctly", () => {
    renderWithRouter(<QuickActions />);

    expect(screen.getByText("inventory.addButton")).toBeInTheDocument();
    expect(screen.getByText("inventory.scan")).toBeInTheDocument();
  });

  it("navigates to correct routes when clicked", () => {
    renderWithRouter(<QuickActions />);

    fireEvent.click(screen.getByText("inventory.addButton"));
    expect(mockNavigate).toHaveBeenCalledWith("/inventory?action=add");

    fireEvent.click(screen.getByText("inventory.scan"));
    expect(mockNavigate).toHaveBeenCalledWith("/inventory?action=scan");
  });

  it("hides title on small screens", () => {
    // Mock useMediaQuery to return true
    vi.mock("@mui/material", async () => {
      const actual = await vi.importActual("@mui/material");
      return {
        ...actual,
        useMediaQuery: () => true,
        useTheme: () => ({
          palette: { mode: "light" },
          breakpoints: { down: () => true },
        }),
      };
    });

    renderWithRouter(<QuickActions />);
    expect(
      screen.queryByText("dashboard.quickActions")
    ).not.toBeInTheDocument();
  });
});
