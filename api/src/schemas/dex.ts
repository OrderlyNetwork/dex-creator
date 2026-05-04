import { z } from "@hono/zod-openapi";
import {
  ErrorResponseSchema,
  DexSchema,
  RateLimitStatusSchema,
} from "./common.js";

// Re-export common schemas for convenience
export { ErrorResponseSchema, DexSchema, RateLimitStatusSchema };

// DEX Response Schemas
export const DexNotFoundResponseSchema = z
  .object({
    exists: z.literal(false).openapi({
      description: "Indicates no DEX exists for this user",
      example: false,
    }),
  })
  .openapi("DexNotFoundResponse");

export const DexResponseSchema = z
  .object({
    id: z.string().openapi({
      description: "DEX ID",
      example: "abc123def456",
    }),
    userId: z.string().openapi({
      description: "User ID",
      example: "user123",
    }),
    brokerId: z.string().openapi({
      description: "Broker ID",
      example: "my-dex",
    }),
    brokerName: z.string().openapi({
      description: "Display name of the DEX",
      example: "My DEX",
    }),
    repoUrl: z.string().nullable().openapi({
      description: "GitHub repository URL",
      example: "https://github.com/user/my-dex",
    }),
    customDomain: z.string().nullable().openapi({
      description: "Custom domain for the DEX",
      example: "dex.example.com",
    }),
    description: z.string().nullable().openapi({
      description: "DEX description",
      example: "A decentralized exchange",
    }),
    banner: z.string().nullable().openapi({
      description: "Banner image URL",
      example: "https://example.com/banner.png",
    }),
    logo: z.string().nullable().openapi({
      description: "Logo image URL",
      example: "https://example.com/logo.png",
    }),
    primaryLogo: z.string().nullable().openapi({
      description: "Primary logo asset URL",
      example: "https://example.com/primary-logo.png",
    }),
    secondaryLogo: z.string().nullable().openapi({
      description: "Secondary logo asset URL",
      example: "https://example.com/secondary-logo.png",
    }),
    favicon: z.string().nullable().openapi({
      description: "Favicon URL",
      example: "https://example.com/favicon.ico",
    }),
    tokenAddress: z.string().nullable().openapi({
      description: "Token contract address",
      example: "0x1234567890123456789012345678901234567890",
    }),
    tokenChain: z.string().nullable().openapi({
      description: "Token blockchain network",
      example: "ethereum",
    }),
    telegramLink: z.string().nullable().openapi({
      description: "Telegram group link",
      example: "https://t.me/mygroup",
    }),
    discordLink: z.string().nullable().openapi({
      description: "Discord invite link",
      example: "https://discord.gg/invite",
    }),
    xLink: z.string().nullable().openapi({
      description: "X (Twitter) profile link",
      example: "https://x.com/mydex",
    }),
    websiteUrl: z.string().nullable().openapi({
      description: "Official website URL",
      example: "https://mydex.com",
    }),
    isGraduated: z.boolean().openapi({
      description: "Whether the DEX has graduated from demo",
      example: false,
    }),
    integrationType: z.string().openapi({
      description:
        "Integration type: 'low_code' for hosted DEX, 'custom' for custom SDK/API integration",
      example: "low_code",
    }),
    showOnBoard: z.boolean().openapi({
      description: "Whether to show on public leaderboard",
      example: true,
    }),
    createdAt: z.string().datetime().openapi({
      description: "Creation timestamp",
      example: "2024-01-01T00:00:00.000Z",
    }),
    updatedAt: z.string().datetime().openapi({
      description: "Last update timestamp",
      example: "2024-01-01T00:00:00.000Z",
    }),
  })
  .openapi("DexResponse");

export const DexExistsResponseSchema = z
  .object({
    exists: z.boolean().openapi({
      description: "Whether the user has a DEX",
      example: true,
    }),
  })
  .openapi({
    description: "DEX existence check response",
  });

export const CreateDexResponseSchema = z
  .object({
    success: z.boolean().openapi({
      description: "Whether the creation was successful",
    }),
    data: DexSchema.optional(),
    error: ErrorResponseSchema.optional(),
  })
  .openapi({
    description: "DEX creation response",
  });

export const UpdateDexResponseSchema = z
  .object({
    success: z.boolean().openapi({
      description: "Whether the update was successful",
    }),
    data: DexSchema.optional(),
    error: ErrorResponseSchema.optional(),
  })
  .openapi({
    description: "DEX update response",
  });

export const DeleteDexResponseSchema = z
  .object({
    message: z.string().openapi({
      description: "Success message",
      example: "DEX deleted successfully",
    }),
    dex: DexSchema.optional(),
  })
  .openapi({
    description: "DEX deletion response",
  });

// Error Schemas
export const ConflictErrorSchema = z
  .object({
    error: z.string().openapi({
      description: "Conflict error message",
      example: "User already has a DEX",
    }),
  })
  .openapi("ConflictError");

export const UnauthorizedErrorSchema = z
  .object({
    message: z.string().openapi({
      description: "Unauthorized error message",
      example: "Unauthorized to access this DEX",
    }),
  })
  .openapi("UnauthorizedError");

export const NotFoundErrorSchema = z
  .object({
    message: z.string().openapi({
      description: "Not found error message",
      example: "DEX not found",
    }),
  })
  .openapi("NotFoundError");

// Parameter Schemas
export const DexIdParamSchema = z.object({
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
});

// Workflow Schemas
export const WorkflowStatusSchema = z
  .object({
    total_count: z.number().int().openapi({
      description: "Total workflow runs",
      example: 10,
    }),
    workflow_runs: z.array(
      z.object({
        id: z.number().int(),
        name: z.string(),
        head_branch: z.string(),
        head_sha: z.string(),
        path: z.string(),
        run_number: z.number().int(),
        event: z.string(),
        status: z.string(),
        conclusion: z.string().nullable(),
        created_at: z.string(),
        updated_at: z.string(),
        html_url: z.string(),
      })
    ),
  })
  .openapi("WorkflowStatus");

export const WorkflowQuerySchema = z.object({
  workflow: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "workflow",
        in: "query",
      },
      description: "Workflow name to filter by",
      example: "deploy.yml",
    }),
});

export const WorkflowRunDetailsSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    head_branch: z.string(),
    head_sha: z.string(),
    run_number: z.number().int(),
    event: z.string(),
    status: z.string(),
    conclusion: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
    html_url: z.string(),
    logs_url: z.string(),
    jobs: z.array(
      z.object({
        id: z.number().int(),
        name: z.string(),
        status: z.string(),
        conclusion: z.string().nullable(),
        started_at: z.string(),
        completed_at: z.string().nullable(),
      })
    ),
  })
  .openapi("WorkflowRunDetails");

// Upgrade Schemas
export const UpgradeStatusSchema = z
  .object({
    hasUpdates: z.boolean().openapi({
      description: "Whether template updates are available",
      example: true,
    }),
    currentVersion: z.string().openapi({
      description: "Current template version",
      example: "v1.0.0",
    }),
    latestVersion: z.string().openapi({
      description: "Latest template version",
      example: "v1.1.0",
    }),
    behindBy: z.number().int().openapi({
      description: "Number of commits behind",
      example: 5,
    }),
  })
  .openapi("UpgradeStatus");

export const UpgradeSuccessSchema = z
  .object({
    message: z.string().openapi({
      description: "Success message",
      example: "DEX upgrade triggered successfully",
    }),
    success: z.boolean().openapi({
      example: true,
    }),
  })
  .openapi("UpgradeSuccess");

// Domain Schemas
export const CustomDomainSchema = z.object({
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
    }, "Domain labels cannot start or end with hyphens")
    .openapi({
      description: "Custom domain to set for the DEX",
      example: "dex.example.com",
    }),
});

export const CustomDomainSuccessSchema = z
  .object({
    message: z.string().openapi({
      description: "Success message",
      example: "Custom domain set successfully",
    }),
    dex: DexResponseSchema,
  })
  .openapi("CustomDomainSuccess");

// Board Visibility Schemas
export const BoardVisibilitySchema = z.object({
  showOnBoard: z.boolean().openapi({
    description: "Whether to show the DEX on the public leaderboard",
    example: true,
  }),
});

export const BoardVisibilitySuccessSchema = z
  .object({
    message: z.string().openapi({
      description: "Success message",
      example: "DEX will now appear on the public board",
    }),
    dex: DexResponseSchema,
  })
  .openapi("BoardVisibilitySuccess");

// Swap Fee Schemas
export const SwapFeeSchema = z.object({
  swapFeeBps: z.number().int().min(0).max(100).nullable().openapi({
    description: "Swap fee in basis points (0-100). Set to null to remove.",
    example: 30,
  }),
});

export const SwapFeeSuccessSchema = z
  .object({
    message: z.string().openapi({
      description: "Success message",
      example: "Swap fee updated successfully",
    }),
    dex: DexResponseSchema,
  })
  .openapi("SwapFeeSuccess");

// Social Card Schemas
export const SocialCardUpdateSchema = z
  .object({
    message: z.string().openapi({
      description: "Success message",
      example: "Social card information updated successfully",
    }),
    dex: z.object({
      id: z.string(),
      description: z.string().nullable(),
      banner: z.string().nullable(),
      logo: z.string().nullable(),
      tokenAddress: z.string().nullable(),
      tokenChain: z.string().nullable(),
      telegramLink: z.string().nullable(),
      discordLink: z.string().nullable(),
      xLink: z.string().nullable(),
      websiteUrl: z.string().nullable(),
    }),
  })
  .openapi("SocialCardUpdate");

// Network Schemas
export const NetworkSchema = z
  .object({
    id: z.string().openapi({
      description: "Network ID",
      example: "eth",
    }),
    type: z.string().openapi({
      description: "Network type",
      example: "network",
    }),
    attributes: z.object({
      name: z.string().openapi({
        description: "Network name",
        example: "Ethereum",
      }),
      coingecko_asset_platform_id: z.string().nullable().openapi({
        description: "CoinGecko asset platform ID",
      }),
    }),
  })
  .openapi({
    description: "Network object",
  });

export const NetworksResponseSchema = z
  .object({
    data: z.array(NetworkSchema),
  })
  .openapi({
    description: "Networks list response",
  });

// Delete success schema that matches the route's expected response
export const DeleteSuccessSchema = z
  .object({
    message: z.string().openapi({
      description: "Success message",
      example: "DEX deleted successfully",
    }),
    dex: DexResponseSchema,
  })
  .openapi("DeleteSuccess");

// Legacy schema exports for backwards compatibility
export const CustomDomainResponseSchema = CustomDomainSuccessSchema;
export const BoardVisibilityResponseSchema = BoardVisibilitySuccessSchema;
export const SocialCardResponseSchema = SocialCardUpdateSchema;
