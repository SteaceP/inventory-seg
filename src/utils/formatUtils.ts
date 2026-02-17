/**
 * Formats a date string or Date object into a localized, human-readable format.
 * Defaults to: Year Month Day, Hour:Minute (e.g., "Jan 1, 2026, 08:00 AM")
 */
export const formatDate = (
  dateInput: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
  locale: string = undefined as unknown as string
): string => {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  return date.toLocaleString(locale, options);
};

/**
 * Generates an array of month options for the last 24 months.
 * Used primarily in reports for selection.
 */
export const generateMonthOptions = (
  lang: string,
  monthsToLookBack: number = 24
): { value: string; label: string }[] => {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  for (let i = 0; i < monthsToLookBack; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = date.toISOString().substring(0, 7); // YYYY-MM
    const label = new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
    }).format(date);
    options.push({ value, label });
  }
  return options;
};
