import React from "react";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router-dom";

import type { SignupFooterProps } from "@/types/auth";

const SignupFooter: React.FC<SignupFooterProps> = ({
  alreadyHaveAccountText,
  signInText,
}) => {
  return (
    <Typography variant="body2" sx={{ mt: 3, mb: 1, color: "text.secondary" }}>
      {alreadyHaveAccountText}{" "}
      <Link component={RouterLink} to="/login" fontWeight="bold">
        {signInText}
      </Link>
    </Typography>
  );
};

export default SignupFooter;
