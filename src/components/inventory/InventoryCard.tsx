import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  Chip,
  LinearProgress,
  IconButton,
  Stack,
  alpha,
  useTheme,
  Button,
  CardActions,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Exposure as ExposureIcon,
  History as HistoryIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import type { InventoryItem } from "../../types/inventory";
import { useTranslation } from "../../i18n";
import { useUserContext } from "../../contexts/UserContext";
import { useInventoryContext } from "../../contexts/InventoryContext";

interface InventoryCardProps {
  item: InventoryItem;
  isSelected: boolean;
  onToggle: (id: string, checked: boolean) => void;
  onEdit: (item: InventoryItem) => void;
  onAdjust?: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
  onViewHistory?: (itemId: string, itemName: string) => void;
}

const InventoryCard: React.FC<InventoryCardProps> = ({
  item,
  isSelected,
  onToggle,
  onEdit,
  onAdjust,
  onDelete,
  onViewHistory,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { compactView, lowStockThreshold: globalThreshold } = useUserContext();
  const { categories, presence } = useInventoryContext();
  const { role, userId: currentUserId } = useUserContext();
  const isAdmin = role === "admin";

  const categoryThreshold = categories.find(
    (c) => c.name === item.category
  )?.low_stock_threshold;

  const effectiveThreshold =
    item.low_stock_threshold ?? categoryThreshold ?? globalThreshold;

  const isLowStock = (item.stock || 0) <= effectiveThreshold;
  const isOutOfStock = (item.stock || 0) === 0;

  // Find other users editing this card
  const editors = Object.values(presence).filter(
    (p) => p.editingId === item.id && p.userId !== currentUserId
  );
  const isBeingEdited = editors.length > 0;
  const editorNames = editors.map((e) => e.displayName).join(", ");

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{ height: "100%" }}
    >
      <Card
        elevation={0}
        onClick={() => onViewHistory?.(item.id, item.name)}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: isSelected ? "primary.main" : "divider",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.background.paper, 0.6)
              : theme.palette.background.paper,
          backdropFilter: "blur(10px)",
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: `0 12px 24px -10px ${alpha(theme.palette.common.black, 0.3)}`,
            borderColor: "primary.main",
            "& .card-image": {
              transform: "scale(1.05)",
            },
          },
        }}
      >
        <Box sx={{ position: "relative" }}>
          <Checkbox
            checked={isSelected}
            onChange={(e) => onToggle(item.id, e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 2,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(4px)",
              "&:hover": { bgcolor: theme.palette.background.paper },
              borderRadius: 1,
              p: 0.5,
            }}
          />

          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 2,
              display: "flex",
              gap: 1,
            }}
          >
            <Chip
              label={item.category}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.9),
                color: "white",
                fontWeight: "bold",
                backdropFilter: "blur(4px)",
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.2),
              }}
            />
            {isBeingEdited && (
              <Chip
                label={`${editorNames} ${t("inventory.isEditing") || "is editing..."}`}
                size="small"
                color="warning"
                sx={{
                  fontWeight: "bold",
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%": { opacity: 1 },
                    "50%": { opacity: 0.6 },
                    "100%": { opacity: 1 },
                  },
                }}
              />
            )}
          </Box>

          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              height: compactView ? 140 : 180,
              bgcolor: "background.paper",
            }}
          >
            {item.image_url ? (
              <>
                {/* Background Layer: Blurred and low-opacity */}
                <Box
                  component="img"
                  src={item.image_url}
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "blur(20px) opacity(0.3)",
                    transform: "scale(1.1)", // Prevent white edges from blur
                  }}
                />
                {/* Foreground Layer: The actual product image */}
                <Box
                  component="img"
                  src={item.image_url}
                  className="card-image"
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    transition: "transform 0.5s ease",
                    p: 1, // Slight padding to breathe
                  }}
                />
              </>
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.disabled",
                  bgcolor: "action.hover",
                }}
              >
                <InventoryIcon sx={{ fontSize: 48, opacity: 0.2 }} />
              </Box>
            )}
          </Box>
        </Box>

        <CardContent sx={{ p: compactView ? 2 : 3, flexGrow: 1 }}>
          <Typography
            variant={compactView ? "subtitle1" : "h6"}
            fontWeight="bold"
            gutterBottom
            noWrap
          >
            {item.name}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography
              variant="caption"
              color="text.primary"
              sx={{
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {item.sku || "NO SKU"}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              •
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: "medium" }}
            >
              {item.category}
            </Typography>
          </Box>

          {(isLowStock || isOutOfStock) && (
            <Chip
              label={
                isOutOfStock
                  ? t("inventory.stats.outOfStock")
                  : t("inventory.stats.lowStock")
              }
              size="small"
              color={isOutOfStock ? "error" : "warning"}
              sx={{
                bgcolor: (theme) =>
                  alpha(
                    isOutOfStock
                      ? theme.palette.error.main
                      : theme.palette.warning.main,
                    0.1
                  ),
                color: isOutOfStock ? "error.main" : "warning.main",
                fontWeight: "bold",
                borderRadius: 1,
                mb: 1.5,
              }}
            />
          )}

          {item.location && (
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "text.primary",
                fontWeight: "medium",
              }}
            >
              <Box
                component="span"
                sx={{
                  color: "primary.main",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                }}
              >
                @
              </Box>{" "}
              {item.location}
            </Typography>
          )}

          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                mb: 1,
              }}
            >
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="900"
                  sx={{
                    color: isOutOfStock
                      ? "error.main"
                      : isLowStock
                        ? "warning.main"
                        : "text.primary",
                    lineHeight: 1,
                    display: "inline-block",
                  }}
                >
                  {item.stock}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="900"
                  sx={{ ml: 1, textTransform: "uppercase", letterSpacing: 1 }}
                >
                  {t("inventory.stockUnits")}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                fontWeight="900"
                color="text.secondary"
                sx={{
                  opacity: 0.8,
                  bgcolor: alpha(theme.palette.divider, 0.05),
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.divider, 0.1),
                  letterSpacing: 0.5,
                }}
              >
                {t("inventory.minThreshold", { threshold: effectiveThreshold })}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(
                100,
                ((item.stock || 0) / effectiveThreshold) * 100
              )}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.divider, 0.1),
                "& .MuiLinearProgress-bar": {
                  bgcolor: isOutOfStock
                    ? "error.main"
                    : isLowStock
                      ? "warning.main"
                      : "success.main",
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        </CardContent>

        <Divider sx={{ opacity: 0.1 }} />

        <CardActions
          sx={{
            p: 1.5,
            bgcolor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.background.default, 0.8)
                : alpha(theme.palette.action.hover, 0.9),
            borderTop: "1px solid",
            borderColor: "divider",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="small"
            startIcon={<HistoryIcon />}
            onClick={() => onViewHistory?.(item.id, item.name)}
            sx={{
              fontWeight: "bold",
              color: theme.palette.text.primary,
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            {t("inventory.history") || "History"}
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={() => onAdjust?.(item)}
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: "success.main",
                "&:hover": { bgcolor: alpha(theme.palette.success.main, 0.2) },
              }}
            >
              <ExposureIcon fontSize="small" />
            </IconButton>

            {isAdmin && (
              <>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => onEdit(item)}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete?.(item.id)}
                  sx={{
                    bgcolor: alpha(theme.palette.error.main, 0.05),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.error.main, 0.15),
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Stack>
        </CardActions>
      </Card>
    </motion.div>
  );
};

export default InventoryCard;
