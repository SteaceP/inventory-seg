import React from "react";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { useTranslation } from "@/i18n";
import type { Repair } from "@/types/appliances";

interface RepairItemProps {
  repair: Repair;
}

const RepairItem: React.FC<RepairItemProps> = ({ repair }) => {
  const { t } = useTranslation();

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          {repair.description}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {repair.repair_date}
        </Typography>
      </Box>
      {repair.parts && repair.parts.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            {t("appliances.parts")}:
          </Typography>
          <Box
            sx={{
              pl: 1,
              borderLeft: "2px solid",
              borderColor: "primary.main",
              mb: 1.5,
            }}
          >
            {repair.parts.map((part) => (
              <Box
                key={part.id || part.name}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  - {part.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {part.price.toFixed(2)} $
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 1,
        }}
      >
        <Typography variant="caption" sx={{ fontStyle: "italic" }}>
          {repair.service_provider}
        </Typography>
        <Typography variant="body2" fontWeight="bold" color="primary.main">
          {(repair.parts || [])
            .reduce((s, p) => s + (p.price || 0), 0)
            .toFixed(2)}{" "}
          $
        </Typography>
      </Box>
    </Paper>
  );
};

export default RepairItem;
