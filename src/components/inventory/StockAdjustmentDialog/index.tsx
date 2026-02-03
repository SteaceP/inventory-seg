import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n";
import { useInventoryContext } from "@contexts/InventoryContext";
import type {
  StockAdjustmentDialogProps,
  Mode,
  SelectedLocation,
} from "./types";
import AdjustmentQuickInfo from "./AdjustmentQuickInfo";
import AdjustmentModeSelector from "./AdjustmentModeSelector";
import LocationSelector from "./LocationSelector";
import AdjustmentForm from "./AdjustmentForm";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import BackIcon from "@mui/icons-material/ArrowBack";

const StockAdjustmentDialog: React.FC<StockAdjustmentDialogProps> = ({
  open,
  item,
  isMobile,
  onClose,
  onSave,
  loading = false,
}) => {
  const [mode, setMode] = useState<Mode>("menu");
  const [pendingAction, setPendingAction] = useState<"add" | "remove" | null>(
    null
  );
  const [inputValue, setInputValue] = useState("");
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [recipient, setRecipient] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const { t } = useTranslation();
  const { locations } = useInventoryContext();

  const handleClose = () => {
    setMode("menu");
    setPendingAction(null);
    setInputValue("");
    setSelectedLocation(null);
    setRecipient("");
    setDestinationLocation("");
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
      newStock = Math.max(0, newStock - change);
      actionType = "remove";
    }

    onSave(
      item.id,
      newStock,
      selectedLocation?.location,
      actionType,
      selectedLocation?.parent_location,
      recipient.trim() || undefined,
      destinationLocation.trim() || undefined
    );
    handleClose();
  };

  const handleDigit = (digit: string) => {
    if (inputValue.length < 5) {
      setInputValue((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setInputValue((prev) => prev.slice(0, -1));
  };

  const handleAddClick = () => {
    setPendingAction("add");
    if (item?.stock_locations && item.stock_locations.length > 0) {
      setMode("selectLocation");
    } else {
      setMode("add");
    }
  };

  const handleRemoveClick = () => {
    setPendingAction("remove");
    if (item?.stock_locations && item.stock_locations.length > 0) {
      setMode("selectLocation");
    } else {
      setMode("remove");
    }
  };

  const handleLocationSelect = (location: SelectedLocation) => {
    setSelectedLocation(location);
    if (pendingAction === "add") {
      setMode("add");
    } else {
      setMode("remove");
    }
  };

  if (!item) return null;

  const containerVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={isMobile}
      slotProps={{
        paper: {
          sx: {
            borderRadius: isMobile ? 0 : "24px",
            width: isMobile ? "100%" : "440px",
            maxWidth: "100%",
            overflow: "hidden",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(145deg, #1e1e1e 0%, #121212 100%)"
                : "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 3,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {mode !== "menu" && (
              <IconButton
                onClick={() => {
                  if (mode === "selectLocation") setMode("menu");
                  else if (
                    mode === "add" ||
                    (mode === "remove" &&
                      item.stock_locations &&
                      item.stock_locations.length > 0)
                  )
                    setMode("selectLocation");
                  else setMode("menu");
                }}
                size="small"
                sx={{ mr: 1 }}
              >
                <BackIcon fontSize="small" />
              </IconButton>
            )}
            <Typography
              variant="h6"
              fontWeight="800"
              sx={{ letterSpacing: -0.5 }}
            >
              {mode === "menu"
                ? t("inventory.manageStock")
                : mode === "add"
                  ? t("inventory.addStock")
                  : mode === "selectLocation"
                    ? t("inventory.selectLocation")
                    : t("inventory.removeStock")}
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{ bgcolor: "action.hover" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <AdjustmentQuickInfo item={item} selectedLocation={selectedLocation} />
      </DialogTitle>

      <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
        <AnimatePresence mode="wait">
          {mode === "menu" && (
            <AdjustmentModeSelector
              onAddClick={handleAddClick}
              onRemoveClick={handleRemoveClick}
              containerVariants={containerVariants}
            />
          )}

          {mode === "selectLocation" && (
            <LocationSelector
              item={item}
              onLocationSelect={handleLocationSelect}
              containerVariants={containerVariants}
            />
          )}

          {(mode === "add" || mode === "remove") && (
            <AdjustmentForm
              mode={mode}
              item={item}
              selectedLocation={selectedLocation}
              inputValue={inputValue}
              recipient={recipient}
              destinationLocation={destinationLocation}
              loading={loading}
              onDigit={handleDigit}
              onBackspace={handleBackspace}
              onRecipientChange={setRecipient}
              onDestinationChange={setDestinationLocation}
              onConfirm={handleConfirm}
              locations={locations}
              containerVariants={containerVariants}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default StockAdjustmentDialog;
