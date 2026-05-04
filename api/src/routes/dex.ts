import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
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
  withCampaignsMenuEnabledIfCustom,
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
import { deploymentRateLimiter } from "../lib/rateLimiter";
import {
  ErrorResponseSchema,
  DexResponseSchema,
  RateLimitStatusSchema,
  DexIdParamSchema,
  CreateDexResponseSchema,
  ConflictErrorSchema,
  UnauthorizedErrorSchema,
  NotFoundErrorSchema,
  DeleteSuccessSchema,
  SocialCardUpdateSchema,
  WorkflowStatusSchema,
  WorkflowQuerySchema,
  WorkflowRunDetailsSchema,
  UpgradeStatusSchema,
  UpgradeSuccessSchema,
  CustomDomainSchema,
  CustomDomainSuccessSchema,
  BoardVisibilitySchema,
  BoardVisibilitySuccessSchema,
  SwapFeeSchema,
  SwapFeeSuccessSchema,
  NetworksResponseSchema,
  DexNotFoundResponseSchema,
} from "../schemas/dex.js";

const app = new OpenAPIHono();

const getDexRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["DEX"],
  summary: "Get current user's DEX",
  description:
    "Retrieve the DEX information for the currently authenticated user",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "DEX information retrieved successfully",
      content: {
        "application/json": {
          schema: z
            .union([DexResponseSchema, DexNotFoundResponseSchema])
            .openapi({
              description: "DEX information or not found response",
            }),
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(getDexRoute, async c => {
  try {
    const userId = c.get("userId");

    const dex = await getUserDex(userId);
    if (!dex) {
      // @ts-ignore: Type instantiation is excessively deep
      return c.json({ exists: false }, { status: 200 });
    }

    return c.json(dex, { status: 200 });
  } catch (error) {
    console.error("Error getting DEX:", error);
    return c.json({ error: "Failed to get DEX information" }, { status: 500 });
  }
});

const getRateLimitStatusRoute = createRoute({
  method: "get",
  path: "/rate-limit-status",
  tags: ["DEX"],
  summary: "Get rate limit status",
  description: "Check the current rate limiting status for DEX operations",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Rate limit status retrieved successfully",
      content: {
        "application/json": {
          schema: RateLimitStatusSchema,
        },
      },
    },
  },
});

app.openapi(getRateLimitStatusRoute, async c => {
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

const getNetworksRoute = createRoute({
  method: "get",
  path: "/networks",
  tags: ["DEX"],
  summary: "Get available networks",
  description:
    "Retrieve a list of available blockchain networks for token selection",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Networks retrieved successfully",
      content: {
        "application/json": {
          schema: NetworksResponseSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(getNetworksRoute, async c => {
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

const getDexByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["DEX"],
  summary: "Get DEX by ID",
  description: "Retrieve a specific DEX by its ID",
  security: [{ bearerAuth: [] }],
  request: {
    params: DexIdParamSchema,
  },
  responses: {
    200: {
      description: "DEX retrieved successfully",
      content: {
        "application/json": {
          schema: DexResponseSchema,
        },
      },
    },
    403: {
      description: "Unauthorized to access this DEX",
      content: {
        "application/json": {
          schema: UnauthorizedErrorSchema,
        },
      },
    },
    404: {
      description: "DEX not found",
      content: {
        "application/json": {
          schema: NotFoundErrorSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(getDexByIdRoute, async c => {
  const { id } = c.req.valid("param");
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

const createDexRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["DEX"],
  summary: "Create a new DEX",
  description:
    "Create a new DEX for the authenticated user with the provided configuration",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: dexFormSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "DEX created successfully",
      content: {
        "application/json": {
          schema: CreateDexResponseSchema,
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    409: {
      description: "User already has a DEX",
      content: {
        "application/json": {
          schema: ConflictErrorSchema,
        },
      },
    },
    429: {
      description: "Rate limited - too many requests",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(createDexRoute, async c => {
  try {
    const userId = c.get("userId");

    const formData = c.req.valid("form");

    const data = await convertFormDataToInternal(formData);

    // Ignore analyticsScript parameter in POST requests
    const { analyticsScript: _analyticsScript, ...rest } = data;
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
});

const updateSocialCardRoute = createRoute({
  method: "put",
  path: "/social-card",
  tags: ["DEX"],
  summary: "Update social card information",
  description:
    "Update the social media and branding information for the user's DEX",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: socialCardFormSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Social card updated successfully",
      content: {
        "application/json": {
          schema: SocialCardUpdateSchema,
        },
      },
    },
    400: {
      description: "Invalid request - invalid token chain or token not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "User is not authorized to update this DEX",
      content: {
        "application/json": {
          schema: UnauthorizedErrorSchema,
        },
      },
    },
    404: {
      description: "DEX not found",
      content: {
        "application/json": {
          schema: NotFoundErrorSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(updateSocialCardRoute, async c => {
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
});

const updateDexRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["DEX"],
  summary: "Update a DEX",
  description: "Update an existing DEX's configuration",
  security: [{ bearerAuth: [] }],
  request: {
    params: DexIdParamSchema,
    body: {
      content: {
        "multipart/form-data": {
          schema: dexFormSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "DEX updated successfully",
      content: {
        "application/json": {
          schema: DexResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request - invalid TradingView color configuration",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "User is not authorized to update this DEX",
      content: {
        "application/json": {
          schema: UnauthorizedErrorSchema,
        },
      },
    },
    404: {
      description: "DEX not found",
      content: {
        "application/json": {
          schema: NotFoundErrorSchema,
        },
      },
    },
    429: {
      description: "Rate limited - too many requests",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(updateDexRoute, async c => {
  const { id } = c.req.valid("param");
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
                updatedDex.pnlPosters.length > 0 ? updatedDex.pnlPosters : null,
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

    return c.json({ message: "Error updating DEX", error: String(error) }, 500);
  }
});

const deleteDexRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["DEX"],
  summary: "Delete a DEX",
  description: "Delete a DEX and its associated resources",
  security: [{ bearerAuth: [] }],
  request: {
    params: DexIdParamSchema,
  },
  responses: {
    200: {
      description: "DEX deleted successfully",
      content: {
        "application/json": {
          schema: DeleteSuccessSchema,
        },
      },
    },
    403: {
      description: "User is not authorized to delete this DEX",
      content: {
        "application/json": {
          schema: UnauthorizedErrorSchema,
        },
      },
    },
    404: {
      description: "DEX not found",
      content: {
        "application/json": {
          schema: NotFoundErrorSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(deleteDexRoute, async c => {
  const { id } = c.req.valid("param");
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

const getWorkflowStatusRoute = createRoute({
  method: "get",
  path: "/{id}/workflow-status",
  tags: ["DEX"],
  summary: "Get workflow status",
  description:
    "Get the status of GitHub Actions workflows for a DEX's repository",
  security: [{ bearerAuth: [] }],
  request: {
    params: DexIdParamSchema,
    query: WorkflowQuerySchema,
  },
  responses: {
    200: {
      description: "Workflow status retrieved successfully",
      content: {
        "application/json": {
          schema: WorkflowStatusSchema,
        },
      },
    },
    400: {
      description: "Invalid request - DEX does not have a repository",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Unauthorized to access this DEX",
      content: {
        "application/json": {
          schema: UnauthorizedErrorSchema,
        },
      },
    },
    404: {
      description: "DEX not found",
      content: {
        "application/json": {
          schema: NotFoundErrorSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(getWorkflowStatusRoute, async c => {
  const { id } = c.req.valid("param");
  const { workflow } = c.req.valid("query");
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
      workflow
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

const getWorkflowRunDetailsRoute = createRoute({
  method: "get",
  path: "/{id}/workflow-runs/{runId}",
  tags: ["DEX"],
  summary: "Get workflow run details",
  description: "Get detailed information about a specific workflow run",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z
        .string()
        .min(1)
        .openapi({
          param: {
            name: "id",
            in: "path",
          },
          description: "DEX ID",
          example: "abc123def456",
        }),
      runId: z
        .string()
        .min(1)
        .openapi({
          param: {
            name: "runId",
            in: "path",
          },
          description: "Workflow run ID",
          example: "123456789",
        }),
    }),
  },
  responses: {
    200: {
      description: "Workflow run details retrieved successfully",
      content: {
        "application/json": {
          schema: WorkflowRunDetailsSchema,
        },
      },
    },
    400: {
      description: "Invalid run ID or DEX does not have a repository",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Unauthorized to access this DEX",
      content: {
        "application/json": {
          schema: UnauthorizedErrorSchema,
        },
      },
    },
    404: {
      description: "DEX not found",
      content: {
        "application/json": {
          schema: NotFoundErrorSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(getWorkflowRunDetailsRoute, async c => {
  const { id, runId } = c.req.valid("param");
  const userId = c.get("userId");

  const runIdNum = parseInt(runId, 10);
  if (isNaN(runIdNum)) {
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
      runIdNum
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

const getUpgradeStatusRoute = createRoute({
  method: "get",
  path: "/{id}/upgrade-status",
  tags: ["DEX"],
  summary: "Get upgrade status",
  description: "Check if template updates are available for the DEX",
  security: [{ bearerAuth: [] }],
  request: {
    params: DexIdParamSchema,
  },
  responses: {
    200: {
      description: "Upgrade status retrieved successfully",
      content: {
        "application/json": {
          schema: UpgradeStatusSchema,
        },
      },
    },
    400: {
      description: "Invalid request - DEX does not have a repository",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Unauthorized to access this DEX",
      content: {
        "application/json": {
          schema: UnauthorizedErrorSchema,
        },
      },
    },
    404: {
      description: "DEX not found",
      content: {
        "application/json": {
          schema: NotFoundErrorSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(getUpgradeStatusRoute, async c => {
  const { id } = c.req.valid("param");
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

const upgradeDexRoute = createRoute({
  method: "post",
  path: "/{id}/upgrade",
  tags: ["DEX"],
  summary: "Upgrade DEX",
  description: "Trigger a redeployment of the DEX to apply template updates",
  security: [{ bearerAuth: [] }],
  request: {
    params: DexIdParamSchema,
  },
  responses: {
    200: {
      description: "DEX upgrade triggered successfully",
      content: {
        "application/json": {
          schema: UpgradeSuccessSchema,
        },
      },
    },
    400: {
      description: "Invalid request - DEX does not have a repository",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Unauthorized to access this DEX",
      content: {
        "application/json": {
          schema: UnauthorizedErrorSchema,
        },
      },
    },
    404: {
      description: "DEX not found",
      content: {
        "application/json": {
          schema: NotFoundErrorSchema,
        },
      },
    },
    429: {
      description: "Rate limited - too many requests",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(upgradeDexRoute, async c => {
  const { id } = c.req.valid("param");
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

    const dexForConfig = await withCampaignsMenuEnabledIfCustom(prisma, dex);
    const dexConfig = convertDexToDexConfig(dexForConfig);

    await triggerRedeployment(
      repoInfo.owner,
      repoInfo.repo,
      dexConfig,
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

const setCustomDomainRoute = createRoute({
  method: "post",
  path: "/{id}/custom-domain",
  tags: ["DEX"],
  summary: "Set custom domain",
  description: "Set a custom domain for the DEX",
  security: [{ bearerAuth: [] }],
  request: {
    params: DexIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: CustomDomainSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Custom domain set successfully",
      content: {
        "application/json": {
          schema: CustomDomainSuccessSchema,
        },
      },
    },
    400: {
      description: "Invalid domain format",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(setCustomDomainRoute, async c => {
  const { id } = c.req.valid("param");
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
});

const removeCustomDomainRoute = createRoute({
  method: "delete",
  path: "/{id}/custom-domain",
  tags: ["DEX"],
  summary: "Remove custom domain",
  description: "Remove the custom domain from a DEX",
  security: [{ bearerAuth: [] }],
  request: {
    params: DexIdParamSchema,
  },
  responses: {
    200: {
      description: "Custom domain removed successfully",
      content: {
        "application/json": {
          schema: CustomDomainSuccessSchema,
        },
      },
    },
    400: {
      description: "DEX does not have a custom domain configured",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "User is not authorized to modify this DEX",
      content: {
        "application/json": {
          schema: UnauthorizedErrorSchema,
        },
      },
    },
    404: {
      description: "DEX not found",
      content: {
        "application/json": {
          schema: NotFoundErrorSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(removeCustomDomainRoute, async c => {
  const { id } = c.req.valid("param");
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

const updateBoardVisibilityRoute = createRoute({
  method: "post",
  path: "/{id}/board-visibility",
  tags: ["DEX"],
  summary: "Update board visibility",
  description: "Update whether the DEX appears on the public leaderboard",
  security: [{ bearerAuth: [] }],
  request: {
    params: DexIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: BoardVisibilitySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Board visibility updated successfully",
      content: {
        "application/json": {
          schema: BoardVisibilitySuccessSchema,
        },
      },
    },
    403: {
      description: "Unauthorized to update this DEX",
      content: {
        "application/json": {
          schema: UnauthorizedErrorSchema,
        },
      },
    },
    404: {
      description: "DEX not found",
      content: {
        "application/json": {
          schema: NotFoundErrorSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(updateBoardVisibilityRoute, async c => {
  const { id } = c.req.valid("param");
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
        message: `DEX ${
          showOnBoard ? "will now appear" : "is now hidden"
        } on the public board`,
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
});

const updateSwapFeeRoute = createRoute({
  method: "put",
  path: "/{id}/swap-fee",
  tags: ["DEX"],
  summary: "Update swap fee",
  description:
    "Update the swap fee for a DEX. Accepts JSON body for programmatic/SDK usage.",
  security: [{ bearerAuth: [] }],
  request: {
    params: DexIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: SwapFeeSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Swap fee updated successfully",
      content: {
        "application/json": {
          schema: SwapFeeSuccessSchema,
        },
      },
    },
    400: {
      description: "Invalid request body",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Unauthorized to update this DEX",
      content: {
        "application/json": {
          schema: UnauthorizedErrorSchema,
        },
      },
    },
    404: {
      description: "DEX not found",
      content: {
        "application/json": {
          schema: NotFoundErrorSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(updateSwapFeeRoute, async c => {
  const { id } = c.req.valid("param");
  const userId = c.get("userId");
  const { swapFeeBps } = c.req.valid("json");

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
      data: { swapFeeBps },
    });

    return c.json(
      {
        message: "Swap fee updated successfully",
        dex: updatedDex,
      },
      200
    );
  } catch (error) {
    console.error("Error updating swap fee:", error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update swap fee",
      },
      500
    );
  }
});

export default app;
