import React from "react";
import { useTranslation } from "../../i18n";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  AddPhotoAlternate as AddPhotoIcon,
  RemoveCircleOutline as RemoveCircleIcon,
  AddCircleOutline as AddCircleIcon,
} from "@mui/icons-material";
import Barcode from "react-barcode";
import type { BarcodeProps } from "react-barcode";
import type { InventoryItem } from "../../types/inventory";

import { useUserContext } from "../../contexts/useUserContext";
import { useInventoryContext } from "../../contexts/useInventoryContext";

interface InventoryDialogProps {
  open: boolean;
  editingItem: InventoryItem | null;
  formData: Partial<InventoryItem>;
  isMobile: boolean;
  onClose: () => void;
  onSave: () => void;
  onFormDataChange: (data: Partial<InventoryItem>) => void;
  onGenerateSKU: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  getBarcodeFormat: (sku: string) => BarcodeProps["format"];
  role?: string;
  loading?: boolean;
}

const InventoryDialog: React.FC<InventoryDialogProps> = ({
  open,
  editingItem,
  formData,
  isMobile,
  onClose,
  onSave,
  onFormDataChange,
  onGenerateSKU,
  onImageUpload,
  getBarcodeFormat,
  role = "user",
  loading = false,
}) => {
  const isAdmin = role === "admin";
  const { t } = useTranslation();
  const { lowStockThreshold: globalThreshold } = useUserContext();
  const { categories, locations } = useInventoryContext();

  // Helper to find parent_id for a location and then its name
  const findParentName = (locationName: string) => {
    const loc = locations.find((l) => l.name === locationName);
    if (loc && loc.parent_id) {
      const parent = locations.find((p) => p.id === loc.parent_id);
      return parent ? parent.name : undefined;
    }
    return undefined;
  };

  const categoryThreshold = categories.find(
    (c) => c.name === formData.category
  )?.low_stock_threshold;

  const effectiveBaseThreshold = categoryThreshold ?? globalThreshold;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          color: "text.primary",
          border: isMobile ? "none" : "1px solid",
          borderColor: "divider",
          borderRadius: isMobile ? 0 : "12px",
          minWidth: isMobile ? "100%" : "450px",
        },
      }}
    >
      <DialogTitle>
        {editingItem ? t("inventory.edit") : t("inventory.add")}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
          {/* Image Upload Area */}
          <Box
            sx={{
              width: "100%",
              height: 200,
              borderRadius: "12px",
              border: "2px dashed",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              overflow: "hidden",
              position: "relative",
              transition: "border-color 0.2s",
              "&:hover": { borderColor: "primary.main" },
            }}
            onClick={() =>
              isAdmin && document.getElementById("image-upload")?.click()
            }
          >
            {formData.image_url ? (
              <>
                <Box
                  component="img"
                  src={formData.image_url}
                  sx={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "12px",
                    opacity: loading ? 0.5 : 1,
                  }}
                />

                {isAdmin && !loading && (
                  <IconButton
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "rgba(0,0,0,0.5)",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFormDataChange({ ...formData, image_url: "" });
                    }}
                  >
                    <DeleteIcon sx={{ color: "white" }} />
                  </IconButton>
                )}
              </>
            ) : (
              <Box sx={{ textAlign: "center", color: "text.secondary" }}>
                <AddPhotoIcon
                  sx={{
                    fontSize: 40,
                    mb: 1,
                    color: isAdmin ? "primary.main" : "text.disabled",
                    opacity: loading ? 0.5 : 1,
                  }}
                />
                <Typography variant="body2">
                  {isAdmin
                    ? t("inventory.image.clickOrDrop")
                    : t("inventory.image.noImage")}
                </Typography>
              </Box>
            )}

            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "rgba(0,0,0,0.1)",
                  zIndex: 1,
                }}
              >
                <CircularProgress size={40} />
              </Box>
            )}

            <input
              type="file"
              id="image-upload"
              hidden
              accept="image/*"
              onChange={onImageUpload}
              disabled={!isAdmin || loading}
            />
          </Box>

          <TextField
            autoFocus
            label={t("inventory.nameLabel")}
            fullWidth
            value={formData.name || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, name: e.target.value })
            }
            disabled={!isAdmin}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "divider" },
              },
            }}
            InputLabelProps={{ sx: { color: "text.secondary" } }}
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 2,
            }}
          >
            <Autocomplete
              freeSolo
              options={categories.map((c) => c.name)}
              value={formData.category || ""}
              onChange={(_, newValue) => {
                onFormDataChange({ ...formData, category: newValue || "" });
              }}
              onInputChange={(_, newInputValue) => {
                onFormDataChange({
                  ...formData,
                  category: newInputValue || "",
                });
              }}
              disabled={!isAdmin}
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("inventory.category")}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "divider" },
                    },
                  }}
                  InputLabelProps={{ sx: { color: "text.secondary" } }}
                />
              )}
            />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {t("inventory.stockLocations") || "Stock Locations"}
              </Typography>
              <Button
                startIcon={<AddCircleIcon />}
                size="small"
                onClick={() => {
                  const currentLocations = formData.stock_locations || [];
                  onFormDataChange({
                    ...formData,
                    stock_locations: [
                      ...currentLocations,
                      { id: `temp-${Date.now()}`, location: "", quantity: 0 },
                    ],
                  });
                }}
                disabled={!isAdmin}
              >
                {t("common.add") || "Add"}
              </Button>
            </Box>

            {(formData.stock_locations || []).map((loc, index) => (
              <Box
                key={loc.id || `loc-${index}`}
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "flex-start",
                }}
              >
                <Autocomplete
                  freeSolo
                  options={locations.map((l) => l.name)}
                  value={loc.location || ""}
                  onChange={(_, newValue) => {
                    const newLocations = [...(formData.stock_locations || [])];
                    const parentName = newValue
                      ? findParentName(newValue)
                      : undefined;
                    newLocations[index] = {
                      ...newLocations[index],
                      location: newValue || "",
                      parent_location: parentName,
                    };
                    onFormDataChange({
                      ...formData,
                      stock_locations: newLocations,
                    });
                  }}
                  onInputChange={(_, newInputValue) => {
                    const newLocations = [...(formData.stock_locations || [])];
                    const parentName = newInputValue
                      ? findParentName(newInputValue)
                      : undefined;
                    newLocations[index] = {
                      ...newLocations[index],
                      location: newInputValue || "",
                      parent_location: parentName,
                    };
                    onFormDataChange({
                      ...formData,
                      stock_locations: newLocations,
                    });
                  }}
                  disabled={!isAdmin}
                  fullWidth
                  size="small"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("inventory.locationLabel")}
                      placeholder={t("inventory.locationPlaceholder")}
                    />
                  )}
                />

                <TextField
                  label={t("inventory.stockLabel")}
                  type="number"
                  value={loc.quantity}
                  onChange={(e) => {
                    const newLocations = [...(formData.stock_locations || [])];
                    newLocations[index] = {
                      ...newLocations[index],
                      quantity: parseInt(e.target.value) || 0,
                    };
                    // Update total stock
                    const totalStock = newLocations.reduce(
                      (sum, l) => sum + (l.quantity || 0),
                      0
                    );
                    onFormDataChange({
                      ...formData,
                      stock_locations: newLocations,
                      stock: totalStock,
                    });
                  }}
                  disabled={!isAdmin}
                  style={{ width: "120px" }}
                  size="small"
                />
                {isAdmin && (
                  <IconButton
                    color="error"
                    onClick={() => {
                      const newLocations = [
                        ...(formData.stock_locations || []),
                      ];
                      newLocations.splice(index, 1);
                      // Update total stock
                      const totalStock = newLocations.reduce(
                        (sum, l) => sum + (l.quantity || 0),
                        0
                      );
                      onFormDataChange({
                        ...formData,
                        stock_locations: newLocations,
                        stock: totalStock,
                      });
                    }}
                    sx={{ mt: 0.5 }}
                  >
                    <RemoveCircleIcon />
                  </IconButton>
                )}
              </Box>
            ))}

            {(!formData.stock_locations ||
              formData.stock_locations.length === 0) && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                No locations defined. Total stock: {formData.stock || 0}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 2,
            }}
          >
            <TextField
              label={
                t("inventory.lowStockThresholdLabel") || "Seuil de stock bas"
              }
              type="number"
              fullWidth
              value={formData.low_stock_threshold ?? ""}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  low_stock_threshold:
                    e.target.value === "" ? null : parseInt(e.target.value),
                })
              }
              placeholder={effectiveBaseThreshold.toString()}
              helperText={
                formData.low_stock_threshold === undefined ||
                formData.low_stock_threshold === null
                  ? `${t("inventory.usingBaseThreshold") || "Utilise le seuil par défaut"}: ${effectiveBaseThreshold}`
                  : ""
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "divider" },
                },
              }}
              InputLabelProps={{
                sx: { color: "text.secondary" },
                shrink: true,
              }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <TextField
              label={t("inventory.skuLabel")}
              fullWidth
              value={formData.sku || ""}
              onChange={(e) =>
                onFormDataChange({ ...formData, sku: e.target.value })
              }
              disabled={!isAdmin}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "divider" },
                },
              }}
              InputLabelProps={{ sx: { color: "text.secondary" } }}
            />
            {isAdmin && (
              <Tooltip title={t("inventory.generateSku")}>
                <IconButton
                  onClick={onGenerateSKU}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "4px",
                    width: 56,
                    height: 56,
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {formData.sku && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: 2,
                bgcolor: "white",
                borderRadius: "8px",
              }}
            >
              <Barcode
                value={formData.sku}
                format={getBarcodeFormat(formData.sku)}
                width={2.0}
                height={50}
                fontSize={14}
                background="#ffffff"
                margin={10}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ color: "text.secondary" }}>
          {t("inventory.cancel")}
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {t("inventory.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryDialog;
