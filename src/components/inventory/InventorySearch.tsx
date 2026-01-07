import React from "react";
import { Box, TextField, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useTranslation } from "../../i18n";

interface InventorySearchProps {
    value: string;
    onChange: (value: string) => void;
}

const InventorySearch: React.FC<InventorySearchProps> = ({ value, onChange }) => {
    const { t } = useTranslation();
    return (
        <Box sx={{ mb: 4 }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder={t('inventory.searchPlaceholder')}
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
