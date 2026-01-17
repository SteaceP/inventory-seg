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
    <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Top Row: Title and Main Actions */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
          {t("inventory.title") || "Inventaire"}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "flex-start", sm: "flex-end" },
          }}
        >
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
                whiteSpace: "nowrap",
                fontWeight: "bold",
              }}
            >
              {isMobile ? "" : t("inventory.categories.manage") || "Categories"}
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
              fontWeight: "bold",
            }}
          >
            {t("inventory.scan")}
          </Button>
          {onAdd && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              fullWidth={isMobile}
              onClick={onAdd}
              sx={{
                background: "linear-gradient(45deg, #027d6f 30%, #1a748b 90%)",
                color: "white",
                fontWeight: "bold",
                boxShadow: "0 3px 5px 2px rgba(2, 125, 111, .3)",
              }}
            >
              {t("inventory.addButton")}
            </Button>
          )}
        </Box>
      </Box>

      {/* Second Row: Search and Filters */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          alignItems: "center",
        }}
      >
        <TextField
          placeholder={t("inventory.search") || "Rechercher..."}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "background.paper",
            },
          }}
          slotProps={{
            input: {
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
            },
          }}
        />

        <Box
          sx={{
            display: "flex",
            gap: 2,
            width: { xs: "100%", sm: "auto" },
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
              whiteSpace: "nowrap",
              minWidth: "fit-content",
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
                whiteSpace: "nowrap",
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
        </Box>
      </Box>
    </Box>
  );
};

export default InventoryHeader;
