import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { useTranslation } from "@/i18n";
import { useErrorHandler } from "@hooks/useErrorHandler";
import { supabase } from "@/supabaseClient";
import {
  validateImageFile,
  generateSecureFileName,
  getExtensionFromMimeType,
} from "@utils/crypto";

interface ApplianceImageUploadProps {
  photoUrl: string | null | undefined;
  onUploadSuccess: (url: string) => void;
}

const ApplianceImageUpload: React.FC<ApplianceImageUploadProps> = ({
  photoUrl,
  onUploadSuccess,
}) => {
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();
  const [uploading, setUploading] = useState(false);

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

      onUploadSuccess(publicUrl);
    } catch (err: unknown) {
      handleError(err, t("appliances.errorUploadingImage"));
    } finally {
      setUploading(false);
    }
  };

  return (
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
      {photoUrl && (
        <Typography variant="caption" color="success.main" fontWeight="bold">
          ✓ {t("appliances.photoAdded")}
        </Typography>
      )}
    </Box>
  );
};

export default ApplianceImageUpload;
