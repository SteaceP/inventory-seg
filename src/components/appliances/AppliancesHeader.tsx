import React from "react";
import { Box, Typography, Button } from "@mui/material";
import {
  Add as AddIcon,
  FilterCenterFocus as ScanIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../i18n";

interface AppliancesHeaderProps {
  compactView: boolean;
  selectedCount: number;
  onPrintLabels: () => void;
  onScan: () => void;
  onAddAppliance: () => void;
}

const AppliancesHeader: React.FC<AppliancesHeaderProps> = ({
  compactView,
  selectedCount,
  onPrintLabels,
  onScan,
  onAddAppliance,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "stretch", sm: "center" },
        gap: 2,
        mb: compactView ? 2 : 3,
      }}
    >
      <Typography
        variant={compactView ? "h5" : "h4"}
        fontWeight="bold"
        sx={{ color: "text.primary" }}
      >
        {t("menu.appliances")}
      </Typography>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {selectedCount > 0 && (
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={onPrintLabels}
            sx={{
              color: "text.primary",
              borderColor: "divider",
              fontWeight: "bold",
              flex: { xs: 1, sm: "0 1 auto" },
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(2, 125, 111, 0.1)"
                    : "rgba(2, 125, 111, 0.05)",
              },
            }}
          >
            {t("inventory.printLabels")} ({selectedCount})
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<ScanIcon />}
          onClick={onScan}
          sx={{
            color: "text.primary",
            borderColor: "divider",
            fontWeight: "bold",
            flex: { xs: 1, sm: "0 1 auto" },
          }}
        >
          {t("inventory.scan")}
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddAppliance}
          sx={{
            background: "linear-gradient(45deg, #027d6f 30%, #1a748b 90%)",
            color: "white",
            fontWeight: "bold",
            boxShadow: "0 3px 5px 2px rgba(2, 125, 111, .3)",
            flex: { xs: 1, sm: "0 1 auto" },
          }}
        >
          {t("appliances.add")}
        </Button>
      </Box>
    </Box>
  );
};

export default AppliancesHeader;
