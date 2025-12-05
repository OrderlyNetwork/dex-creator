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
  return `$${formatNumber(value, options)}`;
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
 * Convert UTC timestamp to local timezone and format as "YYYY-MM-DD HH:mm:ss"
 * @param timestamp UTC timestamp in milliseconds
 * @returns Formatted local time string
 */
export const formatUTCToLocalDateTime = (
  timestamp: number | string
): string => {
  if (!timestamp) return "--";

  const date = new Date(
    typeof timestamp === "string" ? parseInt(timestamp) : timestamp
  );

  if (isNaN(date.getTime())) return "--";

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
