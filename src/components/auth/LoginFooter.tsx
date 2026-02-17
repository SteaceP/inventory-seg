import React from "react";

import { Link as RouterLink } from "react-router-dom";

import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

interface LoginFooterProps {
  noAccountText: string;
  noAccountLinkText: string;
}

const LoginFooter: React.FC<LoginFooterProps> = ({
  noAccountText,
  noAccountLinkText,
}) => {
  return (
    <Typography variant="body2" sx={{ mt: 3, mb: 1, color: "text.secondary" }}>
      {noAccountText}{" "}
      <Link
        component={RouterLink}
        to="/signup"
        fontWeight="bold"
        sx={{ cursor: "pointer" }}
      >
        {noAccountLinkText}
      </Link>
    </Typography>
  );
};

export default LoginFooter;
