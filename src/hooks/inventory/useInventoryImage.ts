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

      // Prepare form data for worker upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "inventory-images");
      formData.append("fileName", fileName);

      // Get session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session");
      }

      const response = await fetch(
        `${import.meta.env.VITE_WORKER_URL || ""}/api/storage/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error || "Upload failed");
      }

      const { url } = (await response.json()) as { url: string };

      setFormData((prev) => ({ ...prev, image_url: url }));
    } catch (err: unknown) {
      showError(t("errors.uploadImage") + ": " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return { handleImageUpload, uploading };
};
