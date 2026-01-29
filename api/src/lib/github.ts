/**
 * GitHub API client with ETag caching
 *
 * This module wraps the Octokit client with hooks that implement
 * ETag-based caching to reduce GitHub API rate limit consumption.
 *
 * The implementation:
 * 1. Uses Octokit hooks to intercept requests and responses
 * 2. Stores ETag headers and response data from successful requests
 * 3. Adds If-None-Match headers for subsequent requests to the same endpoints
 * 4. Returns cached data when GitHub responds with 304 Not Modified
 *
 * This implementation helps to:
 * - Reduce rate limit usage (304 responses don't count against rate limits)
 * - Improve response times for repeated requests
 * - Work seamlessly with existing code using the Octokit client
 */
import { Octokit } from "@octokit/core";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";
import sodium from "libsodium-wrappers";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  GitHubResult,
  GitHubError,
  GitHubErrorType,
  type DexConfig,
  type DexFiles,
} from "./types";
import { getSecret } from "./secretManager.js";
import {
  ALLOWED_MAINNET_CHAIN_IDS,
  ALLOWED_TESTNET_CHAIN_IDS,
} from "../../../config";

let __dirname: string;
if (typeof import.meta !== "undefined" && import.meta.url) {
  const __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} else {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  __dirname = (global as any).__dirname || process.cwd();
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const etagCache = new Map<string, { etag: string; data: any }>();
let cacheHits = 0;
let cacheMisses = 0;

interface TemplateUpdateStatus {
  hasUpdates: boolean;
  behindBy: number;
  templateCommitSha: string;
  userCommitSha: string;
  commits?: Array<{
    sha: string;
    message: string;
    author: string;
    date: string;
  }>;
}

interface CachedTemplateUpdateStatus extends TemplateUpdateStatus {
  timestamp: number;
}

const templateUpdatesCache = new Map<string, CachedTemplateUpdateStatus>();
const CACHE_TTL_TEMPLATE_UPDATES_MS = 60 * 1000;

const workflowsDir = path.resolve(__dirname, "../workflows");
const deployYmlContent = fs.readFileSync(
  path.join(workflowsDir, "deploy.yml"),
  "utf-8"
);

/**
 * Returns stats about the GitHub ETag cache
 */
export function getGitHubETagCacheStats() {
  return {
    cacheSize: etagCache.size,
    hits: cacheHits,
    misses: cacheMisses,
    hitRate:
      cacheHits + cacheMisses > 0
        ? (cacheHits / (cacheHits + cacheMisses)) * 100
        : 0,
    savedApiCalls: cacheHits,
  };
}

const MyOctokit = Octokit.plugin(restEndpointMethods);

let octokit: InstanceType<typeof MyOctokit> | null = null;

async function getOctokit(): Promise<InstanceType<typeof MyOctokit>> {
  if (!octokit) {
    const githubToken = await getSecret("githubToken");
    octokit = new MyOctokit({
      auth: githubToken,
    });

    if (!hooksSetup) {
      await setupOctokitHooks();
      hooksSetup = true;
    }
  }

  return octokit;
}

function getCacheKey(options: any): string {
  let url = options.url;

  if (url) {
    url = url.replace(/{([^}]+)}/g, (_: any, key: string) => {
      return options[key] ?? `{${key}}`;
    });
  }

  if (options.method && options.baseUrl && options.url) {
    return `${options.method} ${options.baseUrl}${url}`;
  }

  if (typeof options === "string") {
    return options;
  }

  return `${options.method || "GET"} ${options.url || ""}:${JSON.stringify(options.params || {})}`;
}

async function setupOctokitHooks() {
  if (!octokit) {
    throw new Error("Octokit instance not initialized");
  }
  const octokitInstance = octokit;

  octokitInstance.hook.before("request", async options => {
    try {
      if (options.method !== "GET") {
        return;
      }

      const cacheKey = getCacheKey(options);
      const cachedItem = etagCache.get(cacheKey);

      if (cachedItem) {
        if (!options.headers) {
          options.headers = {
            accept: "application/vnd.github.v3+json",
            "user-agent": "orderly-dex-creator",
          };
        } else {
          options.headers.accept =
            options.headers.accept || "application/vnd.github.v3+json";
          options.headers["user-agent"] =
            options.headers["user-agent"] || "orderly-dex-creator";
        }

        options.headers["If-None-Match"] = cachedItem.etag;
      }
    } catch (error) {
      console.error("[GitHub ETag] Error in before hook:", error);
    }
  });

  octokitInstance.hook.after("request", async (response, options) => {
    try {
      if (options.method !== "GET") {
        return;
      }

      const cacheKey = getCacheKey(options);

      if (response.headers?.etag) {
        etagCache.set(cacheKey, {
          etag: response.headers.etag,
          data: response.data,
        });
        cacheMisses++;
      }
    } catch (error) {
      console.error("[GitHub ETag] Error in after hook:", error);
    }
  });

  octokitInstance.hook.error("request", async (error, options) => {
    try {
      if (isRequestError(error)) {
        if (error.status === 304) {
          if (options.method !== "GET") {
            throw error;
          }

          const cacheKey = getCacheKey(options);
          const cachedItem = etagCache.get(cacheKey);

          if (cachedItem) {
            cacheHits++;

            return {
              data: cachedItem.data,
              headers: { ...error.response?.headers, "x-cached": "true" },
              status: 200,
              url: error.response?.url,
            };
          }
        }

        console.error(
          `[GitHub ETag] Error for ${getCacheKey(options)}:`,
          error.status,
          error.message
        );
      } else {
        console.error(
          `[GitHub ETag] Error for ${getCacheKey(options)}:`,
          error instanceof Error ? error.message : String(error)
        );
      }

      throw error;
    } catch (hookError) {
      console.error("[GitHub ETag] Error in error hook:", hookError);
      throw error;
    }
  });
}

let hooksSetup = false;

function isRequestError(error: Error | any): error is {
  status: number;
  message?: string;
  response?: { headers?: any; url?: string };
} {
  return error && typeof error === "object" && "status" in error;
}

/**
 * Converts GitHub API errors to structured error types
 */
function handleGitHubError(error: unknown, operation: string): GitHubError {
  if (isRequestError(error)) {
    const status = error.status;
    const message = error.message || "Unknown GitHub API error";

    switch (status) {
      case 401:
      case 403:
        return {
          type: GitHubErrorType.FORK_PERMISSION_DENIED,
          message: `Permission denied for ${operation}: ${message}`,
          details: { status, originalError: error },
        };
      case 404:
        return {
          type: GitHubErrorType.FORK_REPOSITORY_NOT_FOUND,
          message: `Repository not found for ${operation}: ${message}`,
          details: { status, originalError: error },
        };
      case 422:
        if (
          message.includes("already exists") ||
          message.includes("name already taken")
        ) {
          return {
            type: GitHubErrorType.FORK_REPOSITORY_ALREADY_EXISTS,
            message: `Repository already exists for ${operation}: ${message}`,
            details: { status, originalError: error },
          };
        }
        return {
          type: GitHubErrorType.FORK_UNKNOWN_ERROR,
          message: `Validation error for ${operation}: ${message}`,
          details: { status, originalError: error },
        };
      case 429:
        return {
          type: GitHubErrorType.FORK_RATE_LIMITED,
          message: `Rate limited for ${operation}: ${message}`,
          details: { status, originalError: error },
        };
      default:
        return {
          type: GitHubErrorType.FORK_UNKNOWN_ERROR,
          message: `GitHub API error for ${operation}: ${message}`,
          details: { status, originalError: error },
        };
    }
  }

  const message = error instanceof Error ? error.message : String(error);
  return {
    type: GitHubErrorType.FORK_UNKNOWN_ERROR,
    message: `Unknown error for ${operation}: ${message}`,
    details: { originalError: error },
  };
}

/* eslint-enable @typescript-eslint/no-explicit-any */

const templateRepo =
  process.env.GITHUB_TEMPLATE_REPO ||
  "OrderlyNetworkDexCreator/dex-creator-template";
const [templateOwner, templateRepoName] = templateRepo.split("/");

/**
 * Creates a fork of the template repository for a user's DEX
 * @param repoName The name for the new repository
 * @returns The URL of the created repository
 */
export async function forkTemplateRepository(
  repoName: string
): Promise<GitHubResult<string>> {
  try {
    if (!repoName || repoName.trim() === "") {
      return {
        success: false,
        error: {
          type: GitHubErrorType.REPOSITORY_NAME_EMPTY,
          message: "Repository name cannot be empty",
        },
      };
    }

    if (!/^[a-z0-9-]+$/i.test(repoName)) {
      return {
        success: false,
        error: {
          type: GitHubErrorType.REPOSITORY_NAME_INVALID,
          message:
            "Repository name can only contain alphanumeric characters and hyphens",
        },
      };
    }

    if (repoName.length > 100) {
      return {
        success: false,
        error: {
          type: GitHubErrorType.REPOSITORY_NAME_TOO_LONG,
          message:
            "Repository name exceeds GitHub's maximum length of 100 characters",
        },
      };
    }

    console.log(
      `Forking repository ${templateOwner}/${templateRepoName} to OrderlyNetworkDexCreator/${repoName}`
    );

    const orgName = "OrderlyNetworkDexCreator";

    const octokit = await getOctokit();
    const response = await octokit.rest.repos.createFork({
      owner: templateOwner,
      repo: templateRepoName,
      organization: orgName,
      name: repoName,
    });

    const repoUrl = response.data.html_url;
    console.log(`Successfully forked repository: ${repoUrl}`);

    console.log("Waiting for fork to be fully created...");
    await new Promise(resolve => setTimeout(resolve, 5_000));

    await enableRepositoryActions(orgName, repoName);

    const deploymentToken = await getSecret("templatePat");
    try {
      await addSecretToRepository(
        orgName,
        repoName,
        "TEMPLATE_PAT",
        deploymentToken
      );
      console.log(`Added TEMPLATE_PAT secret to ${orgName}/${repoName}`);
    } catch (secretError) {
      console.error(
        "Error adding GitHub Pages deployment token secret:",
        secretError
      );
    }

    try {
      await enableGitHubPages(orgName, repoName);
      console.log(`Enabled GitHub Pages for ${orgName}/${repoName}`);
    } catch (pagesError) {
      console.error("Error enabling GitHub Pages:", pagesError);
    }

    return {
      success: true,
      data: repoUrl,
    };
  } catch (error: unknown) {
    console.error("Error forking repository:", error);
    return {
      success: false,
      error: handleGitHubError(error, "fork repository"),
    };
  }
}

/**
 * Creates an empty repository for a landing page
 * @param repoIdentifier The identifier for the new repository
 * @returns The URL of the created repository
 */
export async function createLandingPageRepository(
  repoIdentifier: string
): Promise<GitHubResult<string>> {
  try {
    if (!repoIdentifier || repoIdentifier.trim() === "") {
      return {
        success: false,
        error: {
          type: GitHubErrorType.REPOSITORY_NAME_EMPTY,
          message: "Repository identifier cannot be empty",
        },
      };
    }

    if (!/^[a-z0-9-]+$/i.test(repoIdentifier)) {
      return {
        success: false,
        error: {
          type: GitHubErrorType.REPOSITORY_NAME_INVALID,
          message:
            "Repository identifier can only contain alphanumeric characters and hyphens",
        },
      };
    }

    if (repoIdentifier.length > 100) {
      return {
        success: false,
        error: {
          type: GitHubErrorType.REPOSITORY_NAME_TOO_LONG,
          message:
            "Repository identifier exceeds GitHub's maximum length of 100 characters",
        },
      };
    }

    const repoName = `landing-page-${repoIdentifier}`;
    const orgName = "OrderlyNetworkDexCreator";

    console.log(`Creating landing page repository ${orgName}/${repoName}...`);

    const octokit = await getOctokit();
    const response = await octokit.rest.repos.createInOrg({
      org: orgName,
      name: repoName,
      private: false,
      auto_init: false,
    });

    const repoUrl = response.data.html_url;
    console.log(`Successfully created repository: ${repoUrl}`);

    await enableRepositoryActions(orgName, repoName);

    const deploymentToken = await getSecret("templatePat");
    try {
      await addSecretToRepository(
        orgName,
        repoName,
        "TEMPLATE_PAT",
        deploymentToken
      );
      console.log(`Added TEMPLATE_PAT secret to ${orgName}/${repoName}`);
    } catch (secretError) {
      console.error(
        "Error adding GitHub Pages deployment token secret:",
        secretError
      );
    }

    try {
      await enableGitHubPages(orgName, repoName);
      console.log(`Enabled GitHub Pages for ${orgName}/${repoName}`);
    } catch (pagesError) {
      console.error("Error enabling GitHub Pages:", pagesError);
    }

    return {
      success: true,
      data: repoUrl,
    };
  } catch (error: unknown) {
    console.error("Error creating landing page repository:", error);
    return {
      success: false,
      error: handleGitHubError(error, "create landing page repository"),
    };
  }
}

/**
 * Setup landing page repository with HTML content and GitHub Pages workflow
 */
export async function setupLandingPageRepository(
  owner: string,
  repo: string,
  customDomain: string | null,
  generatedFiles: Array<{ path: string; content: string }>,
  config?: Record<string, unknown> | null
): Promise<void> {
  console.log(`Setting up landing page repository ${owner}/${repo}...`);

  try {
    const landingPageWorkflow = `name: Deploy Landing Page to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: write
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: \${{ secrets.TEMPLATE_PAT }}
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
        with:
          token: \${{ secrets.TEMPLATE_PAT }}
          enablement: true
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "."
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

    const fileContents = new Map<string, string>();

    for (const file of generatedFiles) {
      if (!file.path.startsWith(".github/") && file.path !== "CNAME") {
        fileContents.set(file.path, file.content);
      }
    }

    fileContents.set(".github/workflows/deploy.yml", landingPageWorkflow);
    if (customDomain) {
      fileContents.set("CNAME", customDomain);
    }

    // Extract images from config and add them as binary files
    const binaryFiles = new Map<string, Buffer>();
    if (config) {
      // Extract and convert base64 image data to Buffers
      const imageMap: Array<{ configKey: string; path: string }> = [
        { configKey: "primaryLogoData", path: "assets/primaryLogo.webp" },
        { configKey: "secondaryLogoData", path: "assets/secondaryLogo.webp" },
        { configKey: "bannerData", path: "assets/banner.webp" },
      ];

      for (const { configKey, path } of imageMap) {
        const imageData = config[configKey];
        if (imageData && typeof imageData === "string") {
          try {
            // Remove data URL prefix if present (data:image/webp;base64,...)
            const base64Data = imageData.includes(",")
              ? imageData.split(",")[1]
              : imageData;
            const buffer = Buffer.from(base64Data, "base64");
            binaryFiles.set(path, buffer);
            console.log(`Added image to binary files: ${path}`);
          } catch (error) {
            console.warn(`Failed to process image ${configKey}:`, error);
          }
        }
      }

      // Process team member images
      const teamMembers = config.teamMembers as
        | Array<{ imageData?: string; imagePath?: string }>
        | undefined;
      if (teamMembers && Array.isArray(teamMembers)) {
        teamMembers.forEach((member, index) => {
          if (member.imageData && typeof member.imageData === "string") {
            try {
              const base64Data = member.imageData.includes(",")
                ? member.imageData.split(",")[1]
                : member.imageData;
              const buffer = Buffer.from(base64Data, "base64");
              const path = `assets/team/member${index + 1}.webp`;
              binaryFiles.set(path, buffer);
              console.log(`Added team member image to binary files: ${path}`);
            } catch (error) {
              console.warn(
                `Failed to process team member ${index + 1} image:`,
                error
              );
            }
          }
        });
      }
    }

    const filesToDelete: string[] = [];

    await syncRepoContents(
      owner,
      repo,
      fileContents,
      binaryFiles,
      filesToDelete,
      "Update landing page files"
    );
  } catch (error) {
    console.error(
      `Error setting up landing page repository ${owner}/${repo}:`,
      error
    );
    throw error;
  }
}

/**
 * Enables GitHub Actions on a repository
 * This is necessary because GitHub disables Actions by default on forked repositories
 * that contain workflows
 * @param owner The repository owner (username or organization)
 * @param repo The repository name
 */
async function enableRepositoryActions(
  owner: string,
  repo: string
): Promise<void> {
  try {
    const octokit = await getOctokit();
    await octokit.rest.actions.setGithubActionsPermissionsRepository({
      owner,
      repo,
      enabled: true,
      allowed_actions: "all",
    });

    await octokit.rest.actions.setGithubActionsDefaultWorkflowPermissionsRepository(
      {
        owner,
        repo,
        default_workflow_permissions: "write",
      }
    );
    console.log(`GitHub Actions successfully enabled on ${owner}/${repo}`);
  } catch (error) {
    console.error(`Error enabling GitHub Actions on ${owner}/${repo}:`, error);
    throw error;
  }
}

/**
 * Adds a secret to a GitHub repository
 * @param owner The repository owner (username or organization)
 * @param repo The repository name
 * @param secretName The name of the secret
 * @param secretValue The plaintext value of the secret
 */
async function addSecretToRepository(
  owner: string,
  repo: string,
  secretName: string,
  secretValue: string
): Promise<void> {
  try {
    console.log(`Adding secret ${secretName} to ${owner}/${repo}...`);

    console.log(`Fetching public key for ${owner}/${repo}...`);
    const octokit = await getOctokit();
    const { data: publicKeyData } = await octokit.rest.actions.getRepoPublicKey(
      {
        owner,
        repo,
      }
    );

    console.log(`Received public key: ${publicKeyData.key}`);

    const encryptedValue = await encryptSecret(publicKeyData.key, secretValue);

    console.log(`Submitting encrypted secret to GitHub...`);
    await octokit.rest.actions.createOrUpdateRepoSecret({
      owner,
      repo,
      secret_name: secretName,
      encrypted_value: encryptedValue,
      key_id: publicKeyData.key_id,
    });

    console.log(`Successfully added secret ${secretName} to ${owner}/${repo}`);
  } catch (error) {
    console.error(
      `Error adding secret ${secretName} to ${owner}/${repo}:`,
      error
    );
    throw error;
  }
}

/**
 * Encrypts a secret using the repository's public key
 * @param publicKey The repository's public key (from GitHub API)
 * @param secretValue The plaintext secret value to encrypt
 * @returns The encrypted secret value ready for GitHub API
 */
async function encryptSecret(
  publicKey: string,
  secretValue: string
): Promise<string> {
  try {
    await sodium.ready;

    console.log("Processing public key:", publicKey);

    let normalizedKey = publicKey;
    if (publicKey.length % 4 !== 0) {
      const padding = 4 - (publicKey.length % 4);
      normalizedKey = publicKey + "=".repeat(padding);
      console.log("Added padding to key:", normalizedKey);
    }

    const buffer = Buffer.from(normalizedKey, "base64");
    const publicKeyBinary = new Uint8Array(buffer);

    if (publicKeyBinary.length !== 32) {
      console.error(
        `Invalid key length: ${publicKeyBinary.length} bytes, expected 32 bytes`
      );
      throw new Error("Invalid key length for GitHub encryption");
    }

    const secretBinary = sodium.from_string(secretValue);

    const encryptedBinary = sodium.crypto_box_seal(
      secretBinary,
      publicKeyBinary
    );

    const base64 = Buffer.from(encryptedBinary).toString("base64");
    console.log("Encrypted value (first 20 chars):", base64.substring(0, 20));

    return base64;
  } catch (error) {
    console.error("Error encrypting secret:", error);
    throw error;
  }
}

/**
 * Extract image data from a data URI
 * @param dataUri The data URI string
 * @returns The raw binary data buffer or null if invalid
 */
function extractImageDataFromUri(dataUri: string | null): Buffer | null {
  if (!dataUri) return null;

  try {
    const match = dataUri.match(/^data:image\/([^;]+);base64,(.+)$/);
    if (!match || !match[2]) {
      console.warn("Invalid data URI format for image");
      return null;
    }

    return Buffer.from(match[2], "base64");
  } catch (error) {
    console.error("Error extracting image data from URI:", error);
    return null;
  }
}

function prepareDexConfigContent(
  config: DexConfig,
  files: DexFiles,
  customDomain: string | null,
  repoUrl: string | null,
  brokerEoaAddress: string | null
): {
  configJsContent: string;
  envContent: string;
  themeCSS: string | null;
  faviconData: Buffer | null;
  primaryLogoData: Buffer | null;
  secondaryLogoData: Buffer | null;
  pnlPostersData: Buffer[] | null;
} {
  const faviconData = extractImageDataFromUri(files.favicon);
  const primaryLogoData = extractImageDataFromUri(files.primaryLogo);
  const secondaryLogoData = extractImageDataFromUri(files.secondaryLogo);

  const pnlPostersData =
    (files.pnlPosters
      ?.map(poster => extractImageDataFromUri(poster))
      .filter(Boolean) as Buffer[]) || [];

  const generateSiteUrl = (): string => {
    if (customDomain) {
      return `https://${customDomain}`;
    }

    if (repoUrl) {
      try {
        const match = repoUrl.match(/github\.com\/[^\/]+\/([^\/]+)/);
        if (match && match[1]) {
          const repoName = match[1];
          return `https://dex.orderly.network/${repoName}/`;
        }
      } catch (error) {
        console.error("Error constructing deployment URL:", error);
      }
    }

    return "";
  };

  const selectedChainIds = config.chainIds || [];
  let selectedMainnetChains = selectedChainIds.filter(id =>
    ALLOWED_MAINNET_CHAIN_IDS.includes(id)
  );
  if (selectedMainnetChains.length === 0) {
    selectedMainnetChains = ALLOWED_MAINNET_CHAIN_IDS;
  }
  let selectedTestnetChains = selectedChainIds.filter(id =>
    ALLOWED_TESTNET_CHAIN_IDS.includes(id)
  );
  if (selectedTestnetChains.length === 0) {
    selectedTestnetChains = ALLOWED_TESTNET_CHAIN_IDS;
  }

  const runtimeConfig = {
    // Broker settings
    VITE_ORDERLY_BROKER_ID: config.brokerId,
    VITE_ORDERLY_BROKER_NAME: config.brokerName,
    VITE_BROKER_EOA_ADDRESS: brokerEoaAddress || "",

    // Network settings
    VITE_DISABLE_MAINNET: String(config.disableMainnet ?? false),
    VITE_DISABLE_TESTNET: String(config.disableTestnet ?? false),
    VITE_ORDERLY_MAINNET_CHAINS: selectedMainnetChains.join(","),
    VITE_ORDERLY_TESTNET_CHAINS: selectedTestnetChains.join(","),
    VITE_DEFAULT_CHAIN: config.defaultChain ? String(config.defaultChain) : "",

    // Wallet settings
    VITE_PRIVY_APP_ID: config.privyAppId || "",
    VITE_PRIVY_LOGIN_METHODS: config.privyLoginMethods || "email",
    VITE_PRIVY_TERMS_OF_USE: config.privyTermsOfUse || "",
    VITE_ENABLE_ABSTRACT_WALLET: String(config.enableAbstractWallet ?? false),
    VITE_DISABLE_EVM_WALLETS: String(config.disableEvmWallets ?? false),
    VITE_DISABLE_SOLANA_WALLETS: String(config.disableSolanaWallets ?? false),
    VITE_WALLETCONNECT_PROJECT_ID: config.walletConnectProjectId || "",

    // UI/Branding settings
    VITE_APP_NAME: config.brokerName || "Orderly App",
    VITE_APP_DESCRIPTION:
      config.seoSiteDescription || "Orderly Trading Application",
    VITE_HAS_PRIMARY_LOGO: primaryLogoData ? "true" : "false",
    VITE_HAS_SECONDARY_LOGO: secondaryLogoData ? "true" : "false",

    // Navigation
    VITE_ENABLED_MENUS:
      config.enabledMenus || "Trading,Portfolio,Markets,Leaderboard",
    VITE_CUSTOM_MENUS: config.customMenus || "",
    VITE_ENABLE_SERVICE_DISCLAIMER_DIALOG: String(
      config.enableServiceDisclaimerDialog ?? false
    ),
    VITE_ENABLE_CAMPAIGNS: String(config.enableCampaigns ?? false),

    // Social links
    VITE_TELEGRAM_URL: config.telegramLink || "",
    VITE_DISCORD_URL: config.discordLink || "",
    VITE_TWITTER_URL: config.xLink || "",

    // SEO settings
    VITE_SEO_SITE_NAME: config.seoSiteName || "",
    VITE_SEO_SITE_DESCRIPTION: config.seoSiteDescription || "",
    VITE_SEO_SITE_URL: generateSiteUrl(),
    VITE_SEO_SITE_LANGUAGE: config.seoSiteLanguage || "en",
    VITE_SEO_SITE_LOCALE: config.seoSiteLocale || "en_US",
    VITE_SEO_TWITTER_HANDLE: config.seoTwitterHandle || "",
    VITE_SEO_THEME_COLOR: config.seoThemeColor || "#000000",
    VITE_SEO_KEYWORDS: config.seoKeywords || "",

    // Language settings
    VITE_AVAILABLE_LANGUAGES: (config.availableLanguages || ["en"]).join(","),

    // PnL/Trading View
    VITE_USE_CUSTOM_PNL_POSTERS: pnlPostersData.length > 0 ? "true" : "false",
    VITE_CUSTOM_PNL_POSTER_COUNT: String(pnlPostersData.length),
    VITE_TRADING_VIEW_COLOR_CONFIG: config.tradingViewColorConfig || "",

    // Analytics
    VITE_ANALYTICS_SCRIPT: config.analyticsScript || "",

    // Asset filtering
    VITE_SYMBOL_LIST: config.symbolList || "",

    // Geo-restriction settings
    VITE_RESTRICTED_REGIONS: config.restrictedRegions || "",
    VITE_WHITELISTED_IPS: config.whitelistedIps || "",
  };

  const configJsContent = `window.__RUNTIME_CONFIG__ = ${JSON.stringify(
    runtimeConfig,
    null,
    2
  )};`;

  const envContent =
    "# Build-time environment variables only\n# Runtime configuration is in /public/config.js";

  return {
    configJsContent,
    envContent,
    themeCSS: config.themeCSS,
    faviconData: faviconData,
    primaryLogoData: primaryLogoData,
    secondaryLogoData: secondaryLogoData,
    pnlPostersData: pnlPostersData.length > 0 ? pnlPostersData : null,
  };
}

/**
 * Helper function to create a single commit with multiple file changes
 * @param owner The repository owner (username or organization)
 * @param repo The repository name
 * @param fileContents Map of file paths to their contents
 * @param binaryFiles Map of file paths to their binary contents
 * @param filesToDelete Array of file paths to delete
 * @param commitMessage The commit message
 */
async function createSingleCommit(
  owner: string,
  repo: string,
  fileContents: Map<string, string>,
  binaryFiles: Map<string, Buffer> = new Map(),
  filesToDelete: string[] = [],
  commitMessage: string
): Promise<void> {
  console.log(`Getting latest commit for ${owner}/${repo}...`);
  const octokit = await getOctokit();
  const { data: refData } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: "heads/main",
  });
  const latestCommitSha = refData.object.sha;

  const verifiedFilesToDelete: string[] = [];
  for (const filePath of filesToDelete) {
    try {
      await octokit.rest.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: "heads/main",
      });
      verifiedFilesToDelete.push(filePath);
      console.log(`Will delete: ${filePath}`);
    } catch {}
  }

  console.log("Creating blobs for text files...");
  const textBlobPromises = Array.from(fileContents.entries()).map(
    ([path, content]) =>
      octokit.rest.git
        .createBlob({
          owner,
          repo,
          content: Buffer.from(content).toString("base64"),
          encoding: "base64",
        })
        .then(response => ({ path, sha: response.data.sha }))
  );

  console.log("Creating blobs for binary files...");
  const binaryBlobPromises = Array.from(binaryFiles.entries()).map(
    ([path, buffer]) =>
      octokit.rest.git
        .createBlob({
          owner,
          repo,
          content: buffer.toString("base64"),
          encoding: "base64",
        })
        .then(response => ({ path, sha: response.data.sha }))
  );

  const textBlobs = await Promise.all(textBlobPromises);
  const binaryBlobs = await Promise.all(binaryBlobPromises);

  const treeEntries = [
    ...textBlobs.map(({ path, sha }) => ({
      path,
      mode: "100644" as const,
      type: "blob" as const,
      sha,
    })),
    ...binaryBlobs.map(({ path, sha }) => ({
      path,
      mode: "100644" as const,
      type: "blob" as const,
      sha,
    })),
    ...verifiedFilesToDelete.map(path => ({
      path,
      mode: "100644" as const,
      type: "blob" as const,
      sha: null as unknown as string,
    })),
  ];

  console.log("Creating git tree with all files...");
  const { data: newTree } = await octokit.rest.git.createTree({
    owner,
    repo,
    base_tree: latestCommitSha,
    tree: treeEntries,
  });

  console.log("Creating commit with all files...");
  const { data: newCommit } = await octokit.rest.git.createCommit({
    owner,
    repo,
    message: commitMessage,
    tree: newTree.sha,
    parents: [latestCommitSha],
  });

  console.log("Updating branch reference...");
  await octokit.rest.git.updateRef({
    owner,
    repo,
    ref: "heads/main",
    sha: newCommit.sha,
  });

  console.log(`Successfully committed changes to ${owner}/${repo}`);
}

/**
 * Create a single commit that cleans all existing files and adds new content
 * This deletes all files except .github/ and CNAME, then adds all new files
 */
async function syncRepoContents(
  owner: string,
  repo: string,
  fileContents: Map<string, string>,
  binaryFiles: Map<string, Buffer> = new Map(),
  filesToDelete: string[] = [],
  commitMessage: string
): Promise<void> {
  console.log(`Creating commit with file cleanup for ${owner}/${repo}...`);
  const octokit = await getOctokit();

  // Get the latest commit SHA (if exists)
  let baseCommitSha: string | null = null;
  let isEmptyRepo = false;
  try {
    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: "heads/main",
    });
    baseCommitSha = refData.object.sha;
  } catch (_error) {
    console.log(
      "No existing main branch, repository is empty - initializing with Contents API"
    );
    isEmptyRepo = true;
  }

  if (isEmptyRepo && (fileContents.size > 0 || binaryFiles.size > 0)) {
    console.log(
      "Repository is empty, initializing with first file then using Git API for single commit..."
    );

    let firstPath: string;
    let firstContent: string | Buffer;

    if (fileContents.has("index.html")) {
      firstPath = "index.html";
      firstContent = fileContents.get("index.html")!;
    } else if (fileContents.size > 0) {
      const firstEntry = fileContents.entries().next().value;
      if (!firstEntry) {
        throw new Error("No files to commit");
      }
      firstPath = firstEntry[0];
      firstContent = firstEntry[1];
    } else if (binaryFiles.size > 0) {
      const firstEntry = binaryFiles.entries().next().value;
      if (!firstEntry) {
        throw new Error("No files to commit");
      }
      firstPath = firstEntry[0];
      firstContent = firstEntry[1];
    } else {
      throw new Error("No files to commit");
    }

    try {
      const initResponse = await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: firstPath,
        message: "Initial commit",
        content: Buffer.isBuffer(firstContent)
          ? firstContent.toString("base64")
          : Buffer.from(firstContent).toString("base64"),
        branch: "main",
      });

      if (initResponse.data.commit?.sha) {
        baseCommitSha = initResponse.data.commit.sha;
      } else {
        const { data: refData } = await octokit.rest.git.getRef({
          owner,
          repo,
          ref: "heads/main",
        });
        baseCommitSha = refData.object.sha;
      }
      console.log(
        `Repository initialized with ${firstPath}, commit ${baseCommitSha}`
      );
    } catch (initError) {
      console.error("Failed to initialize repository:", initError);
      throw initError;
    }
  }

  const allFilesToDelete: string[] = [...filesToDelete];

  if (baseCommitSha) {
    try {
      const { data: commitData } = await octokit.rest.git.getCommit({
        owner,
        repo,
        commit_sha: baseCommitSha,
      });

      const { data: treeData } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: commitData.tree.sha,
        recursive: "1",
      });

      if (treeData.tree) {
        for (const item of treeData.tree) {
          if (item.type === "blob" && item.path) {
            if (
              !item.path.startsWith(".github/") &&
              item.path !== "CNAME" &&
              !fileContents.has(item.path) &&
              !binaryFiles.has(item.path) &&
              !filesToDelete.includes(item.path)
            ) {
              allFilesToDelete.push(item.path);
              console.log(`Will delete: ${item.path}`);
            }
          }
        }
      }
    } catch (error) {
      console.warn("Could not fetch existing files for cleanup:", error);
    }
  }

  const verifiedFilesToDelete: string[] = [];
  if (baseCommitSha) {
    for (const filePath of allFilesToDelete) {
      try {
        await octokit.rest.repos.getContent({
          owner,
          repo,
          path: filePath,
          ref: "heads/main",
        });
        verifiedFilesToDelete.push(filePath);
      } catch {
        // File doesn't exist, skip
      }
    }
  }

  console.log("Creating blobs for text files...");
  const textBlobPromises = Array.from(fileContents.entries()).map(
    ([path, content]) =>
      octokit.rest.git
        .createBlob({
          owner,
          repo,
          content: Buffer.from(content).toString("base64"),
          encoding: "base64",
        })
        .then(response => ({ path, sha: response.data.sha }))
  );

  console.log("Creating blobs for binary files...");
  const binaryBlobPromises = Array.from(binaryFiles.entries()).map(
    ([path, buffer]) =>
      octokit.rest.git
        .createBlob({
          owner,
          repo,
          content: buffer.toString("base64"),
          encoding: "base64",
        })
        .then(response => ({ path, sha: response.data.sha }))
  );

  const textBlobs = await Promise.all(textBlobPromises);
  const binaryBlobs = await Promise.all(binaryBlobPromises);

  const treeEntries = [
    ...textBlobs.map(({ path, sha }) => ({
      path,
      mode: "100644" as const,
      type: "blob" as const,
      sha,
    })),
    ...binaryBlobs.map(({ path, sha }) => ({
      path,
      mode: "100644" as const,
      type: "blob" as const,
      sha,
    })),
    ...verifiedFilesToDelete.map(path => ({
      path,
      mode: "100644" as const,
      type: "blob" as const,
      sha: null as unknown as string,
    })),
  ];

  console.log("Creating git tree...");
  const treeOptions: Parameters<typeof octokit.rest.git.createTree>[0] = {
    owner,
    repo,
    tree: treeEntries,
  };

  if (baseCommitSha) {
    treeOptions.base_tree = baseCommitSha;
  }

  const { data: newTree } = await octokit.rest.git.createTree(treeOptions);

  console.log("Creating commit...");
  const commitOptions: Parameters<typeof octokit.rest.git.createCommit>[0] = {
    owner,
    repo,
    message: commitMessage,
    tree: newTree.sha,
  };

  if (baseCommitSha) {
    commitOptions.parents = [baseCommitSha];
  }

  const { data: newCommit } =
    await octokit.rest.git.createCommit(commitOptions);

  // Update or create ref
  console.log("Updating branch reference...");
  try {
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: "heads/main",
      sha: newCommit.sha,
    });
  } catch (_error) {
    // Ref doesn't exist, create it
    console.log("Main branch doesn't exist, creating it...");
    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: "refs/heads/main",
      sha: newCommit.sha,
    });
  }

  console.log(`Successfully committed changes to ${owner}/${repo}`);
}

/**
 * Updates DEX configuration files in the repository using a single commit
 */
export async function updateDexConfig(
  owner: string,
  repo: string,
  config: DexConfig,
  files: DexFiles,
  customDomain: string | null,
  brokerEoaAddress: string | null
): Promise<void> {
  try {
    const {
      configJsContent,
      envContent,
      themeCSS,
      faviconData,
      primaryLogoData,
      secondaryLogoData,
      pnlPostersData,
    } = prepareDexConfigContent(
      config,
      files,
      customDomain,
      `https://github.com/${owner}/${repo}`,
      brokerEoaAddress
    );

    const fileContents = new Map<string, string>();
    fileContents.set(".github/workflows/deploy.yml", deployYmlContent);
    fileContents.set("public/config.js", configJsContent);
    fileContents.set(".env", envContent);

    if (themeCSS) {
      fileContents.set("app/styles/theme.css", themeCSS);
    }

    const binaryFiles = new Map<string, Buffer>();

    if (faviconData) {
      binaryFiles.set("public/favicon.webp", faviconData);
    }

    if (primaryLogoData) {
      binaryFiles.set("public/logo.webp", primaryLogoData);
    }

    if (secondaryLogoData) {
      binaryFiles.set("public/logo-secondary.webp", secondaryLogoData);
    }

    if (pnlPostersData) {
      pnlPostersData.forEach((posterData, index) => {
        binaryFiles.set(`public/pnl/poster_bg_${index + 1}.webp`, posterData);
      });
    }

    const filesToDelete = [".github/workflows/sync-fork.yml"];

    await createSingleCommit(
      owner,
      repo,
      fileContents,
      binaryFiles,
      filesToDelete,
      "Update DEX configuration and branding"
    );
  } catch (error: unknown) {
    console.error("Error updating DEX configuration:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to update DEX configuration: ${errorMessage}`);
  }
}

/**
 * Enables GitHub Pages for a repository
 * @param owner The repository owner (username or organization)
 * @param repo The repository name
 */
async function enableGitHubPages(owner: string, repo: string): Promise<void> {
  console.log(`Enabling GitHub Pages for ${owner}/${repo}...`);

  const octokit = await getOctokit();
  await octokit.rest.repos.createPagesSite({
    owner,
    repo,
    build_type: "workflow",
  });

  console.log(`Successfully enabled GitHub Pages for ${owner}/${repo}`);
}

/**
 * Setup repository with one commit - combining workflow files and DEX configuration
 */
export async function setupRepositoryWithSingleCommit(
  owner: string,
  repo: string,
  config: DexConfig,
  files: DexFiles,
  customDomain: string | null,
  brokerEoaAddress: string | null
): Promise<void> {
  console.log(`Setting up repository ${owner}/${repo} with a single commit...`);

  try {
    const {
      configJsContent,
      envContent,
      themeCSS,
      faviconData,
      primaryLogoData,
      secondaryLogoData,
      pnlPostersData,
    } = prepareDexConfigContent(
      config,
      files,
      customDomain,
      `https://github.com/${owner}/${repo}`,
      brokerEoaAddress
    );

    const fileContents = new Map<string, string>();
    fileContents.set(".github/workflows/deploy.yml", deployYmlContent);
    fileContents.set("public/config.js", configJsContent);
    fileContents.set(".env", envContent);

    if (themeCSS) {
      fileContents.set("app/styles/theme.css", themeCSS);
    }

    const binaryFiles = new Map<string, Buffer>();

    if (faviconData) {
      binaryFiles.set("public/favicon.webp", faviconData);
    }

    if (primaryLogoData) {
      binaryFiles.set("public/logo.webp", primaryLogoData);
    }

    if (secondaryLogoData) {
      binaryFiles.set("public/logo-secondary.webp", secondaryLogoData);
    }

    if (pnlPostersData) {
      pnlPostersData.forEach((posterData, index) => {
        binaryFiles.set(`public/pnl/poster_bg_${index + 1}.webp`, posterData);
      });
    }

    await createSingleCommit(
      owner,
      repo,
      fileContents,
      binaryFiles,
      [],
      "Setup DEX with workflow files and configuration"
    );
  } catch (error) {
    console.error(`Error setting up repository ${owner}/${repo}:`, error);
    throw error;
  }
}

/**
 * Get the status of workflow runs for a repository
 * @param owner The repository owner (username or organization)
 * @param repo The repository name
 * @param workflowName Optional workflow name to filter by
 * @returns The workflow runs with their statuses
 */
export async function getWorkflowRunStatus(
  owner: string,
  repo: string,
  workflowName?: string
): Promise<{
  totalCount: number;
  workflowRuns: Array<{
    id: number;
    name: string;
    status: string;
    conclusion: string | null;
    createdAt: string;
    updatedAt: string;
    htmlUrl: string;
  }>;
}> {
  try {
    const octokit = await getOctokit();

    const { data: workflows } = await octokit.rest.actions.listRepoWorkflows({
      owner,
      repo,
    });

    if (workflows.total_count === 0) {
      console.log(`No workflows found in ${owner}/${repo}`);
      return { totalCount: 0, workflowRuns: [] };
    }

    let workflowId: number | undefined;

    if (workflowName) {
      const workflow = workflows.workflows.find(
        (wf: { name: string }) => wf.name === workflowName
      );
      if (workflow) {
        workflowId = workflow.id;
      } else {
        console.warn(
          `Workflow "${workflowName}" not found in ${owner}/${repo}`
        );
      }
    }

    if (workflowId) {
      const { data: runs } = await octokit.rest.actions.listWorkflowRuns({
        owner,
        repo,
        per_page: 10,
        workflow_id: workflowId,
      });

      const workflowRuns = runs.workflow_runs.map(run => ({
        id: run.id,
        name: run.name || "Unnamed workflow",
        status: run.status || "unknown",
        conclusion: run.conclusion,
        createdAt: run.created_at,
        updatedAt: run.updated_at,
        htmlUrl: run.html_url,
      }));

      return {
        totalCount: runs.total_count,
        workflowRuns,
      };
    } else {
      const { data: runs } = await octokit.rest.actions.listWorkflowRunsForRepo(
        {
          owner,
          repo,
          per_page: 10,
        }
      );

      const workflowRuns = runs.workflow_runs.map(run => ({
        id: run.id,
        name: run.name || "Unnamed workflow",
        status: run.status || "unknown",
        conclusion: run.conclusion,
        createdAt: run.created_at,
        updatedAt: run.updated_at,
        htmlUrl: run.html_url,
      }));

      return {
        totalCount: runs.total_count,
        workflowRuns,
      };
    }
  } catch (error) {
    console.error(`Error fetching workflow runs for ${owner}/${repo}:`, error);
    throw new Error(
      `Failed to get workflow status: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getWorkflowRunDetails(
  owner: string,
  repo: string,
  runId: number
): Promise<{
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
  jobs: Array<{
    id: number;
    name: string;
    status: string;
    conclusion: string | null;
    startedAt: string | null;
    completedAt: string | null;
    steps: Array<{
      name: string;
      status: string;
      conclusion: string | null;
      number: number;
    }>;
  }>;
}> {
  try {
    console.log(
      `Fetching details for workflow run ${runId} in ${owner}/${repo}...`
    );
    const octokit = await getOctokit();

    const { data: run } = await octokit.rest.actions.getWorkflowRun({
      owner,
      repo,
      run_id: runId,
    });

    const { data: jobsData } =
      await octokit.rest.actions.listJobsForWorkflowRun({
        owner,
        repo,
        run_id: runId,
      });

    const jobs = jobsData.jobs.map(job => ({
      id: job.id,
      name: job.name || "Unnamed job",
      status: job.status || "unknown",
      conclusion: job.conclusion,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      steps: (job.steps || []).map(step => ({
        name: step.name || "Unnamed step",
        status: step.status || "unknown",
        conclusion: step.conclusion,
        number: step.number,
      })),
    }));

    return {
      id: run.id,
      name: run.name || "Unnamed workflow run",
      status: run.status || "unknown",
      conclusion: run.conclusion,
      createdAt: run.created_at,
      updatedAt: run.updated_at,
      htmlUrl: run.html_url,
      jobs,
    };
  } catch (error) {
    console.error(
      `Error fetching workflow run details for ${runId} in ${owner}/${repo}:`,
      error
    );
    throw new Error(
      `Failed to get workflow run details: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Renames a GitHub repository
 * @param owner The repository owner (username or organization)
 * @param repo The current repository name
 * @param newName The new repository name
 * @returns The new repository URL
 */
export async function renameRepository(
  owner: string,
  repo: string,
  newName: string
): Promise<string> {
  try {
    console.log(
      `Renaming repository ${owner}/${repo} to ${owner}/${newName}...`
    );

    if (!newName || !/^[a-z0-9-]+$/i.test(newName)) {
      throw new Error(
        "Repository name can only contain alphanumeric characters and hyphens"
      );
    }

    if (newName.length > 100) {
      throw new Error(
        "Repository name exceeds GitHub's maximum length of 100 characters"
      );
    }

    const octokit = await getOctokit();
    const { data } = await octokit.rest.repos.update({
      owner,
      repo,
      name: newName,
    });

    return data.html_url;
  } catch (error) {
    console.error(`Error renaming repository ${owner}/${repo}:`, error);
    throw new Error(
      `Failed to rename repository: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Deletes a GitHub repository
 * @param owner The repository owner (username or organization)
 * @param repo The repository name
 * @returns A boolean indicating success
 */
export async function deleteRepository(
  owner: string,
  repo: string
): Promise<boolean> {
  try {
    console.log(`Deleting repository ${owner}/${repo}...`);

    const octokit = await getOctokit();
    await octokit.rest.repos.delete({
      owner,
      repo,
    });

    console.log(`Successfully deleted repository ${owner}/${repo}`);
    return true;
  } catch (error) {
    console.error(`Error deleting repository ${owner}/${repo}:`, error);
    return false;
  }
}

/**
 * Set a custom domain for GitHub Pages
 * @param owner The repository owner (username or organization)
 * @param repo The repository name
 * @param domain The custom domain to set
 * @returns The domain that was set
 */
export async function setCustomDomain(
  owner: string,
  repo: string,
  domain: string
): Promise<string> {
  console.log(`Setting custom domain for ${owner}/${repo} to ${domain}...`);

  try {
    try {
      await enableGitHubPages(owner, repo);
    } catch {
      console.warn(
        `Note: GitHub Pages might already be enabled for ${owner}/${repo}`
      );
    }

    const octokit = await getOctokit();
    const response = await octokit.rest.repos.updateInformationAboutPagesSite({
      owner,
      repo,
      cname: domain,
    });

    const validStatusCodes = [200, 201, 204];
    if (!validStatusCodes.includes(response.status)) {
      throw new Error(
        `Failed to set custom domain for ${owner}/${repo}: ${response.status}`
      );
    }

    const cnameContent = domain;

    const fileContents = new Map<string, string>();
    fileContents.set("CNAME", cnameContent);

    await createSingleCommit(
      owner,
      repo,
      fileContents,
      new Map(),
      [],
      "Add CNAME file for custom domain"
    );

    console.log(
      `Successfully set custom domain for ${owner}/${repo} to ${domain}`
    );
    return domain;
  } catch (error) {
    console.error(`Error setting custom domain for ${owner}/${repo}:`, error);
    throw error;
  }
}

/**
 * Remove a custom domain from GitHub Pages
 * @param owner The repository owner (username or organization)
 * @param repo The repository name
 * @returns A boolean indicating success
 */
export async function removeCustomDomain(
  owner: string,
  repo: string
): Promise<boolean> {
  try {
    console.log(`Removing custom domain for ${owner}/${repo}...`);

    const octokit = await getOctokit();
    await octokit.rest.repos.updateInformationAboutPagesSite({
      owner,
      repo,
      cname: "",
    });

    try {
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: "CNAME",
      });

      if (fileData) {
        const sha =
          typeof fileData === "object" && "sha" in fileData
            ? fileData.sha
            : Array.isArray(fileData) &&
                fileData.length > 0 &&
                "sha" in fileData[0]
              ? fileData[0].sha
              : undefined;

        if (sha) {
          await octokit.rest.repos.deleteFile({
            owner,
            repo,
            path: "CNAME",
            message: "Remove CNAME file for custom domain",
            sha,
          });
        }
      }
    } catch {
      console.log("CNAME file might not exist, continuing...");
    }

    console.log(`Successfully removed custom domain for ${owner}/${repo}`);
    return true;
  } catch (error) {
    console.error(`Error removing custom domain for ${owner}/${repo}:`, error);
    throw new Error(
      `Failed to remove custom domain: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Trigger a workflow dispatch to redeploy a DEX
 * @param owner The repository owner (username or organization)
 * @param repo The repository name
 * @param dexConfig The DEX configuration
 * @param files The files associated with the DEX configuration
 * @returns A boolean indicating success
 */
export async function triggerRedeployment(
  owner: string,
  repo: string,
  dexConfig: DexConfig,
  files: DexFiles,
  customDomain: string | null,
  brokerEoaAddress: string | null
): Promise<boolean> {
  try {
    console.log(`Creating redeployment commit for ${owner}/${repo}...`);

    await updateDexConfig(
      owner,
      repo,
      dexConfig,
      files,
      customDomain,
      brokerEoaAddress
    );

    console.log(
      `Successfully created redeployment commit for ${owner}/${repo}`
    );
    return true;
  } catch (error) {
    console.error(
      `Error creating redeployment commit for ${owner}/${repo}:`,
      error
    );
    throw new Error(
      `Failed to create redeployment commit: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Invalidate the template updates cache for a specific repository
 * @param owner The repository owner (username or organization)
 * @param repo The repository name
 */
export function invalidateTemplateUpdatesCache(
  owner: string,
  repo: string
): void {
  const cacheKey = `${owner}/${repo}`;
  templateUpdatesCache.delete(cacheKey);
}

/**
 * Check if a repository has updates available from the template repository
 * @param owner The repository owner (username or organization)
 * @param repo The repository name
 * @returns Information about available updates
 */
export async function checkForTemplateUpdates(
  owner: string,
  repo: string
): Promise<TemplateUpdateStatus> {
  const cacheKey = `${owner}/${repo}`;
  const cached = templateUpdatesCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_TEMPLATE_UPDATES_MS) {
    return {
      hasUpdates: cached.hasUpdates,
      behindBy: cached.behindBy,
      templateCommitSha: cached.templateCommitSha,
      userCommitSha: cached.userCommitSha,
      commits: cached.commits,
    };
  }

  try {
    const octokit = await getOctokit();

    const [templateRef, userRef] = await Promise.all([
      octokit.rest.git.getRef({
        owner: templateOwner,
        repo: templateRepoName,
        ref: "heads/main",
      }),
      octokit.rest.git.getRef({
        owner,
        repo,
        ref: "heads/main",
      }),
    ]);

    const templateCommitSha = templateRef.data.object.sha;
    const userCommitSha = userRef.data.object.sha;

    const mergeBase = await octokit.rest.repos.compareCommitsWithBasehead({
      owner: templateOwner,
      repo: templateRepoName,
      basehead: `${templateCommitSha}...${userCommitSha}`,
    });

    const mergeBaseSha = mergeBase.data.merge_base_commit.sha;
    if (!mergeBaseSha) {
      throw new Error(
        `No common history found between ${owner}/${repo} and template repository`
      );
    }

    if (mergeBaseSha === templateCommitSha) {
      const result: TemplateUpdateStatus = {
        hasUpdates: false,
        behindBy: 0,
        templateCommitSha,
        userCommitSha,
      };

      templateUpdatesCache.set(cacheKey, {
        ...result,
        timestamp: Date.now(),
      });

      return result;
    }

    const comparison = await octokit.rest.repos.compareCommitsWithBasehead({
      owner: templateOwner,
      repo: templateRepoName,
      basehead: `${mergeBaseSha}...${templateCommitSha}`,
    });

    const behindBy = comparison.data.ahead_by;
    const hasUpdates = behindBy > 0;

    const commits = comparison.data.commits.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author?.name || "Unknown",
      date: commit.commit.author?.date || "",
    }));

    console.log(
      `Repository ${owner}/${repo} is ${behindBy} commits behind template (merge base: ${mergeBaseSha.substring(0, 7)})`
    );

    const result: TemplateUpdateStatus = {
      hasUpdates,
      behindBy,
      templateCommitSha,
      userCommitSha,
      commits,
    };

    templateUpdatesCache.set(cacheKey, {
      ...result,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    console.error(
      `Error checking for template updates for ${owner}/${repo}:`,
      error
    );
    throw new Error(
      `Failed to check for template updates: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
