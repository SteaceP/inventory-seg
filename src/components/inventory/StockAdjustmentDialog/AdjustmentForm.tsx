import React from "react";
import {
  Box,
  Typography,
  Paper,
  Fade,
  TextField,
  Autocomplete,
  Button,
  CircularProgress,
} from "@mui/material";
import { Person as PersonIcon, Map as MapIcon } from "@mui/icons-material";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useTranslation } from "../../../i18n";
import type { InventoryItem } from "../../../types/inventory";
import type { SelectedLocation } from "./types";
import AdjustmentKeypad from "./AdjustmentKeypad";

const MotionBox = motion.create(Box);

interface AdjustmentFormProps {
  mode: "add" | "remove";
  item: InventoryItem;
  selectedLocation: SelectedLocation | null;
  inputValue: string;
  recipient: string;
  destinationLocation: string;
  loading: boolean;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onRecipientChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onConfirm: () => void;
  locations: { name: string }[];
  containerVariants: Variants;
}

const AdjustmentForm: React.FC<AdjustmentFormProps> = ({
  mode,
  item,
  selectedLocation,
  inputValue,
  recipient,
  destinationLocation,
  loading,
  onDigit,
  onBackspace,
  onRecipientChange,
  onDestinationChange,
  onConfirm,
  locations,
  containerVariants,
}) => {
  const { t } = useTranslation();

  const maxRemovable = selectedLocation
    ? selectedLocation.quantity
    : item.stock;
  const inputNum = parseInt(inputValue, 10) || 0;
  const isOverLimit = mode === "remove" && inputNum > (maxRemovable || 0);

  return (
    <MotionBox
      key="adjustment"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
    >
      <Paper
        elevation={0}
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(2, 125, 111, 0.1)"
              : "rgba(2, 125, 111, 0.05)",
          p: 3,
          borderRadius: "24px",
          textAlign: "center",
          border: "2px solid",
          borderColor: "primary.main",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Typography
          variant="caption"
          color="primary.main"
          fontWeight="900"
          sx={{ position: "absolute", top: 12, left: 16 }}
        >
          QUANTITY
        </Typography>
        <Typography
          variant="h2"
          fontWeight="900"
          color="primary.main"
          sx={{ letterSpacing: -2 }}
        >
          {inputValue || "0"}
        </Typography>
      </Paper>

      {mode === "remove" && (
        <Fade in>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              id="adjustment-recipient"
              name="recipient"
              fullWidth
              variant="filled"
              label={t("inventory.recipientName")}
              value={recipient}
              onChange={(e) => onRecipientChange(e.target.value)}
              placeholder={t("inventory.recipientPlaceholder")}
              slotProps={{
                input: {
                  disableUnderline: true,
                  sx: {
                    borderRadius: "12px",
                    background: "action.hover",
                  },
                  startAdornment: (
                    <PersonIcon
                      sx={{ mr: 1, color: "text.secondary" }}
                      fontSize="small"
                    />
                  ),
                },
              }}
            />
            <Autocomplete
              freeSolo
              options={locations.map((l) => l.name)}
              value={destinationLocation}
              onChange={(_, newValue) => onDestinationChange(newValue || "")}
              onInputChange={(_, newValue) =>
                onDestinationChange(newValue || "")
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  id="adjustment-destination"
                  name="destinationLocation"
                  variant="filled"
                  label={t("inventory.destinationLocation")}
                  placeholder={t("inventory.destinationPlaceholder")}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      disableUnderline: true,
                      sx: {
                        borderRadius: "12px",
                        background: "action.hover",
                      },
                      startAdornment: (
                        <MapIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                          fontSize="small"
                        />
                      ),
                    },
                  }}
                />
              )}
            />
          </Box>
        </Fade>
      )}

      <AdjustmentKeypad onDigit={onDigit} onBackspace={onBackspace} />

      <Button
        variant="contained"
        fullWidth
        onClick={onConfirm}
        color={mode === "add" ? "success" : "error"}
        disabled={!inputValue || loading || isOverLimit}
        sx={{
          height: 70,
          fontSize: "1.25rem",
          borderRadius: "20px",
          fontWeight: "900",
          textTransform: "none",
          boxShadow: (theme) =>
            `0 12px 24px -6px ${mode === "add" ? theme.palette.success.main : theme.palette.error.main}60`,
        }}
      >
        {loading ? (
          <CircularProgress size={28} color="inherit" />
        ) : (
          <>
            {mode === "add"
              ? t("inventory.addButton")
              : t("inventory.removeStock")}
          </>
        )}
      </Button>

      {isOverLimit && (
        <Typography
          variant="caption"
          color="error"
          textAlign="center"
          fontWeight="bold"
        >
          ⚠️ {t("inventory.insufficientStock")}
        </Typography>
      )}
    </MotionBox>
  );
};

export default AdjustmentForm;
