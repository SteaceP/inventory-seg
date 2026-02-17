import React from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

interface SignupSuccessProps {
  /** Title message (e.g., "Account Created!") */
  title: string;
  /** Success description or next steps */
  successMessage: string;
  /** Text for the sign-in button */
  signInLabel: string;
  /** Callback when user clicks sign in */
  onSignInClick: () => void;
}

const SignupSuccess: React.FC<SignupSuccessProps> = ({
  title,
  successMessage,
  signInLabel,
  onSignInClick,
}) => {
  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(22, 27, 34, 0.7)"
                : "#ffffff",
            backdropFilter: "blur(20px)",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {title}
          </Typography>
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
          <Button variant="contained" fullWidth onClick={onSignInClick}>
            {signInLabel}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignupSuccess;
