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
                background: "rgba(22, 27, 34, 0.7)",
                backdropFilter: "blur(10px)",
                border: "1px solid #30363d",
                borderRadius: "12px",
                width: "100%",
                overflowX: "auto",
            }}
        >
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox" sx={{ borderBottom: "1px solid #30363d" }}>
                            <Checkbox
                                indeterminate={
                                    selectedItems.size > 0 && selectedItems.size < items.length
                                }
                                checked={items.length > 0 && selectedItems.size === items.length}
                                onChange={(e) => onToggleAll(e.target.checked)}
                                sx={{ color: "text.secondary" }}
                            />
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", borderBottom: "1px solid #30363d" }}>
                            Image
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", borderBottom: "1px solid #30363d" }}>
                            SKU
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", borderBottom: "1px solid #30363d" }}>
                            Nom
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", borderBottom: "1px solid #30363d" }}>
                            Catégorie
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", borderBottom: "1px solid #30363d" }}>
                            Stock
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", borderBottom: "1px solid #30363d" }}>
                            Prix
                        </TableCell>
                        <TableCell align="right" sx={{ color: "text.secondary", borderBottom: "1px solid #30363d" }}>
                            Actions
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id} selected={selectedItems.has(item.id)}>
                            <TableCell padding="checkbox" sx={{ borderBottom: "1px solid #30363d" }}>
                                <Checkbox
                                    checked={selectedItems.has(item.id)}
                                    onChange={(e) => onToggleItem(item.id, e.target.checked)}
                                    sx={{ color: "text.secondary" }}
                                />
                            </TableCell>
                            <TableCell sx={{ borderBottom: "1px solid #30363d", width: 60 }}>
                                {item.image_url ? (
                                    <Box
                                        component="img"
                                        src={item.image_url}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "8px",
                                            objectFit: "cover",
                                            border: "1px solid #30363d",
                                        }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "8px",
                                            bgcolor: "rgba(255,255,255,0.05)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: "1px solid #30363d",
                                        }}
                                    >
                                        <ImageIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                                    </Box>
                                )}
                            </TableCell>
                            <TableCell sx={{ borderBottom: "1px solid #30363d", fontFamily: "monospace" }}>
                                {item.sku || "-"}
                            </TableCell>
                            <TableCell sx={{ borderBottom: "1px solid #30363d" }}>{item.name}</TableCell>
                            <TableCell sx={{ borderBottom: "1px solid #30363d" }}>{item.category}</TableCell>
                            <TableCell sx={{ borderBottom: "1px solid #30363d" }}>{item.stock}</TableCell>
                            <TableCell sx={{ borderBottom: "1px solid #30363d" }}>
                                ${item.price.toFixed(2)}
                            </TableCell>
                            <TableCell align="right" sx={{ borderBottom: "1px solid #30363d" }}>
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
