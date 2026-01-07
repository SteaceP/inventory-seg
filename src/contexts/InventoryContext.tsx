import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import type { InventoryItem } from "../types/inventory";
import { InventoryContext } from "./inventory-context";
import { useTranslation } from "../i18n";

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

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
            console.error("Error fetching inventory:", err);
            setError(t('errors.loadInventory'));
        } finally {
            setLoading(false);
        }
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

