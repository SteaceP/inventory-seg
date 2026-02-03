import React, { useState, useEffect, useCallback } from "react";
import { useErrorHandler } from "@hooks/useErrorHandler";
import { useTranslation } from "@/i18n";
import { supabase } from "@/supabaseClient";
import type { InventoryActivity, ActivityAction } from "@/types/activity";
import StockHistoryItem from "./StockHistoryItem";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";

interface StockHistoryDialogProps {
  open: boolean;
  itemId: string | null;
  itemName: string;
  onClose: () => void;
}

interface ActivityQueryResult {
  id: string;
  inventory_id: string;
  user_id: string | null;
  action: ActivityAction;
  item_name: string;
  changes: {
    stock?: number;
    old_stock?: number;
    location?: string;
    action_type?: "add" | "remove" | "adjust";
    [key: string]: unknown;
  };
  created_at: string;
}

const StockHistoryDialog: React.FC<StockHistoryDialogProps> = ({
  open,
  itemId,
  itemName,
  onClose,
}) => {
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<InventoryActivity[]>([]);

  const fetchHistory = useCallback(async () => {
    if (!itemId) return;

    try {
      setLoading(true);
      const { data: activityData, error: activityError } = await supabase
        .from("inventory_activity")
        .select("*")
        .eq("inventory_id", itemId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (activityError) throw activityError;

      // Extract unique user IDs
      const userIds = [
        ...new Set(
          (activityData || [])
            .map((a: { user_id: string | null }) => a.user_id)
            .filter((id): id is string => !!id)
        ),
      ];

      let userNames: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from("user_settings")
          .select("user_id, display_name")
          .in("user_id", userIds);

        if (!userError && userData) {
          userNames = (
            userData as { user_id: string; display_name: string | null }[]
          ).reduce(
            (acc, user) => {
              acc[user.user_id] = user.display_name || "Unknown User";
              return acc;
            },
            {} as Record<string, string>
          );
        }
      }

      const formattedData = (
        (activityData as unknown as ActivityQueryResult[]) || []
      ).map((item: ActivityQueryResult) => ({
        ...item,
        user_display_name: item.user_id
          ? userNames[item.user_id] || "Unknown User"
          : "System",
      })) as InventoryActivity[];

      setActivities(formattedData);
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
    if (open && itemId) {
      void fetchHistory();
    }
  }, [open, itemId, fetchHistory]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "12px",
            maxHeight: "80vh",
          },
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
          "@media print": { display: "none" },
        }}
      >
        <Typography variant="h6" component="h2" fontWeight="bold">
          {t("inventory.history")}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton onClick={handlePrint} size="small">
            <PrintIcon />
          </IconButton>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Print-only header */}
      <Box sx={{ display: "none", "@media print": { display: "block", p: 3 } }}>
        <Typography variant="h4" gutterBottom>
          {t("inventory.history")}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {itemName}
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>

      <DialogContent sx={{ px: 3 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <CircularProgress />
          </Box>
        ) : activities.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              {t("inventory.noHistory")}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {activities.map((activity) => (
              <StockHistoryItem
                key={activity.id}
                activity={activity}
                formatDate={formatDate}
              />
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, "@media print": { display: "none" } }}>
        <Button onClick={onClose}>{t("common.close")}</Button>
      </DialogActions>

      {/* Print-specific styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .MuiDialog-root,
            .MuiDialog-root * {
              visibility: visible;
            }
            .MuiDialog-root {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .MuiBackdrop-root {
              display: none;
            }
          }
        `}
      </style>
    </Dialog>
  );
};

export default StockHistoryDialog;
