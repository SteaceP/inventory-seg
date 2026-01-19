import React from "react";
import { Box, Chip } from "@mui/material";
import { Category as CategoryIcon } from "@mui/icons-material";
import { useTranslation } from "../../i18n";
import type { InventoryCategory } from "../../types/inventory";

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

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1.5,
        mb: 2,
        px: 0.5,
      }}
    >
      <Chip
        label={t("common.all") || "All"}
        icon={<CategoryIcon fontSize="small" />}
        onClick={() => onSelectCategory(null)}
        variant={selectedCategory === null ? "filled" : "outlined"}
        color={selectedCategory === null ? "primary" : "default"}
        sx={{
          fontWeight: "bold",
          px: 1,
          transition: "all 0.2s ease",
          "&:hover": {
            bgcolor:
              selectedCategory === null ? "primary.dark" : "action.hover",
          },
        }}
      />
      {categories.map((category) => (
        <Chip
          key={category.name}
          label={category.name}
          onClick={() => onSelectCategory(category.name)}
          variant={selectedCategory === category.name ? "filled" : "outlined"}
          color={selectedCategory === category.name ? "primary" : "default"}
          sx={{
            fontWeight: "bold",
            px: 1,
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor:
                selectedCategory === category.name
                  ? "primary.dark"
                  : "action.hover",
            },
          }}
        />
      ))}
    </Box>
  );
};

export default CategoryFilters;
