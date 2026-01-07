/**
 * Common Result type for error handling without exceptions
 *
 * @template T The type of data returned on success
 * @template E The type of error returned on failure (defaults to string message)
 */
export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Error types for GitHub operations
 */
export enum GitHubErrorType {
  REPOSITORY_NAME_INVALID = "REPOSITORY_NAME_INVALID",
  REPOSITORY_NAME_TOO_LONG = "REPOSITORY_NAME_TOO_LONG",
  REPOSITORY_NAME_EMPTY = "REPOSITORY_NAME_EMPTY",
  FORK_PERMISSION_DENIED = "FORK_PERMISSION_DENIED",
  FORK_REPOSITORY_NOT_FOUND = "FORK_REPOSITORY_NOT_FOUND",
  FORK_REPOSITORY_ALREADY_EXISTS = "FORK_REPOSITORY_ALREADY_EXISTS",
  FORK_RATE_LIMITED = "FORK_RATE_LIMITED",
  FORK_UNKNOWN_ERROR = "FORK_UNKNOWN_ERROR",
  SETUP_PERMISSION_DENIED = "SETUP_PERMISSION_DENIED",
  SETUP_REPOSITORY_NOT_FOUND = "SETUP_REPOSITORY_NOT_FOUND",
  SETUP_UNKNOWN_ERROR = "SETUP_UNKNOWN_ERROR",
}

/**
 * Error types for DEX operations
 */
export enum DexErrorType {
  USER_ALREADY_HAS_DEX = "USER_ALREADY_HAS_DEX",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  DEX_NOT_FOUND = "DEX_NOT_FOUND",
  USER_NOT_AUTHORIZED = "USER_NOT_AUTHORIZED",
  REPOSITORY_CREATION_FAILED = "REPOSITORY_CREATION_FAILED",
  REPOSITORY_PERMISSION_DENIED = "REPOSITORY_PERMISSION_DENIED",
  REPOSITORY_NOT_FOUND = "REPOSITORY_NOT_FOUND",
  REPOSITORY_ALREADY_EXISTS = "REPOSITORY_ALREADY_EXISTS",
  REPOSITORY_INFO_EXTRACTION_FAILED = "REPOSITORY_INFO_EXTRACTION_FAILED",
  DATABASE_ERROR = "DATABASE_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
}

/**
 * Error types for Landing Page operations
 */
export enum LandingPageErrorType {
  USER_ALREADY_HAS_LANDING_PAGE = "USER_ALREADY_HAS_LANDING_PAGE",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  LANDING_PAGE_NOT_FOUND = "LANDING_PAGE_NOT_FOUND",
  USER_NOT_AUTHORIZED = "USER_NOT_AUTHORIZED",
  REPOSITORY_CREATION_FAILED = "REPOSITORY_CREATION_FAILED",
  DATABASE_ERROR = "DATABASE_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
}

/**
 * Structured error for GitHub operations
 */
export interface GitHubError {
  type: GitHubErrorType;
  message: string;
  details?: unknown;
}

/**
 * Structured error for DEX operations
 */
export interface DexError {
  type: DexErrorType;
  message: string;
  details?: unknown;
}

/**
 * Structured error for Landing Page operations
 */
export interface LandingPageError {
  type: LandingPageErrorType;
  message: string;
  details?: unknown;
}

/**
 * Result type specifically for GitHub operations
 */
export type GitHubResult<T> = Result<T, GitHubError>;

/**
 * Result type specifically for DEX operations
 */
export type DexResult<T> = Result<T, DexError>;

/**
 * Result type specifically for Landing Page operations
 */
export type LandingPageResult<T> = Result<T, LandingPageError>;

/**
 * DEX configuration shared across all GitHub operations
 */
export interface DexConfig {
  brokerId: string;
  brokerName: string;
  chainIds: number[] | null;
  defaultChain: number | null;
  themeCSS: string | null;
  telegramLink: string | null;
  discordLink: string | null;
  xLink: string | null;
  walletConnectProjectId: string | null;
  privyAppId: string | null;
  privyTermsOfUse: string | null;
  privyLoginMethods: string | null;
  enabledMenus: string | null;
  customMenus: string | null;
  enableAbstractWallet: boolean | null;
  disableMainnet: boolean | null;
  disableTestnet: boolean | null;
  disableEvmWallets: boolean | null;
  disableSolanaWallets: boolean | null;
  enableServiceDisclaimerDialog: boolean | null;
  enableCampaigns: boolean | null;
  tradingViewColorConfig: string | null;
  availableLanguages: string[] | null;
  seoSiteName: string | null;
  seoSiteDescription: string | null;
  seoSiteLanguage: string | null;
  seoSiteLocale: string | null;
  seoTwitterHandle: string | null;
  seoThemeColor: string | null;
  seoKeywords: string | null;
  analyticsScript: string | null;
  symbolList: string | null;
  restrictedRegions: string | null;
  whitelistedIps: string | null;
}

/**
 * DEX files (logos, posters, etc.) shared across all GitHub operations
 */
export interface DexFiles {
  primaryLogo: string | null;
  secondaryLogo: string | null;
  favicon: string | null;
  pnlPosters: string[] | null;
}
