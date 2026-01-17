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
  Autocomplete,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import Barcode from "react-barcode";
import type { BarcodeProps } from "react-barcode";
import type { InventoryItem } from "../../types/inventory";

import { useUserContext } from "../../contexts/UserContext";
import { useInventoryContext } from "../../contexts/InventoryContext";
import ImageUploadField from "./ImageUploadField";
import StockLocationFields from "./StockLocationFields";

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
          <ImageUploadField
            imageUrl={formData.image_url}
            loading={loading}
            isAdmin={isAdmin}
            onUpload={onImageUpload}
            onRemove={() => onFormDataChange({ ...formData, image_url: "" })}
          />

          <TextField
            autoFocus
            label={t("inventory.nameLabel")}
            fullWidth
            value={formData.name || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, name: e.target.value })
            }
            disabled={!isAdmin}
          />

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
              <TextField {...params} label={t("inventory.category")} />
            )}
          />

          <StockLocationFields
            stockLocations={formData.stock_locations}
            totalStock={formData.stock || 0}
            locations={locations}
            isAdmin={isAdmin}
            onChange={(newLocations, totalStock) =>
              onFormDataChange({
                ...formData,
                stock_locations: newLocations,
                stock: totalStock,
              })
            }
          />

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
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            label={t("inventory.notes")}
            multiline
            rows={3}
            fullWidth
            value={formData.notes || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, notes: e.target.value })
            }
            disabled={!isAdmin}
          />

          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <TextField
              label={t("inventory.skuLabel")}
              fullWidth
              value={formData.sku || ""}
              onChange={(e) =>
                onFormDataChange({ ...formData, sku: e.target.value })
              }
              disabled={!isAdmin}
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
        >
          {t("inventory.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryDialog;
