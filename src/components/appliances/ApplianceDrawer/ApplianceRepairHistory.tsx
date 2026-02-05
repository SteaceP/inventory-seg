import React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/Assignment";
import BuildIcon from "@mui/icons-material/Build";

import { useTranslation } from "@/i18n";
import type { Appliance, Repair } from "@/types/appliances";

import RepairItem from "../shared/RepairItem";

interface ApplianceRepairHistoryProps {
  appliance: Appliance;
  repairs: Repair[];
  onAddRepair: (appliance: Appliance) => void;
}

const ApplianceRepairHistory: React.FC<ApplianceRepairHistoryProps> = ({
  appliance,
  repairs,
  onAddRepair,
}) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <HistoryIcon fontSize="small" color="primary" />{" "}
          {t("appliances.history")}
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => onAddRepair(appliance)}
          variant="outlined"
        >
          {t("appliances.addRepair")}
        </Button>
      </Box>

      {repairs.length === 0 ? (
        <Paper
          sx={{
            p: 3,
            textAlign: "center",
            bgcolor: "action.hover",
            borderRadius: 3,
          }}
        >
          <BuildIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {t("appliances.noRepairs")}
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {repairs.map((repair) => (
            <RepairItem key={repair.id} repair={repair} />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ApplianceRepairHistory;
