import React from "react";
import { Box, Paper, Typography, FormControlLabel, Switch } from "@mui/material";
import { Palette as PaletteIcon } from "@mui/icons-material";

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
    return (
        <Paper
            sx={{
                p: 3,
                background: "rgba(22, 27, 34, 0.7)",
                backdropFilter: "blur(10px)",
                border: "1px solid #30363d",
                borderRadius: "12px",
                height: "100%",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <PaletteIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" fontWeight="bold">
                    Apparence
                </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={darkMode}
                            onChange={(e) => onDarkModeChange(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="Mode Sombre"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={compactView}
                            onChange={(e) => onCompactViewChange(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="Vue Compacte"
                />
            </Box>
        </Paper>
    );
};

export default AppearanceSection;
