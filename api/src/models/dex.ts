import { z } from "zod";
import { prisma } from "../lib/prisma";
import type { Prisma, Dex } from "@prisma/client";
import {
  forkTemplateRepository,
  setupRepositoryWithSingleCommit,
  deleteRepository,
  setCustomDomain,
  removeCustomDomain,
} from "../lib/github";
import { generateRepositoryName } from "../lib/nameGenerator";

/**
 * Helper function to extract owner and repo from GitHub URL
 */
function extractRepoInfoFromUrl(
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

// Create schema for validation with base64-encoded image data
export const dexSchema = z.object({
  brokerName: z.string().min(3).max(50).nullish(),
  chainIds: z.array(z.number().positive().int()).optional(),
  themeCSS: z.string().nullish(),
  // For image data, expect base64-encoded strings
  primaryLogo: z.string().nullish(),
  secondaryLogo: z.string().nullish(),
  favicon: z.string().nullish(),
  telegramLink: z.string().url().nullish(),
  discordLink: z.string().url().nullish(),
  xLink: z.string().url().nullish(),
  walletConnectProjectId: z.string().nullish(),
  privyAppId: z.string().nullish(),
  privyTermsOfUse: z.string().nullish(),
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
});

// Schema for custom domain validation
export const customDomainSchema = z.object({
  domain: z
    .string()
    .regex(/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, {
      message:
        "Invalid domain format. Please enter a valid domain like 'example.com'",
    }),
});

// Helper function to generate a simple ID
export function generateId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Create DEX in database
export async function createDex(
  data: z.infer<typeof dexSchema>,
  userId: string
): Promise<Dex> {
  // First check if user already has a DEX
  const existingDex = await getUserDex(userId);

  if (existingDex) {
    throw new Error(
      "User already has a DEX. Only one DEX per user is allowed."
    );
  }

  // Get the user's address to use as the repo owner
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { address: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Generate a repository name based on the broker name or a default
  const brokerName = data.brokerName || "Orderly DEX";

  // Use the helper function to generate a standardized repository name
  const repoName = generateRepositoryName(brokerName);

  let repoUrl: string;

  // First create the repository - this is required for DEX creation
  try {
    console.log(
      "Creating repository in OrderlyNetworkDexCreator organization..."
    );
    repoUrl = await forkTemplateRepository(repoName);
    console.log(`Successfully forked repository: ${repoUrl}`);

    const repoInfo = extractRepoInfoFromUrl(repoUrl);
    if (!repoInfo) {
      throw new Error(
        `Failed to extract repository information from URL: ${repoUrl}`
      );
    }

    const brokerId = "demo";

    await setupRepositoryWithSingleCommit(
      repoInfo.owner,
      repoInfo.repo,
      {
        brokerId,
        brokerName,
        chainIds: data.chainIds,
        themeCSS: data.themeCSS?.toString(),
        telegramLink: data.telegramLink || undefined,
        discordLink: data.discordLink || undefined,
        xLink: data.xLink || undefined,
        walletConnectProjectId: data.walletConnectProjectId || undefined,
        privyAppId: data.privyAppId || undefined,
        privyTermsOfUse: data.privyTermsOfUse || undefined,
        enabledMenus: data.enabledMenus || undefined,
        customMenus: data.customMenus || undefined,
        enableAbstractWallet: data.enableAbstractWallet,
        disableMainnet: data.disableMainnet,
        disableTestnet: data.disableTestnet,
        disableEvmWallets: data.disableEvmWallets,
        disableSolanaWallets: data.disableSolanaWallets,
      },
      {
        primaryLogo: data.primaryLogo || undefined,
        secondaryLogo: data.secondaryLogo || undefined,
        favicon: data.favicon || undefined,
      }
    );
    console.log(`Successfully set up repository for ${brokerName}`);
  } catch (error) {
    // If repository creation fails, the entire DEX creation fails
    console.error("Error creating repository:", error);

    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;

      // Provide more context for common errors
      if (
        errorMessage.includes(
          "Resource not accessible by personal access token"
        )
      ) {
        throw new Error(
          "Repository creation failed: The GitHub token does not have sufficient permissions"
        );
      } else if (errorMessage.includes("Not Found")) {
        throw new Error(
          "Repository creation failed: Template repository or organization not found"
        );
      } else if (errorMessage.includes("already exists")) {
        throw new Error(
          "Repository creation failed: A repository with this name already exists"
        );
      }
    }

    throw new Error(`Repository creation failed: ${errorMessage}`);
  }

  // If we get here, repository creation was successful
  // Now create the DEX in the database
  try {
    // Always use 'demo' as the brokerId - only admins can change this
    const brokerId = "demo";

    return await prisma.dex.create({
      data: {
        brokerName: data.brokerName ?? undefined,
        brokerId: brokerId,
        chainIds: data.chainIds ?? [],
        themeCSS: data.themeCSS,
        primaryLogo: data.primaryLogo,
        secondaryLogo: data.secondaryLogo,
        favicon: data.favicon,
        telegramLink: data.telegramLink,
        discordLink: data.discordLink,
        xLink: data.xLink,
        walletConnectProjectId: data.walletConnectProjectId,
        privyAppId: data.privyAppId,
        privyTermsOfUse: data.privyTermsOfUse,
        enabledMenus: data.enabledMenus,
        customMenus: data.customMenus,
        enableAbstractWallet: data.enableAbstractWallet,
        disableMainnet: data.disableMainnet,
        disableTestnet: data.disableTestnet,
        disableEvmWallets: data.disableEvmWallets,
        disableSolanaWallets: data.disableSolanaWallets,
        repoUrl: repoUrl,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  } catch (dbError) {
    console.error("Error creating DEX in database:", dbError);

    // Try to clean up by deleting the repository we just created
    try {
      const repoInfo = extractRepoInfoFromUrl(repoUrl);
      if (repoInfo) {
        await deleteRepository(repoInfo.owner, repoInfo.repo);
        console.log(`Cleaned up repository after database creation failure`);
      }
    } catch (cleanupError) {
      console.error("Failed to clean up repository:", cleanupError);
    }

    throw new Error(
      `Failed to create DEX in database: ${dbError instanceof Error ? dbError.message : String(dbError)}`
    );
  }
}

// Get the DEX for a specific user
export async function getUserDex(userId: string): Promise<Dex | null> {
  return prisma.dex.findUnique({
    where: {
      userId,
    },
  });
}

// Get a specific DEX by ID
export async function getDexById(id: string): Promise<Dex | null> {
  return prisma.dex.findUnique({
    where: {
      id,
    },
  });
}

// Update a DEX
export async function updateDex(
  id: string,
  data: z.infer<typeof dexSchema>,
  userId: string
): Promise<Dex> {
  // Ensure the DEX belongs to the user
  const dex = await getDexById(id);

  if (!dex || dex.userId !== userId) {
    throw new Error("DEX not found or user is not authorized to update it");
  }

  // Prepare update data with properly typed properties
  const updateData: Prisma.DexUpdateInput = {};

  // Update fields that are present in the data object, including null values
  if ("brokerName" in data)
    updateData.brokerName = data.brokerName ?? undefined;
  if ("chainIds" in data) updateData.chainIds = data.chainIds ?? [];
  if ("themeCSS" in data) updateData.themeCSS = data.themeCSS;
  if ("telegramLink" in data) updateData.telegramLink = data.telegramLink;
  if ("discordLink" in data) updateData.discordLink = data.discordLink;
  if ("xLink" in data) updateData.xLink = data.xLink;
  if ("walletConnectProjectId" in data) {
    updateData.walletConnectProjectId = data.walletConnectProjectId;
  }
  if ("privyAppId" in data) updateData.privyAppId = data.privyAppId;
  if ("privyTermsOfUse" in data)
    updateData.privyTermsOfUse = data.privyTermsOfUse;
  if ("enabledMenus" in data) updateData.enabledMenus = data.enabledMenus;
  if ("customMenus" in data) updateData.customMenus = data.customMenus;

  // Handle image data
  if ("primaryLogo" in data) updateData.primaryLogo = data.primaryLogo;
  if ("secondaryLogo" in data) updateData.secondaryLogo = data.secondaryLogo;
  if ("favicon" in data) updateData.favicon = data.favicon;
  if ("enableAbstractWallet" in data)
    updateData.enableAbstractWallet = data.enableAbstractWallet;
  if ("disableMainnet" in data) updateData.disableMainnet = data.disableMainnet;
  if ("disableTestnet" in data) updateData.disableTestnet = data.disableTestnet;
  if ("disableEvmWallets" in data)
    updateData.disableEvmWallets = data.disableEvmWallets;
  if ("disableSolanaWallets" in data)
    updateData.disableSolanaWallets = data.disableSolanaWallets;

  return prisma.dex.update({
    where: {
      id,
    },
    data: updateData,
  });
}

// Delete a DEX
export async function deleteDex(id: string, userId: string): Promise<Dex> {
  // Ensure the DEX belongs to the user
  const dex = await getDexById(id);

  if (!dex || dex.userId !== userId) {
    throw new Error("DEX not found or user is not authorized to delete it");
  }

  // If the DEX has a GitHub repository, attempt to delete it
  if (dex.repoUrl) {
    try {
      const repoInfo = extractRepoInfoFromUrl(dex.repoUrl);
      if (repoInfo) {
        // Attempt to delete the repository, but continue even if it fails
        await deleteRepository(repoInfo.owner, repoInfo.repo);
      }
    } catch (error) {
      console.error("Error deleting GitHub repository:", error);
      // Continue with DEX deletion even if repository deletion fails
    }
  }

  // Delete the DEX from the database
  return prisma.dex.delete({
    where: {
      id,
    },
  });
}

// Update DEX repository URL after forking
export async function updateDexRepoUrl(
  id: string,
  repoUrl: string
): Promise<Dex> {
  // Simply update the repository URL without any ownership checks
  // Authorization should be handled at the controller/route level
  return prisma.dex.update({
    where: {
      id,
    },
    data: {
      repoUrl,
    },
  });
}

// Update broker ID (admin only)
export async function updateBrokerId(
  id: string,
  brokerId: string
): Promise<Dex> {
  return prisma.dex.update({
    where: {
      id,
    },
    data: {
      brokerId,
      preferredBrokerId: brokerId,
    },
  });
}

// Delete a DEX by wallet address (admin only)
export async function deleteDexByWalletAddress(
  address: string
): Promise<Dex | null> {
  // First find the user by address
  const user = await prisma.user.findUnique({
    where: {
      address: address.toLowerCase(), // Ensure address is in lowercase
    },
    include: {
      dex: true,
    },
  });

  // If no user or no DEX, return null
  if (!user || !user.dex) {
    return null;
  }

  const dexId = user.dex.id;
  const dex = user.dex;

  // If the DEX has a GitHub repository, attempt to delete it
  if (dex.repoUrl) {
    try {
      const repoInfo = extractRepoInfoFromUrl(dex.repoUrl);
      if (repoInfo) {
        // Attempt to delete the repository, but continue even if it fails
        await deleteRepository(repoInfo.owner, repoInfo.repo);
      }
    } catch (error) {
      console.error("Error deleting GitHub repository:", error);
      // Continue with DEX deletion even if repository deletion fails
    }
  }

  // Delete the DEX
  return prisma.dex.delete({
    where: {
      id: dexId,
    },
  });
}

// Get all DEXes with associated user data (admin only)
export async function getAllDexes() {
  return prisma.dex.findMany({
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
): Promise<Dex> {
  // First check if the DEX exists and belongs to the user
  const dex = await prisma.dex.findUnique({
    where: { id },
  });

  if (!dex) {
    throw new Error("DEX not found");
  }

  if (dex.userId !== userId) {
    throw new Error("User is not authorized to update this DEX");
  }

  // Check if the repository URL exists
  if (!dex.repoUrl) {
    throw new Error("This DEX doesn't have a repository URL");
  }

  // Extract repo info from URL
  const repoInfo = extractRepoInfoFromUrl(dex.repoUrl);
  if (!repoInfo) {
    throw new Error("Invalid repository URL");
  }

  // Set the custom domain in GitHub
  try {
    await setCustomDomain(repoInfo.owner, repoInfo.repo, domain);
  } catch (error) {
    throw new Error(
      `Failed to set custom domain in GitHub: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  // Update the DEX in the database
  return prisma.dex.update({
    where: { id },
    data: {
      customDomain: domain,
      updatedAt: new Date(),
    },
  });
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
  // First check if the DEX exists and belongs to the user
  const dex = await prisma.dex.findUnique({
    where: { id },
  });

  if (!dex) {
    throw new Error("DEX not found");
  }

  if (dex.userId !== userId) {
    throw new Error("User is not authorized to update this DEX");
  }

  // Check if there is a custom domain to remove
  if (!dex.customDomain) {
    throw new Error("This DEX doesn't have a custom domain configured");
  }

  // Check if the repository URL exists
  if (!dex.repoUrl) {
    throw new Error("This DEX doesn't have a repository URL");
  }

  // Extract repo info from URL
  const repoInfo = extractRepoInfoFromUrl(dex.repoUrl);
  if (!repoInfo) {
    throw new Error("Invalid repository URL");
  }

  // Remove the custom domain in GitHub using the new function
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

  // Update the DEX in the database
  return prisma.dex.update({
    where: { id },
    data: {
      customDomain: null,
      updatedAt: new Date(),
    },
  });
}
