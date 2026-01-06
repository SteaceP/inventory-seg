import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { Security as SecurityIcon } from "@mui/icons-material";

interface SecuritySectionProps {
    onSignOut: () => void;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({ onSignOut }) => {
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
                <SecurityIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" fontWeight="bold">
                    Sécurité
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
                    Changer le mot de passe
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={onSignOut}
                >
                    Se déconnecter
                </Button>
            </Box>
        </Paper>
    );
};

export default SecuritySection;
