// Format number with precision
export const formatNumber = (
  value: number,
  options: { floor?: boolean; precison?: number } = {}
): string => {
  const { floor = false, precison = 2 } = options;

  if (value === undefined || value === null || isNaN(value)) {
    return "0";
  }

  let result = floor
    ? Math.floor(value * 10 ** precison) / 10 ** precison
    : value;

  return result.toLocaleString("en-US", {
    minimumFractionDigits: precison,
    maximumFractionDigits: precison,
  });
};

// Format currency with null safety
export const formatCurrency = (
  value: number | null | undefined,
  options: { floor?: boolean; precison?: number } = {}
): string => {
  if (value == null || isNaN(value)) {
    return "--";
  }
  const { floor = false, precison = 2 } = options;
  if (floor && value > 0) {
    const floored = Math.floor(value * 10 ** precison) / 10 ** precison;
    if (floored === 0) {
      return "<$0.01";
    }
  }

  return `$${formatNumber(value, { floor, precison })}`;
};

// Format percentage with null safety
export const formatPercentage = (
  rate: number | null | undefined,
  precision: number = 2
): string => {
  if (rate == null || isNaN(rate)) {
    return "--";
  }
  const percentage = rate * 100;
  const multiplier = Math.pow(10, precision);
  const rounded = Math.round(percentage * multiplier) / multiplier;
  return `${rounded.toFixed(precision)}%`;
};

// Format basis points (bps) with null safety
export const formatBps = (
  rate: number | null | undefined,
  precision: number = 2
): string => {
  if (rate == null || isNaN(rate)) {
    return "--";
  }
  const multiplier = Math.pow(10, precision);
  const rounded = Math.round(rate * multiplier) / multiplier;
  return `${rounded.toFixed(precision)} bps`;
};

// Format address to shortened form
export const formatAddress = (address: string): string => {
  if (!address) return "--";
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format tier name: convert "PUBLIC" to "Public"
export const formatTier = (tier: string | null | undefined): string => {
  if (!tier) return "--";
  return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
};

// Copy text to clipboard
export const copyText = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
};

// cn utility for classnames
export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(" ");
};

// Generate distributor URL based on current deployment environment
export const getDistributorUrl = (code: string): string => {
  const deploymentEnv = import.meta.env.VITE_DEPLOYMENT_ENV;

  let baseUrl: string;

  switch (deploymentEnv) {
    case "mainnet":
      baseUrl = "https://dex.orderly.network";
      break;
    case "staging":
      baseUrl = "https://testnet-dex.orderly.network";
      break;
    case "qa":
    case "dev":
    default:
      baseUrl = "https://one.shitzuapes.xyz";
      break;
  }

  return `${baseUrl}/dex?distributor_code=${code}`;
};

/**
 * Get user's current timezone string
 * @returns Timezone string like "UTC+8" or "UTC-5"
 */
export const getUserTimezone = (): string => {
  const offset = -new Date().getTimezoneOffset() / 60;
  const sign = offset >= 0 ? "+" : "";
  return `UTC${sign}${offset}`;
};

/**
 * Convert UTC timestamp to local timezone and format as "Mon DD, YYYY HH:MMAM/PM"
 * @param timestamp UTC timestamp in milliseconds
 * @returns Formatted local time string like "Nov 10, 2024 12:00AM"
 */
export const formatUTCToLocalDateTime = (
  timestamp: number | string
): string => {
  if (!timestamp) return "--";

  const date = new Date(
    typeof timestamp === "string" ? parseInt(timestamp) : timestamp
  );

  if (isNaN(date.getTime())) return "--";

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  const minutesStr = minutes.toString().padStart(2, "0");
  const hoursStr = hours.toString().padStart(2, "0");

  return `${month} ${day}, ${year} ${hoursStr}:${minutesStr}${ampm}`;
};

/**
 * Convert UTC 01:00 to user's local timezone and format as "HH:mm (UTC±X)"
 * @returns Formatted time string like "09:00 (UTC+8)"
 */
export const formatUTCTimeToLocal = (): string => {
  const now = new Date();
  const utcDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 1, 0, 0)
  );

  const hours = utcDate.getHours().toString().padStart(2, "0");
  const minutes = utcDate.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes} (${getUserTimezone()})`;
};

/**
 * Split formatted datetime string into date and time parts
 * @param dateTimeString Formatted string like "Nov 10, 2024 00:00AM"
 * @returns Object with date and time parts, or null if invalid
 */
export const splitDateTime = (
  dateTimeString: string
): { date: string; time: string } | null => {
  if (!dateTimeString || dateTimeString === "--") return null;

  // Match pattern: "Mon DD, YYYY HH:MMAM/PM"
  const match = dateTimeString.match(/^(.+?)\s+(\d{2}:\d{2}[AP]M)$/);
  if (match) {
    return {
      date: match[1].trim(), // "Nov 10, 2024"
      time: match[2].trim(), // "00:00AM"
    };
  }

  return null;
};
