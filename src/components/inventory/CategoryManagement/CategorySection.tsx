import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  Category as CategoryIcon,
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import type { InventoryItem } from "../../../types/inventory";
import InventoryCard from "../InventoryCard/InventoryCard";
import { useTranslation } from "../../../i18n";

interface CategorySectionProps {
  category: string;
  items: InventoryItem[];
  collapsed: boolean;
  isAdmin: boolean;
  selectedCategory: string | null;
  selectedItems: Set<string>;
  compactView: boolean;
  onToggleCategory: (category: string) => void;
  onEditThreshold: (category: string) => void;
  onToggleItem: (id: string, checked: boolean) => void;
  onEdit: (item: InventoryItem) => void;
  onAdjust?: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
  onViewHistory?: (itemId: string, itemName: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  items,
  collapsed,
  isAdmin,
  selectedCategory,
  selectedItems,
  compactView,
  onToggleCategory,
  onEditThreshold,
  onToggleItem,
  onEdit,
  onAdjust,
  onDelete,
  onViewHistory,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box>
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
            if (!selectedCategory && items.length > 4) {
              onToggleCategory(category);
            }
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            cursor:
              !selectedCategory && items.length > 4 ? "pointer" : "default",
            "&:hover":
              !selectedCategory && items.length > 4
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
              {items.length} {t("inventory.items") || "Items"}
            </Box>
          </Typography>
          {!selectedCategory && items.length > 4 && (
            <Box
              sx={{
                ml: 2,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                transition: "all 0.2s ease",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "primary.main",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {collapsed
                  ? t("common.showAll") || "Show all"
                  : t("common.showLess") || "Show less"}
              </Typography>
              <ChevronRightIcon
                sx={{
                  fontSize: "1.1rem",
                  color: "primary.main",
                  transform: collapsed ? "rotate(0deg)" : "rotate(90deg)",
                  transition: "transform 0.3s ease",
                }}
              />
            </Box>
          )}
        </Box>

        {isAdmin && (
          <Tooltip
            title={t("inventory.editCategoryThreshold") || "Edit Threshold"}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEditThreshold(category);
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
        <Grid container spacing={compactView ? 2 : 3} sx={{ mt: 1 }}>
          <AnimatePresence>
            {(selectedCategory || !collapsed ? items : items.slice(0, 4)).map(
              (item) => (
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
              )
            )}
          </AnimatePresence>
        </Grid>
      </Box>
    </Box>
  );
};

export default CategorySection;
