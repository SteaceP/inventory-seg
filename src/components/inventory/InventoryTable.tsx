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

const InventoryTable: React.FC<InventoryTableProps> = ({
    items,
    selectedItems,
    onToggleAll,
    onToggleItem,
    onEdit,
    onDelete,
}) => {
    return (
        <TableContainer
            component={Paper}
            sx={{
                background: (theme) => theme.palette.mode === "dark" ? "rgba(22, 27, 34, 0.7)" : "#ffffff",
                backdropFilter: "blur(10px)",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "12px",
                width: "100%",
                overflowX: "auto",
            }}
        >
            <Table>
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
                        <TableCell sx={{ color: "text.secondary", borderBottom: "1px solid", borderColor: "divider" }}>
                            Image
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", borderBottom: "1px solid", borderColor: "divider" }}>
                            SKU
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", borderBottom: "1px solid", borderColor: "divider" }}>
                            Nom
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", borderBottom: "1px solid", borderColor: "divider" }}>
                            Catégorie
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", borderBottom: "1px solid", borderColor: "divider" }}>
                            Stock
                        </TableCell>
                        <TableCell align="right" sx={{ color: "text.secondary", borderBottom: "1px solid", borderColor: "divider" }}>
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
                            <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider", width: 60 }}>
                                {item.image_url ? (
                                    <Box
                                        component="img"
                                        src={item.image_url}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "8px",
                                            objectFit: "cover",
                                            border: "1px solid",
                                            borderColor: "divider",
                                        }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "8px",
                                            bgcolor: "action.hover",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: "1px solid",
                                            borderColor: "divider",
                                        }}
                                    >
                                        <ImageIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                                    </Box>
                                )}
                            </TableCell>
                            <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider", fontFamily: "monospace" }}>
                                {item.sku || "-"}
                            </TableCell>
                            <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider" }}>{item.name}</TableCell>
                            <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider" }}>{item.category}</TableCell>
                            <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider" }}>{item.stock}</TableCell>
                            <TableCell align="right" sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
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
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default InventoryTable;
