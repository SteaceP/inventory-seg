import React from "react";
import Grid from "@mui/material/Grid2";
import { AnimatePresence } from "framer-motion";
import type { InventoryItem } from "../../types/inventory";
import InventoryCard from "./InventoryCard";

interface InventoryGridProps {
    items: InventoryItem[];
    selectedItems: Set<string>;
    onToggleItem: (id: string, checked: boolean) => void;
    onEdit: (item: InventoryItem) => void;
    onDelete?: (id: string) => void;
}

import { useThemeContext } from "../../contexts/ThemeContext";

const InventoryGrid: React.FC<InventoryGridProps> = ({
    items,
    selectedItems,
    onToggleItem,
    onEdit,
    onDelete,
}) => {
    const { compactView } = useThemeContext();

    return (
        <Grid container spacing={compactView ? 1 : 2}>
            <AnimatePresence>
                {items.map((item) => (
                    <Grid size={{ xs: 12, sm: compactView ? 4 : 6, md: compactView ? 3 : 4 }} key={item.id}>
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
        </Grid>
    );
};

export default InventoryGrid;
