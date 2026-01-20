import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  IconButton,
  Box,
  Divider,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { useTranslation } from "../../i18n";
import { useInventoryContext } from "../../contexts/InventoryContext";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { supabase } from "../../supabaseClient";

interface CategoryManagementDialogProps {
  open: boolean;
  onClose: () => void;
}

const CategoryManagementDialog: React.FC<CategoryManagementDialogProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const { categories, refreshInventory } = useInventoryContext();
  const { handleError } = useErrorHandler();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingThresholds, setEditingThresholds] = useState<
    Record<string, string>
  >({});

  const handleUpdateThreshold = async (name: string) => {
    const threshold = editingThresholds[name];
    const val =
      threshold === "" || threshold === undefined ? null : parseInt(threshold);

    try {
      const { error } = await supabase.from("inventory_categories").upsert(
        {
          name,
          low_stock_threshold: val,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "name" }
      );
      if (error) throw error;
      void refreshInventory();
    } catch (err: unknown) {
      handleError(
        err,
        t("errors.updateCategory") || "Failed to update category"
      );
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const { error } = await supabase.from("inventory_categories").insert({
        name: newCategoryName.trim(),
      });
      if (error) throw error;
      setNewCategoryName("");
      void refreshInventory();
    } catch (err: unknown) {
      handleError(err, t("errors.addCategory") || "Failed to add category");
    }
  };

  const handleDeleteCategory = async (name: string) => {
    try {
      const { error } = await supabase
        .from("inventory_categories")
        .delete()
        .eq("name", name);
      if (error) throw error;
      void refreshInventory();
    } catch (err: unknown) {
      handleError(
        err,
        t("errors.deleteCategory") || "Failed to delete category"
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {t("inventory.categories.manage") || "Manage Categories"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1, display: "flex", gap: 1 }}>
          <TextField
            label={t("inventory.categories.newName") || "New category"}
            fullWidth
            size="small"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={() => void handleAddCategory()}
            startIcon={<AddIcon />}
          >
            {t("common.add") || "Add"}
          </Button>
        </Box>
        <Divider />
        <List>
          {categories.map((cat) => (
            <ListItem
              key={cat.name}
              secondaryAction={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TextField
                    label={t("inventory.lowStockThresholdLabel")}
                    type="number"
                    size="small"
                    sx={{ width: 120 }}
                    value={
                      editingThresholds[cat.name] ??
                      (cat.low_stock_threshold?.toString() || "")
                    }
                    onChange={(e) =>
                      setEditingThresholds({
                        ...editingThresholds,
                        [cat.name]: e.target.value,
                      })
                    }
                    onBlur={() => void handleUpdateThreshold(cat.name)}
                  />
                  <IconButton
                    color="error"
                    onClick={() => void handleDeleteCategory(cat.name)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText primary={cat.name} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          {t("common.close") || "Close"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryManagementDialog;
