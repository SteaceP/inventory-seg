import React from "react";
import { Typography, Box, Button } from "@mui/material";
import {
    Add as AddIcon,
    QrCodeScanner as ScanIcon,
    Print as PrintIcon,
} from "@mui/icons-material";

interface InventoryHeaderProps {
    isMobile: boolean;
    selectedCount: number;
    onPrint: () => void;
    onScan: () => void;
    onAdd: () => void;
}

const InventoryHeader: React.FC<InventoryHeaderProps> = ({
    isMobile,
    selectedCount,
    onPrint,
    onScan,
    onAdd,
}) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: 2,
                mb: 4,
            }}
        >
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
                Inventory
            </Typography>
            <Box sx={{ display: "flex", gap: 2, width: { xs: "100%", sm: "auto" } }}>
                {selectedCount > 0 && (
                    <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        fullWidth={isMobile}
                        onClick={onPrint}
                        sx={{
                            border: "1px solid #30363d",
                            color: "text.primary",
                            "&:hover": {
                                borderColor: "primary.main",
                                bgcolor: "rgba(88, 166, 255, 0.1)",
                            },
                        }}
                    >
                        Print {isMobile ? "" : `Labels (${selectedCount})`}
                    </Button>
                )}
                <Button
                    variant="outlined"
                    startIcon={<ScanIcon />}
                    fullWidth={isMobile}
                    onClick={onScan}
                    sx={{ border: "1px solid #30363d", color: "text.primary" }}
                >
                    Scan
                </Button>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    fullWidth={isMobile}
                    onClick={onAdd}
                >
                    Add
                </Button>
            </Box>
        </Box>
    );
};

export default InventoryHeader;
