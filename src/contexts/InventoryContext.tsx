import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import type { InventoryItem } from "../types/inventory";
import { InventoryContext } from "./inventory-context";
import { useTranslation } from "../i18n";
import { useAlert } from "./useAlertContext";

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();
    const { showError } = useAlert();

    const fetchInventory = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("inventory")
                .select("*")
                .order("category")
                .order("name");

            if (error) throw error;
            setItems(data || []);
            setError(null);
        } catch (err: unknown) {
            showError(t('errors.fetchInventory') + ': ' + (err as Error).message);
            setError(t('errors.loadInventory'));
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t]);

    useEffect(() => {
        fetchInventory();

        const subscription = supabase
            .channel("inventory_changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "inventory" },
                () => {
                    fetchInventory();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchInventory]);

    return (
        <InventoryContext.Provider value={{ items, loading, error, refreshInventory: fetchInventory }}>
            {children}
        </InventoryContext.Provider>
    );
};

