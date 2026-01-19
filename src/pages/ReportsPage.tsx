import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Autocomplete,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Print as PrintIcon } from "@mui/icons-material";
import { useTranslation } from "../i18n";
import { useInventoryContext } from "../contexts/InventoryContext";
import { useAlert } from "../contexts/AlertContext";
import { supabase } from "../supabaseClient";

const Reports: React.FC = () => {
  const { t, lang } = useTranslation();
  const { locations } = useInventoryContext();
  const { showError } = useAlert();

  const [reportType, setReportType] = useState<"monthly" | "annual">("monthly");
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7) // YYYY-MM
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ itemName: string; total: number }[]>([]);

  const fetchReportData = useCallback(async () => {
    if (!selectedLocation || (reportType === "monthly" && !selectedMonth)) {
      setData([]);
      return;
    }

    setLoading(true);
    try {
      let startDate: Date;
      let endDate: Date;

      if (reportType === "annual") {
        startDate = new Date(`${selectedYear}-01-01T00:00:00Z`);
        endDate = new Date(`${selectedYear + 1}-01-01T00:00:00Z`);
      } else {
        startDate = new Date(`${selectedMonth}-01T00:00:00Z`);
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const queryParams = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: selectedLocation,
      });

      const response = await fetch(
        `/api/activity/report-stats?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || ""}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch report data");
      const result = await response.json();
      setData(result as { itemName: string; total: number }[]);
    } catch (err: unknown) {
      console.error("Error fetching report data:", err);
      const message = err instanceof Error ? err.message : String(err);
      showError(`${t("errors.saveItem")}: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [reportType, selectedMonth, selectedYear, selectedLocation, t, showError]);

  useEffect(() => {
    void fetchReportData();
  }, [fetchReportData]);

  const handlePrint = () => {
    window.print();
  };

  const masterLocationNames = useMemo(() => {
    const names = new Set<string>();
    locations.forEach((loc) => {
      if (loc.name) names.add(loc.name);
    });
    return ["all", ...Array.from(names).sort()];
  }, [locations]);

  // Generate translated month options for the last 24 months
  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    const locale = lang === "ar" ? "ar-EG" : lang === "fr" ? "fr-FR" : "en-US";

    for (let i = 0; i < 24; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = date.toISOString().substring(0, 7); // YYYY-MM
      const label = new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }).format(date);
      options.push({ value, label });
    }
    return options;
  }, [lang]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          "@media print": { display: "none" },
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          {t("reports.title")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={data.length === 0}
        >
          {t("reports.print")}
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 4, "@media print": { display: "none" } }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12 }}>
            <ToggleButtonGroup
              value={reportType}
              exclusive
              onChange={(_, value: "monthly" | "annual" | null) =>
                value && setReportType(value)
              }
              size="small"
            >
              <ToggleButton value="monthly">
                {t("reports.monthly")}
              </ToggleButton>
              <ToggleButton value="annual">{t("reports.annual")}</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {reportType === "monthly" ? (
              <Autocomplete
                options={monthOptions}
                getOptionLabel={(option) => option.label}
                value={
                  monthOptions.find((m) => m.value === selectedMonth) || null
                }
                onChange={(_, newValue) =>
                  setSelectedMonth(newValue?.value || "")
                }
                renderInput={(params) => (
                  <TextField {...params} label={t("reports.month")} fullWidth />
                )}
              />
            ) : (
              <Autocomplete
                options={Array.from(
                  { length: 10 },
                  (_, i) => new Date().getFullYear() - i
                )}
                getOptionLabel={(year) => String(year)}
                value={selectedYear}
                onChange={(_, newValue) =>
                  newValue && setSelectedYear(newValue)
                }
                renderInput={(params) => (
                  <TextField {...params} label={t("reports.year")} fullWidth />
                )}
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              options={masterLocationNames}
              getOptionLabel={(option) =>
                option === "all" ? t("reports.allLocations") : option
              }
              value={selectedLocation}
              onChange={(_, newValue) => setSelectedLocation(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("reports.location")}
                  fullWidth
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Report Content */}
      <Box className="report-to-print">
        {/* Print only header */}
        <Box
          sx={{ display: "none", "@media print": { display: "block", mb: 4 } }}
        >
          <Typography variant="h4" align="center" gutterBottom>
            {t("reports.title")}
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary">
            {t("reports.summary", { location: selectedLocation })}
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            {t("reports.generatedOn", {
              date: new Date().toLocaleDateString(),
            })}
          </Typography>
          <Divider sx={{ my: 3 }} />
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : data.length > 0 ? (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <Table>
              <TableHead sx={{ bgcolor: "action.hover" }}>
                <TableRow>
                  <TableCell>
                    <strong>{t("reports.itemName")}</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>{t("reports.totalQuantity")}</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.itemName}>
                    <TableCell>{row.itemName}</TableCell>
                    <TableCell align="right">{row.total}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: "action.selected" }}>
                  <TableCell>
                    <strong>Total</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>
                      {data.reduce((sum, item) => sum + item.total, 0)}
                    </strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          selectedLocation && (
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ py: 8 }}
            >
              {t("reports.noData")}
            </Typography>
          )
        )}
      </Box>

      <style>
        {`
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            .report-to-print {
              padding: 20px;
            }
            @page {
              margin: 1cm;
            }
          }
        `}
      </style>
    </Container>
  );
};

export default Reports;
