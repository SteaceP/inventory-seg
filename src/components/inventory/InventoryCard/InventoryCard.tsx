import React from "react";

import { motion } from "framer-motion";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import { useTheme, alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import { useTranslation } from "@/i18n";
import type { InventoryItem } from "@/types/inventory";

import { useInventoryContext } from "@contexts/InventoryContext";
import { useUserContext } from "@contexts/UserContext";

// Sub-components
import InventoryCardActions from "./InventoryCardActions";
import InventoryCardMedia from "./InventoryCardMedia";
import InventoryCardStock from "./InventoryCardStock";

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
          borderColor: isSelected ? "brand.primary" : "sidebar.border",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: (theme) => theme.palette.sidebar.background,
          backdropFilter: "blur(10px)",
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: `0 12px 24px -10px ${alpha(theme.palette.brand.primary, 0.3)}`,
            borderColor: "brand.primary",
            "& .card-image": {
              transform: "scale(1.05)",
            },
          },
        }}
      >
        <InventoryCardMedia
          item={item}
          isSelected={isSelected}
          onToggle={onToggle}
          compactView={compactView}
          isBeingEdited={isBeingEdited}
          editorNames={editorNames}
          t={t}
        />

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

          <InventoryCardStock
            item={item}
            effectiveThreshold={effectiveThreshold}
            isLowStock={isLowStock}
            isOutOfStock={isOutOfStock}
            t={t}
          />

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
                  color: "brand.primary",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                }}
              >
                @
              </Box>{" "}
              {item.location}
            </Typography>
          )}
        </CardContent>

        <Divider sx={{ opacity: 0.1 }} />

        <InventoryCardActions
          item={item}
          isAdmin={isAdmin}
          onViewHistory={onViewHistory}
          onAdjust={onAdjust}
          onEdit={onEdit}
          onDelete={onDelete}
          t={t}
        />
      </Card>
    </motion.div>
  );
};

export default InventoryCard;
