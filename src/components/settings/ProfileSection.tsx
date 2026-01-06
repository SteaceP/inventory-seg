import React from "react";
import { Box, Paper, Typography, Avatar, TextField } from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";

interface ProfileSectionProps {
    displayName: string;
    email: string;
    onDisplayNameChange: (name: string) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
    displayName,
    email,
    onDisplayNameChange,
}) => {
    const getInitials = (name: string, emailStr: string) => {
        if (name) return name.substring(0, 2).toUpperCase();
        if (emailStr) return emailStr.substring(0, 2).toUpperCase();
        return "U";
    };

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
                <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" fontWeight="bold">
                    Profile
                </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <Avatar
                        sx={{
                            width: 80,
                            height: 80,
                            bgcolor: "primary.main",
                            fontSize: "1.5rem",
                        }}
                    >
                        {getInitials(displayName, email)}
                    </Avatar>
                </Box>

                <TextField
                    label="Display Name"
                    fullWidth
                    value={displayName}
                    onChange={(e) => onDisplayNameChange(e.target.value)}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            color: "white",
                            "& fieldset": { borderColor: "#30363d" },
                        },
                    }}
                    InputLabelProps={{ sx: { color: "text.secondary" } }}
                />

                <TextField
                    label="Email"
                    fullWidth
                    value={email}
                    disabled
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            color: "white",
                            "& fieldset": { borderColor: "#30363d" },
                        },
                    }}
                    InputLabelProps={{ sx: { color: "text.secondary" } }}
                />
            </Box>
        </Paper>
    );
};

export default ProfileSection;
