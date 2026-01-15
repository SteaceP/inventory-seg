import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Exposure as ExposureIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import type { InventoryItem } from "../../types/inventory";
import { useThemeContext } from "../../contexts/useThemeContext";
import { useTranslation } from "../../i18n";
import { useUserContext } from "../../contexts/useUserContext";
import { useInventoryContext } from "../../contexts/useInventoryContext";

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
  const { compactView } = useThemeContext();
  const theme = useTheme();
  const { t } = useTranslation();
  const { lowStockThreshold: globalThreshold } = useUserContext();
  const { categories } = useInventoryContext();
  const { role } = useUserContext();
  const isAdmin = role === "admin";

  const categoryThreshold = categories.find(
    (c) => c.name === item.category
  )?.low_stock_threshold;

  const effectiveThreshold =
    item.low_stock_threshold ?? categoryThreshold ?? globalThreshold;

  const isLowStock = (item.stock || 0) <= effectiveThreshold;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{ height: "100%" }}
    >
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          backdropFilter: "blur(10px)",
          border: isLowStock ? "2px solid" : "1px solid",
          borderColor: isLowStock ? "warning.main" : "divider",
          borderRadius: compactView ? "8px" : "12px",
          position: "relative",
          overflow: "hidden",
          boxShadow: isLowStock
            ? `0 4px 12px ${alpha(theme.palette.warning.main, 0.2)}, 0 0 10px ${alpha(theme.palette.warning.main, 0.1)}`
            : `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
          transition:
            "transform 0.2s ease-in-out, border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          "&:hover": {
            borderColor: isLowStock ? "warning.dark" : "primary.main",
            transform: "translateY(-4px)",
            boxShadow: isLowStock
              ? `0 12px 24px ${alpha(theme.palette.warning.main, 0.3)}, 0 0 15px ${alpha(theme.palette.warning.main, 0.2)}`
              : `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
        }}
      >
        {item.image_url ? (
          <Box
            sx={{
              width: "100%",
              height: {
                xs: compactView ? 160 : 320,
                sm: compactView ? 120 : 240,
              },
              overflow: "hidden",
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={item.image_url}
              sx={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              alt={item.name}
            />
          </Box>
        ) : (
          <Box
            sx={{
              width: "100%",
              height: {
                xs: compactView ? 80 : 160,
                sm: compactView ? 60 : 100,
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              color: "primary.main",
              opacity: 0.5,
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src="/icon.svg"
              sx={{
                width: compactView ? 24 : 40,
                height: compactView ? 24 : 40,
                filter: "grayscale(1)",
              }}
            />
          </Box>
        )}
        <CardContent
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            p: compactView ? 2 : 3,
            "&:last-child": { pb: compactView ? 2 : 3 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: compactView ? 1 : 2,
              gap: 1,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Tooltip title={item.name} enterDelay={500} arrow>
                <Typography
                  variant={compactView ? "body1" : "h5"}
                  fontWeight="800"
                  sx={{
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: compactView ? 1.2 : 1.4,
                    height: compactView ? "2.4em" : "2.8em", // Force consistent height for 2 lines
                  }}
                >
                  {item.name}
                </Typography>
              </Tooltip>
            </Box>
            <Checkbox
              checked={isSelected}
              onChange={(e) => onToggle(item.id, e.target.checked)}
              sx={{ color: "text.secondary", p: 0, flexShrink: 0 }}
            />
          </Box>
          <Box
            sx={{
              flexGrow: 1, // Push bottom actions to the bottom
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: compactView ? "flex-start" : "center",
                mb: compactView ? 1 : 2,
              }}
            >
              <Chip
                label={item.category}
                size="small"
                sx={{
                  bgcolor: "rgba(2, 125, 111, 0.1)",
                  color: "primary.main",
                  height: compactView ? 20 : 24,
                  fontSize: compactView ? "0.65rem" : "0.75rem",
                }}
              />
              {item.stock_locations && item.stock_locations.length > 0 ? (
                <Tooltip
                  title={
                    <Box>
                      {item.stock_locations.map((loc) => (
                        <div key={loc.id || `${loc.location}-${loc.quantity}`}>
                          {loc.location}: {loc.quantity}
                        </div>
                      ))}
                    </Box>
                  }
                  arrow
                >
                  <Chip
                    label={`${item.stock_locations.length} ${t("inventory.locationLabel")}s`}
                    size="small"
                    variant="outlined"
                    sx={{
                      ml: 1,
                      borderColor: "divider",
                      color: "text.secondary",
                      height: compactView ? 20 : 24,
                      fontSize: compactView ? "0.65rem" : "0.75rem",
                      maxWidth: "50%",
                      cursor: "help",
                    }}
                  />
                </Tooltip>
              ) : item.location ? (
                <Chip
                  label={item.location}
                  size="small"
                  variant="outlined"
                  sx={{
                    ml: 1,
                    borderColor: "divider",
                    color: "text.secondary",
                    height: compactView ? 20 : 24,
                    fontSize: compactView ? "0.65rem" : "0.75rem",
                    maxWidth: "50%",
                  }}
                />
              ) : null}
            </Box>

            <Box sx={{ mt: "auto" }}>
              <Divider
                sx={{ my: compactView ? 1 : 1.5, borderColor: "divider" }}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: isLowStock ? "warning.main" : "text.secondary",
                    fontWeight: isLowStock ? "bold" : "medium",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {isLowStock && (
                    <Chip
                      label={t("inventory.lowStock") || "STOCK BAS"}
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{
                        height: 18,
                        fontSize: "0.65rem",
                        fontWeight: "bold",
                        borderRadius: "4px",
                        borderWidth: "1px",
                      }}
                    />
                  )}
                  {item.stock} {t("inventory.stock")}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Tooltip title={t("inventory.viewHistory")}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewHistory?.(item.id, item.name);
                      }}
                      sx={{
                        color: "text.secondary",
                        mr: 0.5,
                        p: compactView ? 0.5 : 1,
                      }}
                    >
                      <HistoryIcon
                        fontSize={compactView ? "inherit" : "small"}
                      />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("inventory.manageStock")}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAdjust) onAdjust(item);
                        else onEdit(item);
                      }}
                      sx={{
                        color: "success.main",
                        mr: 0.5,
                        p: compactView ? 0.5 : 1,
                      }}
                    >
                      <ExposureIcon
                        fontSize={compactView ? "inherit" : "small"}
                      />
                    </IconButton>
                  </Tooltip>
                  {isAdmin && (
                    <Tooltip title={t("inventory.edit")}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                        }}
                        sx={{
                          color: "primary.main",
                          mr: onDelete ? 0.5 : 0,
                          p: compactView ? 0.5 : 1,
                        }}
                      >
                        <EditIcon
                          fontSize={compactView ? "inherit" : "small"}
                        />
                      </IconButton>
                    </Tooltip>
                  )}
                  {isAdmin && onDelete && (
                    <Tooltip title={t("inventory.delete")}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                        sx={{ color: "error.main", p: compactView ? 0.5 : 1 }}
                      >
                        <DeleteIcon
                          fontSize={compactView ? "inherit" : "small"}
                        />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InventoryCard;
