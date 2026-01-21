import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CategoryFilters from "./CategoryFilters";
import { ThemeProvider, createTheme } from "@mui/material";

// Mock translation hook
vi.mock("../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const theme = createTheme();

describe("CategoryFilters", () => {
  const mockCategories = [
    {
      name: "Tools",
      low_stock_threshold: 10,
      created_at: null,
      updated_at: null,
    },
    {
      name: "Electronics",
      low_stock_threshold: 5,
      created_at: null,
      updated_at: null,
    },
  ];

  const defaultProps = {
    categories: mockCategories,
    selectedCategory: null,
    onSelectCategory: vi.fn(),
  };

  it("should render All chip and category chips", () => {
    render(
      <ThemeProvider theme={theme}>
        <CategoryFilters {...defaultProps} />
      </ThemeProvider>
    );

    expect(screen.getByText("common.all")).toBeInTheDocument();
    expect(screen.getByText("Tools")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
  });

  it("should trigger onSelectCategory with null when All is clicked", () => {
    render(
      <ThemeProvider theme={theme}>
        <CategoryFilters {...defaultProps} />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText("common.all"));
    expect(defaultProps.onSelectCategory).toHaveBeenCalledWith(null);
  });

  it("should trigger onSelectCategory with category name when a category chip is clicked", () => {
    render(
      <ThemeProvider theme={theme}>
        <CategoryFilters {...defaultProps} />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText("Tools"));
    expect(defaultProps.onSelectCategory).toHaveBeenCalledWith("Tools");
  });

  it("should highlight the selected category", () => {
    const { rerender } = render(
      <ThemeProvider theme={theme}>
        <CategoryFilters {...defaultProps} selectedCategory="Tools" />
      </ThemeProvider>
    );

    const toolsChip = screen.getByText("Tools").closest(".MuiChip-root");
    const electronicsChip = screen
      .getByText("Electronics")
      .closest(".MuiChip-root");

    // Check implementation: Selected chip has a linear-gradient background (which is applied via sx)
    // In unit tests, we can check for specific styles if we want, but checking the prop is passed
    // and correctly rendered is usually enough.
    // However, the selected chip has 'none' border according to getChipStyles.
    expect(toolsChip).toHaveStyle("border: none");
    expect(electronicsChip).not.toHaveStyle("border: none");

    // Rerender with Electronics selected
    rerender(
      <ThemeProvider theme={theme}>
        <CategoryFilters {...defaultProps} selectedCategory="Electronics" />
      </ThemeProvider>
    );
    expect(electronicsChip).toHaveStyle("border: none");
    expect(toolsChip).not.toHaveStyle("border: none");
  });
});
