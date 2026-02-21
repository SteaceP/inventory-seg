import React from "react";

import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

import RefreshIcon from "@mui/icons-material/Refresh";

import { useTranslation } from "@/i18n";
import type { InventoryItem } from "@/types/inventory";

import { useInventoryContext } from "@contexts/InventoryContext";
import { useUserContext } from "@contexts/UserContextDefinition";
import { calculateEffectiveThreshold } from "@utils/inventoryUtils";

import ImageUploadField from "../shared/ImageUploadField";
import LazyBarcode from "../shared/LazyBarcode";
import StockLocationFields from "../shared/StockLocationFields";

import type { BarcodeProps } from "react-barcode";

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

  const effectiveBaseThreshold = calculateEffectiveThreshold(
    null,
    categoryThreshold,
    globalThreshold
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      slotProps={{
        paper: {
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            border: isMobile ? "none" : "1px solid",
            borderColor: "divider",
            borderRadius: isMobile ? 0 : "12px",
            minWidth: isMobile ? "100%" : "450px",
          },
        },
      }}
    >
      <DialogTitle>
        {editingItem ? t("inventory.edit") : t("inventory.add")}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
          <ImageUploadField
            imageUrl={formData.image_url ?? undefined}
            loading={loading}
            isAdmin={isAdmin}
            onUpload={onImageUpload}
            onRemove={() => onFormDataChange({ ...formData, image_url: "" })}
          />

          <TextField
            id="item-name"
            name="name"
            autoFocus
            label={t("inventory.nameLabel")}
            fullWidth
            value={formData.name || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, name: e.target.value })
            }
            slotProps={{ htmlInput: { "data-testid": "item-name-input" } }}
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
              <TextField
                {...params}
                id="item-category"
                name="category"
                label={t("inventory.category")}
                slotProps={{
                  htmlInput: {
                    ...params.inputProps,
                    "data-testid": "item-category-input",
                  },
                }}
              />
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
            id="item-threshold"
            name="low_stock_threshold"
            label={
              t("inventory.lowStockThresholdLabel") || "Seuil de stock bas"
            }
            type="number"
            fullWidth
            slotProps={{
              htmlInput: { "data-testid": "item-threshold-input" },
              inputLabel: {
                shrink: true,
              },
            }}
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
          />

          <TextField
            id="item-notes"
            name="notes"
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
              id="item-sku"
              name="sku"
              label={t("inventory.skuLabel")}
              fullWidth
              slotProps={{ htmlInput: { "data-testid": "item-sku-input" } }}
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
              <LazyBarcode
                value={formData.sku}
                format={getBarcodeFormat(formData.sku)}
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
