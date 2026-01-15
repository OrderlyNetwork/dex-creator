import { getPrisma } from "../lib/prisma";
import type { Prisma, LandingPage } from "@prisma/client";
import type { LandingPageResult } from "../lib/types";
import { LandingPageErrorType, GitHubErrorType } from "../lib/types";
import {
  createLandingPageRepository,
  setupLandingPageRepository,
  deleteRepository,
  setCustomDomain,
  removeCustomDomain,
} from "../lib/github";
import { generateLandingPageIdentifier } from "../lib/landingPageIdentifier";

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

export async function getUserLandingPage(
  userId: string
): Promise<LandingPage | null> {
  const prismaClient = await getPrisma();
  return prismaClient.landingPage.findUnique({
    where: {
      userId,
    },
  });
}

export async function getLandingPageById(
  id: string
): Promise<LandingPage | null> {
  const prismaClient = await getPrisma();
  return prismaClient.landingPage.findUnique({
    where: {
      id,
    },
  });
}

export async function createLandingPage(
  userId: string,
  config: Prisma.InputJsonValue
): Promise<LandingPageResult<LandingPage>> {
  const existingLandingPage = await getUserLandingPage(userId);

  if (existingLandingPage) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.USER_ALREADY_HAS_LANDING_PAGE,
        message:
          "User already has a landing page. Only one landing page per user is allowed.",
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
        type: LandingPageErrorType.USER_NOT_FOUND,
        message: "User not found",
      },
    };
  }

  const identifier = generateLandingPageIdentifier();

  try {
    const landingPage = await prismaClient.landingPage.create({
      data: {
        userId,
        repoIdentifier: identifier,
        config,
        repoUrl: null, // Will be set when deployed
      },
    });

    return {
      success: true,
      data: landingPage,
    };
  } catch (dbError) {
    console.error("Error creating landing page in database:", dbError);
    return {
      success: false,
      error: {
        type: LandingPageErrorType.DATABASE_ERROR,
        message: `Failed to create landing page: ${
          dbError instanceof Error ? dbError.message : String(dbError)
        }`,
      },
    };
  }
}

export async function deployLandingPage(
  id: string,
  userId: string
): Promise<LandingPageResult<LandingPage>> {
  const landingPage = await getLandingPageById(id);

  if (!landingPage) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.LANDING_PAGE_NOT_FOUND,
        message: "Landing page not found",
      },
    };
  }

  if (landingPage.userId !== userId) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.USER_NOT_AUTHORIZED,
        message: "User is not authorized to deploy this landing page",
      },
    };
  }

  if (!landingPage.htmlContent) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.VALIDATION_ERROR,
        message: "Landing page HTML content is required for deployment",
      },
    };
  }

  // If repo already exists, just update it
  if (landingPage.repoUrl) {
    const repoInfo = extractRepoInfoFromUrl(landingPage.repoUrl);
    if (repoInfo) {
      try {
        // Extract generatedFiles from config if available
        const config = landingPage.config as Record<string, unknown> | null;
        const generatedFiles = config?.generatedFiles as
          | Array<{ path: string; content: string }>
          | undefined;

        await setupLandingPageRepository(
          repoInfo.owner,
          repoInfo.repo,
          landingPage.htmlContent || "",
          landingPage.customDomain,
          generatedFiles
        );
        return {
          success: true,
          data: landingPage,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            type: LandingPageErrorType.REPOSITORY_CREATION_FAILED,
            message: `Failed to update repository: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        };
      }
    }
  }

  // Create new repository
  try {
    console.log(
      "Creating landing page repository in OrderlyNetworkDexCreator organization..."
    );
    const repoResult = await createLandingPageRepository(
      landingPage.repoIdentifier
    );
    if (!repoResult.success) {
      switch (repoResult.error.type) {
        case GitHubErrorType.REPOSITORY_NAME_EMPTY:
        case GitHubErrorType.REPOSITORY_NAME_INVALID:
        case GitHubErrorType.REPOSITORY_NAME_TOO_LONG:
          return {
            success: false,
            error: {
              type: LandingPageErrorType.VALIDATION_ERROR,
              message: repoResult.error.message,
            },
          };
        default:
          return {
            success: false,
            error: {
              type: LandingPageErrorType.REPOSITORY_CREATION_FAILED,
              message: repoResult.error.message,
            },
          };
      }
    }

    const repoUrl = repoResult.data;
    console.log(`Successfully forked landing page repository: ${repoUrl}`);

    const repoInfo = extractRepoInfoFromUrl(repoUrl);
    if (!repoInfo) {
      return {
        success: false,
        error: {
          type: LandingPageErrorType.REPOSITORY_CREATION_FAILED,
          message: `Failed to extract repository information from URL: ${repoUrl}`,
        },
      };
    }

    // Extract generatedFiles from config if available
    const config = landingPage.config as Record<string, unknown> | null;
    const generatedFiles = config?.generatedFiles as
      | Array<{ path: string; content: string }>
      | undefined;

    await setupLandingPageRepository(
      repoInfo.owner,
      repoInfo.repo,
      landingPage.htmlContent || "",
      landingPage.customDomain,
      generatedFiles
    );
    console.log(
      `Successfully set up landing page repository for ${landingPage.repoIdentifier}`
    );

    // Update landing page with repo URL
    const prismaClient = await getPrisma();
    const updatedLandingPage = await prismaClient.landingPage.update({
      where: { id },
      data: { repoUrl },
    });

    return {
      success: true,
      data: updatedLandingPage,
    };
  } catch (error) {
    console.error("Error deploying landing page:", error);
    return {
      success: false,
      error: {
        type: LandingPageErrorType.REPOSITORY_CREATION_FAILED,
        message: `Repository deployment failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    };
  }
}

export async function updateLandingPage(
  id: string,
  userId: string,
  data: {
    htmlContent?: string;
    config?: any;
    repoUrl?: string;
    customDomain?: string;
  }
): Promise<LandingPageResult<LandingPage>> {
  const landingPage = await getLandingPageById(id);

  if (!landingPage) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.LANDING_PAGE_NOT_FOUND,
        message: "Landing page not found",
      },
    };
  }

  if (landingPage.userId !== userId) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.USER_NOT_AUTHORIZED,
        message: "User is not authorized to update this landing page",
      },
    };
  }

  const updateData: Prisma.LandingPageUpdateInput = {};

  if ("htmlContent" in data && data.htmlContent !== undefined) {
    updateData.htmlContent = data.htmlContent;
  }
  if ("config" in data && data.config !== undefined) {
    updateData.config = data.config;
  }
  if ("repoUrl" in data && data.repoUrl !== undefined) {
    updateData.repoUrl = data.repoUrl;
  }
  if ("customDomain" in data && data.customDomain !== undefined) {
    updateData.customDomain = data.customDomain;
  }

  try {
    const prismaClient = await getPrisma();
    const updatedLandingPage = await prismaClient.landingPage.update({
      where: {
        id,
      },
      data: updateData,
    });

    return {
      success: true,
      data: updatedLandingPage,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.DATABASE_ERROR,
        message: `Failed to update landing page: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    };
  }
}

export async function deleteLandingPage(
  id: string,
  userId: string
): Promise<LandingPageResult<LandingPage>> {
  const landingPage = await getLandingPageById(id);

  if (!landingPage) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.LANDING_PAGE_NOT_FOUND,
        message: "Landing page not found",
      },
    };
  }

  if (landingPage.userId !== userId) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.USER_NOT_AUTHORIZED,
        message: "User is not authorized to delete this landing page",
      },
    };
  }

  try {
    const prismaClient = await getPrisma();
    const deletedLandingPage = await prismaClient.landingPage.delete({
      where: {
        id,
      },
    });

    // If repo exists, delete it
    if (landingPage.repoUrl) {
      const repoInfo = extractRepoInfoFromUrl(landingPage.repoUrl);
      if (repoInfo) {
        try {
          await deleteRepository(repoInfo.owner, repoInfo.repo);
        } catch (error) {
          console.error("Error deleting repository:", error);
          // Don't fail the whole operation if repo deletion fails
        }
      }
    }

    return {
      success: true,
      data: deletedLandingPage,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.DATABASE_ERROR,
        message: `Failed to delete landing page: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    };
  }
}

export async function updateLandingPageCustomDomain(
  id: string,
  domain: string,
  userId: string
): Promise<LandingPageResult<LandingPage>> {
  const landingPage = await getLandingPageById(id);

  if (!landingPage) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.LANDING_PAGE_NOT_FOUND,
        message: "Landing page not found",
      },
    };
  }

  if (landingPage.userId !== userId) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.USER_NOT_AUTHORIZED,
        message: "User is not authorized to update this landing page",
      },
    };
  }

  if (!landingPage.repoUrl) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.VALIDATION_ERROR,
        message: "Landing page must be deployed before setting a custom domain",
      },
    };
  }

  const repoInfo = extractRepoInfoFromUrl(landingPage.repoUrl);
  if (!repoInfo) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.REPOSITORY_CREATION_FAILED,
        message: "Failed to extract repository information",
      },
    };
  }

  try {
    await setCustomDomain(repoInfo.owner, repoInfo.repo, domain);

    const prismaClient = await getPrisma();
    const updatedLandingPage = await prismaClient.landingPage.update({
      where: { id },
      data: { customDomain: domain },
    });

    return {
      success: true,
      data: updatedLandingPage,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.DATABASE_ERROR,
        message: `Failed to set custom domain: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    };
  }
}

export async function removeLandingPageCustomDomain(
  id: string,
  userId: string
): Promise<LandingPageResult<LandingPage>> {
  const landingPage = await getLandingPageById(id);

  if (!landingPage) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.LANDING_PAGE_NOT_FOUND,
        message: "Landing page not found",
      },
    };
  }

  if (landingPage.userId !== userId) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.USER_NOT_AUTHORIZED,
        message: "User is not authorized to update this landing page",
      },
    };
  }

  if (!landingPage.repoUrl) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.VALIDATION_ERROR,
        message: "Landing page must be deployed before removing custom domain",
      },
    };
  }

  const repoInfo = extractRepoInfoFromUrl(landingPage.repoUrl);
  if (!repoInfo) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.REPOSITORY_CREATION_FAILED,
        message: "Failed to extract repository information",
      },
    };
  }

  try {
    await removeCustomDomain(repoInfo.owner, repoInfo.repo);

    const prismaClient = await getPrisma();
    const updatedLandingPage = await prismaClient.landingPage.update({
      where: { id },
      data: { customDomain: null },
    });

    return {
      success: true,
      data: updatedLandingPage,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.DATABASE_ERROR,
        message: `Failed to remove custom domain: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    };
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

/**
 * Get image dimensions from a File (simplified - returns null for now)
 * TODO: Add image dimension detection using a library like 'image-size' or 'sharp'
 */
async function getImageDimensions(
  _file: File
): Promise<{ width: number; height: number } | null> {
  // For now, return null. Dimensions can be detected client-side or
  // we can add a library like 'image-size' or 'sharp' later
  return null;
}

/**
 * Process landing page FormData and extract images with metadata
 */
export async function processLandingPageFormData(formData: FormData): Promise<{
  config: Prisma.InputJsonValue;
  images: {
    primaryLogo?: { data: string; width: number; height: number };
    secondaryLogo?: { data: string; width: number; height: number };
  };
}> {
  // Reconstruct config object from flattened FormData
  const config: Record<string, unknown> = {};

  // Get all form data entries except images
  for (const [key, value] of formData.entries()) {
    if (key === "primaryLogo" || key === "secondaryLogo" || key === "banner") {
      continue; // Skip image fields
    }

    // Try to parse JSON strings, otherwise use as-is
    if (typeof value === "string") {
      try {
        config[key] = JSON.parse(value);
      } catch {
        config[key] = value;
      }
    } else {
      config[key] = value;
    }
  }

  const images: {
    primaryLogo?: { data: string; width: number; height: number };
    secondaryLogo?: { data: string; width: number; height: number };
    banner?: { data: string; width: number; height: number };
  } = {};

  // Process primary logo
  const primaryLogoFile = formData.get("primaryLogo");
  if (primaryLogoFile && primaryLogoFile instanceof File) {
    const base64 = await fileToBase64(primaryLogoFile);
    const dimensions = await getImageDimensions(primaryLogoFile);
    images.primaryLogo = {
      data: base64,
      width: dimensions?.width || 0,
      height: dimensions?.height || 0,
    };
  }

  // Process secondary logo
  const secondaryLogoFile = formData.get("secondaryLogo");
  if (secondaryLogoFile && secondaryLogoFile instanceof File) {
    const base64 = await fileToBase64(secondaryLogoFile);
    const dimensions = await getImageDimensions(secondaryLogoFile);
    images.secondaryLogo = {
      data: base64,
      width: dimensions?.width || 0,
      height: dimensions?.height || 0,
    };
  }

  // Process banner
  const bannerFile = formData.get("banner");
  if (bannerFile && bannerFile instanceof File) {
    const base64 = await fileToBase64(bannerFile);
    const dimensions = await getImageDimensions(bannerFile);
    images.banner = {
      data: base64,
      width: dimensions?.width || 0,
      height: dimensions?.height || 0,
    };
  }

  // Add image metadata to config for AI (with commit paths)
  if (images.primaryLogo) {
    config.primaryLogoImage = {
      path: "assets/primaryLogo.webp",
      width: images.primaryLogo.width || 400, // Default if not detected
      height: images.primaryLogo.height || 400,
    };
    // Store the image data in config for deployment
    config.primaryLogoData = images.primaryLogo.data;
  }
  if (images.secondaryLogo) {
    config.secondaryLogoImage = {
      path: "assets/secondaryLogo.webp",
      width: images.secondaryLogo.width || 200, // Default if not detected
      height: images.secondaryLogo.height || 200,
    };
    // Store the image data in config for deployment
    config.secondaryLogoData = images.secondaryLogo.data;
  }
  if (images.banner) {
    config.bannerImage = {
      path: "assets/banner.webp",
      width: images.banner.width || 1200, // Default if not detected
      height: images.banner.height || 400,
    };
    // Store the image data in config for deployment
    config.bannerData = images.banner.data;
  }

  return { config: config as Prisma.InputJsonValue, images };
}
