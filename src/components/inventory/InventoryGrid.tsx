import React, { useState, useEffect, useRef } from "react";
import { Grid, Box } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import type { InventoryItem } from "../../types/inventory";
import InventoryCard from "./InventoryCard";
import { useThemeContext } from "../../contexts/useThemeContext";

interface InventoryGridProps {
  items: InventoryItem[];
  selectedItems: Set<string>;
  onToggleItem: (id: string, checked: boolean) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
}

const InventoryGrid: React.FC<InventoryGridProps> = ({
  items,
  selectedItems,
  onToggleItem,
  onEdit,
  onDelete,
}) => {
  const { compactView } = useThemeContext();
  const PAGE_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset visible count when items list changes (e.g., new search)
  useEffect(() => {
    const id = setTimeout(() => setVisibleCount(PAGE_SIZE), 0);
    return () => clearTimeout(id);
  }, [items]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisibleCount((c) => Math.min(items.length, c + PAGE_SIZE));
          }
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [items.length]);

  const visibleItems = items.slice(0, visibleCount);

  return (
    <Grid container spacing={compactView ? 1 : 2}>
      <AnimatePresence>
        {visibleItems.map((item) => (
          <Grid
            size={{ xs: 12, sm: compactView ? 4 : 6, md: compactView ? 3 : 4 }}
            key={item.id}
          >
            <InventoryCard
              item={item}
              isSelected={selectedItems.has(item.id)}
              onToggle={onToggleItem}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </Grid>
        ))}
      </AnimatePresence>
      {visibleCount < items.length && (
        <Box ref={sentinelRef} sx={{ width: "100%", height: 1 }} />
      )}
    </Grid>
  );
};

export default InventoryGrid;
