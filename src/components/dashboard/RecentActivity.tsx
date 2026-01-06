import React from "react";
import {
    Paper,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";

interface Activity {
    id: string;
    action: "created" | "updated" | "deleted";
    item_name: string;
    created_at: string;
    user_display_name?: string;
}

interface RecentActivityProps {
    activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
    const getActionIcon = (action: string) => {
        switch (action) {
            case "created":
                return <AddIcon sx={{ color: "success.main" }} />;
            case "updated":
                return <EditIcon sx={{ color: "primary.main" }} />;
            case "deleted":
                return <DeleteIcon sx={{ color: "error.main" }} />;
            default:
                return null;
        }
    };

    const getActionText = (action: string) => {
        switch (action) {
            case "created":
                return "ajouté";
            case "updated":
                return "modifié";
            case "deleted":
                return "supprimé";
            default:
                return action;
        }
    };

    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

        if (diffInSeconds < 60) return "il y a quelques secondes";
        if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
        }
        if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `il y a ${hours} heure${hours > 1 ? "s" : ""}`;
        }
        const days = Math.floor(diffInSeconds / 86400);
        return `il y a ${days} jour${days > 1 ? "s" : ""}`;
    };

    return (
        <Paper
            sx={{
                p: 3,
                background: (theme) => theme.palette.mode === "dark" ? "rgba(22, 27, 34, 0.7)" : "#ffffff",
                backdropFilter: "blur(10px)",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "12px",
            }}
        >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Activité Récente
            </Typography>
            {activities.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    Aucune activité récente
                </Typography>
            ) : (
                <List sx={{ p: 0 }}>
                    {activities.map((activity, index) => (
                        <ListItem
                            key={activity.id}
                            sx={{
                                px: 0,
                                py: 1.5,
                                borderBottom: index < activities.length - 1 ? "1px solid" : "none",
                                borderColor: "divider",
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                {getActionIcon(activity.action)}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Typography variant="body2">
                                        <strong>{activity.user_display_name || "Utilisateur"}</strong> a{" "}
                                        {getActionText(activity.action)} <strong>{activity.item_name}</strong>
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="caption" color="text.secondary">
                                        {getTimeAgo(activity.created_at)}
                                    </Typography>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    );
};

export default RecentActivity;
