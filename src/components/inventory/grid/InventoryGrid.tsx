import React, { useState, useEffect, useRef } from "react";
import { Grid, Box } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import type { InventoryItem } from "@/types/inventory";
import InventoryCard from "../InventoryCard/InventoryCard";
import { useUserContext } from "@contexts/UserContext";

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
  const { compactView } = useUserContext();
  const PAGE_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset visible count when items list changes (e.g., new search)
  // We handle this by using the number of items as a key if we want a full reset,
  // but for infinite scroll, we usually just want to slice.
  // Instead of an effect, we will reset the count if items.length changes significantly or just keep it simple.
  // Using a key on the Grid is the most 'React' way to reset state.

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
    <Grid container spacing={compactView ? 1 : 2} key={items.length}>
      <AnimatePresence>
        {visibleItems.map((item) => (
          <Grid
            size={{ xs: 12, sm: compactView ? 4 : 6, md: compactView ? 3 : 4 }}
            key={item.id}
            sx={{ display: "flex" }}
          >
            <Box sx={{ width: "100%", height: "100%" }}>
              <InventoryCard
                item={item}
                isSelected={selectedItems.has(item.id)}
                onToggle={onToggleItem}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </Box>
          </Grid>
        ))}
      </AnimatePresence>
      {visibleCount < items.length && (
        <Box
          ref={sentinelRef}
          data-testid="infinite-scroll-sentinel"
          sx={{ width: "100%", height: 1 }}
        />
      )}
    </Grid>
  );
};

export default InventoryGrid;
