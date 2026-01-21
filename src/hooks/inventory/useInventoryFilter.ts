import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { InventoryItem, InventoryCategory } from "../../types/inventory";

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

  const [isLowStockFilter, setIsLowStockFilter] = useState(
    () => searchParams.get("filter") === "lowStock"
  );

  const toggleLowStockFilter = () => {
    const newValue = !isLowStockFilter;
    setIsLowStockFilter(newValue);
    if (newValue) {
      setSearchParams({ filter: "lowStock" });
    } else {
      searchParams.delete("filter");
      setSearchParams(searchParams);
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

      if (isLowStockFilter) {
        return (
          matchesSearch &&
          (item.stock || 0) <= effectiveThreshold &&
          (item.stock || 0) > 0
        );
      }

      if (searchParams.get("filter") === "outOfStock") {
        return matchesSearch && (item.stock || 0) === 0;
      }

      return matchesSearch;
    });
  }, [
    items,
    searchQuery,
    selectedCategory,
    isLowStockFilter,
    categories,
    globalThreshold,
    searchParams,
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
