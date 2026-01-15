import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Category as CategoryIcon,
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import type { InventoryItem } from "../../types/inventory";
import InventoryCard from "./InventoryCard";
import { useTranslation } from "../../i18n";
import { useInventoryContext } from "../../contexts/useInventoryContext";
import { useUserContext } from "../../contexts/useUserContext";

interface InventoryCategorizedGridProps {
  items: InventoryItem[];
  selectedItems: Set<string>;
  onToggleItem: (id: string, checked: boolean) => void;
  onEdit: (item: InventoryItem) => void;
  onAdjust?: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
  onViewHistory?: (itemId: string, itemName: string) => void;
  compactView?: boolean;
}

const CategoryThresholdDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  categoryName: string;
  currentThreshold: number | null;
  onSave: (threshold: number | null) => void;
}> = ({ open, onClose, categoryName, currentThreshold, onSave }) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string>(
    currentThreshold?.toString() || ""
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {t("inventory.categoryThresholdTitle") || "Category Threshold"}:{" "}
        {categoryName}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("inventory.categoryThresholdInfo") ||
            "Define a low stock threshold for all items in this category. Individual item settings take priority."}
        </Typography>
        <TextField
          autoFocus
          label={t("inventory.threshold") || "Threshold"}
          type="number"
          fullWidth
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("inventory.inherited") || "Inherited"}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("inventory.cancel") || "Cancel"}</Button>
        <Button
          onClick={() => {
            onSave(value === "" ? null : parseInt(value));
            onClose();
          }}
          variant="contained"
        >
          {t("inventory.save") || "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const InventoryCategorizedGrid: React.FC<InventoryCategorizedGridProps> = ({
  items,
  selectedItems,
  onToggleItem,
  onEdit,
  onAdjust,
  onDelete,
  onViewHistory,
  compactView = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { categories, updateCategoryThreshold } = useInventoryContext();
  const { role } = useUserContext();
  const isAdmin = role === "admin";

  const [thresholdDialogOpen, setThresholdDialogOpen] = useState(false);
  const [selectedCategoryForThreshold, setSelectedCategoryForThreshold] =
    useState<string | null>(null);

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

  const sortedCategories = Object.keys(groupedItems);

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
        <Box
          key={category}
          sx={{ mb: index === sortedCategories.length - 1 ? 0 : 4 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              position: "sticky",
              top: isMobile ? 56 : 0,
              zIndex: 10,
              py: 1.5,
              bgcolor: alpha(theme.palette.background.default, 0.8),
              backdropFilter: "blur(12px)",
              mx: -2,
              px: 2,
              transition: "background-color 0.2s",
            }}
          >
            <Box
              onClick={() => {
                if (groupedItems[category].length > 4) {
                  toggleCategory(category);
                }
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                flexGrow: 1,
                cursor:
                  groupedItems[category].length > 4 ? "pointer" : "default",
                "&:hover":
                  groupedItems[category].length > 4
                    ? {
                        opacity: 0.8,
                      }
                    : {},
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  display: "flex",
                  mr: 2.5,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <CategoryIcon fontSize="small" />
              </Paper>
              <Typography
                variant="h6"
                fontWeight="900"
                sx={{
                  fontSize: isMobile ? "1.1rem" : "1.35rem",
                  letterSpacing: "-0.02em",
                  color: "text.primary",
                }}
              >
                {category}
                <Box
                  component="span"
                  sx={{
                    ml: 1.5,
                    opacity: 0.3,
                    fontWeight: "600",
                    fontSize: "0.7em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {groupedItems[category].length}{" "}
                  {t("inventory.items") || "Items"}
                </Box>
              </Typography>
              <ChevronRightIcon
                sx={{
                  ml: 1,
                  opacity: groupedItems[category].length > 4 ? 0.6 : 0.2,
                  transform: collapsedCategories.has(category)
                    ? "rotate(0deg)"
                    : "rotate(90deg)",
                  transition: "transform 0.3s ease, opacity 0.2s",
                }}
              />
            </Box>

            {isAdmin && (
              <Tooltip
                title={t("inventory.editCategoryThreshold") || "Edit Threshold"}
              >
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategoryForThreshold(category);
                    setThresholdDialogOpen(true);
                  }}
                  sx={{ color: "text.secondary", ml: 1 }}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Box
            sx={{
              px: { xs: 1, sm: 2 },
              width: "100%",
              overflow: "visible",
            }}
          >
            <Grid
              container
              spacing={compactView ? 2 : 3}
              sx={{
                mt: 1,
              }}
            >
              <AnimatePresence>
                {(collapsedCategories.has(category)
                  ? groupedItems[category].slice(0, 4)
                  : groupedItems[category]
                ).map((item) => (
                  <Grid
                    size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}
                    key={item.id}
                    component={motion.div}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    sx={{ display: "flex" }}
                  >
                    <Box sx={{ width: "100%", height: "100%" }}>
                      <InventoryCard
                        item={item}
                        isSelected={selectedItems.has(item.id)}
                        onToggle={onToggleItem}
                        onEdit={onEdit}
                        onAdjust={onAdjust}
                        onDelete={onDelete}
                        onViewHistory={onViewHistory}
                      />
                    </Box>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          </Box>

          {index < sortedCategories.length - 1 && (
            <Divider sx={{ mt: 4, opacity: 0.5 }} />
          )}
        </Box>
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
