import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { Security as SecurityIcon } from "@mui/icons-material";
import { useTranslation } from "../../i18n";

interface SecuritySectionProps {
    onSignOut: () => void;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({ onSignOut }) => {
    const { t } = useTranslation();

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
                <SecurityIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" fontWeight="bold">
                    {t('security.title')}
                </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                        borderColor: "#30363d",
                        color: "text.primary",
                        "&:hover": {
                            borderColor: "primary.main",
                        },
                    }}
                >
                    {t('security.changePassword')}
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={onSignOut}
                >
                    {t('security.signOut')}
                </Button>
            </Box>
        </Paper>
    );
};

export default SecuritySection;
