import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useTranslation } from "../i18n";
import { supabase } from "../supabaseClient";
import { useAlert } from "../contexts/AlertContext";
import type { InventoryActivity } from "../types/activity";
import { alpha } from "@mui/material/styles";
import { getActivityNarrative, getStockChange } from "../utils/activityUtils";

const InventoryActivityPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { showError } = useAlert();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activities, setActivities] = useState<InventoryActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  const fetchHistory = useCallback(
    async (pageNum: number, isInitial = false) => {
      try {
        if (isInitial) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        const queryParams = new URLSearchParams({
          page: pageNum.toString(),
          pageSize: PAGE_SIZE.toString(),
          actionFilter,
          searchTerm,
        });

        const response = await fetch(`/api/activity?${queryParams}`, {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch activity");
        const activityData: InventoryActivity[] = await response.json();

        if (!activityData || activityData.length < PAGE_SIZE) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        const userIds = [
          ...new Set(
            (activityData || [])
              .map((a: InventoryActivity) => a.user_id)
              .filter((id: string | null): id is string => !!id)
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

        const formattedData = activityData.map((item) => ({
          ...item,
          user_display_name: item.user_id
            ? userNames[item.user_id] || "Unknown User"
            : "System",
        })) as InventoryActivity[];

        if (isInitial) {
          setActivities(formattedData);
        } else {
          setActivities((prev) => [...prev, ...formattedData]);
        }
      } catch (err: unknown) {
        console.error("Error fetching activity:", err);
        showError(t("errors.loadActivity") + ": " + (err as Error).message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [actionFilter, searchTerm, showError, t]
  );

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    void fetchHistory(0, true);
  }, [fetchHistory, searchTerm, actionFilter]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      void fetchHistory(nextPage);
    }
  }, [fetchHistory, hasMore, loadingMore, page]);

  // Infinite scroll observer
  const observerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore) return;
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });
      if (node) observer.observe(node);
    },
    [hasMore, loadMore, loading, loadingMore]
  );

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

  const getActionIcon = (
    action: string,
    changes: InventoryActivity["changes"]
  ) => {
    if (action === "created")
      return <AddIcon fontSize="small" color="success" />;
    if (action === "deleted")
      return <DeleteIcon fontSize="small" color="error" />;

    const actionType = changes?.action_type;
    if (actionType === "add")
      return <TrendingUpIcon fontSize="small" color="success" />;
    if (actionType === "remove")
      return <TrendingDownIcon fontSize="small" color="error" />;

    return <EditIcon fontSize="small" color="primary" />;
  };

  const filteredActivities = activities.filter((a) => {
    const matchesSearch =
      a.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.user_display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction =
      actionFilter === "all" ||
      a.action === actionFilter ||
      (actionFilter === "stock" &&
        (a.changes?.action_type === "add" ||
          a.changes?.action_type === "remove"));
    return matchesSearch && matchesAction;
  });

  return (
    <Container maxWidth={false} sx={{ py: 4, maxWidth: "1600px" }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          {t("inventory.activity.globalTitle")}
        </Typography>
        <IconButton
          onClick={() => {
            setPage(0);
            setHasMore(true);
            void fetchHistory(0, true);
          }}
          disabled={loading}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      <Paper
        sx={{
          p: 2,
          mb: 4,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          size="small"
          placeholder={t("inventory.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: "200px" }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: "150px" }}>
          <InputLabel>{t("inventory.category")}</InputLabel>
          <Select
            value={actionFilter}
            label={t("inventory.category")}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <MenuItem value="all">All Actions</MenuItem>
            <MenuItem value="created">Created</MenuItem>
            <MenuItem value="updated">Updated</MenuItem>
            <MenuItem value="deleted">Deleted</MenuItem>
            <MenuItem value="stock">Stock Only</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filteredActivities.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography color="text.secondary">
                {t("inventory.noHistory")}
              </Typography>
            </Box>
          ) : (
            filteredActivities.map((activity) => {
              const stockChange = getStockChange(activity.changes);

              return (
                <Paper
                  key={activity.id}
                  elevation={0}
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "12px",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: "8px",
                          bgcolor: alpha(
                            actionFilter === "deleted"
                              ? theme.palette.error.main
                              : theme.palette.primary.main,
                            0.1
                          ),
                          display: "flex",
                        }}
                      >
                        {getActionIcon(activity.action, activity.changes)}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {activity.item_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getActivityNarrative(activity, t)}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(activity.created_at)}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2, ml: 7 }}>
                    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {stockChange && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="body2">
                            Stock: {stockChange.oldStock} →{" "}
                            {stockChange.newStock}
                          </Typography>
                          <Chip
                            label={`${stockChange.diff > 0 ? "+" : ""}${stockChange.diff}`}
                            size="small"
                            color={stockChange.color as "success" | "error"}
                            sx={{ height: 20, fontSize: "0.75rem" }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>
              );
            })
          )}
          {(hasMore || loadingMore) && (
            <Box
              ref={observerRef}
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 4,
                width: "100%",
              }}
            >
              {loadingMore && <CircularProgress size={24} />}
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default InventoryActivityPage;
