import React, { useEffect } from "react";

import { useTranslation } from "@/i18n";
import { supabase } from "@/supabaseClient";

import { useAlert } from "@contexts/AlertContext";
import { useUserContext } from "@contexts/UserContextDefinition";
import { useErrorHandler } from "@hooks/useErrorHandler";

interface Activity {
  id: string;
  inventory_id: string;
  user_id: string;
  action: "created" | "updated" | "deleted";
  item_name: string;
  created_at: string;
}

interface ApplianceData {
  id: string;
  user_id: string;
  name: string;
}

interface BroadcastPayload {
  schema: string;
  table: string;
  event: "INSERT" | "UPDATE" | "DELETE";
  operation: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
}

const RealtimeNotifications: React.FC = () => {
  const { showInfo } = useAlert();
  const { handleError } = useErrorHandler();
  const { userId } = useUserContext();
  const { t } = useTranslation();

  useEffect(() => {
    if (!userId) return;

    // Create a private channel for site activity
    const channel = supabase.channel("app-activity", {
      config: { private: true },
    });

    const handleBroadcast = (envelope: unknown) => {
      // The data sent via broadcast_changes is nested in the 'payload' property
      const data = (envelope as { payload: BroadcastPayload }).payload;
      if (!data) return;

      const { table, record, event, old_record } = data;

      if (table === "inventory_activity" && event === "INSERT") {
        const newActivity = record as unknown as Activity;
        // Only notify if someone else did it
        if (newActivity.user_id !== userId) {
          let message = "";
          const name = newActivity.item_name;

          switch (newActivity.action) {
            case "created":
              message = `${t("recentActivity.action.created")} : ${name}`;
              break;
            case "updated":
              message = `${t("recentActivity.action.updated")} : ${name}`;
              break;
            case "deleted":
              message = `${t("recentActivity.action.deleted")} : ${name}`;
              break;
          }
          if (message) showInfo(message);
        }
      } else if (table === "appliances") {
        const data =
          (record as unknown as ApplianceData) ||
          (old_record as unknown as ApplianceData);
        if (data && data.user_id !== userId) {
          const name = data.name || "Appareil";
          if (event === "INSERT") {
            showInfo(`${t("common.add")} : ${name}`);
          } else if (event === "UPDATE") {
            showInfo(`${t("recentActivity.action.updated")} : ${name}`);
          }
        }
      }
    };

    // Initialize Realtime Auth and Subscribe
    void (async () => {
      try {
        // Required for Realtime Authorization
        await supabase.realtime.setAuth();

        channel
          .on("broadcast", { event: "INSERT" }, (payload) =>
            handleBroadcast(payload)
          )
          .on("broadcast", { event: "UPDATE" }, (payload) =>
            handleBroadcast(payload)
          )
          .on("broadcast", { event: "DELETE" }, (payload) =>
            handleBroadcast(payload)
          )
          .subscribe();
      } catch (err) {
        handleError(err);
      }
    })();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, showInfo, t, handleError]);

  return null;
};

export default RealtimeNotifications;
