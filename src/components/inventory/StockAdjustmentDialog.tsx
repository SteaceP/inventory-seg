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
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Close as CloseIcon,
  Backspace as BackspaceIcon,
} from "@mui/icons-material";
import type { InventoryItem } from "../../types/inventory";
import { useTranslation } from "../../i18n";

interface StockAdjustmentDialogProps {
  open: boolean;
  item: InventoryItem | null;
  isMobile: boolean;
  onClose: () => void;
  onSave: (itemId: string, newStock: number) => void;
}

type Mode = "menu" | "add" | "remove";

const StockAdjustmentDialog: React.FC<StockAdjustmentDialogProps> = ({
  open,
  item,
  isMobile,
  onClose,
  onSave,
}) => {
  const [mode, setMode] = useState<Mode>("menu");
  const [inputValue, setInputValue] = useState("");
  const { t } = useTranslation();

  const handleClose = () => {
    setMode("menu");
    setInputValue("");
    onClose();
  };

  const handleConfirm = () => {
    if (!item || !inputValue) return;
    const change = parseInt(inputValue, 10);
    let newStock = item.stock || 0;

    if (mode === "add") {
      newStock += change;
    } else {
      newStock = Math.max(0, newStock - change);
    }

    onSave(item.id, newStock);
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

  if (!item) return null;

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
              onClick={() => setMode("remove")}
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
                  disabled={!inputValue}
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
