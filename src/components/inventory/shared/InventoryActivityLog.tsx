import React, { useState, useEffect, useCallback } from "react";

import Box from "@mui/material/Box";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import HistoryIcon from "@mui/icons-material/History";

import { useTranslation } from "@/i18n";
import { supabase } from "@/supabaseClient";
import type { ActivityLog } from "@/types/inventory";

import { useErrorHandler } from "@hooks/useErrorHandler";

interface InventoryActivityLogProps {
  itemId: string;
}

const InventoryActivityLog: React.FC<InventoryActivityLogProps> = ({
  itemId,
}) => {
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActivity = useCallback(async () => {
    if (!itemId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("inventory_activity")
        .select("*")
        .eq("inventory_id", itemId)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setActivity((data as ActivityLog[]) || []);
    } catch (err: unknown) {
      handleError(
        err,
        t("errors.loadActivity") + ": " + (err as Error).message
      );
    } finally {
      setLoading(false);
    }
  }, [itemId, handleError, t]);

  useEffect(() => {
    void fetchActivity();
  }, [fetchActivity]);

  if (loading && activity.length === 0) {
    return null; // Or a skeleton
  }

  if (activity.length === 0) {
    return (
      <Paper
        sx={{
          p: 3,
          textAlign: "center",
          bgcolor: "action.hover",
          borderRadius: 3,
        }}
      >
        <HistoryIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {t("inventory.drawer.noHistory")}
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {activity.map((log) => (
        <Paper key={log.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <ListItemText
            primary={log.action}
            secondary={
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.primary"
                >
                  {log.created_at
                    ? new Date(log.created_at).toLocaleString()
                    : ""}
                </Typography>
                {log.changes && (
                  <Box component="span" sx={{ display: "block" }}>
                    {log.changes.action_type && (
                      <Typography component="span" variant="caption">
                        Action: {log.changes.action_type}
                      </Typography>
                    )}
                    {log.changes.stock !== undefined && (
                      <Typography component="span" variant="caption">
                        {" "}
                        New Stock: {log.changes.stock}
                      </Typography>
                    )}
                    {log.changes.old_stock !== undefined && (
                      <Typography component="span" variant="caption">
                        {" "}
                        (Was: {log.changes.old_stock})
                      </Typography>
                    )}
                    {log.changes.location && (
                      <Typography
                        component="span"
                        variant="caption"
                        display="block"
                        color="primary"
                      >
                        {log.changes.location}
                      </Typography>
                    )}
                  </Box>
                )}
              </React.Fragment>
            }
          />
        </Paper>
      ))}
    </Stack>
  );
};

export default InventoryActivityLog;
