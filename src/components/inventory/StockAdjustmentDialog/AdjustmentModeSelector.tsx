import React from "react";

import { motion } from "framer-motion";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import { useTranslation } from "@/i18n";

import type { Variants } from "framer-motion";

const MotionBox = motion.create(Box);

interface AdjustmentModeSelectorProps {
  onAddClick: () => void;
  onRemoveClick: () => void;
  containerVariants: Variants;
}

const AdjustmentModeSelector: React.FC<AdjustmentModeSelectorProps> = ({
  onAddClick,
  onRemoveClick,
  containerVariants,
}) => {
  const { t } = useTranslation();

  return (
    <MotionBox
      key="menu"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      sx={{ display: "flex", gap: 3, justifyContent: "center", py: 4 }}
    >
      <Button
        variant="contained"
        onClick={onAddClick}
        sx={{
          width: 150,
          height: 150,
          borderRadius: "24px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          bgcolor: "success.main",
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: "success.dark",
            transform: "translateY(-4px)",
            boxShadow: (theme) =>
              `0 12px 20px -5px ${theme.palette.success.main}40`,
          },
        }}
      >
        <AddIcon sx={{ fontSize: 48 }} />
        <Typography fontWeight="800" variant="button">
          {t("inventory.addStock")}
        </Typography>
      </Button>
      <Button
        variant="contained"
        onClick={onRemoveClick}
        sx={{
          width: 150,
          height: 150,
          borderRadius: "24px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          bgcolor: "error.main",
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: "error.dark",
            transform: "translateY(-4px)",
            boxShadow: (theme) =>
              `0 12px 20px -5px ${theme.palette.error.main}40`,
          },
        }}
      >
        <RemoveIcon sx={{ fontSize: 48 }} />
        <Typography fontWeight="800" variant="button">
          {t("inventory.removeStock")}
        </Typography>
      </Button>
    </MotionBox>
  );
};

export default AdjustmentModeSelector;
