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
  CircularProgress,
  MenuItem,
  Grid,
} from "@mui/material";
import { PhotoCamera, Autorenew as AutoRenewIcon } from "@mui/icons-material";
import { useTranslation } from "../../i18n";
import type { Appliance } from "../../types/appliances";
import { useAlert } from "../../contexts/AlertContext";
import { supabase } from "../../supabaseClient";
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
  loading?: boolean;
}

const ApplianceDialog: React.FC<ApplianceDialogProps> = ({
  open,
  onClose,
  onSave,
  initialData = {},
  loading = false,
}) => {
  const { t } = useTranslation();
  const { showError } = useAlert();

  // Initialize with defaults if adding new
  const [formData, setFormData] = useState<Partial<Appliance>>({
    status: "functional",
    expected_life: 10,
    ...initialData,
  });
  const [uploading, setUploading] = useState(false);

  const isEdit = !!initialData.id;

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];

    try {
      setUploading(true);
      validateImageFile(file);
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
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        event.target.type === "number"
          ? Number(event.target.value)
          : event.target.value;
      setFormData({ ...formData, [field]: value });
    };

  const handleSave = () => {
    onSave(formData);
    if (!isEdit) setFormData({ status: "functional", expected_life: 10 });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle fontWeight="bold">
        {isEdit
          ? t("appliances.edit") || "Edit Appliance"
          : t("appliances.add")}
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              autoFocus
              margin="dense"
              label={t("appliances.nameLabel")}
              fullWidth
              value={formData.name || ""}
              onChange={handleChange("name")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              margin="dense"
              label={t("appliances.status.title") || "Status"}
              fullWidth
              value={formData.status || "functional"}
              onChange={handleChange("status" as keyof Appliance)}
            >
              <MenuItem value="functional">
                {t("appliances.status.functional") || "Operational"}
              </MenuItem>
              <MenuItem value="needs_service">
                {t("appliances.status.needsService") || "Needs Service"}
              </MenuItem>
              <MenuItem value="broken">
                {t("appliances.status.broken") || "Broken"}
              </MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
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
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              margin="dense"
              label={t("appliances.serialLabel") || "Serial Number"}
              fullWidth
              value={formData.serial_number || ""}
              onChange={handleChange("serial_number")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              margin="dense"
              label={t("appliances.brand")}
              fullWidth
              value={formData.brand || ""}
              onChange={handleChange("brand")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              margin="dense"
              label={t("appliances.type")}
              fullWidth
              value={formData.type || ""}
              onChange={handleChange("type")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              margin="dense"
              label={t("appliances.model")}
              fullWidth
              value={formData.model || ""}
              onChange={handleChange("model")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              margin="dense"
              label={t("appliances.purchaseDate")}
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.purchase_date || ""}
              onChange={handleChange("purchase_date")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              margin="dense"
              label={t("appliances.warrantyExpiry") || "Warranty Expiry"}
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.warranty_expiry || ""}
              onChange={handleChange("warranty_expiry")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              margin="dense"
              label={t("appliances.expectedLife") || "Expected Life (Years)"}
              type="number"
              fullWidth
              value={formData.expected_life || 10}
              onChange={handleChange("expected_life")}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              margin="dense"
              label={t("appliances.locationLabel")}
              fullWidth
              value={formData.location || ""}
              onChange={handleChange("location")}
              placeholder={t("appliances.locationPlaceholder")}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              margin="dense"
              label={t("appliances.notes")}
              fullWidth
              multiline
              rows={2}
              value={formData.notes || ""}
              onChange={handleChange("notes")}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoCamera />}
            disabled={uploading}
            size="small"
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
            <Typography
              variant="caption"
              color="success.main"
              fontWeight="bold"
            >
              ✓ {t("appliances.photoAdded")}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          {t("appliances.cancel")}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || uploading}
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : null
          }
          sx={{ px: 4 }}
        >
          {isEdit ? t("common.save") || "Save" : t("appliances.add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplianceDialog;
