import React, { useState } from "react";
import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useTranslation } from "../../i18n";

interface CategoryThresholdDialogProps {
  open: boolean;
  onClose: () => void;
  categoryName: string;
  currentThreshold: number | null;
  onSave: (threshold: number | null) => void;
}

const CategoryThresholdDialog: React.FC<CategoryThresholdDialogProps> = ({
  open,
  onClose,
  categoryName,
  currentThreshold,
  onSave,
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string>(
    currentThreshold?.toString() || ""
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {t("inventory.categoryThresholdTitle") || "Category Threshold"}:{" "}
        {categoryName}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("inventory.categoryThresholdInfo") ||
            "Define a low stock threshold for all items in this category. Individual item settings take priority."}
        </Typography>
        <TextField
          autoFocus
          label={t("inventory.threshold") || "Threshold"}
          type="number"
          fullWidth
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("inventory.inherited") || "Inherited"}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("inventory.cancel") || "Cancel"}</Button>
        <Button
          onClick={() => {
            onSave(value === "" ? null : parseInt(value));
            onClose();
          }}
          variant="contained"
        >
          {t("inventory.save") || "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryThresholdDialog;
