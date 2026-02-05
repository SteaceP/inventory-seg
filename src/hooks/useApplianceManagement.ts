import { useState, useEffect, useCallback } from "react";

import { useSearchParams } from "react-router-dom";

import { useTranslation } from "@/i18n";
import { supabase } from "@/supabaseClient";
import type { Appliance, Repair, ApplianceStatus } from "@/types/appliances";

import { useErrorHandler } from "./useErrorHandler";

/**
 * Custom hook for managing appliance-related state and operations.
 * Handles fetching list, details, repairs, and performing CRUD actions.
 *
 * @returns An object containing appliance state, filtered lists, and action handlers.
 */
export function useApplianceManagement() {
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();
  const [searchParams, setSearchParams] = useSearchParams();

  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<ApplianceStatus | "all">("all");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    () => new Set()
  );
  const [selectedAppliance, setSelectedAppliance] = useState<Appliance | null>(
    null
  );
  const [repairs, setRepairs] = useState<Repair[]>([]);

  // Dialog states
  const [openAddAppliance, setOpenAddAppliance] = useState(false);
  const [openEditAppliance, setOpenEditAppliance] = useState(false);
  const [openAddRepair, setOpenAddRepair] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [applianceToDelete, setApplianceToDelete] = useState<string | null>(
    null
  );

  const fetchAppliances = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("appliances")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        handleError(error, t("appliances.errorFetching"));
      } else if (data) {
        setAppliances(data as Appliance[]);
      }
    } catch (err) {
      handleError(err as Error, t("appliances.errorFetching"));
    } finally {
      setLoading(false);
    }
  }, [handleError, t]);

  const fetchRepairs = useCallback(
    async (applianceId: string) => {
      try {
        const { data, error } = await supabase
          .from("repairs")
          .select("*")
          .eq("appliance_id", applianceId)
          .order("repair_date", { ascending: false });

        if (error) {
          handleError(error, t("appliances.errorFetchingRepairs"));
        } else if (data) {
          setRepairs(data as Repair[]);
        }
      } catch (err) {
        handleError(err as Error, t("appliances.errorFetchingRepairs"));
      }
    },
    [handleError, t]
  );

  useEffect(() => {
    void fetchAppliances();

    const action = searchParams.get("action");
    if (action === "add") {
      setOpenAddAppliance(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("action");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams, fetchAppliances]);

  const handleCreateAppliance = async (newAppliance: Partial<Appliance>) => {
    try {
      setActionLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        handleError(
          new Error("User not logged in"),
          t("appliances.userNotLoggedIn")
        );
        return;
      }

      const { error } = await supabase.from("appliances").insert([
        {
          ...newAppliance,
          user_id: user.id,
        } as import("../types/database.types").Database["public"]["Tables"]["appliances"]["Insert"],
      ]);

      if (error) {
        handleError(error, t("appliances.errorCreating"));
      } else {
        setOpenAddAppliance(false);
        void fetchAppliances();
      }
    } catch (err: unknown) {
      handleError(err, t("appliances.errorCreating"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAppliance = async (updatedData: Partial<Appliance>) => {
    if (!selectedAppliance?.id) return;
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from("appliances")
        .update(updatedData)
        .eq("id", selectedAppliance.id);

      if (error) {
        handleError(error, t("appliances.errorUpdating"));
      } else {
        setOpenEditAppliance(false);
        setOpenDrawer(false);
        void fetchAppliances();
      }
    } catch (err: unknown) {
      handleError(err, t("appliances.errorUpdating"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateRepair = async (newRepair: Partial<Repair>) => {
    if (!selectedAppliance) {
      handleError(
        new Error("No appliance selected"),
        t("appliances.noApplianceSelected")
      );
      return;
    }

    try {
      setActionLoading(true);
      const { error } = await supabase.from("repairs").insert([
        {
          ...newRepair,
          appliance_id: selectedAppliance.id,
        } as import("../types/database.types").Database["public"]["Tables"]["repairs"]["Insert"],
      ]);

      if (error) {
        handleError(error, t("appliances.errorCreatingRepair"));
      } else {
        setOpenAddRepair(false);
        void fetchRepairs(selectedAppliance.id);
      }
    } catch (err: unknown) {
      handleError(err, t("appliances.errorCreatingRepair"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!applianceToDelete) return;
    const id = applianceToDelete;
    setDeleteConfirmOpen(false);
    setApplianceToDelete(null);

    try {
      setActionLoading(true);
      const { error } = await supabase.from("appliances").delete().eq("id", id);
      if (error) {
        handleError(error, t("appliances.errorDeleting"));
      } else {
        setOpenDrawer(false);
        void fetchAppliances();
      }
    } catch (err: unknown) {
      handleError(err, t("appliances.errorDeleting"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (appliance: Appliance) => {
    setSelectedAppliance(appliance);
    void fetchRepairs(appliance.id);
    setOpenDrawer(true);
  };

  const handleScanSuccess = (decodedText: string) => {
    setScanOpen(false);
    const appliance = appliances.find((a) => a.sku === decodedText);
    if (appliance) {
      handleViewDetails(appliance);
    } else {
      setOpenAddAppliance(true);
    }
  };

  const toggleAll = (checked: boolean, filteredList: Appliance[]) => {
    if (checked) {
      setSelectedItems(new Set(filteredList.map((a) => a.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const toggleItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const filteredAppliances = appliances.filter((a) => {
    if (filter === "all") return true;
    return a.status === filter;
  });

  return {
    appliances,
    filteredAppliances,
    loading,
    actionLoading,
    filter,
    setFilter,
    selectedItems,
    setSelectedItems,
    selectedAppliance,
    setSelectedAppliance,
    repairs,
    dialogs: {
      openAddAppliance,
      setOpenAddAppliance,
      openEditAppliance,
      setOpenEditAppliance,
      openAddRepair,
      setOpenAddRepair,
      openDrawer,
      setOpenDrawer,
      scanOpen,
      setScanOpen,
      deleteConfirmOpen,
      setDeleteConfirmOpen,
    },
    actions: {
      handleCreateAppliance,
      handleUpdateAppliance,
      handleCreateRepair,
      handleDeleteClick: (id: string) => {
        setApplianceToDelete(id);
        setDeleteConfirmOpen(true);
      },
      handleDeleteConfirm,
      handleViewDetails,
      handleScanSuccess,
      toggleAll,
      toggleItem,
    },
  };
}
