import React from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface LoginHeaderProps {
  /** Text to display in the header */
  title: string;
}

const LoginHeader: React.FC<LoginHeaderProps> = ({ title }) => {
  return (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box
        component="img"
        src="/logo-secondary.svg"
        sx={{ width: 120, height: "auto", mb: 2 }}
        alt="Logo"
      />
      <Typography variant="h5" fontWeight="bold" color="text.primary">
        {title}
      </Typography>
    </Box>
  );
};

export default LoginHeader;
