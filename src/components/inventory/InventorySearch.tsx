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
                placeholder="Search items by name, SKU, or category..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(22, 27, 34, 0.7)",
                        color: "white",
                        "& fieldset": { borderColor: "#30363d" },
                        "&:hover fieldset": { borderColor: "#58a6ff" },
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
