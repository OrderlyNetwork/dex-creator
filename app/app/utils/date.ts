import { format } from "date-fns";

export function formatDate(
  date?: Date | number | string,
  formatStr = "MM/dd/yyyy HH:mm:ss"
) {
  if (!date) {
    return undefined;
  }
  return format(date, formatStr!);
}

export function formatUTCDate(
  date?: Date | number | string,
  formatStr = "MM/dd/yyyy HH:mm:ss"
) {
  if (!date) {
    return undefined;
  }

  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  if (isNaN(dateObj.getTime())) {
    return undefined;
  }

  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getUTCDate()).padStart(2, "0");

  const hours = String(dateObj.getUTCHours()).padStart(2, "0");
  const minutes = String(dateObj.getUTCMinutes()).padStart(2, "0");
  const seconds = String(dateObj.getUTCSeconds()).padStart(2, "0");

  return formatStr
    .replace("yyyy", year.toString())
    .replace("MM", month)
    .replace("dd", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}
