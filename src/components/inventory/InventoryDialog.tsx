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
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  AddPhotoAlternate as AddPhotoIcon,
} from "@mui/icons-material";
import Barcode from "react-barcode";
import type { BarcodeProps } from "react-barcode";
import type { InventoryItem } from "../../types/inventory";

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
}) => {
  const isAdmin = role === "admin";
  const { t } = useTranslation();

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
                  }}
                />

                {isAdmin && (
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
                  }}
                />
                <Typography variant="body2">
                  {isAdmin
                    ? t("inventory.image.clickOrDrop")
                    : t("inventory.image.noImage")}
                </Typography>
              </Box>
            )}
            <input
              type="file"
              id="image-upload"
              hidden
              accept="image/*"
              onChange={onImageUpload}
              disabled={!isAdmin}
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
            <TextField
              label={t("inventory.category")}
              fullWidth
              value={formData.category || ""}
              onChange={(e) =>
                onFormDataChange({ ...formData, category: e.target.value })
              }
              disabled={!isAdmin}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "divider" },
                },
              }}
              InputLabelProps={{ sx: { color: "text.secondary" } }}
            />
            <TextField
              label={t("inventory.stockLabel")}
              type="number"
              fullWidth
              value={formData.stock || ""}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  stock: parseInt(e.target.value) || 0,
                })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "divider" },
                },
              }}
              InputLabelProps={{ sx: { color: "text.secondary" } }}
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
        <Button onClick={onSave} variant="contained" color="primary">
          {t("inventory.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryDialog;
