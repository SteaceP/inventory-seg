import { useState, useCallback } from "react";
import type { InventoryItem } from "@/types/inventory";
import { generateSecureId } from "@utils/crypto";

export const useInventoryForm = (
  setEditingId?: (id: string | null) => void
) => {
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "",
    category: "",
    sku: "",
    stock: 0,
    image_url: "",
    low_stock_threshold: null,
    notes: "",
  });

  const generateSKU = useCallback(() => {
    const sku = generateSecureId();
    setFormData((prev) => ({ ...prev, sku }));
  }, []);

  const handleOpen = useCallback((item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
      // If we have a drawer-specific state, the parent might handle that,
      // but for generic add/edit form, this is the logic.
      setOpen(true);
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        category: "",
        sku: "",
        stock: 0,
        image_url: "",
        low_stock_threshold: null,
        notes: "",
      });
      setOpen(true);
    }
  }, []);

  const handleEdit = useCallback(
    (item: InventoryItem) => {
      setEditingItem(item);
      setFormData(item);
      setOpen(true);
      if (setEditingId) setEditingId(item.id);
    },
    [setEditingId]
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    if (setEditingId) setEditingId(null);
  }, [setEditingId]);

  return {
    open,
    setOpen,
    editingItem,
    setEditingItem,
    formData,
    setFormData,
    handleOpen,
    handleEdit,
    handleClose,
    generateSKU,
  };
};
