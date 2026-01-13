import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import type { InventoryItem } from "../types/inventory";
import { InventoryContext } from "./inventory-context";
import { useTranslation } from "../i18n";
import { useAlert } from "./useAlertContext";

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const { showError } = useAlert();

  const isFetching = React.useRef(false);

  const fetchInventory = useCallback(async () => {
    console.log("[InventoryContext] fetchInventory called, online:", navigator.onLine, "fetching:", isFetching.current);
    
    // If offline, just stop loading and show whatever we have (cached)
    if (!navigator.onLine) {
      console.log("[InventoryContext] Skipping fetch (offline)");
      setLoading(false);
      return;
    }

    if (isFetching.current) {
      console.log("[InventoryContext] Skipping fetch (already in progress)");
      return;
    }

    isFetching.current = true;
    try {
      console.log("[InventoryContext] Starting Supabase fetch...");
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("category")
        .order("name");

      if (error) throw error;
      console.log("[InventoryContext] Fetch success, items:", data?.length);
      setItems(data || []);
      setError(null);
    } catch (err: unknown) {
      const error = err as Error;
      console.log("[InventoryContext] Fetch error:", error.message);
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

  const subscriptionRef = React.useRef<any>(null);

  useEffect(() => {
    const subscribe = () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }

      if (navigator.onLine) {
        subscriptionRef.current = supabase
          .channel("inventory_changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "inventory" },
            () => {
              fetchInventory();
            }
          )
          .subscribe();
      }
    };

    fetchInventory();
    subscribe();

    const handleOnline = () => {
      fetchInventory();
      subscribe();
    };

    const handleOffline = () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      setLoading(false); // Ensure loading is cleared if it was in progress
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [fetchInventory]);

  const contextValue = React.useMemo(
    () => ({ items, loading, error, refreshInventory: fetchInventory }),
    [items, loading, error, fetchInventory]
  );

  return (
    <InventoryContext.Provider value={contextValue}>
      {children}
    </InventoryContext.Provider>
  );
};
