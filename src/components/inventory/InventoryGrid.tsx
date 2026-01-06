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
    onDelete: (id: string) => void;
}

const InventoryGrid: React.FC<InventoryGridProps> = ({
    items,
    selectedItems,
    onToggleItem,
    onEdit,
    onDelete,
}) => {
    return (
        <Grid container spacing={2}>
            <AnimatePresence>
                {items.map((item) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={item.id}>
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
