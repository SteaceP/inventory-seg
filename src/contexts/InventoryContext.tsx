/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  use,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { supabase } from "@/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type {
  InventoryItem,
  InventoryCategory,
  MasterLocation,
  InventoryContextType,
} from "@/types/inventory";
import { useTranslation } from "@/i18n";
import { useAlert } from "./AlertContext";
import { useUserContext } from "./UserContext";

export const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export const useInventoryContext = () => {
  const context = use(InventoryContext);
  if (context === undefined) {
    throw new Error(
      "useInventoryContext must be used within an InventoryProvider"
    );
  }
  return context;
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [locations, setLocations] = useState<MasterLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const { showError } = useAlert();
  const { userId, displayName } = useUserContext();

  const [presence, setPresence] = useState<
    Record<
      string,
      { userId: string; displayName: string; editingId: string | null }
    >
  >({});
  const [editingId, setEditingIdState] = useState<string | null>(null);

  const isFetching = useRef(false);

  const fetchInventory = useCallback(async () => {
    if (!navigator.onLine) {
      setLoading(false);
      return;
    }

    if (isFetching.current) return;

    isFetching.current = true;
    try {
      const { data: itemsData, error: itemsError } = await supabase
        .from("inventory")
        .select("*, stock_locations:inventory_stock_locations(*)")
        .order("category")
        .order("name");

      if (itemsError) throw itemsError;

      const { data: categoriesData, error: categoriesError } = await supabase
        .from("inventory_categories")
        .select("*");

      if (categoriesError) throw categoriesError;

      const { data: locationsData, error: locationsError } = await supabase
        .from("inventory_locations")
        .select("*")
        .order("name");

      if (locationsError) throw locationsError;

      setItems((itemsData as unknown as InventoryItem[]) || []);
      setCategories(categoriesData || []);
      setLocations(locationsData || []);
      setError(null);
    } catch (err: unknown) {
      const error = err as Error;
      if (navigator.onLine) {
        showError(t("errors.fetchInventory") + ": " + error.message);
        setError(t("errors.loadInventory"));
      }
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [t, showError]);

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

  const subscriptionRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const subscribe = () => {
      if (subscriptionRef.current) void subscriptionRef.current.unsubscribe();

      if (navigator.onLine) {
        // Use the centralized 'app-activity' broadcast channel instead of postgres_changes
        // This is significantly more performant and eliminates slow subscription-time queries
        subscriptionRef.current = supabase
          .channel("app-activity", { config: { private: true } })
          .on("broadcast", { event: "*" }, (envelope) => {
            const data = (envelope as unknown as { payload: { table: string } })
              .payload;
            if (!data) return;

            const { table } = data;
            const targetTables = [
              "inventory",
              "inventory_categories",
              "inventory_locations",
              "inventory_stock_locations",
            ];

            if (targetTables.includes(table)) {
              void fetchInventory();
            }
          })
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
      setLoading(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (subscriptionRef.current) void subscriptionRef.current.unsubscribe();
    };
  }, [fetchInventory]);

  // Presence and Sync Channel
  useEffect(() => {
    if (!userId || !navigator.onLine) return;

    const channel = supabase.channel("inventory-sync", {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const newState = channel.presenceState();
        const simplifiedPresence: Record<
          string,
          { userId: string; displayName: string; editingId: string | null }
        > = {};
        Object.keys(newState).forEach((key) => {
          simplifiedPresence[key] = newState[key][0] as unknown as {
            userId: string;
            displayName: string;
            editingId: string | null;
          };
        });
        setPresence(simplifiedPresence);
      })
      .on("broadcast", { event: "inventory-updated" }, () => {
        void fetchInventory();
      })
      .subscribe((status) => {
        if ((status as string) === "SUBSCRIBED") {
          void channel.track({
            userId,
            displayName: displayName || "Anonymous",
            editingId: editingId,
          });
        }
      });

    return () => {
      void channel.unsubscribe();
    };
  }, [userId, displayName, editingId, fetchInventory]);

  const setEditingId = useCallback((id: string | null) => {
    setEditingIdState(id);
  }, []);

  const broadcastInventoryChange = useCallback(() => {
    void supabase.channel("inventory-sync").send({
      type: "broadcast",
      event: "inventory-updated",
      payload: { timestamp: new Date().toISOString() },
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      items,
      categories,
      locations,
      loading,
      error,
      refreshInventory: fetchInventory,
      updateCategoryThreshold,
      presence,
      setEditingId,
      broadcastInventoryChange,
    }),
    [
      items,
      categories,
      locations,
      loading,
      error,
      fetchInventory,
      updateCategoryThreshold,
      presence,
      setEditingId,
      broadcastInventoryChange,
    ]
  );

  return <InventoryContext value={contextValue}>{children}</InventoryContext>;
};
