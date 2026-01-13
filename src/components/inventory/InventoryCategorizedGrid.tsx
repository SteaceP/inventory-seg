import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Category as CategoryIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import type { InventoryItem } from "../../types/inventory";
import InventoryCard from "./InventoryCard";
import { useTranslation } from "../../i18n";

interface InventoryCategorizedGridProps {
  items: InventoryItem[];
  selectedItems: Set<string>;
  onToggleItem: (id: string, checked: boolean) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
  compactView?: boolean;
}

const InventoryCategorizedGrid: React.FC<InventoryCategorizedGridProps> = ({
  items,
  selectedItems,
  onToggleItem,
  onEdit,
  onDelete,
  compactView = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Start with all categories collapsed (showing only 4 items)
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

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, InventoryItem[]> = {};
    items.forEach((item) => {
      const cat =
        item.category || t("inventory.uncategorized") || "Uncategorized";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    // Sort categories alphabetically
    return Object.keys(groups)
      .sort()
      .reduce((acc, key) => {
        acc[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name));
        return acc;
      }, {} as Record<string, InventoryItem[]>);
  }, [items, t]);

  const categories = Object.keys(groupedItems);

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
      {categories.map((category, index) => (
        <Box
          key={category}
          sx={{ mb: index === categories.length - 1 ? 0 : 4 }}
        >
          {/* Category Header */}
          <Box
            onClick={() => {
              if (groupedItems[category].length > 4) {
                toggleCategory(category);
              }
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              position: "sticky",
              top: isMobile ? 56 : 0,
              zIndex: 10,
              py: 1.5,
              bgcolor: alpha(theme.palette.background.default, 0.8),
              backdropFilter: "blur(8px)",
              mx: -2,
              px: 2,
              cursor: groupedItems[category].length > 4 ? "pointer" : "default",
              transition: "background-color 0.2s",
              "&:hover":
                groupedItems[category].length > 4
                  ? {
                      bgcolor: alpha(theme.palette.background.default, 0.95),
                    }
                  : {},
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 1,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                display: "flex",
                mr: 2,
              }}
            >
              <CategoryIcon fontSize="small" />
            </Paper>
            <Typography
              variant="h6"
              fontWeight="800"
              sx={{
                flexGrow: 1,
                fontSize: isMobile ? "1.1rem" : "1.25rem",
                letterSpacing: "-0.01em",
              }}
            >
              {category}
              <Box
                component="span"
                sx={{
                  ml: 1.5,
                  opacity: 0.4,
                  fontWeight: "400",
                  fontSize: "0.8em",
                }}
              >
                ({groupedItems[category].length})
              </Box>
            </Typography>
            <ChevronRightIcon
              sx={{
                opacity: groupedItems[category].length > 4 ? 0.6 : 0.2,
                transform: collapsedCategories.has(category)
                  ? "rotate(0deg)"
                  : "rotate(90deg)",
                transition: "transform 0.3s ease, opacity 0.2s",
              }}
            />
          </Box>

          <Box
            sx={{
              px: { xs: 1, sm: 2 },
              width: "100%",
              overflow: "visible", // Changed from hidden to prevent clipping
            }}
          >
            {/* Items Grid */}
            <Grid
              container
              spacing={compactView ? 1.5 : 2.5}
              sx={{
                mt: 2, // Add top margin to prevent clipping
                "& > .MuiGrid-item": {
                  padding: compactView ? 0.75 : 1.25,
                },
              }}
            >
              <AnimatePresence>
                {(collapsedCategories.has(category)
                  ? groupedItems[category].slice(0, 4)
                  : groupedItems[category]
                ).map((item) => (
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                    key={item.id}
                    component={motion.div}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    sx={{ display: "flex" }} // Support card stretching
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
            </Grid>
          </Box>

          {index < categories.length - 1 && (
            <Divider sx={{ mt: 4, opacity: 0.5 }} />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default InventoryCategorizedGrid;
