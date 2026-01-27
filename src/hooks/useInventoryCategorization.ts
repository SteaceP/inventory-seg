import { useMemo, useState } from "react";
import type { InventoryItem } from "@/types/inventory";
import { useTranslation } from "@/i18n";

export function useInventoryCategorization(items: InventoryItem[]) {
  const { t } = useTranslation();

  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    () => {
      const allCategories = new Set<string>();
      items.forEach((item) => {
        const cat =
          item.category || t("inventory.uncategorized") || "Uncategorized";
        allCategories.add(cat);
      });
      return allCategories;
    }
  );

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const groupedItems = useMemo(() => {
    const groups: Record<string, InventoryItem[]> = {};
    items.forEach((item) => {
      const cat =
        item.category || t("inventory.uncategorized") || "Uncategorized";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    return Object.keys(groups)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name));
          return acc;
        },
        {} as Record<string, InventoryItem[]>
      );
  }, [items, t]);

  const sortedCategories = useMemo(
    () => Object.keys(groupedItems),
    [groupedItems]
  );

  return {
    groupedItems,
    sortedCategories,
    collapsedCategories,
    toggleCategory,
  };
}
