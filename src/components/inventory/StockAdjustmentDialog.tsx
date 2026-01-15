import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Button,
  Grid,
  Typography,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Close as CloseIcon,
  Backspace as BackspaceIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import type { InventoryItem } from "../../types/inventory";
import { useTranslation } from "../../i18n";

interface StockAdjustmentDialogProps {
  open: boolean;
  item: InventoryItem | null;
  isMobile: boolean;
  onClose: () => void;
  onSave: (
    itemId: string,
    newStock: number,
    location?: string,
    actionType?: "add" | "remove"
  ) => void;
  loading?: boolean;
}

type Mode = "menu" | "add" | "remove" | "selectLocation";

const StockAdjustmentDialog: React.FC<StockAdjustmentDialogProps> = ({
  open,
  item,
  isMobile,
  onClose,
  onSave,
  loading = false,
}) => {
  const [mode, setMode] = useState<Mode>("menu");
  const [inputValue, setInputValue] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    location: string;
    quantity: number;
  } | null>(null);
  const { t } = useTranslation();

  const handleClose = () => {
    setMode("menu");
    setInputValue("");
    setSelectedLocation(null);
    onClose();
  };

  const handleConfirm = () => {
    if (!item || !inputValue) return;
    const change = parseInt(inputValue, 10);
    let newStock = item.stock || 0;
    let actionType: "add" | "remove" | undefined;

    if (mode === "add") {
      newStock += change;
      actionType = "add";
    } else {
      // For remove, the newStock is already calculated based on selected location
      newStock = Math.max(0, newStock - change);
      actionType = "remove";
    }

    // Pass location and action type to parent
    onSave(item.id, newStock, selectedLocation?.location, actionType);
    handleClose();
  };

  const handleDigit = (digit: string) => {
    if (inputValue.length < 5) {
      // Prevent overflow
      setInputValue((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setInputValue((prev) => prev.slice(0, -1));
  };

  const handleRemoveClick = () => {
    // If item has multiple stock locations, show location selector
    if (item?.stock_locations && item.stock_locations.length > 0) {
      setMode("selectLocation");
    } else {
      // No locations defined, proceed directly to remove
      setMode("remove");
    }
  };

  const handleLocationSelect = (location: {
    location: string;
    quantity: number;
  }) => {
    setSelectedLocation(location);
    setMode("remove");
  };

  if (!item) return null;

  // Check if attempting to remove more than available
  const maxRemovable = selectedLocation
    ? selectedLocation.quantity
    : item.stock;
  const inputNum = parseInt(inputValue, 10) || 0;
  const isOverLimit = mode === "remove" && inputNum > maxRemovable;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : "16px",
          width: isMobile ? "100%" : "400px",
          maxWidth: "100%",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" fontWeight="bold" component="span">
          {mode === "menu"
            ? t("inventory.manageStock")
            : mode === "add"
              ? t("inventory.addStock")
              : mode === "selectLocation"
                ? t("inventory.selectLocation")
                : t("inventory.removeStock")}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {t("inventory.current")}
          </Typography>
          <Typography variant="h6" color="primary.main" fontWeight="medium">
            {item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Actuel: {item.stock}
          </Typography>
          {selectedLocation && (
            <Typography
              variant="caption"
              color="primary.main"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                mt: 0.5,
              }}
            >
              <LocationIcon fontSize="small" />
              {selectedLocation.location} ({selectedLocation.quantity}{" "}
              available)
            </Typography>
          )}
        </Box>

        {mode === "menu" ? (
          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "center", py: 4 }}
          >
            <Button
              variant="contained"
              color="success"
              onClick={() => setMode("add")}
              sx={{
                width: 120,
                height: 120,
                borderRadius: "16px",
                flexDirection: "column",
                gap: 1,
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              <AddIcon sx={{ fontSize: 40 }} />
              {t("inventory.addStock")}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleRemoveClick}
              sx={{
                width: 120,
                height: 120,
                borderRadius: "16px",
                flexDirection: "column",
                gap: 1,
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              <RemoveIcon sx={{ fontSize: 40 }} />
              {t("inventory.removeStock")}
            </Button>
          </Box>
        ) : mode === "selectLocation" ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t("inventory.locationRequired")}
            </Typography>
            <List sx={{ bgcolor: "background.paper", borderRadius: "8px" }}>
              {(item.stock_locations || []).map((loc) => (
                <ListItem key={loc.location} disablePadding>
                  <ListItemButton
                    onClick={() =>
                      handleLocationSelect({
                        location: loc.location,
                        quantity: loc.quantity,
                      })
                    }
                    sx={{
                      borderRadius: "8px",
                      mb: 0.5,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <LocationIcon sx={{ mr: 1.5, color: "primary.main" }} />
                    <ListItemText
                      primary={loc.location}
                      secondary={`${t("inventory.stockLabel")}: ${loc.quantity}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Button
              fullWidth
              onClick={() => {
                setMode("menu");
              }}
              sx={{ mt: 1 }}
            >
              {t("inventory.back")}
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                bgcolor: "action.hover",
                p: 2,
                borderRadius: "12px",
                textAlign: "right",
                mb: 2,
              }}
            >
              <Typography variant="h3" fontWeight="bold">
                {inputValue || "0"}
              </Typography>
            </Box>

            <Grid container spacing={1}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <Grid size={4} key={digit}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleDigit(digit.toString())}
                    sx={{
                      height: 60,
                      fontSize: "1.5rem",
                      borderRadius: "12px",
                      color: "text.primary",
                      borderColor: "divider",
                    }}
                  >
                    {digit}
                  </Button>
                </Grid>
              ))}
              <Grid size={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleDigit("0")}
                  sx={{
                    height: 60,
                    fontSize: "1.5rem",
                    borderRadius: "12px",
                    color: "text.primary",
                    borderColor: "divider",
                  }}
                >
                  0
                </Button>
              </Grid>
              <Grid size={8}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleBackspace}
                  color="warning"
                  sx={{
                    height: 60,
                    borderRadius: "12px",
                  }}
                >
                  <BackspaceIcon />
                </Button>
              </Grid>
              <Grid size={12}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleConfirm}
                  color={mode === "add" ? "success" : "error"}
                  disabled={!inputValue || loading || isOverLimit}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                  sx={{
                    height: 60,
                    fontSize: "1.2rem",
                    borderRadius: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {mode === "add"
                    ? t("inventory.addButton")
                    : t("inventory.removeStock")}
                </Button>
              </Grid>
              {isOverLimit && (
                <Grid size={12}>
                  <Typography variant="body2" color="error" textAlign="center">
                    {t("inventory.insufficientStock")}
                  </Typography>
                </Grid>
              )}
            </Grid>

            <Button
              fullWidth
              onClick={() => {
                setMode("menu");
                setInputValue("");
              }}
              sx={{ mt: 1 }}
            >
              {t("inventory.back")}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StockAdjustmentDialog;
