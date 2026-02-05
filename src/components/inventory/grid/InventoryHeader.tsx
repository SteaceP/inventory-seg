import React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import ClearIcon from "@mui/icons-material/Clear";
import PrintIcon from "@mui/icons-material/Print";
import ScanIcon from "@mui/icons-material/QrCodeScanner";
import SearchIcon from "@mui/icons-material/Search";

import { useTranslation } from "@/i18n";

interface InventoryHeaderProps {
  isMobile: boolean;
  selectedCount: number;
  onPrint: () => void;
  onScan: () => void;
  onAdd?: () => void;
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
  searchQuery,
  onSearchChange,
  onManageCategories,
}) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Main Header Row: Title, Search, and Actions */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          alignItems: { xs: "flex-start", sm: "center" },
        }}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          fontWeight="bold"
          sx={{ flexShrink: 0 }}
        >
          {t("inventory.title") || "Inventaire"}
        </Typography>

        <TextField
          id="inventory-header-search"
          name="searchQuery"
          placeholder={t("inventory.search") || "Rechercher..."}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label={t("inventory.search") || "Rechercher"}
          size="small"
          sx={{
            flexGrow: 1,
            minWidth: { sm: 300 },
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
            gap: 1,
            width: { xs: "100%", sm: "auto" },
            flexShrink: 0,
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

      {/* Print Labels Button - Only shows when items are selected */}
      {selectedCount > 0 && (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
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
              ? `${t("inventory.printLabels")} (${selectedCount})`
              : `${t("inventory.printLabels")} (${selectedCount})`}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default InventoryHeader;
