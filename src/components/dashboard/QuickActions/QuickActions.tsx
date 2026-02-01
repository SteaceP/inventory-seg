import React from "react";
import {
  Grid,
  Typography,
  Box,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  AddBox as AddIcon,
  QrCodeScanner as ScanIcon,
  HomeRepairService as RepairIcon,
  Assessment as ReportIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n";
import ActionCard from "../ActionCard/ActionCard";
import { useScrollIndicators } from "@hooks/useScrollIndicators";

interface QuickActionsProps {
  onScanClick?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onScanClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    showLeft: showLeftIndicator,
    showRight: showRightIndicator,
    scrollRef,
  } = useScrollIndicators(isMobile);

  const actions = [
    {
      title: t("inventory.addButton"),
      description: t("dashboard.actions.inventoryDesc"),
      icon: <AddIcon fontSize="large" />,
      color: "status.success",
      onClick: () => navigate("/inventory?action=add"),
    },
    {
      title: t("inventory.scan"),
      description: t("dashboard.actions.scanDesc"),
      icon: <ScanIcon fontSize="large" />,
      color: "brand.secondary",
      onClick: onScanClick || (() => navigate("/inventory?action=scan")),
    },
    {
      title: t("appliances.addAppliance") || t("appliances.add"),
      description: t("dashboard.actions.applianceDesc"),
      icon: <RepairIcon fontSize="large" />,
      color: "status.info",
      onClick: () => navigate("/appliances?action=add"),
    },
    {
      title: t("inventory.reports") || t("menu.reports"),
      description: t("dashboard.actions.reportDesc"),
      icon: <ReportIcon fontSize="large" />,
      color: "status.warning",
      onClick: () => navigate("/inventory/reports"),
    },
  ];

  return (
    <Box>
      {/* Hide title on mobile to save space */}
      {!isMobile && (
        <Typography variant="h6" fontWeight="900" sx={{ mb: 2, ml: 0.5 }}>
          {t("dashboard.quickActions")}
        </Typography>
      )}

      {isMobile ? (
        // Mobile: Horizontal scrollable carousel with dynamic scroll hints
        <Box sx={{ position: "relative" }}>
          <Box
            ref={scrollRef}
            sx={{
              display: "flex",
              gap: 1.5,
              overflowX: "auto",
              overflowY: "hidden",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              // Hide scrollbar but keep functionality
              "&::-webkit-scrollbar": {
                display: "none",
              },
              scrollbarWidth: "none",
              // Scroll padding for first/last items
              px: 0.5,
              mx: -0.5,
            }}
          >
            {actions.map((action) => (
              <Box
                key={action.title}
                sx={{
                  flex: "0 0 140px",
                  scrollSnapAlign: "start",
                }}
              >
                <ActionCard {...action} />
              </Box>
            ))}
          </Box>

          {/* Left scroll indicator - shows when scrolled right */}
          {showLeftIndicator && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: 60,
                pointerEvents: "none",
                background: (theme) =>
                  `linear-gradient(to right, ${theme.palette.mode === "dark" ? "#121212" : "#ffffff"} 0%, transparent 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                pl: 0.5,
              }}
            >
              <Box
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  borderRadius: "50%",
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "pulse 2s ease-in-out infinite",
                  cursor: "pointer",
                  pointerEvents: "auto",
                  "&:active": { transform: "scale(0.95)" },
                  "@keyframes pulse": {
                    "0%, 100%": {
                      opacity: 0.3,
                      transform: "scale(1)",
                    },
                    "50%": {
                      opacity: 0.5,
                      transform: "scale(1.1)",
                    },
                  },
                }}
              >
                <ChevronLeftIcon
                  sx={{
                    fontSize: "1.25rem",
                    color: "primary.main",
                    opacity: 0.7,
                  }}
                  onClick={() => {
                    if (scrollRef.current) {
                      scrollRef.current.scrollBy({
                        left: -200,
                        behavior: "smooth",
                      });
                    }
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Right scroll indicator - shows when more content to the right */}
          {showRightIndicator && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: 60,
                pointerEvents: "none",
                background: (theme) =>
                  `linear-gradient(to left, ${theme.palette.mode === "dark" ? "#121212" : "#ffffff"} 0%, transparent 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                pr: 0.5,
              }}
            >
              <Box
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  borderRadius: "50%",
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "pulse 2s ease-in-out infinite",
                  cursor: "pointer",
                  pointerEvents: "auto",
                  "&:active": { transform: "scale(0.95)" },
                  "@keyframes pulse": {
                    "0%, 100%": {
                      opacity: 0.3,
                      transform: "scale(1)",
                    },
                    "50%": {
                      opacity: 0.5,
                      transform: "scale(1.1)",
                    },
                  },
                }}
              >
                <ChevronRightIcon
                  sx={{
                    fontSize: "1.25rem",
                    color: "primary.main",
                    opacity: 0.7,
                  }}
                  onClick={() => {
                    if (scrollRef.current) {
                      scrollRef.current.scrollBy({
                        left: 200,
                        behavior: "smooth",
                      });
                    }
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>
      ) : (
        // Desktop/Tablet: Grid layout
        <Grid container spacing={isMobile ? 1.5 : 2}>
          {actions.map((action) => (
            <Grid size={{ xs: 6, sm: 6, md: 3 }} key={action.title}>
              <ActionCard {...action} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default QuickActions;
