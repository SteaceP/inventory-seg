import React from "react";
import { Grid, Button } from "@mui/material";
import { Backspace as BackspaceIcon } from "@mui/icons-material";

interface AdjustmentKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
}

const AdjustmentKeypad: React.FC<AdjustmentKeypadProps> = ({
  onDigit,
  onBackspace,
}) => {
  return (
    <Grid container spacing={1.5}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, "0", "back"].map((btn) => (
        <Grid size={4} key={btn}>
          {btn === "back" ? (
            <Button
              variant="outlined"
              fullWidth
              onClick={onBackspace}
              sx={{
                height: 70,
                borderRadius: "16px",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(237, 108, 2, 0.1)"
                    : "rgba(237, 108, 2, 0.05)",
                color: "warning.main",
                borderColor: "warning.main",
                "&:hover": {
                  bgcolor: "warning.main",
                  color: "white",
                  borderColor: "warning.main",
                },
              }}
            >
              <BackspaceIcon />
            </Button>
          ) : (
            <Button
              variant="outlined"
              fullWidth
              onClick={() => onDigit(btn.toString())}
              sx={{
                height: 70,
                fontSize: "1.75rem",
                borderRadius: "16px",
                fontWeight: "800",
                color: "text.primary",
                borderColor: "divider",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "action.hover",
                },
              }}
            >
              {btn}
            </Button>
          )}
        </Grid>
      ))}
    </Grid>
  );
};

export default AdjustmentKeypad;
