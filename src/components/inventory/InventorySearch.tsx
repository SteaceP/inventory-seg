import React, { useState, useEffect } from "react";
import { Box, TextField, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useTranslation } from "../../i18n";

interface InventorySearchProps {
  value: string;
  onChange: (value: string) => void;
}

const InventorySearch: React.FC<InventorySearchProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation();
  const [local, setLocal] = useState<string>(value || "");

  // keep local state in sync if parent changes externally
  useEffect(() => {
    if (value !== local) {
      const id = setTimeout(() => setLocal(value || ""), 0);
      return () => clearTimeout(id);
    }
    return;
  }, [value, local]);

  // debounce calling onChange to avoid rapid server calls
  useEffect(() => {
    const id = setTimeout(() => {
      if (local !== value) onChange(local);
    }, 300);
    return () => clearTimeout(id);
  }, [local, onChange, value]);

  return (
    <Box sx={{ mb: 4 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder={t("inventory.searchPlaceholder")}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(22, 27, 34, 0.7)"
                : "#ffffff",
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
