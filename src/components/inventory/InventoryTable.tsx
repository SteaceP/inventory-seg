import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    IconButton,
    Box,
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Image as ImageIcon,
} from "@mui/icons-material";
import type { InventoryItem } from "../../types/inventory";

interface InventoryTableProps {
    items: InventoryItem[];
    selectedItems: Set<string>;
    onToggleAll: (checked: boolean) => void;
    onToggleItem: (id: string, checked: boolean) => void;
    onEdit: (item: InventoryItem) => void;
    onDelete: (id: string) => void;
}

import { useThemeContext } from "../../contexts/ThemeContext";

const InventoryTable: React.FC<InventoryTableProps> = ({
    items,
    selectedItems,
    onToggleAll,
    onToggleItem,
    onEdit,
    onDelete,
}) => {
    const { compactView } = useThemeContext();

    return (
        <TableContainer
            component={Paper}
            sx={{
                background: (theme) => theme.palette.mode === "dark" ? "rgba(22, 27, 34, 0.7)" : "#ffffff",
                backdropFilter: "blur(10px)",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: compactView ? "8px" : "12px",
                width: "100%",
                overflowX: "auto",
            }}
        >
            <Table size={compactView ? "small" : "medium"}>
                <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox" sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
                            <Checkbox
                                indeterminate={
                                    selectedItems.size > 0 && selectedItems.size < items.length
                                }
                                checked={items.length > 0 && selectedItems.size === items.length}
                                onChange={(e) => onToggleAll(e.target.checked)}
                                sx={{ color: "text.secondary" }}
                            />
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", borderBottom: "1px solid", borderColor: "divider", fontSize: compactView ? "0.75rem" : "inherit" }}>
                            Image
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", borderBottom: "1px solid", borderColor: "divider", fontSize: compactView ? "0.75rem" : "inherit" }}>
                            Nom
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", borderBottom: "1px solid", borderColor: "divider", fontSize: compactView ? "0.75rem" : "inherit" }}>
                            Catégorie
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", borderBottom: "1px solid", borderColor: "divider", fontSize: compactView ? "0.75rem" : "inherit" }}>
                            Stock
                        </TableCell>
                        <TableCell align="right" sx={{ color: "text.secondary", borderBottom: "1px solid", borderColor: "divider", fontSize: compactView ? "0.75rem" : "inherit" }}>
                            Actions
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id} selected={selectedItems.has(item.id)}>
                            <TableCell padding="checkbox" sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
                                <Checkbox
                                    checked={selectedItems.has(item.id)}
                                    onChange={(e) => onToggleItem(item.id, e.target.checked)}
                                    sx={{ color: "text.secondary" }}
                                />
                            </TableCell>
                            <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider", width: compactView ? 40 : 60 }}>
                                {item.image_url ? (
                                    <Box
                                        component="img"
                                        src={item.image_url}
                                        sx={{
                                            width: compactView ? 30 : 40,
                                            height: compactView ? 30 : 40,
                                            borderRadius: "4px",
                                            objectFit: "cover",
                                            border: "1px solid",
                                            borderColor: "divider",
                                        }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            width: compactView ? 30 : 40,
                                            height: compactView ? 30 : 40,
                                            borderRadius: "4px",
                                            bgcolor: "action.hover",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: "1px solid",
                                            borderColor: "divider",
                                        }}
                                    >
                                        <ImageIcon sx={{ color: "text.secondary", fontSize: compactView ? 16 : 20 }} />
                                    </Box>
                                )}
                            </TableCell>
                            <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider", fontSize: compactView ? "0.8125rem" : "0.875rem" }}>{item.name}</TableCell>
                            <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider", fontSize: compactView ? "0.8125rem" : "0.875rem" }}>{item.category}</TableCell>
                            <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider", fontSize: compactView ? "0.8125rem" : "0.875rem" }}>{item.stock}</TableCell>
                            <TableCell align="right" sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
                                <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
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
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default InventoryTable;
