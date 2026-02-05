import React from "react";

import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import type { LanguageSwitcherProps } from "@/types/auth";
import type { Language } from "@/types/user";

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  language,
  onLanguageChange,
}) => {
  return (
    <Box
      sx={{
        mt: 2,
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <ToggleButtonGroup
        value={language}
        exclusive
        onChange={(_e, val: string | null) => {
          if (val) void onLanguageChange(val as Language);
        }}
        size="small"
        aria-label="language switcher"
        sx={{
          "& .MuiToggleButton-root": {
            px: 2,
            py: 0.5,
            fontSize: "0.75rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            borderColor: "divider",
            "&.Mui-selected": {
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            },
          },
        }}
      >
        <ToggleButton value="fr">FR</ToggleButton>
        <ToggleButton value="en">EN</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default LanguageSwitcher;
