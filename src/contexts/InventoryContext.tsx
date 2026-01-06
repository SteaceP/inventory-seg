import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import type { InventoryItem } from "../types/inventory";

interface InventoryContextType {
    items: InventoryItem[];
    loading: boolean;
    error: string | null;
    refreshInventory: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInventory = async () => {
        try {
            const { data, error } = await supabase
                .from("inventory")
                .select("*")
                .order("category")
                .order("name");

            if (error) throw error;
            setItems(data || []);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching inventory:", err);
            setError("Impossible de charger l'inventaire.");
        } finally {
            setLoading(false);
        }
    };

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
    }, []);

    return (
        <InventoryContext.Provider value={{ items, loading, error, refreshInventory: fetchInventory }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventoryContext = () => {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error("useInventoryContext must be used within an InventoryProvider");
    }
    return context;
};
