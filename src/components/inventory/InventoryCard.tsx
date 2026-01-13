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
} from "@mui/icons-material";
import { motion } from "framer-motion";
import type { InventoryItem } from "../../types/inventory";
import { useThemeContext } from "../../contexts/useThemeContext";
import { useTranslation } from "../../i18n";

interface InventoryCardProps {
  item: InventoryItem;
  isSelected: boolean;
  onToggle: (id: string, checked: boolean) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
}

const InventoryCard: React.FC<InventoryCardProps> = ({
  item,
  isSelected,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const { compactView } = useThemeContext();
  const theme = useTheme();
  const { t } = useTranslation();

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
          border: "1px solid",
          borderColor: "divider",
          borderRadius: compactView ? "8px" : "12px",
          position: "relative",
          overflow: "hidden",
          transition:
            "transform 0.2s ease-in-out, border-color 0.2s ease-in-out",
          "&:hover": {
            borderColor: "primary.main",
            transform: "translateY(-4px)",
          },
        }}
      >
        {item.image_url ? (
          <Box
            sx={{
              width: "100%",
              height: compactView ? 100 : 160,
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
              height: compactView ? 60 : 100,
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
            p: compactView ? 1.5 : 2,
            "&:last-child": { pb: compactView ? 1.5 : 2 },
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
                  variant={compactView ? "body1" : "h6"}
                  fontWeight="bold"
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
                    color:
                      (item.stock || 0) < 5 ? "warning.main" : "text.secondary",
                    fontWeight: "medium",
                  }}
                >
                  {item.stock} {t("inventory.stock")}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(item)}
                    sx={{
                      color: "primary.main",
                      mr: onDelete ? 0.5 : 0,
                      p: compactView ? 0.5 : 1,
                    }}
                    title={
                      onDelete
                        ? t("inventory.edit")
                        : t("inventory.manageStock")
                    }
                  >
                    {onDelete ? (
                      <EditIcon fontSize={compactView ? "inherit" : "small"} />
                    ) : (
                      <ExposureIcon
                        fontSize={compactView ? "inherit" : "small"}
                      />
                    )}
                  </IconButton>
                  {onDelete && (
                    <IconButton
                      size="small"
                      onClick={() => onDelete(item.id)}
                      sx={{ color: "error.main", p: compactView ? 0.5 : 1 }}
                      title={t("inventory.delete")}
                    >
                      <DeleteIcon
                        fontSize={compactView ? "inherit" : "small"}
                      />
                    </IconButton>
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
