import { z } from "zod";
import { getPrisma } from "../lib/prisma";
import type { Prisma, Dex } from "@prisma/client";
import type { DexResult, Result } from "../lib/types";
import { DexErrorType, GitHubErrorType } from "../lib/types";
import {
  forkTemplateRepository,
  setupRepositoryWithSingleCommit,
  deleteRepository,
  setCustomDomain,
  removeCustomDomain,
} from "../lib/github";
import type { DexConfig } from "../lib/types";
import { generateRepositoryName } from "../lib/nameGenerator";
import { validateTradingViewColorConfig } from "./tradingViewConfig.js";
import { validateCSS } from "../lib/cssValidator.js";

function decodeBase64(str: string): string {
  const decoded = Buffer.from(str, "base64").toString("utf-8");
  return decodeURIComponent(decoded);
}

export function convertDexToDexConfig(dex: Dex): DexConfig {
  return {
    brokerId: dex.brokerId,
    brokerName: dex.brokerName,
    chainIds: dex.chainIds.length > 0 ? dex.chainIds : null,
    defaultChain: dex.defaultChain,
    themeCSS: dex.themeCSS,
    telegramLink: dex.telegramLink,
    discordLink: dex.discordLink,
    xLink: dex.xLink,
    walletConnectProjectId: dex.walletConnectProjectId,
    privyAppId: dex.privyAppId,
    privyTermsOfUse: dex.privyTermsOfUse,
    privyLoginMethods: dex.privyLoginMethods,
    enabledMenus: dex.enabledMenus,
    customMenus: dex.customMenus,
    enableAbstractWallet: dex.enableAbstractWallet,
    disableMainnet: dex.disableMainnet,
    disableTestnet: dex.disableTestnet,
    disableEvmWallets: dex.disableEvmWallets,
    disableSolanaWallets: dex.disableSolanaWallets,
    enableServiceDisclaimerDialog: dex.enableServiceDisclaimerDialog,
    enableCampaigns: dex.enableCampaigns,
    tradingViewColorConfig: dex.tradingViewColorConfig,
    availableLanguages:
      dex.availableLanguages.length > 0 ? dex.availableLanguages : null,
    seoSiteName: dex.seoSiteName,
    seoSiteDescription: dex.seoSiteDescription,
    seoSiteLanguage: dex.seoSiteLanguage,
    seoSiteLocale: dex.seoSiteLocale,
    seoTwitterHandle: dex.seoTwitterHandle,
    seoThemeColor: dex.seoThemeColor,
    seoKeywords: dex.seoKeywords,
    analyticsScript: dex.analyticsScript,
    symbolList: dex.symbolList,
    restrictedRegions: dex.restrictedRegions,
    whitelistedIps: dex.whitelistedIps,
  };
}

function convertValidatedDataToDexConfig(
  validatedData: z.infer<typeof dexSchema>,
  brokerId: string,
  brokerName: string
): DexConfig {
  const decodedAnalyticsScript = validatedData.analyticsScript
    ? decodeBase64(validatedData.analyticsScript)
    : null;

  return {
    brokerId,
    brokerName,
    chainIds: validatedData.chainIds ?? null,
    defaultChain: validatedData.defaultChain ?? null,
    themeCSS: validatedData.themeCSS ?? null,
    telegramLink: validatedData.telegramLink ?? null,
    discordLink: validatedData.discordLink ?? null,
    xLink: validatedData.xLink ?? null,
    walletConnectProjectId: validatedData.walletConnectProjectId ?? null,
    privyAppId: validatedData.privyAppId ?? null,
    privyTermsOfUse: validatedData.privyTermsOfUse ?? null,
    privyLoginMethods: validatedData.privyLoginMethods ?? null,
    enabledMenus: validatedData.enabledMenus ?? null,
    customMenus: validatedData.customMenus ?? null,
    enableAbstractWallet: validatedData.enableAbstractWallet ?? null,
    disableMainnet: validatedData.disableMainnet ?? null,
    disableTestnet: validatedData.disableTestnet ?? null,
    disableEvmWallets: validatedData.disableEvmWallets ?? null,
    disableSolanaWallets: validatedData.disableSolanaWallets ?? null,
    enableServiceDisclaimerDialog:
      validatedData.enableServiceDisclaimerDialog ?? null,
    enableCampaigns: validatedData.enableCampaigns ?? null,
    tradingViewColorConfig: validatedData.tradingViewColorConfig ?? null,
    availableLanguages: validatedData.availableLanguages ?? null,
    seoSiteName: validatedData.seoSiteName ?? null,
    seoSiteDescription: validatedData.seoSiteDescription ?? null,
    seoSiteLanguage: validatedData.seoSiteLanguage ?? null,
    seoSiteLocale: validatedData.seoSiteLocale ?? null,
    seoTwitterHandle: validatedData.seoTwitterHandle ?? null,
    seoThemeColor: validatedData.seoThemeColor ?? null,
    seoKeywords: validatedData.seoKeywords ?? null,
    analyticsScript: decodedAnalyticsScript,
    symbolList: validatedData.symbolList ?? null,
    restrictedRegions: validatedData.restrictedRegions ?? null,
    whitelistedIps: validatedData.whitelistedIps ?? null,
  };
}

export type Environment = "mainnet" | "staging" | "qa" | "dev";

export function getCurrentEnvironment(): Environment {
  switch (process.env.DEPLOYMENT_ENV) {
    case "mainnet":
      return "mainnet";
    case "staging":
      return "staging";
    case "qa":
      return "qa";
    case "dev":
    default:
      return "dev";
  }
}

export enum LocaleEnum {
  en = "en",
  zh = "zh",
  tc = "tc",
  ja = "ja",
  es = "es",
  ko = "ko",
  vi = "vi",
  de = "de",
  fr = "fr",
  ru = "ru",
  id = "id",
  tr = "tr",
  it = "it",
  pt = "pt",
  uk = "uk",
  pl = "pl",
  nl = "nl",
}

/**
 * Helper function to extract owner and repo from GitHub URL
 */
export function extractRepoInfoFromUrl(
  repoUrl: string
): { owner: string; repo: string } | null {
  if (!repoUrl) return null;

  try {
    const repoPath = repoUrl.split("github.com/")[1];
    if (!repoPath) return null;

    const [owner, repo] = repoPath.split("/");
    if (!owner || !repo) return null;

    return { owner, repo };
  } catch (error) {
    console.error("Error extracting repo info from URL:", error);
    return null;
  }
}

/**
 * Convert a File/Blob to base64 data URI
 */
async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);
  let binaryString = "";
  const chunkSize = 8192;
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(
      i,
      Math.min(i + chunkSize, uint8Array.length)
    );
    binaryString += String.fromCharCode.apply(null, Array.from(chunk));
  }
  const base64String = btoa(binaryString);
  return `data:image/webp;base64,${base64String}`;
}

export const dexSchema = z.object({
  brokerName: z
    .string()
    .min(3, "Broker name must be at least 3 characters")
    .max(30, "Broker name cannot exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9 .\-_]*$/,
      "Broker name can only contain letters, numbers, spaces, dots, hyphens, and underscores"
    )
    .nullish(),
  chainIds: z.array(z.number().positive().int()).optional(),
  defaultChain: z.number().positive().int().optional(),
  themeCSS: z
    .string()
    .refine(
      value => {
        if (!value || value.trim() === "") return true;
        const validation = validateCSS(value);
        return validation.isValid;
      },
      {
        message:
          "Invalid CSS syntax detected. Please check your CSS for errors.",
      }
    )
    .nullish(),
  primaryLogo: z
    .string()
    .max(250000, "Primary logo must be smaller than 250KB")
    .nullish(),
  secondaryLogo: z
    .string()
    .max(100000, "Secondary logo must be smaller than 100KB")
    .nullish(),
  favicon: z.string().max(50000, "Favicon must be smaller than 50KB").nullish(),
  pnlPosters: z
    .array(z.string().max(250000, "Each PnL poster must be smaller than 250KB"))
    .optional()
    .default([]),
  telegramLink: z.string().url().or(z.literal("")).nullish(),
  discordLink: z.string().url().or(z.literal("")).nullish(),
  xLink: z.string().url().or(z.literal("")).nullish(),
  walletConnectProjectId: z.string().nullish(),
  privyAppId: z.string().nullish(),
  privyTermsOfUse: z.string().nullish(),
  privyLoginMethods: z.string().nullish(),
  enabledMenus: z.string().nullish(),
  customMenus: z
    .string()
    .refine(
      value => {
        if (!value || value.trim() === "") return true;

        const menuItems = value.split(";");
        return menuItems.every(item => {
          if (!item.trim()) return false;
          const parts = item.split(",");
          if (parts.length !== 2) return false;
          const [name, url] = parts.map(p => p.trim());
          if (!name || !url) return false;

          try {
            new URL(url);
            return true;
          } catch {
            return false;
          }
        });
      },
      {
        message:
          "Custom menus must be in format 'Name,URL;Name2,URL2' with valid URLs",
      }
    )
    .nullish(),
  enableAbstractWallet: z.boolean().optional(),
  disableMainnet: z.boolean().optional(),
  disableTestnet: z.boolean().optional(),
  disableEvmWallets: z.boolean().optional(),
  disableSolanaWallets: z.boolean().optional(),
  enableServiceDisclaimerDialog: z.boolean().optional(),
  enableCampaigns: z.boolean().optional(),
  tradingViewColorConfig: z.string().nullish(),
  availableLanguages: z.array(z.nativeEnum(LocaleEnum)).optional(),
  swapFeeBps: z
    .number()
    .int()
    .min(0, "Swap fee must be at least 0 bps")
    .max(100, "Swap fee cannot exceed 100 bps (1%)")
    .nullable()
    .optional(),

  seoSiteName: z
    .string()
    .max(100, "Site name must be 100 characters or less")
    .nullish(),
  seoSiteDescription: z
    .string()
    .max(300, "Site description must be 300 characters or less")
    .nullish(),
  seoSiteLanguage: z
    .string()
    .regex(
      /^[a-z]{2}(-[A-Z]{2})?$/,
      "Site language must be in format 'en' or 'en-US'"
    )
    .or(z.literal(""))
    .nullish(),
  seoSiteLocale: z
    .string()
    .regex(/^[a-z]{2}_[A-Z]{2}$/, "Site locale must be in format 'en_US'")
    .or(z.literal(""))
    .nullish(),
  seoTwitterHandle: z
    .string()
    .regex(
      /^@[a-zA-Z0-9_]+$/,
      "Twitter handle must start with @ and contain only alphanumeric characters and underscores"
    )
    .or(z.literal(""))
    .nullish(),
  seoThemeColor: z
    .string()
    .regex(
      /^#[0-9a-fA-F]{6}$/,
      "Theme color must be a valid hex color (e.g., #1a1b23)"
    )
    .or(z.literal(""))
    .nullish(),
  seoKeywords: z
    .string()
    .max(500, "Keywords must be 500 characters or less")
    .nullish(),
  analyticsScript: z
    .string()
    .max(2000, "Analytics script must be 2000 characters or less")
    .nullish(),
  symbolList: z
    .string()
    .refine(
      value => {
        if (!value || value.trim() === "") return true;
        const symbols = value.split(",").map(s => s.trim());
        return symbols.every(s => s.length > 0);
      },
      {
        message:
          "Symbol list must be comma-separated symbols (e.g., PERP_SOL_USDC,PERP_BTC_USDC)",
      }
    )
    .nullish(),
  restrictedRegions: z
    .string()
    .max(2000, "Restricted regions list cannot exceed 2000 characters")
    .nullish(),
  whitelistedIps: z
    .string()
    .max(2000, "Whitelisted IPs list cannot exceed 2000 characters")
    .nullish(),
});

export const dexFormSchema = dexSchema
  .extend({
    primaryLogo: z.instanceof(File).optional(),
    secondaryLogo: z.instanceof(File).optional(),
    favicon: z.instanceof(File).optional(),
    pnlPosters: z.array(z.instanceof(File)).optional(),
    chainIds: z
      .union([
        z.array(z.number().positive().int()),
        z.string().transform(val => {
          if (!val || val.trim() === "") return [];
          try {
            return JSON.parse(val);
          } catch {
            return [];
          }
        }),
      ])
      .optional(),
    defaultChain: z
      .union([
        z.number().positive().int(),
        z.string().transform(val => {
          if (!val || val.trim() === "") return undefined;
          const parsed = parseInt(val, 10);
          return isNaN(parsed) ? undefined : parsed;
        }),
      ])
      .optional(),
    enableAbstractWallet: z
      .union([z.boolean(), z.string().transform(val => val === "true")])
      .optional(),
    disableMainnet: z
      .union([z.boolean(), z.string().transform(val => val === "true")])
      .optional(),
    disableTestnet: z
      .union([z.boolean(), z.string().transform(val => val === "true")])
      .optional(),
    disableEvmWallets: z
      .union([z.boolean(), z.string().transform(val => val === "true")])
      .optional(),
    disableSolanaWallets: z
      .union([z.boolean(), z.string().transform(val => val === "true")])
      .optional(),
    enableServiceDisclaimerDialog: z
      .union([z.boolean(), z.string().transform(val => val === "true")])
      .optional(),
    enableCampaigns: z
      .union([z.boolean(), z.string().transform(val => val === "true")])
      .optional(),
    availableLanguages: z
      .union([
        z.array(z.nativeEnum(LocaleEnum)),
        z.string().transform(val => {
          if (!val || val.trim() === "") return ["en"];
          try {
            return JSON.parse(val);
          } catch {
            return ["en"];
          }
        }),
      ])
      .optional(),
    swapFeeBps: z
      .union([
        z.number().int().min(0).max(100),
        z.string().transform(val => {
          if (!val || val.trim() === "") return null;
          const parsed = parseInt(val, 10);
          if (isNaN(parsed)) return null;
          if (parsed < 0 || parsed > 100) {
            throw new Error("Swap fee must be between 0 and 100 bps (1%)");
          }
          return parsed;
        }),
        z.null(),
      ])
      .optional(),
  })
  .catchall(z.union([z.instanceof(File), z.string()]).optional()); // Allow pnlPoster0, pnlPoster1, etc.

export function generateId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export async function createDex(
  data: z.infer<typeof dexSchema>,
  userId: string
): Promise<DexResult<Dex>> {
  const validatedData = dexSchema.parse(data);

  if (validatedData.tradingViewColorConfig) {
    validateTradingViewColorConfig(validatedData.tradingViewColorConfig);
  }

  const existingDex = await getUserDex(userId);

  if (existingDex) {
    return {
      success: false,
      error: {
        type: DexErrorType.USER_ALREADY_HAS_DEX,
        message: "User already has a DEX. Only one DEX per user is allowed.",
      },
    };
  }

  const prismaClient = await getPrisma();
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: { address: true },
  });

  if (!user) {
    return {
      success: false,
      error: {
        type: DexErrorType.USER_NOT_FOUND,
        message: "User not found",
      },
    };
  }

  const brokerName = validatedData.brokerName || "Orderly DEX";

  const repoName = generateRepositoryName(brokerName);

  let repoUrl: string;

  try {
    console.log(
      "Creating repository in OrderlyNetworkDexCreator organization..."
    );
    const forkResult = await forkTemplateRepository(repoName);
    if (!forkResult.success) {
      switch (forkResult.error.type) {
        case GitHubErrorType.REPOSITORY_NAME_EMPTY:
        case GitHubErrorType.REPOSITORY_NAME_INVALID:
        case GitHubErrorType.REPOSITORY_NAME_TOO_LONG:
          return {
            success: false,
            error: {
              type: DexErrorType.VALIDATION_ERROR,
              message: forkResult.error.message,
            },
          };
        case GitHubErrorType.FORK_PERMISSION_DENIED:
          return {
            success: false,
            error: {
              type: DexErrorType.REPOSITORY_PERMISSION_DENIED,
              message: forkResult.error.message,
            },
          };
        case GitHubErrorType.FORK_REPOSITORY_NOT_FOUND:
          return {
            success: false,
            error: {
              type: DexErrorType.REPOSITORY_NOT_FOUND,
              message: forkResult.error.message,
            },
          };
        case GitHubErrorType.FORK_REPOSITORY_ALREADY_EXISTS:
          return {
            success: false,
            error: {
              type: DexErrorType.REPOSITORY_ALREADY_EXISTS,
              message: forkResult.error.message,
            },
          };
        default:
          return {
            success: false,
            error: {
              type: DexErrorType.REPOSITORY_CREATION_FAILED,
              message: forkResult.error.message,
            },
          };
      }
    }

    repoUrl = forkResult.data;
    console.log(`Successfully forked repository: ${repoUrl}`);

    const repoInfo = extractRepoInfoFromUrl(repoUrl);
    if (!repoInfo) {
      return {
        success: false,
        error: {
          type: DexErrorType.REPOSITORY_INFO_EXTRACTION_FAILED,
          message: `Failed to extract repository information from URL: ${repoUrl}`,
        },
      };
    }

    const brokerId = "demo";

    await setupRepositoryWithSingleCommit(
      repoInfo.owner,
      repoInfo.repo,
      convertValidatedDataToDexConfig(validatedData, brokerId, brokerName),
      {
        primaryLogo: validatedData.primaryLogo ?? null,
        secondaryLogo: validatedData.secondaryLogo ?? null,
        favicon: validatedData.favicon ?? null,
        pnlPosters: validatedData.pnlPosters ?? null,
      },
      null,
      user.address
    );
    console.log(`Successfully set up repository for ${brokerName}`);
  } catch (error) {
    console.error("Error setting up repository:", error);
    return {
      success: false,
      error: {
        type: DexErrorType.REPOSITORY_CREATION_FAILED,
        message: `Repository setup failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    };
  }

  try {
    const brokerId = "demo";

    const prismaClient = await getPrisma();
    const dex = await prismaClient.dex.create({
      data: {
        brokerName: validatedData.brokerName ?? undefined,
        brokerId: brokerId,
        chainIds: validatedData.chainIds ?? [],
        defaultChain: validatedData.defaultChain,
        themeCSS: validatedData.themeCSS,
        primaryLogo: validatedData.primaryLogo,
        secondaryLogo: validatedData.secondaryLogo,
        favicon: validatedData.favicon,
        pnlPosters: validatedData.pnlPosters ?? [],
        telegramLink: validatedData.telegramLink,
        discordLink: validatedData.discordLink,
        xLink: validatedData.xLink,
        walletConnectProjectId: validatedData.walletConnectProjectId,
        privyAppId: validatedData.privyAppId,
        privyTermsOfUse: validatedData.privyTermsOfUse,
        privyLoginMethods: validatedData.privyLoginMethods,
        enabledMenus: validatedData.enabledMenus,
        customMenus: validatedData.customMenus,
        enableAbstractWallet: validatedData.enableAbstractWallet,
        disableMainnet: validatedData.disableMainnet,
        disableTestnet: validatedData.disableTestnet,
        disableEvmWallets: validatedData.disableEvmWallets,
        disableSolanaWallets: validatedData.disableSolanaWallets,
        enableServiceDisclaimerDialog:
          validatedData.enableServiceDisclaimerDialog,
        enableCampaigns: validatedData.enableCampaigns,
        tradingViewColorConfig: validatedData.tradingViewColorConfig,
        availableLanguages: validatedData.availableLanguages,
        seoSiteName: validatedData.seoSiteName,
        seoSiteDescription: validatedData.seoSiteDescription,
        seoSiteLanguage: validatedData.seoSiteLanguage,
        seoSiteLocale: validatedData.seoSiteLocale,
        seoTwitterHandle: validatedData.seoTwitterHandle,
        seoThemeColor: validatedData.seoThemeColor,
        seoKeywords: validatedData.seoKeywords,
        analyticsScript: validatedData.analyticsScript
          ? decodeBase64(validatedData.analyticsScript)
          : undefined,
        swapFeeBps: validatedData.swapFeeBps,
        restrictedRegions: validatedData.restrictedRegions,
        whitelistedIps: validatedData.whitelistedIps,
        repoUrl: repoUrl,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return {
      success: true,
      data: dex,
    };
  } catch (dbError) {
    console.error("Error creating DEX in database:", dbError);

    try {
      const repoInfo = extractRepoInfoFromUrl(repoUrl);
      if (repoInfo) {
        await deleteRepository(repoInfo.owner, repoInfo.repo);
        console.log(`Cleaned up repository after database creation failure`);
      }
    } catch (cleanupError) {
      console.error("Failed to clean up repository:", cleanupError);
    }

    return {
      success: false,
      error: {
        type: DexErrorType.DATABASE_ERROR,
        message: `Failed to create DEX in database: ${
          dbError instanceof Error ? dbError.message : String(dbError)
        }`,
      },
    };
  }
}

export async function getUserDex(userId: string): Promise<Dex | null> {
  const prismaClient = await getPrisma();
  return prismaClient.dex.findUnique({
    where: {
      userId,
    },
  });
}

export async function getDexById(id: string): Promise<Dex | null> {
  const prismaClient = await getPrisma();
  return prismaClient.dex.findUnique({
    where: {
      id,
    },
  });
}

export async function updateDex(
  id: string,
  userId: string,
  data: z.infer<typeof dexSchema>
): Promise<DexResult<Dex>> {
  const validatedData = dexSchema.parse(data);

  if (validatedData.tradingViewColorConfig) {
    validateTradingViewColorConfig(validatedData.tradingViewColorConfig);
  }

  const dex = await getDexById(id);

  if (!dex) {
    return {
      success: false,
      error: {
        type: DexErrorType.DEX_NOT_FOUND,
        message: "DEX not found",
      },
    };
  }

  if (dex.userId !== userId) {
    return {
      success: false,
      error: {
        type: DexErrorType.USER_NOT_AUTHORIZED,
        message: "User is not authorized to update this DEX",
      },
    };
  }

  const updateData: Prisma.DexUpdateInput = {};

  if ("brokerName" in validatedData)
    updateData.brokerName = validatedData.brokerName ?? undefined;
  if ("chainIds" in validatedData)
    updateData.chainIds = validatedData.chainIds ?? [];
  if ("defaultChain" in validatedData)
    updateData.defaultChain = validatedData.defaultChain;
  if ("themeCSS" in validatedData) updateData.themeCSS = validatedData.themeCSS;
  if ("telegramLink" in validatedData)
    updateData.telegramLink = validatedData.telegramLink;
  if ("discordLink" in validatedData)
    updateData.discordLink = validatedData.discordLink;
  if ("xLink" in validatedData) updateData.xLink = validatedData.xLink;
  if ("walletConnectProjectId" in validatedData) {
    updateData.walletConnectProjectId = validatedData.walletConnectProjectId;
  }
  if ("privyAppId" in validatedData)
    updateData.privyAppId = validatedData.privyAppId;
  if ("privyTermsOfUse" in validatedData)
    updateData.privyTermsOfUse = validatedData.privyTermsOfUse;
  if ("privyLoginMethods" in validatedData)
    updateData.privyLoginMethods = validatedData.privyLoginMethods;
  if ("enabledMenus" in validatedData)
    updateData.enabledMenus = validatedData.enabledMenus;
  if ("customMenus" in validatedData)
    updateData.customMenus = validatedData.customMenus;

  if ("primaryLogo" in validatedData)
    updateData.primaryLogo = validatedData.primaryLogo;
  if ("secondaryLogo" in validatedData)
    updateData.secondaryLogo = validatedData.secondaryLogo;
  if ("favicon" in validatedData) updateData.favicon = validatedData.favicon;
  if ("pnlPosters" in validatedData)
    updateData.pnlPosters = validatedData.pnlPosters ?? [];
  if ("enableAbstractWallet" in validatedData)
    updateData.enableAbstractWallet = validatedData.enableAbstractWallet;
  if ("disableMainnet" in validatedData)
    updateData.disableMainnet = validatedData.disableMainnet;
  if ("disableTestnet" in validatedData)
    updateData.disableTestnet = validatedData.disableTestnet;
  if ("disableEvmWallets" in validatedData)
    updateData.disableEvmWallets = validatedData.disableEvmWallets;
  if ("disableSolanaWallets" in validatedData)
    updateData.disableSolanaWallets = validatedData.disableSolanaWallets;
  if ("enableServiceDisclaimerDialog" in validatedData)
    updateData.enableServiceDisclaimerDialog =
      validatedData.enableServiceDisclaimerDialog;
  if ("enableCampaigns" in validatedData)
    updateData.enableCampaigns = validatedData.enableCampaigns;
  if ("tradingViewColorConfig" in validatedData)
    updateData.tradingViewColorConfig = validatedData.tradingViewColorConfig;
  if ("availableLanguages" in validatedData)
    updateData.availableLanguages = validatedData.availableLanguages;
  if ("swapFeeBps" in validatedData)
    updateData.swapFeeBps = validatedData.swapFeeBps;

  if ("seoSiteName" in validatedData)
    updateData.seoSiteName = validatedData.seoSiteName;
  if ("seoSiteDescription" in validatedData)
    updateData.seoSiteDescription = validatedData.seoSiteDescription;
  if ("seoSiteLanguage" in validatedData)
    updateData.seoSiteLanguage = validatedData.seoSiteLanguage;
  if ("seoSiteLocale" in validatedData)
    updateData.seoSiteLocale = validatedData.seoSiteLocale;
  if ("seoTwitterHandle" in validatedData)
    updateData.seoTwitterHandle = validatedData.seoTwitterHandle;
  if ("seoThemeColor" in validatedData)
    updateData.seoThemeColor = validatedData.seoThemeColor;
  if ("seoKeywords" in validatedData)
    updateData.seoKeywords = validatedData.seoKeywords;
  if ("analyticsScript" in validatedData) {
    updateData.analyticsScript = validatedData.analyticsScript
      ? decodeBase64(validatedData.analyticsScript)
      : null;
  }
  if ("symbolList" in validatedData)
    updateData.symbolList = validatedData.symbolList;
  if ("restrictedRegions" in validatedData)
    updateData.restrictedRegions = validatedData.restrictedRegions;
  if ("whitelistedIps" in validatedData)
    updateData.whitelistedIps = validatedData.whitelistedIps;

  try {
    const prismaClient = await getPrisma();
    const updatedDex = await prismaClient.dex.update({
      where: {
        id,
      },
      data: updateData,
    });

    return {
      success: true,
      data: updatedDex,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        type: DexErrorType.DATABASE_ERROR,
        message: `Failed to update DEX: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    };
  }
}

export async function deleteDex(
  id: string,
  userId: string
): Promise<DexResult<Dex>> {
  const dex = await getDexById(id);

  if (!dex) {
    return {
      success: false,
      error: {
        type: DexErrorType.DEX_NOT_FOUND,
        message: "DEX not found",
      },
    };
  }

  if (dex.userId !== userId) {
    return {
      success: false,
      error: {
        type: DexErrorType.USER_NOT_AUTHORIZED,
        message: "User is not authorized to delete this DEX",
      },
    };
  }

  if (dex.repoUrl) {
    try {
      const repoInfo = extractRepoInfoFromUrl(dex.repoUrl);
      if (repoInfo) {
        await deleteRepository(repoInfo.owner, repoInfo.repo);
      }
    } catch (error) {
      console.error("Error deleting GitHub repository:", error);
    }
  }

  try {
    const prismaClient = await getPrisma();
    const deletedDex = await prismaClient.dex.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      data: deletedDex,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        type: DexErrorType.DATABASE_ERROR,
        message: `Failed to delete DEX: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    };
  }
}

export async function updateDexRepoUrl(
  id: string,
  repoUrl: string
): Promise<Dex> {
  const prismaClient = await getPrisma();
  return prismaClient.dex.update({
    where: {
      id,
    },
    data: {
      repoUrl,
    },
  });
}

export async function updateBrokerId(
  id: string,
  brokerId: string
): Promise<Result<Dex>> {
  const prismaClient = await getPrisma();
  if (brokerId !== "demo") {
    const existingDex = await prismaClient.dex.findFirst({
      where: {
        brokerId,
        id: { not: id },
      },
    });

    if (existingDex) {
      return {
        success: false,
        error: `Broker ID "${brokerId}" is already in use by another DEX`,
      };
    }
  }

  try {
    const updatedDex = await prismaClient.dex.update({
      where: {
        id,
      },
      data: {
        brokerId,
      },
    });

    return { success: true, data: updatedDex };
  } catch (error) {
    console.error("Failed to update broker ID:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteDexByWalletAddress(
  address: string
): Promise<Dex | null> {
  const prismaClient = await getPrisma();
  const user = await prismaClient.user.findUnique({
    where: {
      address: address.toLowerCase(),
    },
    include: {
      dex: true,
    },
  });

  if (!user || !user.dex) {
    return null;
  }

  const dexId = user.dex.id;
  const dex = user.dex;

  if (dex.repoUrl) {
    try {
      const repoInfo = extractRepoInfoFromUrl(dex.repoUrl);
      if (repoInfo) {
        await deleteRepository(repoInfo.owner, repoInfo.repo);
      }
    } catch (error) {
      console.error("Error deleting GitHub repository:", error);
    }
  }

  return prismaClient.dex.delete({
    where: {
      id: dexId,
    },
  });
}

export async function getAllDexes(
  limit: number,
  offset: number,
  search?: string
) {
  const whereClause = search
    ? {
        OR: [
          {
            brokerName: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            brokerId: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            id: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            user: {
              address: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          },
          {
            repoUrl: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  const prismaClient = await getPrisma();
  return prismaClient.$transaction(async tx => {
    const total = await tx.dex.count({
      where: whereClause,
    });

    const dexes = await tx.dex.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            address: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    return {
      dexes,
      pagination: {
        total,
        limit,
        offset,
      },
    };
  });
}

/**
 * Update the custom domain for a DEX
 * @param id The DEX ID
 * @param domain The custom domain to set
 * @param userId The user ID (for authorization)
 * @returns The updated DEX
 */
export async function updateDexCustomDomain(
  id: string,
  domain: string,
  userId: string
): Promise<Result<Dex>> {
  const prismaClient = await getPrisma();
  const dex = await prismaClient.dex.findUnique({
    where: { id },
  });

  if (!dex) {
    return { success: false, error: "DEX not found" };
  }

  if (dex.userId !== userId) {
    return {
      success: false,
      error: "You are not authorized to update this DEX",
    };
  }

  if (!dex.repoUrl) {
    return {
      success: false,
      error: "This DEX doesn't have a repository configured",
    };
  }

  const repoInfo = extractRepoInfoFromUrl(dex.repoUrl);
  if (!repoInfo) {
    return {
      success: false,
      error: "Invalid repository URL format",
    };
  }

  try {
    await setCustomDomain(repoInfo.owner, repoInfo.repo, domain);
  } catch (error) {
    return {
      success: false,
      error: `Failed to configure domain with GitHub Pages: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }

  const updatedDex = await prismaClient.dex.update({
    where: { id },
    data: {
      customDomain: domain,
      updatedAt: new Date(),
    },
  });

  return { success: true, data: updatedDex };
}

/**
 * Remove custom domain from a DEX
 * @param id The DEX ID
 * @param userId The user ID (for authorization)
 * @returns The updated DEX
 */
export async function removeDexCustomDomain(
  id: string,
  userId: string
): Promise<Dex> {
  const prismaClient = await getPrisma();
  const dex = await prismaClient.dex.findUnique({
    where: { id },
  });

  if (!dex) {
    throw new Error("DEX not found");
  }

  if (dex.userId !== userId) {
    throw new Error("User is not authorized to update this DEX");
  }

  if (!dex.customDomain) {
    throw new Error("This DEX doesn't have a custom domain configured");
  }

  if (!dex.repoUrl) {
    throw new Error("This DEX doesn't have a repository URL");
  }

  const repoInfo = extractRepoInfoFromUrl(dex.repoUrl);
  if (!repoInfo) {
    throw new Error("Invalid repository URL");
  }

  try {
    await removeCustomDomain(repoInfo.owner, repoInfo.repo);
    console.log(
      `Successfully removed custom domain for ${repoInfo.owner}/${repoInfo.repo}`
    );
  } catch (error) {
    throw new Error(
      `Failed to remove custom domain in GitHub: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  return prismaClient.dex.update({
    where: { id },
    data: {
      customDomain: null,
      updatedAt: new Date(),
    },
  });
}

export async function convertFormDataToInternal(
  formData: z.infer<typeof dexFormSchema>
): Promise<z.infer<typeof dexSchema>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { ...formData };

  if (formData.primaryLogo instanceof File) {
    data.primaryLogo = await fileToBase64(formData.primaryLogo);
  }
  if (formData.secondaryLogo instanceof File) {
    data.secondaryLogo = await fileToBase64(formData.secondaryLogo);
  }
  if (formData.favicon instanceof File) {
    data.favicon = await fileToBase64(formData.favicon);
  }

  const pnlPosters: string[] = [];
  let posterIndex = 0;

  while (true) {
    const posterKey = `pnlPoster${posterIndex}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const posterFile = (formData as any)[posterKey];

    if (!posterFile || !(posterFile instanceof File)) {
      break;
    }

    pnlPosters.push(await fileToBase64(posterFile));
    posterIndex++;
  }

  if (pnlPosters.length > 0) {
    data.pnlPosters = pnlPosters;
  }

  Object.keys(data).forEach(key => {
    if (key.startsWith("pnlPoster") && /^pnlPoster\d+$/.test(key)) {
      delete data[key];
    }
  });

  return data;
}

export const socialCardUpdateSchema = z.object({
  description: z
    .string()
    .max(150, "Description must be 150 characters or less")
    .nullish(),
  banner: z.string().max(250000, "Banner must be smaller than 250KB").nullish(),
  logo: z.string().max(100000, "Logo must be smaller than 100KB").nullish(),
  tokenAddress: z
    .string()
    .max(100, "Token address must be 100 characters or less")
    .nullish(),
  tokenChain: z
    .string()
    .max(50, "Token chain must be 50 characters or less")
    .nullish(),
  telegramLink: z
    .string()
    .max(50, "Telegram link must be 50 characters or less")
    .nullish(),
  discordLink: z
    .string()
    .max(50, "Discord link must be 50 characters or less")
    .nullish(),
  xLink: z
    .string()
    .max(50, "X (Twitter) link must be 50 characters or less")
    .nullish(),
  websiteUrl: z
    .string()
    .url("Must be a valid URL")
    .max(50, "Website URL must be 50 characters or less")
    .nullish(),
});

export const socialCardFormSchema = socialCardUpdateSchema.extend({
  banner: z.instanceof(File).optional(),
  logo: z.instanceof(File).optional(),
});

export async function convertSocialCardFormDataToInternal(
  formData: z.infer<typeof socialCardFormSchema>
): Promise<z.infer<typeof socialCardUpdateSchema>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { ...formData };

  if (formData.banner instanceof File) {
    data.banner = await fileToBase64(formData.banner);
  }
  if (formData.logo instanceof File) {
    data.logo = await fileToBase64(formData.logo);
  }

  return data;
}

export async function updateDexSocialCard(
  id: string,
  userId: string,
  data: z.infer<typeof socialCardUpdateSchema>
): Promise<Dex> {
  const prismaClient = await getPrisma();
  const existingDex = await prismaClient.dex.findFirst({
    where: { id, userId },
  });

  if (!existingDex) {
    throw new Error("DEX not found or access denied");
  }

  const updateData: Partial<Dex> = {};

  if ("description" in data && data.description !== existingDex.description) {
    updateData.description = data.description;
  }
  if ("banner" in data && data.banner !== existingDex.banner) {
    updateData.banner = data.banner;
  }
  if ("logo" in data && data.logo !== existingDex.logo) {
    updateData.logo = data.logo;
  }
  if (
    "tokenAddress" in data &&
    data.tokenAddress !== existingDex.tokenAddress
  ) {
    updateData.tokenAddress = data.tokenAddress;
  }
  if ("tokenChain" in data && data.tokenChain !== existingDex.tokenChain) {
    updateData.tokenChain = data.tokenChain;
  }
  if (
    "telegramLink" in data &&
    data.telegramLink !== existingDex.telegramLink
  ) {
    updateData.telegramLink = data.telegramLink;
  }
  if ("discordLink" in data && data.discordLink !== existingDex.discordLink) {
    updateData.discordLink = data.discordLink;
  }
  if ("xLink" in data && data.xLink !== existingDex.xLink) {
    updateData.xLink = data.xLink;
  }
  if ("websiteUrl" in data && data.websiteUrl !== existingDex.websiteUrl) {
    updateData.websiteUrl = data.websiteUrl;
  }

  return prismaClient.dex.update({
    where: { id },
    data: updateData,
  });
}

export async function updateDexCustomDomainOverride(
  id: string,
  customDomainOverride: string | null
): Promise<Dex> {
  const prismaClient = await getPrisma();
  return prismaClient.dex.update({
    where: { id },
    data: {
      customDomainOverride,
      updatedAt: new Date(),
    },
  });
}
