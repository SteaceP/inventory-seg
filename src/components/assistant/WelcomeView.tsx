import React from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import RobotIcon from "@mui/icons-material/SmartToy";

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
