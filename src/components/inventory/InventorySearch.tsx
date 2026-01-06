import React from "react";
import { Box, TextField, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

interface InventorySearchProps {
    value: string;
    onChange: (value: string) => void;
}

const InventorySearch: React.FC<InventorySearchProps> = ({ value, onChange }) => {
    return (
        <Box sx={{ mb: 4 }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Rechercher des articles par nom, SKU ou catégorie..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(22, 27, 34, 0.7)" : "#ffffff",
                        "& fieldset": { borderColor: "divider" },
                        "&:hover fieldset": { borderColor: "primary.main" },
                    },
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                    ),
                }}
            />
        </Box>
    );
};

export default InventorySearch;
