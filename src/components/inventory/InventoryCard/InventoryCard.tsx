import React from "react";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import { alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import { useTranslation } from "@/i18n";
import type { InventoryItem } from "@/types/inventory";

import { useInventoryContext } from "@contexts/InventoryContext";
import { useUserContext } from "@contexts/UserContext";
import { calculateEffectiveThreshold } from "@utils/inventoryUtils";

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
  const { compactView, lowStockThreshold: globalThreshold } = useUserContext();
  const { categories, presence } = useInventoryContext();
  const { role, userId: currentUserId } = useUserContext();
  const isAdmin = role === "admin";

  const categoryThreshold = categories.find(
    (c) => c.name === item.category
  )?.low_stock_threshold;

  const effectiveThreshold = calculateEffectiveThreshold(
    item.low_stock_threshold,
    categoryThreshold,
    globalThreshold
  );

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
          bgcolor: "background.paper",
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: (theme) =>
              `0 12px 24px -4px ${alpha(theme.palette.common.black, theme.palette.mode === "dark" ? 0.3 : 0.08)}`,
            borderColor: isSelected ? "primary.main" : "text.secondary",
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
              color="text.secondary"
              sx={{ fontWeight: "medium" }}
            >
              {item.category}
            </Typography>
          </Box>

          {item.notes && (
            <Box
              sx={{
                mt: 1.5,
                mb: 1.5,
                p: 1.5,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                border: "1px solid",
                borderColor: "divider",
                maxHeight: 120,
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: (theme) => alpha(theme.palette.text.primary, 0.1),
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: (theme) => alpha(theme.palette.text.primary, 0.2),
                },
                "& p": {
                  m: 0,
                  fontSize: "0.875rem",
                  color: "text.secondary",
                  lineHeight: 1.6,
                },
                "& strong": {
                  color: "text.primary",
                  fontWeight: 700,
                },
                "& ul, & ol": {
                  m: 0,
                  pl: 2.5,
                  color: "text.secondary",
                },
                "& li": {
                  fontSize: "0.875rem",
                  color: "text.secondary",
                  mb: 0.5,
                },
                "& a": {
                  color: "primary.main",
                  textDecoration: "none",
                  fontWeight: 500,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                },
                "& code": {
                  fontFamily: "monospace",
                  fontSize: "0.8em",
                  bgcolor: (theme) => alpha(theme.palette.text.primary, 0.1),
                  p: 0.5,
                  borderRadius: 1,
                  color: "text.primary",
                },
                "& blockquote": {
                  borderLeft: "3px solid",
                  borderColor: "primary.main",
                  m: 0,
                  pl: 2,
                  fontStyle: "italic",
                  color: "text.secondary",
                },
              }}
            >
              <ReactMarkdown>{item.notes}</ReactMarkdown>
            </Box>
          )}

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
