import React from "react";
import { Box, Paper, Typography, Avatar, TextField } from "@mui/material";
import {
  Person as PersonIcon,
  PhotoCamera as CameraIcon,
} from "@mui/icons-material";
import { useTranslation } from "@/i18n";

interface ProfileSectionProps {
  displayName: string;
  avatarUrl: string;
  email: string;
  onDisplayNameChange: (name: string) => void;
  onAvatarChange: (file: File) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  displayName,
  avatarUrl,
  email,
  onDisplayNameChange,
  onAvatarChange,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const getInitials = (name: string, emailStr: string) => {
    if (name) return name.substring(0, 2).toUpperCase();
    if (emailStr) return emailStr.substring(0, 2).toUpperCase();
    return "U";
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onAvatarChange(e.target.files[0]);
    }
  };

  return (
    <Paper
      sx={{
        p: 3,
        background: (theme) =>
          theme.palette.mode === "dark" ? "rgba(22, 27, 34, 0.7)" : "#ffffff",
        backdropFilter: "blur(10px)",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px",
        height: "100%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" fontWeight="bold">
          {t("profile.title")}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Box
            sx={{
              position: "relative",
              cursor: "pointer",
              "&:hover .avatar-overlay": { opacity: 1 },
            }}
            onClick={handleAvatarClick}
            data-testid="avatar-container"
          >
            <Avatar
              src={avatarUrl}
              sx={{
                width: 100,
                height: 100,
                bgcolor: "primary.main",
                fontSize: "2rem",
                border: "4px solid",
                borderColor: "background.paper",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              {getInitials(displayName, email)}
            </Avatar>
            <Box
              className="avatar-overlay"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                bgcolor: "rgba(0, 0, 0, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.2s",
              }}
            >
              <CameraIcon sx={{ color: "white" }} />
            </Box>
          </Box>
          <input
            id="avatar-upload"
            name="avatar"
            type="file"
            hidden
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            data-testid="avatar-input"
            aria-label={t("profile.changeAvatar")}
          />
        </Box>

        <TextField
          id="display-name"
          name="displayName"
          label={t("profile.displayName")}
          fullWidth
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "divider" },
            },
          }}
          slotProps={{ inputLabel: { sx: { color: "text.secondary" } } }}
        />

        <TextField
          id="email"
          name="email"
          label={t("profile.email")}
          fullWidth
          value={email}
          disabled
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "divider" },
            },
          }}
          slotProps={{ inputLabel: { sx: { color: "text.secondary" } } }}
        />
      </Box>
    </Paper>
  );
};

export default ProfileSection;
