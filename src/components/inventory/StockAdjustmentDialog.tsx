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
  TextField,
  Autocomplete,
  Paper,
  Fade,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Close as CloseIcon,
  Backspace as BackspaceIcon,
  LocationOn as LocationIcon,
  ArrowBack as BackIcon,
  Person as PersonIcon,
  Map as MapIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import type { InventoryItem } from "../../types/inventory";
import { useTranslation } from "../../i18n";
import { useInventoryContext } from "../../contexts/InventoryContext";

interface StockAdjustmentDialogProps {
  open: boolean;
  item: InventoryItem | null;
  isMobile: boolean;
  onClose: () => void;
  onSave: (
    itemId: string,
    newStock: number,
    location?: string,
    actionType?: "add" | "remove",
    parentLocation?: string,
    recipient?: string,
    destination_location?: string
  ) => void;
  loading?: boolean;
}

type Mode = "menu" | "add" | "remove" | "selectLocation";

const MotionBox = motion(Box);

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
  const [selectedLocation, setSelectedLocation] = useState<{
    location: string;
    quantity: number;
    parent_location?: string;
  } | null>(null);
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

  const handleLocationSelect = (location: {
    location: string;
    quantity: number;
    parent_location?: string;
  }) => {
    setSelectedLocation(location);
    if (pendingAction === "add") {
      setMode("add");
    } else {
      setMode("remove");
    }
  };

  if (!item) return null;

  const maxRemovable = selectedLocation
    ? selectedLocation.quantity
    : item.stock;
  const inputNum = parseInt(inputValue, 10) || 0;
  const isOverLimit = mode === "remove" && inputNum > (maxRemovable || 0);

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

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 0.5 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight="600"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "200px",
            }}
          >
            {item.name}
          </Typography>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: "12px",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              boxShadow: "0 2px 8px rgba(2, 125, 111, 0.2)",
            }}
          >
            <Typography variant="caption" fontWeight="900">
              {item.stock}
            </Typography>
            <Typography
              variant="caption"
              fontWeight="bold"
              sx={{ fontSize: "0.65rem", opacity: 0.9 }}
            >
              IN STOCK
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {selectedLocation && (
          <Box sx={{ px: 3, pt: 2, pb: 1 }}>
            <Fade in={!!selectedLocation}>
              <Paper
                elevation={0}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: "16px",
                  bgcolor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "10px",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    display: "flex",
                  }}
                >
                  <LocationIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight="bold"
                  >
                    SELECTED LOCATION
                  </Typography>
                  <Typography variant="body2" fontWeight="800">
                    {selectedLocation.location} • {selectedLocation.quantity}{" "}
                    {t("inventory.stockUnits")}
                  </Typography>
                </Box>
              </Paper>
            </Fade>
          </Box>
        )}

        <AnimatePresence mode="wait">
          {mode === "menu" && (
            <MotionBox
              key="menu"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              sx={{ display: "flex", gap: 3, justifyContent: "center", py: 4 }}
            >
              <Button
                variant="contained"
                onClick={handleAddClick}
                sx={{
                  width: 150,
                  height: 150,
                  borderRadius: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  bgcolor: "success.main",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "success.dark",
                    transform: "translateY(-4px)",
                    boxShadow: (theme) =>
                      `0 12px 20px -5px ${theme.palette.success.main}40`,
                  },
                }}
              >
                <AddIcon sx={{ fontSize: 48 }} />
                <Typography fontWeight="800" variant="button">
                  {t("inventory.addStock")}
                </Typography>
              </Button>
              <Button
                variant="contained"
                onClick={handleRemoveClick}
                sx={{
                  width: 150,
                  height: 150,
                  borderRadius: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  bgcolor: "error.main",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "error.dark",
                    transform: "translateY(-4px)",
                    boxShadow: (theme) =>
                      `0 12px 20px -5px ${theme.palette.error.main}40`,
                  },
                }}
              >
                <RemoveIcon sx={{ fontSize: 48 }} />
                <Typography fontWeight="800" variant="button">
                  {t("inventory.removeStock")}
                </Typography>
              </Button>
            </MotionBox>
          )}

          {mode === "selectLocation" && (
            <MotionBox
              key="selectLocation"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                {t("inventory.locationRequired")}
              </Typography>
              <List sx={{ p: 0 }}>
                {(item.stock_locations || []).map((loc) => (
                  <ListItem key={loc.location} disablePadding sx={{ mb: 1.5 }}>
                    <ListItemButton
                      onClick={() =>
                        handleLocationSelect({
                          location: loc.location || "",
                          quantity: loc.quantity || 0,
                          parent_location: loc.parent_location ?? undefined,
                        })
                      }
                      sx={{
                        borderRadius: "16px",
                        py: 2,
                        bgcolor: "action.hover",
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: (theme) =>
                            theme.palette.mode === "dark"
                              ? "rgba(2, 125, 111, 0.1)"
                              : "rgba(2, 125, 111, 0.05)",
                          transform: "scale(1.02)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: "12px",
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            mr: 2,
                          }}
                        >
                          <LocationIcon />
                        </Box>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight="800">
                              {loc.location}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight="600"
                            >
                              {t("inventory.stockLabel").toUpperCase()}:{" "}
                              {loc.quantity}
                            </Typography>
                          }
                        />
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </MotionBox>
          )}

          {(mode === "add" || mode === "remove") && (
            <MotionBox
              key="adjustment"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
            >
              <Paper
                elevation={0}
                sx={{
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(2, 125, 111, 0.1)"
                      : "rgba(2, 125, 111, 0.05)",
                  p: 3,
                  borderRadius: "24px",
                  textAlign: "center",
                  border: "2px solid",
                  borderColor: "primary.main",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Typography
                  variant="caption"
                  color="primary.main"
                  fontWeight="900"
                  sx={{ position: "absolute", top: 12, left: 16 }}
                >
                  QUANTITY
                </Typography>
                <Typography
                  variant="h2"
                  fontWeight="900"
                  color="primary.main"
                  sx={{ letterSpacing: -2 }}
                >
                  {inputValue || "0"}
                </Typography>
              </Paper>

              {mode === "remove" && (
                <Fade in>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <TextField
                      fullWidth
                      variant="filled"
                      label={t("inventory.recipientName")}
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder={t("inventory.recipientPlaceholder")}
                      slotProps={{
                        input: {
                          disableUnderline: true,
                          sx: {
                            borderRadius: "12px",
                            background: "action.hover",
                          },
                          startAdornment: (
                            <PersonIcon
                              sx={{ mr: 1, color: "text.secondary" }}
                              fontSize="small"
                            />
                          ),
                        },
                      }}
                    />
                    <Autocomplete
                      freeSolo
                      options={locations.map((l) => l.name)}
                      value={destinationLocation}
                      onChange={(_, newValue) =>
                        setDestinationLocation(newValue || "")
                      }
                      onInputChange={(_, newValue) =>
                        setDestinationLocation(newValue || "")
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="filled"
                          label={t("inventory.destinationLocation")}
                          placeholder={t("inventory.destinationPlaceholder")}
                          slotProps={{
                            input: {
                              ...params.InputProps,
                              disableUnderline: true,
                              sx: {
                                borderRadius: "12px",
                                background: "action.hover",
                              },
                              startAdornment: (
                                <MapIcon
                                  sx={{ mr: 1, color: "text.secondary" }}
                                  fontSize="small"
                                />
                              ),
                            },
                          }}
                        />
                      )}
                    />
                  </Box>
                </Fade>
              )}

              <Grid container spacing={1.5}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, "0", "back"].map((btn) => (
                  <Grid size={4} key={btn}>
                    {btn === "back" ? (
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleBackspace}
                        sx={{
                          height: 70,
                          borderRadius: "16px",
                          bgcolor: (theme) =>
                            theme.palette.mode === "dark"
                              ? "rgba(237, 108, 2, 0.1)"
                              : "rgba(237, 108, 2, 0.05)",
                          color: "warning.main",
                          borderColor: "warning.main",
                          "&:hover": {
                            bgcolor: "warning.main",
                            color: "white",
                            borderColor: "warning.main",
                          },
                        }}
                      >
                        <BackspaceIcon />
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => handleDigit(btn.toString())}
                        sx={{
                          height: 70,
                          fontSize: "1.75rem",
                          borderRadius: "16px",
                          fontWeight: "800",
                          color: "text.primary",
                          borderColor: "divider",
                          "&:hover": {
                            borderColor: "primary.main",
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        {btn}
                      </Button>
                    )}
                  </Grid>
                ))}
              </Grid>

              <Button
                variant="contained"
                fullWidth
                onClick={handleConfirm}
                color={mode === "add" ? "success" : "error"}
                disabled={!inputValue || loading || isOverLimit}
                sx={{
                  height: 70,
                  fontSize: "1.25rem",
                  borderRadius: "20px",
                  fontWeight: "900",
                  textTransform: "none",
                  boxShadow: (theme) =>
                    `0 12px 24px -6px ${mode === "add" ? theme.palette.success.main : theme.palette.error.main}60`,
                }}
              >
                {loading ? (
                  <CircularProgress size={28} color="inherit" />
                ) : (
                  <>
                    {mode === "add"
                      ? t("inventory.addButton")
                      : t("inventory.removeStock")}
                  </>
                )}
              </Button>

              {isOverLimit && (
                <Typography
                  variant="caption"
                  color="error"
                  textAlign="center"
                  fontWeight="bold"
                >
                  ⚠️ {t("inventory.insufficientStock")}
                </Typography>
              )}
            </MotionBox>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default StockAdjustmentDialog;
