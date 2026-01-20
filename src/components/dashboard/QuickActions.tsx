import React from "react";
import {
  Grid,
  Paper,
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
import { useTranslation } from "../../i18n";

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  color,
  onClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: isMobile ? 1.5 : 2.5,
        borderRadius: isMobile ? 3 : 4,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        border: "1px solid",
        borderColor: alpha(color, 0.1),
        bgcolor:
          theme.palette.mode === "dark"
            ? alpha(color, 0.05)
            : alpha(color, 0.02),
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 0.5 : 1,
        height: "100%",
        minHeight: isMobile ? "100px" : "auto",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px -10px ${alpha(color, 0.4)}`,
          borderColor: alpha(color, 0.3),
          bgcolor: alpha(color, 0.08),
          "& .action-icon": {
            transform: "scale(1.1) rotate(5deg)",
            color: color,
          },
        },
      }}
    >
      <Box
        className="action-icon"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: isMobile ? 36 : 48,
          height: isMobile ? 36 : 48,
          borderRadius: isMobile ? "8px" : "12px",
          bgcolor: alpha(color, 0.1),
          color: alpha(color, 0.8),
          transition: "all 0.3s ease",
          mb: isMobile ? 0.5 : 1,
          "& svg": {
            fontSize: isMobile ? "1.25rem" : "2rem",
          },
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          variant={isMobile ? "caption" : "subtitle1"}
          fontWeight="900"
          noWrap
          sx={{ fontSize: isMobile ? "0.7rem" : undefined }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{
            fontSize: isMobile ? "0.625rem" : undefined,
            display: isMobile ? "block" : "block",
          }}
        >
          {description}
        </Typography>
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: -15,
          right: -15,
          opacity: 0.05,
          transform: isMobile ? "scale(2)" : "scale(3)",
          color: color,
          pointerEvents: "none",
        }}
      >
        {icon}
      </Box>
    </Paper>
  );
};

const QuickActions: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Track scroll position for scroll indicators
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showLeftIndicator, setShowLeftIndicator] = React.useState(false);
  const [showRightIndicator, setShowRightIndicator] = React.useState(true);

  // Update scroll indicators based on scroll position
  const handleScroll = React.useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const { scrollLeft, scrollWidth, clientWidth } = element;
    const isAtStart = scrollLeft <= 10; // Small threshold for accuracy
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;

    setShowLeftIndicator(!isAtStart);
    setShowRightIndicator(!isAtEnd);
  }, []);

  // Set up scroll listener on mobile
  React.useEffect(() => {
    const element = scrollRef.current;
    if (!isMobile || !element) return;

    // Initial check
    handleScroll();

    element.addEventListener("scroll", handleScroll);
    return () => element.removeEventListener("scroll", handleScroll);
  }, [isMobile, handleScroll]);

  const actions = [
    {
      title: t("inventory.addButton"),
      description: t("dashboard.actions.inventoryDesc"),
      icon: <AddIcon fontSize="large" />,
      color: "#027d6f",
      onClick: () => navigate("/inventory?action=add"),
    },
    {
      title: t("inventory.scan"),
      description: t("dashboard.actions.scanDesc"),
      icon: <ScanIcon fontSize="large" />,
      color: "#1a748b",
      onClick: () => navigate("/inventory?action=scan"),
    },
    {
      title: t("appliances.addAppliance") || t("appliances.add"),
      description: t("dashboard.actions.applianceDesc"),
      icon: <RepairIcon fontSize="large" />,
      color: "#0969da",
      onClick: () => navigate("/appliances?action=add"),
    },
    {
      title: t("inventory.reports") || t("menu.reports"),
      description: t("dashboard.actions.reportDesc"),
      icon: <ReportIcon fontSize="large" />,
      color: "#d29922",
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
