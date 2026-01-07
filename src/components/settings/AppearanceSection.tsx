import React from "react";
import { Box, Paper, Typography, FormControlLabel, Switch } from "@mui/material";
import { Palette as PaletteIcon } from "@mui/icons-material";
import { useThemeContext } from "../../contexts/useThemeContext";
import { useTranslation } from "../../i18n";

interface AppearanceSectionProps {
    darkMode: boolean;
    compactView: boolean;
    onDarkModeChange: (enabled: boolean) => void;
    onCompactViewChange: (enabled: boolean) => void;
}

const AppearanceSection: React.FC<AppearanceSectionProps> = ({
    darkMode,
    compactView,
    onDarkModeChange,
    onCompactViewChange,
}) => {
    const { toggleDarkMode, toggleCompactView } = useThemeContext();
    const { t } = useTranslation();

    const handleThemeToggle = (enabled: boolean) => {
        onDarkModeChange(enabled);
        toggleDarkMode(enabled);
    };

    const handleCompactToggle = (enabled: boolean) => {
        onCompactViewChange(enabled);
        toggleCompactView(enabled);
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
                height: "100%",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <PaletteIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" fontWeight="bold">
                    {t('appearance.title')}
                </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={darkMode}
                            onChange={(e) => handleThemeToggle(e.target.checked)}
                            color="primary"
                        />
                    }
                    label={t('appearance.darkMode')}
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={compactView}
                            onChange={(e) => handleCompactToggle(e.target.checked)}
                            color="primary"
                        />
                    }
                    label={t('appearance.compactView')}
                />
            </Box>
        </Paper>
    );
};

export default AppearanceSection;
