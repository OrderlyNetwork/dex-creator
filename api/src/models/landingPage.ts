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

  let repoUrl: string | null = null;

  try {
    console.log(
      "Creating landing page repository in OrderlyNetworkDexCreator organization..."
    );
    const repoResult = await createLandingPageRepository(identifier);
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

    repoUrl = repoResult.data;
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

    await setupLandingPageRepository(
      repoInfo.owner,
      repoInfo.repo,
      "<!DOCTYPE html><html><head><title>Landing Page</title></head><body><h1>Landing Page</h1></body></html>",
      null
    );
    console.log(
      `Successfully set up landing page repository for ${identifier}`
    );
  } catch (error) {
    console.error("Error setting up landing page repository:", error);
    return {
      success: false,
      error: {
        type: LandingPageErrorType.REPOSITORY_CREATION_FAILED,
        message: `Repository setup failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    };
  }

  try {
    const prismaClient = await getPrisma();
    const landingPage = await prismaClient.landingPage.create({
      data: {
        userId,
        repoIdentifier: identifier,
        config,
        repoUrl: repoUrl,
      },
    });

    return {
      success: true,
      data: landingPage,
    };
  } catch (dbError) {
    console.error("Error creating landing page in database:", dbError);

    try {
      const repoInfo = extractRepoInfoFromUrl(repoUrl);
      if (repoInfo) {
        await deleteRepository(repoInfo.owner, repoInfo.repo);
        console.log(
          `Cleaned up landing page repository after database creation failure`
        );
      }
    } catch (cleanupError) {
      console.error(
        "Failed to clean up landing page repository:",
        cleanupError
      );
    }

    return {
      success: false,
      error: {
        type: LandingPageErrorType.DATABASE_ERROR,
        message: `Failed to create landing page in database: ${
          dbError instanceof Error ? dbError.message : String(dbError)
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

  if (landingPage.repoUrl) {
    try {
      const repoInfo = extractRepoInfoFromUrl(landingPage.repoUrl);
      if (repoInfo) {
        await deleteRepository(repoInfo.owner, repoInfo.repo);
      }
    } catch (error) {
      console.error("Error deleting landing page GitHub repository:", error);
    }
  }

  try {
    const prismaClient = await getPrisma();
    const deletedLandingPage = await prismaClient.landingPage.delete({
      where: {
        id,
      },
    });

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
  const prismaClient = await getPrisma();
  const landingPage = await prismaClient.landingPage.findUnique({
    where: { id },
  });

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
        message: "You are not authorized to update this landing page",
      },
    };
  }

  if (!landingPage.repoUrl) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.REPOSITORY_CREATION_FAILED,
        message: "This landing page doesn't have a repository configured",
      },
    };
  }

  const repoInfo = extractRepoInfoFromUrl(landingPage.repoUrl);
  if (!repoInfo) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.REPOSITORY_CREATION_FAILED,
        message: "Invalid repository URL format",
      },
    };
  }

  try {
    await setCustomDomain(repoInfo.owner, repoInfo.repo, domain);
  } catch (error) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.REPOSITORY_CREATION_FAILED,
        message: `Failed to configure domain with GitHub Pages: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    };
  }

  const updatedLandingPage = await prismaClient.landingPage.update({
    where: { id },
    data: {
      customDomain: domain,
      updatedAt: new Date(),
    },
  });

  return { success: true, data: updatedLandingPage };
}

export async function removeLandingPageCustomDomain(
  id: string,
  userId: string
): Promise<LandingPageResult<LandingPage>> {
  const prismaClient = await getPrisma();
  const landingPage = await prismaClient.landingPage.findUnique({
    where: { id },
  });

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

  if (!landingPage.customDomain) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.VALIDATION_ERROR,
        message: "This landing page doesn't have a custom domain configured",
      },
    };
  }

  if (!landingPage.repoUrl) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.REPOSITORY_CREATION_FAILED,
        message: "This landing page doesn't have a repository URL",
      },
    };
  }

  const repoInfo = extractRepoInfoFromUrl(landingPage.repoUrl);
  if (!repoInfo) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.REPOSITORY_CREATION_FAILED,
        message: "Invalid repository URL",
      },
    };
  }

  try {
    await removeCustomDomain(repoInfo.owner, repoInfo.repo);
    console.log(
      `Successfully removed custom domain for ${repoInfo.owner}/${repoInfo.repo}`
    );
  } catch (error) {
    return {
      success: false,
      error: {
        type: LandingPageErrorType.REPOSITORY_CREATION_FAILED,
        message: `Failed to remove custom domain in GitHub: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    };
  }

  const updatedLandingPage = await prismaClient.landingPage.update({
    where: { id },
    data: {
      customDomain: null,
      updatedAt: new Date(),
    },
  });

  return { success: true, data: updatedLandingPage };
}
