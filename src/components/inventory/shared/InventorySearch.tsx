import React, { useState, useEffect } from "react";
import { useTranslation } from "@/i18n";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

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
  const [prevValue, setPrevValue] = useState<string>(value || "");

  // Render-phase sync: when value prop changes, update local state
  if (value !== prevValue) {
    setLocal(value || "");
    setPrevValue(value || "");
  }

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
        id="inventory-search"
        name="search"
        key={value}
        fullWidth
        variant="outlined"
        placeholder={t("inventory.searchPlaceholder")}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        aria-label={t("inventory.searchPlaceholder")}
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
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  );
};

export default InventorySearch;
