import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    TextField,
    Button,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    Refresh as RefreshIcon,
    Delete as DeleteIcon,
    AddPhotoAlternate as AddPhotoIcon,
} from "@mui/icons-material";
import Barcode from "react-barcode";
import type { InventoryItem } from "../../types/inventory";

interface InventoryDialogProps {
    open: boolean;
    editingItem: InventoryItem | null;
    formData: Partial<InventoryItem>;
    isMobile: boolean;
    onClose: () => void;
    onSave: () => void;
    onFormDataChange: (data: Partial<InventoryItem>) => void;
    onGenerateSKU: () => void;
    onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    getBarcodeFormat: (sku: string) => any;
}

const InventoryDialog: React.FC<InventoryDialogProps> = ({
    open,
    editingItem,
    formData,
    isMobile,
    onClose,
    onSave,
    onFormDataChange,
    onGenerateSKU,
    onImageUpload,
    getBarcodeFormat,
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={isMobile}
            PaperProps={{
                sx: {
                    bgcolor: "#0d1117",
                    color: "white",
                    border: isMobile ? "none" : "1px solid #30363d",
                    borderRadius: isMobile ? 0 : "12px",
                    minWidth: isMobile ? "100%" : "450px",
                },
            }}
        >
            <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
                    {/* Image Upload Area */}
                    <Box
                        sx={{
                            width: "100%",
                            height: 200,
                            borderRadius: "12px",
                            border: "2px dashed #30363d",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            overflow: "hidden",
                            position: "relative",
                            transition: "border-color 0.2s",
                            "&:hover": { borderColor: "primary.main" },
                        }}
                        onClick={() => document.getElementById("image-upload")?.click()}
                    >
                        {formData.image_url ? (
                            <>
                                <Box
                                    component="img"
                                    src={formData.image_url}
                                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                                <IconButton
                                    sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        bgcolor: "rgba(0,0,0,0.5)",
                                        "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onFormDataChange({ ...formData, image_url: "" });
                                    }}
                                >
                                    <DeleteIcon sx={{ color: "white" }} />
                                </IconButton>
                            </>
                        ) : (
                            <>
                                <AddPhotoIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Click to upload photo
                                </Typography>
                            </>
                        )}
                        <input
                            type="file"
                            id="image-upload"
                            hidden
                            accept="image/*"
                            onChange={onImageUpload}
                        />
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                        <TextField
                            label="SKU / Barcode"
                            fullWidth
                            value={formData.sku || ""}
                            onChange={(e) =>
                                onFormDataChange({ ...formData, sku: e.target.value })
                            }
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    color: "white",
                                    "& fieldset": { borderColor: "#30363d" },
                                },
                            }}
                            InputLabelProps={{ sx: { color: "text.secondary" } }}
                        />
                        <Tooltip title="Generate SKU">
                            <IconButton
                                onClick={onGenerateSKU}
                                sx={{ mt: 1, color: "primary.main" }}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {formData.sku && (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                p: 2,
                                bgcolor: "white",
                                borderRadius: "8px",
                            }}
                        >
                            <Barcode
                                value={formData.sku}
                                format={getBarcodeFormat(formData.sku)}
                                width={2.0}
                                height={50}
                                fontSize={14}
                                background="#ffffff"
                                margin={10}
                            />
                        </Box>
                    )}

                    <TextField
                        label="Name"
                        fullWidth
                        value={formData.name || ""}
                        onChange={(e) =>
                            onFormDataChange({ ...formData, name: e.target.value })
                        }
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                color: "white",
                                "& fieldset": { borderColor: "#30363d" },
                            },
                        }}
                        InputLabelProps={{ sx: { color: "text.secondary" } }}
                    />
                    <TextField
                        label="Category"
                        fullWidth
                        value={formData.category || ""}
                        onChange={(e) =>
                            onFormDataChange({ ...formData, category: e.target.value })
                        }
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                color: "white",
                                "& fieldset": { borderColor: "#30363d" },
                            },
                        }}
                        InputLabelProps={{ sx: { color: "text.secondary" } }}
                    />
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: isMobile ? "column" : "row",
                            gap: 2,
                        }}
                    >
                        <TextField
                            label="Stock"
                            type="number"
                            fullWidth
                            value={formData.stock || 0}
                            onChange={(e) =>
                                onFormDataChange({
                                    ...formData,
                                    stock: parseInt(e.target.value) || 0,
                                })
                            }
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    color: "white",
                                    "& fieldset": { borderColor: "#30363d" },
                                },
                            }}
                            InputLabelProps={{ sx: { color: "text.secondary" } }}
                        />
                        <TextField
                            label="Price"
                            type="number"
                            fullWidth
                            value={formData.price || 0}
                            onChange={(e) =>
                                onFormDataChange({
                                    ...formData,
                                    price: parseFloat(e.target.value) || 0,
                                })
                            }
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    color: "white",
                                    "& fieldset": { borderColor: "#30363d" },
                                },
                            }}
                            InputLabelProps={{ sx: { color: "text.secondary" } }}
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} sx={{ color: "text.secondary" }}>
                    Cancel
                </Button>
                <Button onClick={onSave} variant="contained" color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InventoryDialog;
