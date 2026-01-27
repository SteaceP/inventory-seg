import React from "react";
import { Box, Chip, useTheme, useMediaQuery, alpha } from "@mui/material";
import { Category as CategoryIcon } from "@mui/icons-material";
import { useTranslation } from "@/i18n";
import type { InventoryCategory } from "@/types/inventory";

interface CategoryFiltersProps {
  categories: InventoryCategory[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getChipStyles = (isSelected: boolean) => ({
    fontWeight: 700,
    fontSize: isMobile ? "0.75rem" : "0.875rem",
    px: isMobile ? 1.5 : 2,
    py: isMobile ? 0.5 : 0.75,
    height: isMobile ? 32 : 36,
    borderRadius: 5,
    border: isSelected
      ? "none"
      : `1.5px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    background: isSelected
      ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
      : alpha(theme.palette.primary.main, 0.08),
    color: isSelected
      ? theme.palette.primary.contrastText
      : theme.palette.text.primary,
    boxShadow: isSelected
      ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.35)}, 0 2px 4px ${alpha(theme.palette.primary.main, 0.2)}`
      : `0 2px 4px ${alpha(theme.palette.common.black, 0.05)}`,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: isSelected ? "translateY(-2px)" : "translateY(0)",
    backdropFilter: "blur(8px)",
    position: "relative" as const,
    zIndex: 1,
    "& .MuiChip-icon": {
      color: isSelected
        ? theme.palette.primary.contrastText
        : theme.palette.primary.main,
      fontSize: isMobile ? "1rem" : "1.125rem",
      opacity: isSelected ? 1 : 0.8,
      transition: "all 0.3s ease",
    },
    "&:hover": {
      transform: "translateY(-2px) scale(1.02)",
      zIndex: 10,
      boxShadow: isSelected
        ? `0 6px 20px ${alpha(theme.palette.primary.main, 0.45)}, 0 3px 8px ${alpha(theme.palette.primary.main, 0.3)}`
        : `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}, 0 2px 6px ${alpha(theme.palette.common.black, 0.1)}`,
      background: isSelected
        ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
        : alpha(theme.palette.primary.main, 0.12),
      borderColor: alpha(theme.palette.primary.main, 0.5),
      "& .MuiChip-icon": {
        transform: "rotate(10deg) scale(1.1)",
        opacity: 1,
      },
    },
    "&:active": {
      transform: "translateY(-1px) scale(1.01)",
    },
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: isMobile ? "nowrap" : "wrap",
        gap: isMobile ? 1 : 1.5,
        pt: 2,
        mb: 4,
        px: 0.5,
        position: "relative",
        zIndex: 100,
        overflowX: isMobile ? "auto" : "visible",
        overflowY: "hidden",
        scrollSnapType: isMobile ? "x mandatory" : "none",
        WebkitOverflowScrolling: "touch",
        "&::-webkit-scrollbar": {
          height: 4,
        },
        "&::-webkit-scrollbar-track": {
          background: alpha(theme.palette.primary.main, 0.05),
          borderRadius: 2,
        },
        "&::-webkit-scrollbar-thumb": {
          background: alpha(theme.palette.primary.main, 0.3),
          borderRadius: 2,
          "&:hover": {
            background: alpha(theme.palette.primary.main, 0.5),
          },
        },
      }}
    >
      <Chip
        label={t("common.all") || "All"}
        icon={<CategoryIcon />}
        onClick={() => onSelectCategory(null)}
        sx={{
          ...getChipStyles(selectedCategory === null),
          scrollSnapAlign: isMobile ? "start" : "none",
          minWidth: "fit-content",
        }}
      />
      {categories.map((category) => (
        <Chip
          key={category.name}
          label={category.name}
          onClick={() => onSelectCategory(category.name)}
          sx={{
            ...getChipStyles(selectedCategory === category.name),
            scrollSnapAlign: isMobile ? "start" : "none",
            minWidth: "fit-content",
          }}
        />
      ))}
    </Box>
  );
};

export default CategoryFilters;
