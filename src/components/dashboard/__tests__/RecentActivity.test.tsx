import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RecentActivity from "../RecentActivity";
import type { RecentActivityItem } from "../../../types/activity";

// Mock translation hook
const mockT = vi.fn((key: string) => key);
const mockLang = { value: "en" };

vi.mock("../../../i18n", () => ({
  useTranslation: () => ({
    t: mockT,
    lang: mockLang.value,
  }),
}));

describe("RecentActivity", () => {
  const mockActivities: RecentActivityItem[] = [
    {
      id: "1",
      action: "created",
      item_name: "Drill",
      user_display_name: "Alice",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      action: "updated",
      item_name: "Hammer",
      user_display_name: undefined,
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    },
    {
      id: "3",
      action: "deleted",
      item_name: "Screwdriver",
      user_display_name: "Bob",
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
  ];

  it("should render title and empty message when no activities", () => {
    render(<RecentActivity activities={[]} />);
    expect(screen.getByText("recentActivity.title")).toBeInTheDocument();
    expect(screen.getByText("recentActivity.none")).toBeInTheDocument();
  });

  it("should render activities with correct icons and text", () => {
    mockLang.value = "en";
    render(<RecentActivity activities={mockActivities} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Drill")).toBeInTheDocument();
    expect(screen.getByTestId("AddIcon")).toBeInTheDocument();

    expect(
      screen.getByText(/recentActivity.action.created/)
    ).toBeInTheDocument();

    expect(screen.getByText("recentActivity.user")).toBeInTheDocument();
    expect(screen.getByText("Hammer")).toBeInTheDocument();
    expect(screen.getByTestId("EditIcon")).toBeInTheDocument();

    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Screwdriver")).toBeInTheDocument();
    expect(screen.getByTestId("DeleteIcon")).toBeInTheDocument();
  });

  it("should show correct time ago text", () => {
    mockLang.value = "en";
    render(<RecentActivity activities={mockActivities} />);

    expect(screen.getByText("a few seconds ago")).toBeInTheDocument();
    expect(screen.getByText("1 hour ago")).toBeInTheDocument();
    expect(screen.getByText("1 day ago")).toBeInTheDocument();
  });

  it("should handle French translation rules", () => {
    mockLang.value = "fr";
    mockT.mockImplementation((key) => {
      if (key === "recentActivity.action.created") return "créé";
      return key;
    });

    render(<RecentActivity activities={[mockActivities[0]]} />);

    expect(screen.getByText(/a créé/)).toBeInTheDocument();
    expect(screen.getByText("il y a quelques secondes")).toBeInTheDocument();
  });
});
