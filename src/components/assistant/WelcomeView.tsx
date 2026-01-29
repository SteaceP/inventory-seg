import React from "react";
import { Box, Typography } from "@mui/material";
import { SmartToy as RobotIcon } from "@mui/icons-material";
import { useTranslation } from "@/i18n";

const WelcomeView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.5,
        gap: 2,
      }}
    >
      <RobotIcon sx={{ fontSize: 64 }} />
      <Typography variant="body1">{t("assistant.welcome")}</Typography>
    </Box>
  );
};

export default WelcomeView;
