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

// Get current file's directory (ES module replacement for __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* eslint-disable @typescript-eslint/no-explicit-any */
// Simple in-memory cache for ETags
const etagCache = new Map<string, { etag: string; data: any }>();
let cacheHits = 0;
let cacheMisses = 0;

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

// Initialize Octokit with GitHub token and plugins
const MyOctokit = Octokit.plugin(restEndpointMethods);
const octokit = new MyOctokit({
  auth: process.env.GITHUB_TOKEN,
});

// Helper function to generate a consistent cache key from request options
function getCacheKey(options: any): string {
  // For URL templates like '/repos/{owner}/{repo}'
  // Try to replace placeholders with their actual values
  let url = options.url;

  if (url) {
    url = url.replace(/{([^}]+)}/g, (_: any, key: string) => {
      return options[key] ?? `{${key}}`;
    });
  }

  // For REST API methods, reconstruct the full URL
  if (options.method && options.baseUrl && options.url) {
    return `${options.method} ${options.baseUrl}${url}`;
  }

  // For direct request() calls
  if (typeof options === "string") {
    return options;
  }

  // Fallback for other scenarios
  return `${options.method || "GET"} ${options.url || ""}:${JSON.stringify(options.params || {})}`;
}

// Register hooks for ETag caching
octokit.hook.before("request", async options => {
  try {
    // Only apply caching for GET requests to conserve memory
    if (options.method !== "GET") {
      return;
    }

    const cacheKey = getCacheKey(options);
    const cachedItem = etagCache.get(cacheKey);

    // Add If-None-Match header if we have a cached ETag
    if (cachedItem) {
      // Initialize headers with required properties if not present
      if (!options.headers) {
        options.headers = {
          accept: "application/vnd.github.v3+json",
          "user-agent": "orderly-dex-creator",
        };
      } else {
        // Ensure required properties exist
        options.headers.accept =
          options.headers.accept || "application/vnd.github.v3+json";
        options.headers["user-agent"] =
          options.headers["user-agent"] || "orderly-dex-creator";
      }

      options.headers["If-None-Match"] = cachedItem.etag;
      console.log(`[GitHub ETag] Using cached ETag for ${cacheKey}`);
    }
  } catch (error) {
    console.error("[GitHub ETag] Error in before hook:", error);
  }
});

octokit.hook.after("request", async (response, options) => {
  try {
    // Only cache GET requests
    if (options.method !== "GET") {
      return;
    }

    const cacheKey = getCacheKey(options);

    // Store the ETag if present in the response
    if (response.headers?.etag) {
      etagCache.set(cacheKey, {
        etag: response.headers.etag,
        data: response.data,
      });
      cacheMisses++;
      console.log(
        `[GitHub ETag] Cache MISS for ${cacheKey} - stored ETag: ${response.headers.etag}`
      );
    }
  } catch (error) {
    console.error("[GitHub ETag] Error in after hook:", error);
  }
});

// Type guard for RequestError
function isRequestError(
  error: Error | any
): error is { status: number; response?: { headers?: any; url?: string } } {
  return error && typeof error === "object" && "status" in error;
}

octokit.hook.error("request", async (error, options) => {
  try {
    // Ensure we're dealing with a RequestError before accessing status/response
    if (isRequestError(error)) {
      // Check if this is a 304 Not Modified response, which is what we're expecting for cached resources
      if (error.status === 304) {
        // Only handle 304 responses for GET requests
        if (options.method !== "GET") {
          throw error;
        }

        const cacheKey = getCacheKey(options);
        const cachedItem = etagCache.get(cacheKey);

        // If we have a cached response for a 304, return it
        if (cachedItem) {
          cacheHits++;
          console.log(
            `[GitHub ETag] Cache HIT for ${cacheKey} - using cached data`
          );

          // Return a successful response with cached data
          return {
            data: cachedItem.data,
            headers: { ...error.response?.headers, "x-cached": "true" },
            status: 200,
            url: error.response?.url,
          };
        }
      }

      // Log other errors (but not for debugging purposes)
      console.error(
        `[GitHub ETag] Error for ${getCacheKey(options)}:`,
        error.status,
        error.message
      );
    } else {
      // Not a RequestError
      console.error(
        `[GitHub ETag] Error for ${getCacheKey(options)}:`,
        error instanceof Error ? error.message : String(error)
      );
    }

    // Re-throw the error regardless of type
    throw error;
  } catch (hookError) {
    console.error("[GitHub ETag] Error in error hook:", hookError);
    throw error; // Still throw the original error
  }
});
/* eslint-enable @typescript-eslint/no-explicit-any */

// Template repository information
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
): Promise<string> {
  try {
    // Validate repository name
    if (!repoName || repoName.trim() === "") {
      throw new Error("Repository name cannot be empty");
    }

    // GitHub has specific repo name requirements
    if (!/^[a-z0-9-]+$/i.test(repoName)) {
      throw new Error(
        "Repository name can only contain alphanumeric characters and hyphens"
      );
    }

    // GitHub has a 100 character limit for repo names
    if (repoName.length > 100) {
      throw new Error(
        "Repository name exceeds GitHub's maximum length of 100 characters"
      );
    }

    console.log(
      `Forking repository ${templateOwner}/${templateRepoName} to OrderlyNetworkDexCreator/${repoName}`
    );

    // Organization to create the fork in
    const orgName = "OrderlyNetworkDexCreator";

    // Use GitHub's native fork functionality
    const response = await octokit.rest.repos.createFork({
      owner: templateOwner,
      repo: templateRepoName,
      organization: orgName,
      name: repoName,
    });

    const repoUrl = response.data.html_url;
    console.log(`Successfully forked repository: ${repoUrl}`);

    // GitHub forks happen asynchronously, so the fork might not be immediately available
    // We'll wait for a few seconds to ensure the fork is created
    console.log("Waiting for fork to be fully created...");
    await new Promise(resolve => setTimeout(resolve, 5_000));

    // Enable GitHub Actions on the forked repository
    await enableRepositoryActions(orgName, repoName);

    // Add GitHub Pages deployment token as a secret if available
    const deploymentToken = process.env.PAGES_DEPLOYMENT_TOKEN;
    if (deploymentToken) {
      try {
        await addSecretToRepository(
          orgName,
          repoName,
          "PAGES_DEPLOYMENT_TOKEN",
          deploymentToken
        );
        console.log(
          `Added PAGES_DEPLOYMENT_TOKEN secret to ${orgName}/${repoName}`
        );
      } catch (secretError) {
        console.error(
          "Error adding GitHub Pages deployment token secret:",
          secretError
        );
        // Continue even if adding the secret fails - we don't want to fail the fork operation
      }
    } else {
      console.warn("PAGES_DEPLOYMENT_TOKEN not found in environment variables");
      console.warn("GitHub Pages deployment may not work without this token");
    }

    // Enable GitHub Pages on the repository
    try {
      await enableGitHubPages(orgName, repoName);
      console.log(`Enabled GitHub Pages for ${orgName}/${repoName}`);
    } catch (pagesError) {
      console.error("Error enabling GitHub Pages:", pagesError);
      // Continue even if enabling GitHub Pages fails
    }

    return repoUrl;
  } catch (error: unknown) {
    console.error("Error forking repository:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to fork repository: ${errorMessage}`);
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
    // First, enable Actions on the repository
    await octokit.rest.actions.setGithubActionsPermissionsRepository({
      owner,
      repo,
      enabled: true,
      allowed_actions: "all",
    });

    // Then, enable all workflows
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

    // Get the repository's public key for encrypting secrets
    console.log(`Fetching public key for ${owner}/${repo}...`);
    const { data: publicKeyData } = await octokit.rest.actions.getRepoPublicKey(
      {
        owner,
        repo,
      }
    );

    console.log(`Received public key: ${publicKeyData.key}`);

    // Encrypt the secret using the repository's public key
    const encryptedValue = await encryptSecret(publicKeyData.key, secretValue);

    // Add the encrypted secret to the repository
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
    // Ensure sodium is ready
    await sodium.ready;

    console.log("Processing public key:", publicKey);

    // Ensure the key has correct base64 padding if needed
    let normalizedKey = publicKey;
    if (publicKey.length % 4 !== 0) {
      const padding = 4 - (publicKey.length % 4);
      normalizedKey = publicKey + "=".repeat(padding);
      console.log("Added padding to key:", normalizedKey);
    }

    const buffer = Buffer.from(normalizedKey, "base64");
    const publicKeyBinary = new Uint8Array(buffer);

    // GitHub requires keys to be 32 bytes (256 bits)
    if (publicKeyBinary.length !== 32) {
      console.error(
        `Invalid key length: ${publicKeyBinary.length} bytes, expected 32 bytes`
      );
      throw new Error("Invalid key length for GitHub encryption");
    }

    // Convert the secret value to a binary buffer
    const secretBinary = sodium.from_string(secretValue);

    // Encrypt the secret using the public key
    const encryptedBinary = sodium.crypto_box_seal(
      secretBinary,
      publicKeyBinary
    );

    // Convert the encrypted value to standard base64 for GitHub API
    // (NOT URL-safe base64 which uses - and _)
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
function extractImageDataFromUri(dataUri: string | undefined): Buffer | null {
  if (!dataUri) return null;

  try {
    // Format is typically: data:image/webp;base64,BASE64_DATA
    const match = dataUri.match(/^data:image\/([^;]+);base64,(.+)$/);
    if (!match || !match[2]) {
      console.warn("Invalid data URI format for image");
      return null;
    }

    // Convert base64 to binary buffer
    return Buffer.from(match[2], "base64");
  } catch (error) {
    console.error("Error extracting image data from URI:", error);
    return null;
  }
}

/**
 * Prepare DEX configuration content including extracting favicon
 */
function prepareDexConfigContent(
  config: {
    brokerId: string;
    brokerName: string;
    themeCSS?: string;
    telegramLink?: string;
    discordLink?: string;
    xLink?: string;
  },
  files?: {
    primaryLogo?: string;
    secondaryLogo?: string;
    favicon?: string;
  }
): {
  envContent: string;
  themeCSS?: string;
  faviconData?: Buffer;
  primaryLogoData?: Buffer;
  secondaryLogoData?: Buffer;
} {
  // Extract image data
  const faviconData = extractImageDataFromUri(files?.favicon);
  const primaryLogoData = extractImageDataFromUri(files?.primaryLogo);
  const secondaryLogoData = extractImageDataFromUri(files?.secondaryLogo);

  // Create ENV file content
  let envContent = `# Broker settings
VITE_ORDERLY_BROKER_ID=${config.brokerId}
VITE_ORDERLY_BROKER_NAME=${config.brokerName}

# Meta tags
VITE_APP_NAME=${config.brokerName}
VITE_APP_DESCRIPTION=${config.brokerName} - A DEX powered by Orderly Network

# Social Media Links
VITE_TELEGRAM_URL=${config.telegramLink || ""}
VITE_DISCORD_URL=${config.discordLink || ""}
VITE_TWITTER_URL=${config.xLink || ""}

# Logo flags - indicates if logos have been set
VITE_HAS_PRIMARY_LOGO=${primaryLogoData ? "true" : "false"}
VITE_HAS_SECONDARY_LOGO=${secondaryLogoData ? "true" : "false"}`;

  return {
    envContent,
    themeCSS: config.themeCSS,
    faviconData: faviconData || undefined,
    primaryLogoData: primaryLogoData || undefined,
    secondaryLogoData: secondaryLogoData || undefined,
  };
}

/**
 * Helper function to create a single commit with multiple file changes
 * @param owner The repository owner (username or organization)
 * @param repo The repository name
 * @param fileContents Map of file paths to their contents
 * @param binaryFiles Map of file paths to their binary contents
 * @param commitMessage The commit message
 */
async function createSingleCommit(
  owner: string,
  repo: string,
  fileContents: Map<string, string>,
  binaryFiles: Map<string, Buffer> = new Map(),
  commitMessage: string
): Promise<void> {
  // Get the latest commit SHA from the default branch
  console.log(`Getting latest commit for ${owner}/${repo}...`);
  const { data: refData } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: "heads/main",
  });
  const latestCommitSha = refData.object.sha;

  // Create blobs for text files
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

  // Create blobs for binary files
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

  // Wait for all blobs to be created
  const textBlobs = await Promise.all(textBlobPromises);
  const binaryBlobs = await Promise.all(binaryBlobPromises);

  // Combine all blobs into tree entries
  const treeEntries = [
    ...textBlobs.map(({ path, sha }) => ({
      path,
      mode: "100644" as const, // file mode (100644 = file)
      type: "blob" as const,
      sha,
    })),
    ...binaryBlobs.map(({ path, sha }) => ({
      path,
      mode: "100644" as const, // file mode (100644 = file)
      type: "blob" as const,
      sha,
    })),
  ];

  // Create a tree with all files
  console.log("Creating git tree with all files...");
  const { data: newTree } = await octokit.rest.git.createTree({
    owner,
    repo,
    base_tree: latestCommitSha,
    tree: treeEntries,
  });

  // Create a commit
  console.log("Creating commit with all files...");
  const { data: newCommit } = await octokit.rest.git.createCommit({
    owner,
    repo,
    message: commitMessage,
    tree: newTree.sha,
    parents: [latestCommitSha],
  });

  // Update the reference
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
 * Updates DEX configuration files in the repository using a single commit
 */
export async function updateDexConfig(
  owner: string,
  repo: string,
  config: {
    brokerId: string;
    brokerName: string;
    themeCSS?: string;
    telegramLink?: string;
    discordLink?: string;
    xLink?: string;
  },
  files?: {
    primaryLogo?: string;
    secondaryLogo?: string;
    favicon?: string;
  }
): Promise<void> {
  try {
    // Use the helper function to prepare config content
    const {
      envContent,
      themeCSS,
      faviconData,
      primaryLogoData,
      secondaryLogoData,
    } = prepareDexConfigContent(config, files);

    // Prepare file contents map for text files
    const fileContents = new Map<string, string>();
    fileContents.set(".env", envContent);

    if (themeCSS) {
      fileContents.set("app/styles/theme.css", themeCSS);
    }

    // Prepare binary files map
    const binaryFiles = new Map<string, Buffer>();

    // Add image files if data is available
    if (faviconData) {
      binaryFiles.set("public/favicon.webp", faviconData);
    }

    // Add logo files if data is available
    if (primaryLogoData) {
      binaryFiles.set("public/logo.webp", primaryLogoData);
    }

    if (secondaryLogoData) {
      binaryFiles.set("public/logo-secondary.webp", secondaryLogoData);
    }

    // Create a single commit with all changes
    await createSingleCommit(
      owner,
      repo,
      fileContents,
      binaryFiles,
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

  // Configure GitHub Pages with GitHub Actions deployment
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
  config: {
    brokerId: string;
    brokerName: string;
    themeCSS?: string;
    telegramLink?: string;
    discordLink?: string;
    xLink?: string;
  },
  files: {
    primaryLogo?: string;
    secondaryLogo?: string;
    favicon?: string;
  }
): Promise<void> {
  console.log(`Setting up repository ${owner}/${repo} with a single commit...`);

  try {
    // Path to workflow files
    const workflowsDir = path.resolve(__dirname, "../workflows");

    // Check if workflows directory exists
    if (!fs.existsSync(workflowsDir)) {
      throw new Error(`Workflows directory not found at ${workflowsDir}`);
    }

    // Read workflow files
    const deployYmlContent = fs.readFileSync(
      path.join(workflowsDir, "deploy.yml"),
      "utf-8"
    );
    const syncForkYmlContent = fs.readFileSync(
      path.join(workflowsDir, "sync-fork.yml"),
      "utf-8"
    );

    // Use the helper function to prepare config content
    const {
      envContent,
      themeCSS,
      faviconData,
      primaryLogoData,
      secondaryLogoData,
    } = prepareDexConfigContent(config, files);

    // Prepare file contents map for text files
    const fileContents = new Map<string, string>();
    fileContents.set(".github/workflows/deploy.yml", deployYmlContent);
    fileContents.set(".github/workflows/sync-fork.yml", syncForkYmlContent);
    fileContents.set(".env", envContent);

    if (themeCSS) {
      fileContents.set("app/styles/theme.css", themeCSS);
    }

    // Prepare binary files map
    const binaryFiles = new Map<string, Buffer>();

    // Add image files if data is available
    if (faviconData) {
      binaryFiles.set("public/favicon.webp", faviconData);
    }

    // Add logo files if data is available
    if (primaryLogoData) {
      binaryFiles.set("public/logo.webp", primaryLogoData);
    }

    if (secondaryLogoData) {
      binaryFiles.set("public/logo-secondary.webp", secondaryLogoData);
    }

    // Create a single commit with all changes
    await createSingleCommit(
      owner,
      repo,
      fileContents,
      binaryFiles,
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
    console.log(`Fetching workflow runs for ${owner}/${repo}...`);

    // First, try to get workflows to check if they exist
    const { data: workflows } = await octokit.rest.actions.listRepoWorkflows({
      owner,
      repo,
    });

    if (workflows.total_count === 0) {
      console.log(`No workflows found in ${owner}/${repo}`);
      return { totalCount: 0, workflowRuns: [] };
    }

    // If a specific workflow name is provided, find its ID
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

    // Get workflow runs, either for all workflows or a specific one
    // Use separate logic for with/without workflow_id to satisfy TypeScript
    if (workflowId) {
      const { data: runs } = await octokit.rest.actions.listWorkflowRuns({
        owner,
        repo,
        per_page: 10,
        workflow_id: workflowId,
      });

      // Format the response with proper type assertions
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
      // Get runs for all workflows
      const { data: runs } = await octokit.rest.actions.listWorkflowRunsForRepo(
        {
          owner,
          repo,
          per_page: 10,
        }
      );

      // Format the response with proper type assertions
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

// Add a function to get detailed info for a specific workflow run
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

    // Get the run details
    const { data: run } = await octokit.rest.actions.getWorkflowRun({
      owner,
      repo,
      run_id: runId,
    });

    // Get jobs for this run
    const { data: jobsData } =
      await octokit.rest.actions.listJobsForWorkflowRun({
        owner,
        repo,
        run_id: runId,
      });

    // Format the jobs data with proper type checking
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
