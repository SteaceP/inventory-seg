import React from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Autocomplete,
  TextField,
} from "@mui/material";
import {
  AddCircleOutline as AddCircleIcon,
  RemoveCircleOutline as RemoveCircleIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../../i18n";
import type { InventoryItem } from "../../../types/inventory";

interface StockLocationFieldsProps {
  stockLocations: InventoryItem["stock_locations"];
  totalStock: number;
  locations: { id: string; name: string; parent_id?: string | null }[];
  isAdmin: boolean;
  onChange: (
    locations: InventoryItem["stock_locations"],
    totalStock: number
  ) => void;
}

const StockLocationFields: React.FC<StockLocationFieldsProps> = ({
  stockLocations = [],
  totalStock,
  locations,
  isAdmin,
  onChange,
}) => {
  const { t } = useTranslation();

  const findParentName = (locationName: string) => {
    const loc = locations.find((l) => l.name === locationName);
    if (loc && loc.parent_id) {
      const parent = locations.find((p) => p.id === loc.parent_id);
      return parent ? parent.name : undefined;
    }
    return undefined;
  };

  const handleAddLocation = () => {
    const newLocations = [
      ...stockLocations,
      { id: `temp-${Date.now()}`, location: "", quantity: 0 },
    ];
    onChange(newLocations, totalStock);
  };

  const handleRemoveLocation = (index: number) => {
    const newLocations = [...stockLocations];
    newLocations.splice(index, 1);
    const newTotal = newLocations.reduce(
      (sum, l) => sum + (l.quantity || 0),
      0
    );
    onChange(newLocations, newTotal);
  };

  const handleLocationChange = (index: number, newValue: string | null) => {
    const newLocations = [...stockLocations];
    const parentName = newValue ? findParentName(newValue) : undefined;
    newLocations[index] = {
      ...newLocations[index],
      location: newValue || "",
      parent_location: parentName,
    };
    onChange(newLocations, totalStock);
  };

  const handleQuantityChange = (index: number, value: string) => {
    const newLocations = [...stockLocations];
    newLocations[index] = {
      ...newLocations[index],
      quantity: parseInt(value) || 0,
    };
    const newTotal = newLocations.reduce(
      (sum, l) => sum + (l.quantity || 0),
      0
    );
    onChange(newLocations, newTotal);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          {t("inventory.stockLocations") || "Stock Locations"}
        </Typography>
        <Button
          startIcon={<AddCircleIcon />}
          size="small"
          onClick={handleAddLocation}
          disabled={!isAdmin}
        >
          {t("common.add") || "Add"}
        </Button>
      </Box>

      {stockLocations.map((loc, index) => (
        <Box
          key={loc.id || `loc-${index}`}
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "flex-start",
          }}
        >
          <Autocomplete
            freeSolo
            options={locations.map((l) => l.name)}
            value={loc.location || ""}
            onChange={(_, newValue) => handleLocationChange(index, newValue)}
            onInputChange={(_, newInputValue) =>
              handleLocationChange(index, newInputValue)
            }
            disabled={!isAdmin}
            fullWidth
            size="small"
            renderInput={(params) => (
              <TextField
                {...params}
                id={`location-select-${index}`}
                name={`location-${index}`}
                label={t("inventory.locationLabel")}
                placeholder={t("inventory.locationPlaceholder")}
              />
            )}
          />

          <TextField
            id={`location-quantity-${index}`}
            name={`quantity-${index}`}
            label={t("inventory.stockLabel")}
            type="number"
            value={loc.quantity}
            onChange={(e) => handleQuantityChange(index, e.target.value)}
            disabled={!isAdmin}
            style={{ width: "120px" }}
            size="small"
          />
          {isAdmin && (
            <IconButton
              color="error"
              onClick={() => handleRemoveLocation(index)}
              sx={{ mt: 0.5 }}
            >
              <RemoveCircleIcon />
            </IconButton>
          )}
        </Box>
      ))}

      {stockLocations.length === 0 && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          {t("inventory.noLocationsDefined")} Total stock: {totalStock || 0}
        </Typography>
      )}
    </Box>
  );
};

export default StockLocationFields;
