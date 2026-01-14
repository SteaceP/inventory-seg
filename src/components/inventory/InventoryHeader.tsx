import React from "react";
import {
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  QrCodeScanner as ScanIcon,
  Print as PrintIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../i18n";

interface InventoryHeaderProps {
  isMobile: boolean;
  selectedCount: number;
  onPrint: () => void;
  onScan: () => void;
  onAdd?: () => void;
  isLowStockFilter: boolean;
  onToggleLowStock: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onManageCategories?: () => void;
}

const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  isMobile,
  selectedCount,
  onPrint,
  onScan,
  onAdd,
  isLowStockFilter,
  onToggleLowStock,
  searchQuery,
  onSearchChange,
  onManageCategories,
}) => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 2,
        mb: 4,
      }}
    >
      <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
        {t("inventory.title") || "Inventaire"}
      </Typography>

      {/* Search Bar */}
      <TextField
        placeholder={t("inventory.search") || "Rechercher..."}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        sx={{
          minWidth: { xs: "100%", sm: 250, md: 300 },
          "& .MuiOutlinedInput-root": {
            bgcolor: "background.paper",
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "text.secondary" }} />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => onSearchChange("")}
                edge="end"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Box
        sx={{
          display: "flex",
          gap: 2,
          width: { xs: "100%", sm: "auto" },
          flexWrap: { xs: "wrap", sm: "nowrap" },
        }}
      >
        <Button
          variant={isLowStockFilter ? "contained" : "outlined"}
          color={isLowStockFilter ? "warning" : "inherit"}
          startIcon={<WarningIcon />}
          fullWidth={isMobile}
          onClick={onToggleLowStock}
          sx={{
            border: isLowStockFilter ? "none" : "1px solid",
            borderColor: "divider",
            color: isLowStockFilter ? "white" : "text.primary",
            "&:hover": {
              borderColor: "warning.main",
              bgcolor: isLowStockFilter ? "warning.dark" : "action.hover",
            },
          }}
        >
          {t("inventory.filter.lowStock")}
        </Button>
        {selectedCount > 0 && (
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            fullWidth={isMobile}
            onClick={onPrint}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              color: "text.primary",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(2, 125, 111, 0.1)"
                    : "rgba(2, 125, 111, 0.05)",
              },
            }}
          >
            {isMobile
              ? `(${selectedCount})`
              : `${t("inventory.printLabels")} (${selectedCount})`}
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<ScanIcon />}
          fullWidth={isMobile}
          onClick={onScan}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            color: "text.primary",
          }}
        >
          {t("inventory.scan")}
        </Button>
        {onManageCategories && (
          <Button
            variant="outlined"
            startIcon={<CategoryIcon />}
            fullWidth={isMobile}
            onClick={onManageCategories}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              color: "text.primary",
            }}
          >
            {isMobile ? "" : t("inventory.categories.manage") || "Categories"}
          </Button>
        )}
        {onAdd && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            fullWidth={isMobile}
            onClick={onAdd}
          >
            {t("inventory.addButton")}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default InventoryHeader;
