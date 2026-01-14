import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { PhotoCamera, Autorenew as AutoRenewIcon } from "@mui/icons-material";
import { useTranslation } from "../../i18n";
import type { Appliance } from "../../types/appliances";
import { supabase } from "../../supabaseClient";
import { useAlert } from "../../contexts/useAlertContext";
import {
  validateImageFile,
  generateSecureFileName,
  generateSecureId,
  getExtensionFromMimeType,
} from "../../utils/crypto";

interface ApplianceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (appliance: Partial<Appliance>) => void;
  initialData?: Partial<Appliance>;
}

const ApplianceDialog: React.FC<ApplianceDialogProps> = ({
  open,
  onClose,
  onSave,
  initialData = {},
}) => {
  const { t } = useTranslation();
  const { showError } = useAlert();
  const [formData, setFormData] = useState<Partial<Appliance>>(initialData);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];

    try {
      setUploading(true);

      // Validate file type and size
      validateImageFile(file);

      // Get proper extension from MIME type
      const ext = getExtensionFromMimeType(file.type);
      const fileName = generateSecureFileName(ext);
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("appliance-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("appliance-images").getPublicUrl(filePath);

      setFormData({ ...formData, photo_url: publicUrl });
    } catch (err: unknown) {
      showError(
        t("appliances.errorUploadingImage") + ": " + (err as Error).message
      );
    } finally {
      setUploading(false);
    }
  };

  const generateSKU = () => {
    const sku = generateSecureId("APP");
    setFormData({ ...formData, sku });
  };

  const handleChange =
    (field: keyof Appliance) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: event.target.value });
    };

  const handleSave = () => {
    onSave(formData);
    setFormData({}); // Reset for next time
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t("appliances.add")}</DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        <TextField
          autoFocus
          margin="dense"
          label={t("appliances.nameLabel")}
          fullWidth
          value={formData.name || ""}
          onChange={handleChange("name")}
        />

        <Box sx={{ display: "flex", gap: 2, alignItems: "center", my: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoCamera />}
            disabled={uploading}
          >
            {uploading ? t("appliances.uploading") : t("appliances.addPhoto")}
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={(e) => {
                void handleImageUpload(e);
              }}
            />
          </Button>
          {formData.photo_url && (
            <Typography variant="caption" color="success.main">
              {t("appliances.photoAdded")}
            </Typography>
          )}
        </Box>

        <TextField
          margin="dense"
          label={t("appliances.skuLabel")}
          fullWidth
          value={formData.sku || ""}
          onChange={handleChange("sku")}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={generateSKU}
                  edge="end"
                  title={t("appliances.generateSku")}
                >
                  <AutoRenewIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          margin="dense"
          label={t("appliances.type")}
          fullWidth
          value={formData.type || ""}
          onChange={handleChange("type")}
        />
        <TextField
          margin="dense"
          label={t("appliances.brand")}
          fullWidth
          value={formData.brand || ""}
          onChange={handleChange("brand")}
        />
        <TextField
          margin="dense"
          label={t("appliances.model")}
          fullWidth
          value={formData.model || ""}
          onChange={handleChange("model")}
        />
        <TextField
          margin="dense"
          label={t("appliances.purchaseDate")}
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={formData.purchase_date || ""}
          onChange={handleChange("purchase_date")}
        />
        <TextField
          margin="dense"
          label={t("appliances.notes")}
          fullWidth
          multiline
          rows={2}
          value={formData.notes || ""}
          onChange={handleChange("notes")}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("appliances.cancel")}</Button>
        <Button onClick={handleSave} variant="contained">
          {t("appliances.add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplianceDialog;
