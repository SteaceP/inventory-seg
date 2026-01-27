import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import {
  WifiOff as WifiOffIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useTranslation } from "@/i18n";

const OfflineFallback: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        p: 3,
        textAlign: "center",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 5,
          borderRadius: 4,
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          maxWidth: 400,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "rgba(2, 125, 111, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
          }}
        >
          <WifiOffIcon sx={{ fontSize: 40, color: "primary.main" }} />
        </Box>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          {t("common.offline")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("common.offlineMessage")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => window.location.reload()}
          sx={{ mt: 1, px: 4, py: 1.5 }}
        >
          {t("common.retry")}
        </Button>
      </Paper>
    </Box>
  );
};

export default OfflineFallback;
