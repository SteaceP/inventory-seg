import React, { useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useUserContext } from "../contexts/useUserContext";
import { useAlert } from "../contexts/useAlertContext";
import { useTranslation } from "../i18n";

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

const RealtimeNotifications: React.FC = () => {
  const { userId } = useUserContext();
  const { showInfo } = useAlert();
  const { t } = useTranslation();

  useEffect(() => {
    if (!userId) return;

    // 1. Listen to inventory activity (shared)
    const activityChannel = supabase
      .channel("realtime_activity")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "inventory_activity" },
        (payload) => {
          const newActivity = payload.new as Activity;
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
        }
      )
      .subscribe();

    // 2. Listen to appliances (also shared but usually restricted by RLS)
    const applianceChannel = supabase
      .channel("realtime_appliances")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appliances" },
        (payload) => {
          const data =
            (payload.new as ApplianceData) || (payload.old as ApplianceData);
          if (data && data.user_id !== userId) {
            const name = data.name || "Appareil";
            if (payload.eventType === "INSERT") {
              showInfo(`${t("common.add")} : ${name}`);
            } else if (payload.eventType === "UPDATE") {
              showInfo(`${t("recentActivity.action.updated")} : ${name}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(activityChannel);
      void supabase.removeChannel(applianceChannel);
    };
  }, [userId, showInfo, t]);

  return null;
};

export default RealtimeNotifications;
