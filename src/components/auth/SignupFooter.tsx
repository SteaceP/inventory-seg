import React from "react";

import { Link as RouterLink } from "react-router-dom";

import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

interface SignupFooterProps {
  alreadyHaveAccountText: string;
  signInText: string;
}

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
