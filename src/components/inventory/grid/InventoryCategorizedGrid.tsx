import React, { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import InventoryIcon from "@mui/icons-material/Inventory";

import { useTranslation } from "@/i18n";
import type { InventoryItem } from "@/types/inventory";

import { useInventoryContext } from "@contexts/InventoryContext";
import { useUserContext } from "@contexts/UserContext";
import { useInventoryCategorization } from "@hooks/useInventoryCategorization";

import CategorySection from "../CategoryManagement/CategorySection";
import CategoryThresholdDialog from "../CategoryManagement/CategoryThresholdDialog";

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
  isFiltered?: boolean;
  onAdd?: () => void;
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
  isFiltered = false,
  onAdd,
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
          px: 3,
          textAlign: "center",
        }}
      >
        {isFiltered ? (
          <>
            <CategoryIcon
              sx={{
                fontSize: 64,
                mb: 2,
                color: "text.secondary",
                opacity: 0.5,
              }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t("inventory.noItemsFound") || "No items found"}
            </Typography>
          </>
        ) : (
          <>
            <InventoryIcon
              sx={{ fontSize: 64, mb: 2, color: "primary.main", opacity: 0.8 }}
            />
            <Typography variant="h5" color="text.primary" gutterBottom>
              {t("inventory.empty") || "Your inventory is empty"}
            </Typography>
            {onAdd && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onAdd}
                sx={{
                  mt: 2,
                  bgcolor: "primary.main",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                {t("inventory.add") || "Add Item"}
              </Button>
            )}
          </>
        )}
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
