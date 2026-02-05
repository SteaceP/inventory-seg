import React from "react";

import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import CloseIcon from "@mui/icons-material/Close";

interface ApplianceDrawerHeaderProps {
  name: string;
  onClose: () => void;
}

const ApplianceDrawerHeader: React.FC<ApplianceDrawerHeaderProps> = ({
  name,
  onClose,
}) => {
  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        backdropFilter: "blur(20px)",
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(18, 18, 18, 0.8)"
            : "rgba(255, 255, 255, 0.8)",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight="bold">
          {name}
        </Typography>
        <IconButton onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default ApplianceDrawerHeader;
