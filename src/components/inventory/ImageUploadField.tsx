import React from "react";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import {
  AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../i18n";

interface ImageUploadFieldProps {
  imageUrl?: string;
  loading?: boolean;
  isAdmin: boolean;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  imageUrl,
  loading,
  isAdmin,
  onUpload,
  onRemove,
}) => {
  const { t } = useTranslation();

  return (
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
        cursor: isAdmin ? "pointer" : "default",
        overflow: "hidden",
        position: "relative",
        transition: "border-color 0.2s",
        "&:hover": { borderColor: isAdmin ? "primary.main" : "divider" },
      }}
      onClick={() =>
        isAdmin &&
        !loading &&
        document.getElementById("image-upload-input")?.click()
      }
    >
      {imageUrl ? (
        <>
          <Box
            component="img"
            src={imageUrl}
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
                onRemove();
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
        id="image-upload-input"
        hidden
        accept="image/*"
        onChange={onUpload}
        disabled={!isAdmin || loading}
      />
    </Box>
  );
};

export default ImageUploadField;
