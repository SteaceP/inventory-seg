import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { InventoryItem, InventoryCategory } from "../types/inventory";
import { InventoryContext } from "./inventory-context";
import { useTranslation } from "../i18n";
import { useAlert } from "./useAlertContext";

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const { showError } = useAlert();

  const isFetching = React.useRef(false);

  const fetchInventory = useCallback(async () => {
    // If offline, just stop loading and show whatever we have (cached)
    if (!navigator.onLine) {
      setLoading(false);
      return;
    }

    if (isFetching.current) {
      return;
    }

    isFetching.current = true;
    try {
      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from("inventory")
        .select("*")
        .order("category")
        .order("name");

      if (itemsError) throw itemsError;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("inventory_categories")
        .select("*");

      if (categoriesError) throw categoriesError;

      setItems(itemsData || []);
      setCategories(categoriesData || []);
      setError(null);
    } catch (err: unknown) {
      const error = err as Error;
      // Only show error if we're still online (prevents noise during disconnect)
      if (navigator.onLine) {
        showError(t("errors.fetchInventory") + ": " + error.message);
        setError(t("errors.loadInventory"));
      }
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const updateCategoryThreshold = useCallback(
    async (name: string, threshold: number | null) => {
      try {
        const { error } = await supabase.from("inventory_categories").upsert(
          {
            name,
            low_stock_threshold: threshold,
          },
          { onConflict: "name" }
        );

        if (error) throw error;
        await fetchInventory();
      } catch (err: unknown) {
        showError(
          "Failed to update category threshold: " + (err as Error).message
        );
      }
    },
    [fetchInventory, showError]
  );

  const subscriptionRef = React.useRef<RealtimeChannel | null>(null);
  const catSubscriptionRef = React.useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const subscribe = () => {
      if (subscriptionRef.current) {
        void subscriptionRef.current.unsubscribe();
      }
      if (catSubscriptionRef.current) {
        void catSubscriptionRef.current.unsubscribe();
      }

      if (navigator.onLine) {
        subscriptionRef.current = supabase
          .channel("inventory_changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "inventory" },
            () => {
              void fetchInventory();
            }
          )
          .subscribe();

        catSubscriptionRef.current = supabase
          .channel("category_changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "inventory_categories" },
            () => {
              void fetchInventory();
            }
          )
          .subscribe();
      }
    };

    void fetchInventory();
    subscribe();

    const handleOnline = () => {
      void fetchInventory();
      subscribe();
    };

    const handleOffline = () => {
      if (subscriptionRef.current) {
        void subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (catSubscriptionRef.current) {
        void catSubscriptionRef.current.unsubscribe();
        catSubscriptionRef.current = null;
      }
      setLoading(false); // Ensure loading is cleared if it was in progress
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (subscriptionRef.current) {
        void subscriptionRef.current.unsubscribe();
      }
      if (catSubscriptionRef.current) {
        void catSubscriptionRef.current.unsubscribe();
      }
    };
  }, [fetchInventory]);

  const contextValue = React.useMemo(
    () => ({
      items,
      categories,
      loading,
      error,
      refreshInventory: fetchInventory,
      updateCategoryThreshold,
    }),
    [items, categories, loading, error, fetchInventory, updateCategoryThreshold]
  );

  return <InventoryContext value={contextValue}>{children}</InventoryContext>;
};
