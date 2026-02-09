import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import {
  createDex,
  getUserDex,
  getDexById,
  updateDex,
  deleteDex,
  updateDexCustomDomain,
  removeDexCustomDomain,
  extractRepoInfoFromUrl,
  dexFormSchema,
  convertFormDataToInternal,
  updateDexSocialCard,
  socialCardFormSchema,
  convertSocialCardFormDataToInternal,
  convertDexToDexConfig,
} from "../models/dex";
import { DexErrorType } from "../lib/types";
import { getPrisma } from "../lib/prisma";
import { geckoTerminalService } from "../services/geckoTerminalService.js";
import { leaderboardService } from "../services/leaderboardService.js";
import {
  getWorkflowRunStatus,
  getWorkflowRunDetails,
  updateDexConfig,
  checkForTemplateUpdates,
  invalidateTemplateUpdatesCache,
  triggerRedeployment,
} from "../lib/github";
import {
  deploymentRateLimiter,
  createDeploymentRateLimit,
} from "../lib/rateLimiter";
import { z } from "zod";

const dexRoutes = new Hono();

const deploymentRateLimit = createDeploymentRateLimit(deploymentRateLimiter);

// Get the current user's DEX
dexRoutes.get("/", async c => {
  try {
    const userId = c.get("userId");

    const dex = await getUserDex(userId);
    if (!dex) {
      return c.json({ exists: false }, { status: 200 });
    }

    return c.json(dex, { status: 200 });
  } catch (error) {
    console.error("Error getting DEX:", error);
    return c.json({ error: "Failed to get DEX information" }, { status: 500 });
  }
});

// Get rate limiting status for current user
dexRoutes.get("/rate-limit-status", async c => {
  const userId = c.get("userId");
  const remainingSeconds = deploymentRateLimiter.getRemainingCooldown(userId);
  const isRateLimited = deploymentRateLimiter.isRateLimited(userId);

  return c.json({
    isRateLimited,
    remainingCooldownSeconds: remainingSeconds,
    cooldownMinutes: 5,
    message: isRateLimited
      ? `Please wait ${Math.ceil(
          remainingSeconds / 60
        )} more minutes before updating your DEX again.`
      : "Ready to update your DEX.",
  });
});

// Get available networks for token chain selection
dexRoutes.get("/networks", async c => {
  try {
    const networks = await geckoTerminalService.getNetworks();

    return c.json(networks, { status: 200 });
  } catch (error) {
    console.error("Error fetching networks:", error);
    return c.json(
      {
        message: "Failed to fetch available networks",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});

// Get a specific DEX by ID
dexRoutes.get("/:id", async c => {
  const id = c.req.param("id");
  const userId = c.get("userId");

  try {
    const dex = await getDexById(id);

    if (!dex) {
      return c.json({ message: "DEX not found" }, 404);
    }

    if (dex.userId !== userId) {
      return c.json({ message: "Unauthorized to access this DEX" }, 403);
    }

    return c.json(dex);
  } catch (error) {
    console.error("Error fetching DEX:", error);
    return c.json({ message: "Error fetching DEX", error: String(error) }, 500);
  }
});

// Create a new DEX
dexRoutes.post(
  "/",
  deploymentRateLimit,
  zValidator("form", dexFormSchema),
  async c => {
    try {
      const userId = c.get("userId");

      const formData = c.req.valid("form");

      const data = await convertFormDataToInternal(formData);

      // Ignore analyticsScript parameter in POST requests
      const { analyticsScript, ...rest } = data;
      const result = await createDex(rest, userId);

      if (!result.success) {
        switch (result.error.type) {
          case DexErrorType.USER_ALREADY_HAS_DEX:
            return c.json({ error: result.error.message }, { status: 409 });
          case DexErrorType.USER_NOT_FOUND:
            return c.json({ error: result.error.message }, { status: 404 });
          case DexErrorType.REPOSITORY_PERMISSION_DENIED:
          case DexErrorType.REPOSITORY_NOT_FOUND:
          case DexErrorType.REPOSITORY_ALREADY_EXISTS:
          case DexErrorType.REPOSITORY_CREATION_FAILED:
          case DexErrorType.REPOSITORY_INFO_EXTRACTION_FAILED:
          case DexErrorType.DATABASE_ERROR:
            return c.json({ error: result.error.message }, { status: 500 });
          default:
            return c.json({ error: result.error.message }, { status: 500 });
        }
      }

      return c.json(result.data, { status: 201 });
    } catch (error) {
      console.error("Error creating DEX:", error);
      return c.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

// Update social card information
dexRoutes.put(
  "/social-card",
  zValidator("form", socialCardFormSchema),
  async c => {
    try {
      const userId = c.get("userId");
      const formData = c.req.valid("form");

      const data = await convertSocialCardFormDataToInternal(formData);

      const dex = await getUserDex(userId);
      if (!dex) {
        return c.json({ message: "DEX not found" }, { status: 404 });
      }

      if (data.tokenChain) {
        const isValidChain = await geckoTerminalService.isValidNetwork(
          data.tokenChain
        );
        if (!isValidChain) {
          return c.json(
            {
              message:
                "Invalid token chain. Please use a valid GeckoTerminal network ID.",
            },
            { status: 400 }
          );
        }
      }

      if (data.tokenAddress && data.tokenChain) {
        try {
          const response = await fetch(
            `https://api.geckoterminal.com/api/v2/networks/${data.tokenChain}/tokens/${data.tokenAddress}`
          );

          if (!response.ok) {
            return c.json(
              {
                message:
                  "Token not found on the specified network. Please verify the token address and network.",
              },
              { status: 400 }
            );
          }

          const tokenData = await response.json();
          if (!tokenData.data || !tokenData.data.attributes) {
            return c.json(
              {
                message: "Invalid token data received from GeckoTerminal API.",
              },
              { status: 400 }
            );
          }
        } catch (error) {
          console.error("Error validating token:", error);
          return c.json(
            {
              message: "Failed to validate token. Please try again later.",
            },
            { status: 500 }
          );
        }
      }

      const updatedDex = await updateDexSocialCard(dex.id, userId, data);

      if (data.tokenAddress || data.tokenChain) {
        leaderboardService.invalidateTokenCacheForBroker(dex.brokerId);
      }

      return c.json(
        {
          message: "Social card information updated successfully",
          dex: {
            id: updatedDex.id,
            description: updatedDex.description,
            banner: updatedDex.banner,
            logo: updatedDex.logo,
            tokenAddress: updatedDex.tokenAddress,
            tokenChain: updatedDex.tokenChain,
            telegramLink: updatedDex.telegramLink,
            discordLink: updatedDex.discordLink,
            xLink: updatedDex.xLink,
            websiteUrl: updatedDex.websiteUrl,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating social card:", error);

      if (error instanceof Error) {
        if (error.message.includes("DEX not found")) {
          return c.json({ message: "DEX not found" }, { status: 404 });
        }
        if (error.message.includes("User is not authorized")) {
          return c.json({ message: error.message }, { status: 403 });
        }
      }

      return c.json(
        {
          message: "Failed to update social card information",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  }
);

// Update an existing DEX
dexRoutes.put(
  "/:id",
  deploymentRateLimit,
  zValidator("form", dexFormSchema),
  async c => {
    const id = c.req.param("id");
    const userId = c.get("userId");

    try {
      const formData = c.req.valid("form");

      const data = await convertFormDataToInternal(formData);

      const existingDex = await getDexById(id);

      if (
        existingDex &&
        formData.analyticsScript &&
        !(existingDex.customDomain || existingDex.customDomainOverride)
      ) {
        return c.json(
          {
            error:
              "Analytics script cannot be enabled: custom domain is not configured. Please set a custom domain first.",
          },
          { status: 400 }
        );
      }

      const result = await updateDex(id, userId, data);

      if (!result.success) {
        switch (result.error.type) {
          case DexErrorType.DEX_NOT_FOUND:
            return c.json({ message: result.error.message }, { status: 404 });
          case DexErrorType.USER_NOT_AUTHORIZED:
            return c.json({ message: result.error.message }, { status: 403 });
          case DexErrorType.DATABASE_ERROR:
            return c.json({ error: result.error.message }, { status: 500 });
          default:
            return c.json({ error: result.error.message }, { status: 500 });
        }
      }

      const updatedDex = result.data;

      if (updatedDex.repoUrl) {
        const repoInfo = extractRepoInfoFromUrl(updatedDex.repoUrl);

        if (repoInfo) {
          try {
            const { getPrisma } = await import("../lib/prisma");
            const prisma = await getPrisma();
            const user = await prisma.user.findUnique({
              where: { id: userId },
              select: { address: true },
            });

            await updateDexConfig(
              repoInfo.owner,
              repoInfo.repo,
              convertDexToDexConfig(updatedDex),
              {
                primaryLogo: updatedDex.primaryLogo,
                secondaryLogo: updatedDex.secondaryLogo,
                favicon: updatedDex.favicon,
                pnlPosters:
                  updatedDex.pnlPosters.length > 0
                    ? updatedDex.pnlPosters
                    : null,
              },
              updatedDex.customDomain,
              user?.address ?? null
            );

            console.log(
              `Successfully updated repository files for ${updatedDex.brokerName} with a single commit`
            );

            invalidateTemplateUpdatesCache(repoInfo.owner, repoInfo.repo);
          } catch (configError) {
            console.error("Error updating repository files:", configError);
          }
        }
      }

      return c.json(updatedDex);
    } catch (error) {
      console.error("Error updating DEX:", error);

      if (
        error instanceof Error &&
        error.message.includes("user is not authorized")
      ) {
        return c.json({ message: error.message }, 403);
      }

      if (error instanceof Error && error.message.includes("DEX not found")) {
        return c.json({ message: "DEX not found" }, 404);
      }

      if (
        error instanceof Error &&
        error.message.includes("Invalid TradingView color configuration")
      ) {
        return c.json({ error: error.message }, 400);
      }

      return c.json(
        { message: "Error updating DEX", error: String(error) },
        500
      );
    }
  }
);

// Delete a user's DEX
dexRoutes.delete("/:id", async c => {
  const id = c.req.param("id");
  const userId = c.get("userId");

  try {
    const result = await deleteDex(id, userId);

    if (!result.success) {
      switch (result.error.type) {
        case DexErrorType.DEX_NOT_FOUND:
          return c.json({ message: result.error.message }, 404);
        case DexErrorType.USER_NOT_AUTHORIZED:
          return c.json({ message: result.error.message }, 403);
        case DexErrorType.DATABASE_ERROR:
          return c.json(
            { message: "Error deleting DEX", error: result.error.message },
            500
          );
        default:
          return c.json(
            { message: "Error deleting DEX", error: result.error.message },
            500
          );
      }
    }

    return c.json({ message: "DEX deleted successfully", dex: result.data });
  } catch (error) {
    console.error("Error deleting DEX:", error);
    return c.json(
      { message: "Internal server error", error: String(error) },
      500
    );
  }
});

// Get workflow status for a DEX's repository
dexRoutes.get("/:id/workflow-status", async c => {
  const id = c.req.param("id");
  const workflowName = c.req.query("workflow");
  const userId = c.get("userId");

  try {
    const dex = await getDexById(id);

    if (!dex) {
      return c.json({ message: "DEX not found" }, 404);
    }

    if (dex.userId !== userId) {
      return c.json({ message: "Unauthorized to access this DEX" }, 403);
    }

    if (!dex.repoUrl) {
      return c.json({ message: "This DEX does not have a repository" }, 400);
    }

    const repoInfo = extractRepoInfoFromUrl(dex.repoUrl);
    if (!repoInfo) {
      return c.json({ message: "Invalid repository URL" }, 400);
    }

    const workflowRuns = await getWorkflowRunStatus(
      repoInfo.owner,
      repoInfo.repo,
      workflowName
    );

    return c.json(workflowRuns);
  } catch (error) {
    console.error("Error fetching workflow status:", error);
    return c.json(
      { message: "Error fetching workflow status", error: String(error) },
      500
    );
  }
});

// Get details for a specific workflow run
dexRoutes.get("/:id/workflow-runs/:runId", async c => {
  const id = c.req.param("id");
  const runId = parseInt(c.req.param("runId"), 10);
  const userId = c.get("userId");

  if (isNaN(runId)) {
    return c.json({ message: "Invalid run ID" }, 400);
  }

  try {
    const dex = await getDexById(id);

    if (!dex) {
      return c.json({ message: "DEX not found" }, 404);
    }

    if (dex.userId !== userId) {
      return c.json({ message: "Unauthorized to access this DEX" }, 403);
    }

    if (!dex.repoUrl) {
      return c.json({ message: "This DEX does not have a repository" }, 400);
    }

    const repoInfo = extractRepoInfoFromUrl(dex.repoUrl);
    if (!repoInfo) {
      return c.json({ message: "Invalid repository URL" }, 400);
    }

    const runDetails = await getWorkflowRunDetails(
      repoInfo.owner,
      repoInfo.repo,
      runId
    );

    return c.json(runDetails);
  } catch (error) {
    console.error("Error fetching workflow run details:", error);
    return c.json(
      {
        message: "Error fetching workflow run details",
        error: String(error),
      },
      500
    );
  }
});

dexRoutes.get("/:id/upgrade-status", async c => {
  const id = c.req.param("id");
  const userId = c.get("userId");

  try {
    const dex = await getDexById(id);

    if (!dex) {
      return c.json({ message: "DEX not found" }, { status: 404 });
    }

    if (dex.userId !== userId) {
      return c.json(
        { message: "Unauthorized to access this DEX" },
        { status: 403 }
      );
    }

    if (!dex.repoUrl) {
      return c.json(
        { message: "This DEX does not have a repository" },
        { status: 400 }
      );
    }

    const repoInfo = extractRepoInfoFromUrl(dex.repoUrl);
    if (!repoInfo) {
      return c.json({ message: "Invalid repository URL" }, { status: 400 });
    }

    const updateStatus = await checkForTemplateUpdates(
      repoInfo.owner,
      repoInfo.repo
    );

    return c.json(updateStatus, { status: 200 });
  } catch (error) {
    console.error("Error checking upgrade status:", error);
    return c.json(
      {
        message: "Error checking upgrade status",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});

// Upgrade DEX (trigger redeployment without changing config)
dexRoutes.post("/:id/upgrade", deploymentRateLimit, async c => {
  const id = c.req.param("id");
  const userId = c.get("userId");

  try {
    const dex = await getDexById(id);

    if (!dex) {
      return c.json({ message: "DEX not found" }, { status: 404 });
    }

    if (dex.userId !== userId) {
      return c.json(
        { message: "Unauthorized to access this DEX" },
        { status: 403 }
      );
    }

    if (!dex.repoUrl) {
      return c.json(
        { message: "This DEX does not have a repository" },
        { status: 400 }
      );
    }

    const repoInfo = extractRepoInfoFromUrl(dex.repoUrl);
    if (!repoInfo) {
      return c.json({ message: "Invalid repository URL" }, { status: 400 });
    }

    const prisma = await getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { address: true },
    });

    await triggerRedeployment(
      repoInfo.owner,
      repoInfo.repo,
      convertDexToDexConfig(dex),
      {
        primaryLogo: dex.primaryLogo,
        secondaryLogo: dex.secondaryLogo,
        favicon: dex.favicon,
        pnlPosters: dex.pnlPosters.length > 0 ? dex.pnlPosters : null,
      },
      dex.customDomain,
      user?.address ?? null
    );

    invalidateTemplateUpdatesCache(repoInfo.owner, repoInfo.repo);

    return c.json({
      message: "DEX upgrade triggered successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error upgrading DEX:", error);
    return c.json(
      {
        message: "Error upgrading DEX",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});

const customDomainSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .max(253, "Domain cannot exceed 253 characters")
    .transform(val => val.trim().toLowerCase())
    .refine(domain => {
      return domain.length > 0;
    }, "Domain cannot be empty")
    .refine(domain => {
      return (
        !domain.includes("..") &&
        !domain.startsWith(".") &&
        !domain.endsWith(".")
      );
    }, "Domain cannot have consecutive dots or start/end with a dot")
    .refine(domain => {
      const domainRegex =
        /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/;
      return domainRegex.test(domain);
    }, "Invalid domain format. Use a valid domain like 'example.com' or 'subdomain.example.com'")
    .refine(domain => {
      const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
      return !ipRegex.test(domain);
    }, "IP addresses are not allowed. Please use a domain name")
    .refine(domain => {
      return domain.includes(".");
    }, "Domain must include a top-level domain (e.g., '.com', '.org')")
    .refine(domain => {
      const labels = domain.split(".");
      return labels.every(label => label.length <= 63 && label.length > 0);
    }, "Each part of the domain must be 1-63 characters long")
    .refine(domain => {
      const tld = domain.split(".").pop();
      return tld && tld.length >= 2 && /^[a-z]+$/.test(tld);
    }, "Domain must have a valid top-level domain (e.g., '.com', '.org')")
    .refine(domain => {
      const labels = domain.split(".");
      return labels.every(
        label => !label.startsWith("-") && !label.endsWith("-")
      );
    }, "Domain labels cannot start or end with hyphens"),
});

// Set a custom domain for a DEX
dexRoutes.post(
  "/:id/custom-domain",
  zValidator("json", customDomainSchema),
  async c => {
    const id = c.req.param("id");
    const userId = c.get("userId");
    const { domain } = c.req.valid("json");

    const result = await updateDexCustomDomain(id, domain, userId);

    if (!result.success) {
      return c.json({ message: result.error }, 400);
    }

    return c.json(
      {
        message: "Custom domain set successfully",
        dex: result.data,
      },
      200
    );
  }
);

// Remove custom domain from a DEX
dexRoutes.delete("/:id/custom-domain", async c => {
  const id = c.req.param("id");
  const userId = c.get("userId");

  try {
    const updatedDex = await removeDexCustomDomain(id, userId);
    return c.json(
      {
        message: "Custom domain removed successfully",
        dex: updatedDex,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing custom domain:", error);

    if (error instanceof Error) {
      if (error.message.includes("DEX not found")) {
        return c.json({ message: "DEX not found" }, { status: 404 });
      }
      if (error.message.includes("User is not authorized")) {
        return c.json({ message: error.message }, { status: 403 });
      }
      if (error.message.includes("doesn't have a custom domain configured")) {
        return c.json({ message: error.message }, { status: 400 });
      }
      if (error.message.includes("doesn't have a repository URL")) {
        return c.json({ message: error.message }, { status: 400 });
      }
    }

    return c.json(
      {
        message: "Failed to remove custom domain",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});

const boardVisibilitySchema = z.object({
  showOnBoard: z.boolean(),
});

dexRoutes.post(
  "/:id/board-visibility",
  zValidator("json", boardVisibilitySchema),
  async c => {
    const id = c.req.param("id");
    const userId = c.get("userId");
    const { showOnBoard } = c.req.valid("json");

    try {
      const dex = await getDexById(id);

      if (!dex) {
        return c.json({ message: "DEX not found" }, 404);
      }

      if (dex.userId !== userId) {
        return c.json({ message: "Unauthorized to update this DEX" }, 403);
      }

      const prisma = await getPrisma();
      const updatedDex = await prisma.dex.update({
        where: { id },
        data: { showOnBoard },
      });

      return c.json(
        {
          message: `DEX ${showOnBoard ? "will now appear" : "is now hidden"} on the public board`,
          dex: updatedDex,
        },
        200
      );
    } catch (error) {
      console.error("Error updating board visibility:", error);
      return c.json(
        {
          message: "Failed to update board visibility",
          error: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }
);

export default dexRoutes;
