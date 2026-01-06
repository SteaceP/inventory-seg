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
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Exposure as ExposureIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import type { InventoryItem } from "../../types/inventory";

interface InventoryCardProps {
    item: InventoryItem;
    isSelected: boolean;
    onToggle: (id: string, checked: boolean) => void;
    onEdit: (item: InventoryItem) => void;
    onDelete?: (id: string) => void;
}

import { useThemeContext } from "../../contexts/useThemeContext";

const InventoryCard: React.FC<InventoryCardProps> = ({
    item,
    isSelected,
    onToggle,
    onEdit,
    onDelete,
}) => {
    const { compactView } = useThemeContext();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
        >
            <Card
                sx={{
                    bgcolor: "background.paper",
                    backdropFilter: "blur(10px)",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: compactView ? "8px" : "12px",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": { borderColor: "primary.main" },
                }}
            >
                {item.image_url && (
                    <Box
                        component="img"
                        src={item.image_url}
                        sx={{
                            display: 'block',
                            width: "100%",
                            height: compactView ? 80 : 140,
                            objectFit: "cover",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            borderTopLeftRadius: compactView ? "8px" : "12px",
                            borderTopRightRadius: compactView ? "8px" : "12px",
                        }}
                    />
                )}
                <CardContent sx={{ p: compactView ? 1.5 : 2, "&:last-child": { pb: compactView ? 1.5 : 2 } }}>
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
                            <Typography
                                variant={compactView ? "body1" : "h6"}
                                fontWeight="bold"
                                sx={{
                                    wordBreak: "break-word",
                                    overflowWrap: "break-word",
                                }}
                            >
                                {item.name}
                            </Typography>
                        </Box>
                        <Checkbox
                            checked={isSelected}
                            onChange={(e) => onToggle(item.id, e.target.checked)}
                            sx={{ color: "text.secondary", p: 0, flexShrink: 0 }}
                        />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: compactView ? "flex-start" : "center", mb: compactView ? 1 : 2 }}>
                        <Chip
                            label={item.category}
                            size="small"
                            sx={{
                                bgcolor: "rgba(2, 125, 111, 0.1)",
                                color: "primary.main",
                                height: compactView ? 20 : 24,
                                fontSize: compactView ? "0.65rem" : "0.75rem"
                            }}
                        />
                    </Box>

                    <Divider sx={{ my: compactView ? 1 : 1.5, borderColor: "divider" }} />

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
                                color: (item.stock || 0) < 5 ? "warning.main" : "text.secondary",
                                fontWeight: "medium",
                            }}
                        >
                            {item.stock} en stock
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <IconButton
                                size="small"
                                onClick={() => onEdit(item)}
                                sx={{ color: "primary.main", mr: onDelete ? 0.5 : 0, p: compactView ? 0.5 : 1 }}
                                title={onDelete ? "Modifier" : "Gérer le stock"}
                            >
                                {onDelete ? <EditIcon fontSize={compactView ? "inherit" : "small"} /> : <ExposureIcon sx={{ fontSize: "3.75rem" }} />}
                            </IconButton>
                            {onDelete && (
                                <IconButton
                                    size="small"
                                    onClick={() => onDelete(item.id)}
                                    sx={{ color: "error.main", p: compactView ? 0.5 : 1 }}
                                    title="Supprimer"
                                >
                                    <DeleteIcon fontSize={compactView ? "inherit" : "small"} />
                                </IconButton>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default InventoryCard;
