import { useState } from "react";

import { useTranslation } from "@/i18n";
import { supabase } from "@/supabaseClient";
import type { InventoryItem } from "@/types/inventory";

import { useAlert } from "@contexts/AlertContext";
import {
  validateImageFile,
  generateSecureFileName,
  getExtensionFromMimeType,
} from "@utils/crypto";

export const useInventoryImage = (
  setFormData: React.Dispatch<React.SetStateAction<Partial<InventoryItem>>>
) => {
  const [uploading, setUploading] = useState(false);
  const { showError } = useAlert();
  const { t } = useTranslation();

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      validateImageFile(file);
      const ext = getExtensionFromMimeType(file.type);
      const fileName = generateSecureFileName(ext);
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("inventory-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("inventory-images").getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, image_url: publicUrl }));
    } catch (err: unknown) {
      showError(t("errors.uploadImage") + ": " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return { handleImageUpload, uploading };
};
