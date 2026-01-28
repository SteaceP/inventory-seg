import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import LowStockAlert from "../LowStockAlert";

// Mock translation hook
vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LowStockAlert", () => {
  const mockItems = [
    { id: "1", name: "Item 1", stock: 2 },
    { id: "2", name: "Item 2", stock: 0 },
    { id: "3", name: "Item 3", stock: 5 },
  ];

  it("should return null when no items are provided", () => {
    const { container } = render(
      <BrowserRouter>
        <LowStockAlert items={[]} />
      </BrowserRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render all low stock items", () => {
    render(
      <BrowserRouter>
        <LowStockAlert items={mockItems} />
      </BrowserRouter>
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });

  it("should display stock count for each item", () => {
    render(
      <BrowserRouter>
        <LowStockAlert items={mockItems} />
      </BrowserRouter>
    );

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("should navigate to inventory page with lowStock filter when View All is clicked", () => {
    render(
      <BrowserRouter>
        <LowStockAlert items={mockItems} />
      </BrowserRouter>
    );

    const viewAllButton = screen.getByText("dashboard.lowStock.viewAll");
    fireEvent.click(viewAllButton);

    expect(mockNavigate).toHaveBeenCalledWith("/inventory?filter=lowStock");
  });
});
