import { useState, useMemo } from "react";

import { useSearchParams } from "react-router-dom";

import type { InventoryItem, InventoryCategory } from "@/types/inventory";

interface UseInventoryFilterProps {
  items: InventoryItem[];
  categories: InventoryCategory[];
  globalThreshold: number;
}

export const useInventoryFilter = ({
  items,
  categories,
  globalThreshold,
}: UseInventoryFilterProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Read filter state directly from URL params
  const filterParam = searchParams.get("filter");
  const isLowStockFilter = filterParam === "lowStock";

  const toggleLowStockFilter = () => {
    const newValue = !isLowStockFilter;
    if (newValue) {
      setSearchParams({ filter: "lowStock" });
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("filter");
      setSearchParams(newParams);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        (item.sku && item.sku.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query));

      if (selectedCategory && item.category !== selectedCategory) {
        return false;
      }

      const categoryThreshold = categories.find(
        (c) => c.name === item.category
      )?.low_stock_threshold;

      const effectiveThreshold =
        item.low_stock_threshold ?? categoryThreshold ?? globalThreshold;

      if (filterParam === "lowStock") {
        return (
          matchesSearch &&
          (item.stock || 0) <= effectiveThreshold &&
          (item.stock || 0) > 0
        );
      }

      if (filterParam === "outOfStock") {
        return matchesSearch && (item.stock || 0) === 0;
      }

      return matchesSearch;
    });
  }, [
    items,
    searchQuery,
    selectedCategory,
    filterParam,
    categories,
    globalThreshold,
  ]);

  return {
    searchQuery,
    setSearchQuery,
    isLowStockFilter,
    toggleLowStockFilter,
    selectedCategory,
    setSelectedCategory,
    filteredItems,
  };
};
