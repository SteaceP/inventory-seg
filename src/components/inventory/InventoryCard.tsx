import React from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Checkbox,
    Stack,
    Chip,
    Divider,
    IconButton,
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import type { InventoryItem } from "../../types/inventory";

interface InventoryCardProps {
    item: InventoryItem;
    isSelected: boolean;
    onToggle: (id: string, checked: boolean) => void;
    onEdit: (item: InventoryItem) => void;
    onDelete: (id: string) => void;
}

const InventoryCard: React.FC<InventoryCardProps> = ({
    item,
    isSelected,
    onToggle,
    onEdit,
    onDelete,
}) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
        >
            <Card
                sx={{
                    bgcolor: "rgba(22, 27, 34, 0.7)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid #30363d",
                    borderRadius: "12px",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": { borderColor: "#58a6ff" },
                }}
            >
                {item.image_url && (
                    <Box
                        component="img"
                        src={item.image_url}
                        sx={{
                            width: "100%",
                            height: 140,
                            objectFit: "cover",
                            borderBottom: "1px solid #30363d",
                        }}
                    />
                )}
                <CardContent>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                        }}
                    >
                        <Box>
                            <Typography variant="h6" fontWeight="bold">
                                {item.name}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{ fontFamily: "monospace", color: "text.secondary" }}
                            >
                                {item.sku || "Pas de SKU"}
                            </Typography>
                        </Box>
                        <Checkbox
                            checked={isSelected}
                            onChange={(e) => onToggle(item.id, e.target.checked)}
                            sx={{ color: "text.secondary", p: 0 }}
                        />
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip
                            label={`${item.stock} en stock`}
                            size="small"
                            color={item.stock < 5 ? "warning" : "default"}
                            sx={{
                                bgcolor:
                                    item.stock < 5
                                        ? "rgba(210, 153, 34, 0.1)"
                                        : "rgba(48, 54, 61, 0.5)",
                            }}
                        />
                        <Chip
                            label={item.category}
                            size="small"
                            sx={{ bgcolor: "rgba(88, 166, 255, 0.1)", color: "#58a6ff" }}
                        />
                    </Stack>

                    <Divider sx={{ my: 1.5, borderColor: "#30363d" }} />

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h6" color="primary.main">
                            ${item.price.toFixed(2)}
                        </Typography>
                        <Box>
                            <IconButton
                                size="small"
                                onClick={() => onEdit(item)}
                                sx={{ color: "primary.main", mr: 1 }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={() => onDelete(item.id)}
                                sx={{ color: "error.main" }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default InventoryCard;
