import React, { useState } from "react";
import type { InventoryItem } from "@/types/inventory";
import { useTranslation } from "@/i18n";
import { useUserContext } from "@contexts/UserContext";
import { useInventoryContext } from "@contexts/InventoryContext";
import { useInventoryCategorization } from "@hooks/useInventoryCategorization";
import CategoryThresholdDialog from "../CategoryManagement/CategoryThresholdDialog";
import CategorySection from "../CategoryManagement/CategorySection";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import CategoryIcon from "@mui/icons-material/Category";

interface InventoryCategorizedGridProps {
  items: InventoryItem[];
  selectedItems: Set<string>;
  onToggleItem: (id: string, checked: boolean) => void;
  onEdit: (item: InventoryItem) => void;
  onAdjust?: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
  onViewHistory?: (itemId: string, itemName: string) => void;
  compactView?: boolean;
  selectedCategory?: string | null;
}

const InventoryCategorizedGrid: React.FC<InventoryCategorizedGridProps> = ({
  items,
  selectedItems,
  onToggleItem,
  onEdit,
  onAdjust,
  onDelete,
  onViewHistory,
  compactView = false,
  selectedCategory = null,
}) => {
  const { t } = useTranslation();
  const { categories, updateCategoryThreshold } = useInventoryContext();
  const { role } = useUserContext();
  const isAdmin = role === "admin";

  const [thresholdDialogOpen, setThresholdDialogOpen] = useState(false);
  const [selectedCategoryForThreshold, setSelectedCategoryForThreshold] =
    useState<string | null>(null);

  const {
    groupedItems,
    sortedCategories,
    collapsedCategories,
    toggleCategory,
  } = useInventoryCategorization(items);

  if (items.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
          opacity: 0.6,
        }}
      >
        <CategoryIcon sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6">
          {t("inventory.noItemsFound") || "No items found"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 8 }}>
      {sortedCategories.map((category, index) => (
        <React.Fragment key={category}>
          <CategorySection
            category={category}
            items={groupedItems[category]}
            collapsed={collapsedCategories.has(category)}
            isAdmin={isAdmin}
            selectedCategory={selectedCategory}
            selectedItems={selectedItems}
            compactView={compactView}
            onToggleCategory={toggleCategory}
            onEditThreshold={(cat) => {
              setSelectedCategoryForThreshold(cat);
              setThresholdDialogOpen(true);
            }}
            onToggleItem={onToggleItem}
            onEdit={onEdit}
            onAdjust={onAdjust}
            onDelete={onDelete}
            onViewHistory={onViewHistory}
          />

          {index < sortedCategories.length - 1 && (
            <Divider sx={{ mt: 4, opacity: 0.5 }} />
          )}
        </React.Fragment>
      ))}

      {selectedCategoryForThreshold && (
        <CategoryThresholdDialog
          open={thresholdDialogOpen}
          onClose={() => {
            setThresholdDialogOpen(false);
            setSelectedCategoryForThreshold(null);
          }}
          categoryName={selectedCategoryForThreshold}
          currentThreshold={
            categories.find((c) => c.name === selectedCategoryForThreshold)
              ?.low_stock_threshold ?? null
          }
          onSave={(val) => {
            if (selectedCategoryForThreshold) {
              void updateCategoryThreshold(selectedCategoryForThreshold, val);
            }
          }}
        />
      )}
    </Box>
  );
};

export default InventoryCategorizedGrid;
