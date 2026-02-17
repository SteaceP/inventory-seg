import React, { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import PhotoCamera from "@mui/icons-material/PhotoCamera";

import { useTranslation } from "@/i18n";
import { supabase } from "@/supabaseClient";

import { useErrorHandler } from "@hooks/useErrorHandler";
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

      // Prepare form data for worker upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "appliance-images");
      formData.append("fileName", fileName);

      // Get session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session");
      }

      const response = await fetch(
        `${import.meta.env.VITE_WORKER_URL || ""}/api/storage/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error || "Upload failed");
      }

      const { url } = (await response.json()) as { url: string };

      onUploadSuccess(url);
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
