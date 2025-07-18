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
} from "../models/dex";
import {
  getWorkflowRunStatus,
  getWorkflowRunDetails,
  updateDexConfig,
} from "../lib/github";
import { z } from "zod";

// Create a router for authenticated routes
const dexRoutes = new Hono();

// Get the current user's DEX
dexRoutes.get("/", async c => {
  try {
    // Get userId from context (set by authMiddleware)
    const userId = c.get("userId");

    // Get the user's DEX
    const dex = await getUserDex(userId);
    if (!dex) {
      return c.json({ exists: false }, { status: 200 });
    }

    // Return the DEX
    return c.json(dex, { status: 200 });
  } catch (error) {
    console.error("Error getting DEX:", error);
    return c.json({ error: "Failed to get DEX information" }, { status: 500 });
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

    // Check if the DEX belongs to the user
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
dexRoutes.post("/", zValidator("form", dexFormSchema), async c => {
  try {
    // Get userId from context (set by authMiddleware)
    const userId = c.get("userId");

    // Get validated form data
    const formData = c.req.valid("form");

    // Convert to internal format
    const data = await convertFormDataToInternal(formData);

    // Create the DEX
    const dex = await createDex(data, userId);

    return c.json(dex, { status: 201 });
  } catch (error) {
    console.error("Error creating DEX:", error);

    let message = "Failed to create DEX";
    if (error instanceof Error) {
      message = error.message;
    }
    return c.json({ error: message }, { status: 500 });
  }
});

// Update an existing DEX
dexRoutes.put("/:id", zValidator("form", dexFormSchema), async c => {
  const id = c.req.param("id");
  const userId = c.get("userId");

  try {
    // Get validated form data
    const formData = c.req.valid("form");

    // Convert to internal format
    const data = await convertFormDataToInternal(formData);

    const updatedDex = await updateDex(id, userId, data);

    if (updatedDex.repoUrl) {
      const repoInfo = extractRepoInfoFromUrl(updatedDex.repoUrl);

      if (repoInfo) {
        try {
          await updateDexConfig(
            repoInfo.owner,
            repoInfo.repo,
            {
              brokerId: updatedDex.brokerId,
              brokerName: updatedDex.brokerName,
              chainIds: updatedDex.chainIds,
              defaultChain: updatedDex.defaultChain || undefined,
              themeCSS: updatedDex.themeCSS?.toString(),
              telegramLink: updatedDex.telegramLink || undefined,
              discordLink: updatedDex.discordLink || undefined,
              xLink: updatedDex.xLink || undefined,
              walletConnectProjectId:
                updatedDex.walletConnectProjectId || undefined,
              privyAppId: updatedDex.privyAppId || undefined,
              privyTermsOfUse: updatedDex.privyTermsOfUse || undefined,
              enabledMenus: updatedDex.enabledMenus || undefined,
              customMenus: updatedDex.customMenus || undefined,
              enableAbstractWallet: updatedDex.enableAbstractWallet,
              disableMainnet: updatedDex.disableMainnet,
              disableTestnet: updatedDex.disableTestnet,
              disableEvmWallets: updatedDex.disableEvmWallets,
              disableSolanaWallets: updatedDex.disableSolanaWallets,
              enableCampaigns: updatedDex.enableCampaigns,
              tradingViewColorConfig:
                updatedDex.tradingViewColorConfig || undefined,
              availableLanguages: updatedDex.availableLanguages,
              seoSiteName: updatedDex.seoSiteName || undefined,
              seoSiteDescription: updatedDex.seoSiteDescription || undefined,
              seoSiteLanguage: updatedDex.seoSiteLanguage || undefined,
              seoSiteLocale: updatedDex.seoSiteLocale || undefined,
              seoTwitterHandle: updatedDex.seoTwitterHandle || undefined,
              seoThemeColor: updatedDex.seoThemeColor || undefined,
              seoKeywords: updatedDex.seoKeywords || undefined,
            },
            {
              primaryLogo: updatedDex.primaryLogo || undefined,
              secondaryLogo: updatedDex.secondaryLogo || undefined,
              favicon: updatedDex.favicon || undefined,
              pnlPosters: updatedDex.pnlPosters || undefined,
            },
            updatedDex.customDomain || undefined
          );

          console.log(
            `Successfully updated repository files for ${updatedDex.brokerName} with a single commit`
          );
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

// Delete a user's DEX
dexRoutes.delete("/:id", async c => {
  const id = c.req.param("id");
  const userId = c.get("userId");

  try {
    const deletedDex = await deleteDex(id, userId);
    return c.json({ message: "DEX deleted successfully", dex: deletedDex });
  } catch (error) {
    console.error("Error deleting DEX:", error);

    if (
      error instanceof Error &&
      error.message.includes("user is not authorized")
    ) {
      return c.json({ message: error.message }, 403);
    }

    if (error instanceof Error && error.message.includes("DEX not found")) {
      return c.json({ message: "DEX not found" }, 404);
    }

    return c.json({ message: "Error deleting DEX", error: String(error) }, 500);
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

// Set a custom domain for a DEX
dexRoutes.post("/:id/custom-domain", async c => {
  const id = c.req.param("id");
  const userId = c.get("userId");

  try {
    const body = await c.req.json();
    const customDomainSchema = z.object({
      domain: z.string().min(1, "Domain is required"),
    });

    const { domain } = customDomainSchema.parse(body);

    const updatedDex = await updateDexCustomDomain(id, domain, userId);
    return c.json(
      {
        message: "Custom domain set successfully",
        dex: updatedDex,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error setting custom domain:", error);

    if (error instanceof Error) {
      if (error.message.includes("DEX not found")) {
        return c.json({ message: "DEX not found" }, { status: 404 });
      }
      if (error.message.includes("User is not authorized")) {
        return c.json({ message: error.message }, { status: 403 });
      }
      if (error.message.includes("Invalid domain format")) {
        return c.json({ message: error.message }, { status: 400 });
      }
      if (error.message.includes("doesn't have a repository URL")) {
        return c.json({ message: error.message }, { status: 400 });
      }
    }

    return c.json(
      {
        message: "Failed to set custom domain",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});

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

export default dexRoutes;
