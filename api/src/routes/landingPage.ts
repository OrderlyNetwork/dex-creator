import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getPrisma } from "../lib/prisma";
import {
  getUserLandingPage,
  getLandingPageById,
  createLandingPage,
  updateLandingPage,
  deleteLandingPage,
  deployLandingPage,
  updateLandingPageCustomDomain,
  removeLandingPageCustomDomain,
  processLandingPageFormData,
} from "../models/landingPage";
import { LandingPageErrorType } from "../lib/types";
import { landingPageAgent } from "../mastra/agents/landingPageAgent";

const landingPageRoutes = new Hono();

const landingPageConfigSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters"),
  subtitle: z
    .string()
    .max(500, "Subtitle cannot exceed 500 characters")
    .optional(),
  aiDescription: z
    .string()
    .max(2000, "AI description cannot exceed 2000 characters")
    .optional(),
  theme: z.enum(["light", "dark"]).default("dark"),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format")
    .default("#000000"),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format")
    .default("#ffffff"),
  fontFamily: z
    .string()
    .max(100, "Font family cannot exceed 100 characters")
    .default("sans-serif"),
  languages: z
    .array(z.string())
    .min(1, "At least one language must be selected")
    .default(["en"]),
  // CTA Customization
  ctaButtonText: z
    .string()
    .max(50, "CTA button text cannot exceed 50 characters")
    .default("Start Trading"),
  ctaButtonColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format")
    .optional(),
  useCustomCtaColor: z.boolean().default(false),
  ctaPlacement: z.enum(["hero", "footer", "both"]).default("both"),
  // Section Templates
  enabledSections: z
    .array(
      z.enum([
        "hero",
        "features",
        "feeStructure",
        "faq",
        "team",
        "contact",
        "socials",
        "about",
      ])
    )
    .default(["hero", "features", "contact"]),
  // Social Media Links
  telegramLink: z
    .string()
    .url("Invalid Telegram URL")
    .max(200, "Telegram link cannot exceed 200 characters")
    .optional()
    .or(z.literal("")),
  discordLink: z
    .string()
    .url("Invalid Discord URL")
    .max(200, "Discord link cannot exceed 200 characters")
    .optional()
    .or(z.literal("")),
  xLink: z
    .string()
    .url("Invalid X (Twitter) URL")
    .max(200, "X link cannot exceed 200 characters")
    .optional()
    .or(z.literal("")),
  // Content Prompts
  problemStatement: z
    .string()
    .max(500, "Problem statement cannot exceed 500 characters")
    .optional(),
  uniqueValue: z
    .string()
    .max(500, "Unique value cannot exceed 500 characters")
    .optional(),
  targetAudience: z
    .string()
    .max(500, "Target audience cannot exceed 500 characters")
    .optional(),
  keyFeatures: z.array(z.string()).default([]),
  faqItems: z
    .array(
      z.object({
        question: z.string().min(1, "Question is required"),
        answer: z.string().min(1, "Answer is required"),
      })
    )
    .default([]),
  sections: z
    .array(
      z.object({
        type: z.enum(["hero", "features", "about", "contact", "custom"]),
        content: z.record(z.string(), z.any()),
        order: z.number().min(0),
      })
    )
    .default([]),
  metadata: z
    .object({
      description: z
        .string()
        .max(300, "Description cannot exceed 300 characters")
        .optional(),
      keywords: z.array(z.string()).default([]),
      favicon: z.string().url().optional(),
    })
    .optional(),
});

const generatePromptSchema = z.object({
  prompt: z
    .string()
    .max(2000, "Prompt cannot exceed 2000 characters")
    .optional(),
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

const updateLandingPageSchema = z.object({
  htmlContent: z.string().optional(),
  config: landingPageConfigSchema.optional(),
});

// Landing page form schema - config fields are flattened
const landingPageFormSchema = landingPageConfigSchema.extend({
  primaryLogo: z.instanceof(File).optional(),
  secondaryLogo: z.instanceof(File).optional(),
  banner: z.instanceof(File).optional(),
});

landingPageRoutes.get("/", async c => {
  try {
    const userId = c.get("userId");
    const landingPage = await getUserLandingPage(userId);

    if (!landingPage) {
      return c.json({ exists: false }, { status: 200 });
    }

    return c.json(landingPage, { status: 200 });
  } catch (error) {
    console.error("Error getting landing page:", error);
    return c.json(
      { error: "Failed to get landing page information" },
      { status: 500 }
    );
  }
});

// Get a specific landing page by ID
landingPageRoutes.get("/:id", async c => {
  const id = c.req.param("id");
  const userId = c.get("userId");

  try {
    const landingPage = await getLandingPageById(id);

    if (!landingPage) {
      return c.json({ message: "Landing page not found" }, 404);
    }

    if (landingPage.userId !== userId) {
      return c.json(
        { message: "Unauthorized to access this landing page" },
        403
      );
    }

    return c.json(landingPage);
  } catch (error) {
    console.error("Error fetching landing page:", error);
    return c.json(
      { message: "Error fetching landing page", error: String(error) },
      500
    );
  }
});

landingPageRoutes.post(
  "/",
  zValidator("form", landingPageFormSchema),
  async c => {
    try {
      const userId = c.get("userId");

      // Get raw FormData to process images
      const rawFormData = await c.req.formData();
      const { config, images } = await processLandingPageFormData(rawFormData);

      const result = await createLandingPage(userId, config);

      if (!result.success) {
        switch (result.error.type) {
          case LandingPageErrorType.USER_ALREADY_HAS_LANDING_PAGE:
            return c.json({ error: result.error.message }, { status: 409 });
          case LandingPageErrorType.USER_NOT_FOUND:
            return c.json({ error: result.error.message }, { status: 404 });
          case LandingPageErrorType.REPOSITORY_CREATION_FAILED:
          case LandingPageErrorType.DATABASE_ERROR:
            return c.json({ error: result.error.message }, { status: 500 });
          default:
            return c.json({ error: result.error.message }, { status: 500 });
        }
      }

      return c.json(result.data, { status: 201 });
    } catch (error) {
      console.error("Error creating landing page:", error);
      return c.json(
        {
          error: "Internal server error",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  }
);

landingPageRoutes.put("/:id", async c => {
  const id = c.req.param("id");
  const userId = c.get("userId");

  try {
    const contentType = c.req.header("content-type") || "";
    const updatePayload: {
      htmlContent?: string;
      config?: Prisma.InputJsonValue;
      repoUrl?: string;
      customDomain?: string;
    } = {};

    // Handle multipart/form-data (with images)
    if (contentType.includes("multipart/form-data")) {
      const rawFormData = await c.req.formData();
      const { config } = await processLandingPageFormData(rawFormData);
      updatePayload.config = config;
    } else {
      // Handle JSON (for backward compatibility and generate endpoint)
      const jsonData = await c.req.json();
      if (jsonData.htmlContent !== undefined) {
        updatePayload.htmlContent = jsonData.htmlContent;
      }
      if (jsonData.config !== undefined) {
        updatePayload.config = jsonData.config as Prisma.InputJsonValue;
      }
    }

    const result = await updateLandingPage(id, userId, updatePayload);

    if (!result.success) {
      switch (result.error.type) {
        case LandingPageErrorType.LANDING_PAGE_NOT_FOUND:
          return c.json({ message: result.error.message }, { status: 404 });
        case LandingPageErrorType.USER_NOT_AUTHORIZED:
          return c.json({ message: result.error.message }, { status: 403 });
        case LandingPageErrorType.DATABASE_ERROR:
          return c.json({ error: result.error.message }, { status: 500 });
        default:
          return c.json({ error: result.error.message }, { status: 500 });
      }
    }

    return c.json(result.data);
  } catch (error) {
    console.error("Error updating landing page:", error);
    return c.json(
      { message: "Error updating landing page", error: String(error) },
      500
    );
  }
});

landingPageRoutes.delete("/:id", async c => {
  const id = c.req.param("id");
  const userId = c.get("userId");

  try {
    const result = await deleteLandingPage(id, userId);

    if (!result.success) {
      switch (result.error.type) {
        case LandingPageErrorType.LANDING_PAGE_NOT_FOUND:
          return c.json({ message: result.error.message }, { status: 404 });
        case LandingPageErrorType.USER_NOT_AUTHORIZED:
          return c.json({ message: result.error.message }, { status: 403 });
        case LandingPageErrorType.DATABASE_ERROR:
          return c.json(
            {
              message: "Error deleting landing page",
              error: result.error.message,
            },
            { status: 500 }
          );
        default:
          return c.json(
            {
              message: "Error deleting landing page",
              error: result.error.message,
            },
            { status: 500 }
          );
      }
    }

    return c.json({
      message: "Landing page deleted successfully",
      landingPage: result.data,
    });
  } catch (error) {
    console.error("Error deleting landing page:", error);
    return c.json(
      { message: "Internal server error", error: String(error) },
      500
    );
  }
});

landingPageRoutes.post(
  "/:id/generate",
  zValidator("json", generatePromptSchema),
  async c => {
    const id = c.req.param("id");
    const userId = c.get("userId");
    const { prompt } = c.req.valid("json");

    try {
      const prisma = await getPrisma();

      const existingPage = await prisma.landingPage.findUnique({
        where: { id },
      });

      if (!existingPage) {
        return c.json({ message: "Landing page not found" }, 404);
      }

      if (existingPage.userId !== userId) {
        return c.json(
          { message: "Unauthorized to generate content for this landing page" },
          403
        );
      }

      const config = existingPage.config as Record<string, unknown> | null;

      // Build prompt from config and user prompt
      let configPrompt = "";
      if (config) {
        const title = config.title ? `Title: ${config.title}` : "";
        const subtitle = config.subtitle ? `Subtitle: ${config.subtitle}` : "";
        const aiDesc = config.aiDescription
          ? `AI Description: ${config.aiDescription}`
          : "";
        const theme = config.theme ? `Default Theme: ${config.theme}` : "";
        const primaryColor = config.primaryColor
          ? `Primary Color: ${config.primaryColor}`
          : "";
        const secondaryColor = config.secondaryColor
          ? `Secondary Color: ${config.secondaryColor}`
          : "";
        const linkColor = config.linkColor
          ? `Link Color: ${config.linkColor}`
          : "";
        const fontFamily = config.fontFamily
          ? `Font Family: ${config.fontFamily}`
          : "";
        const languages = config.languages
          ? `Supported Languages: ${(config.languages as string[]).join(", ")}`
          : "";

        // CTA Customization
        const ctaText = config.ctaButtonText
          ? `CTA Button Text: ${config.ctaButtonText}`
          : "";
        const ctaColor = config.ctaButtonColor
          ? `CTA Button Color: ${config.ctaButtonColor}`
          : "";
        const ctaPlacement = config.ctaPlacement
          ? `CTA Placement: ${config.ctaPlacement} (hero, footer, or both)`
          : "";

        // Section Templates
        const enabledSections = config.enabledSections
          ? `Enabled Sections: ${(config.enabledSections as string[]).join(", ")}`
          : "";

        // Social Media Links
        const telegramLink = config.telegramLink
          ? `Telegram Link: ${config.telegramLink}`
          : "";
        const discordLink = config.discordLink
          ? `Discord Link: ${config.discordLink}`
          : "";
        const xLink = config.xLink ? `X (Twitter) Link: ${config.xLink}` : "";

        // Content Prompts
        const problemStatement = config.problemStatement
          ? `Problem Statement: ${config.problemStatement}`
          : "";
        const uniqueValue = config.uniqueValue
          ? `Unique Value Proposition: ${config.uniqueValue}`
          : "";
        const targetAudience = config.targetAudience
          ? `Target Audience: ${config.targetAudience}`
          : "";
        const keyFeatures =
          config.keyFeatures &&
          Array.isArray(config.keyFeatures) &&
          config.keyFeatures.length > 0
            ? `Key Features: ${(config.keyFeatures as string[]).join(", ")}`
            : "";

        // FAQ Items
        const faqItems =
          config.faqItems &&
          Array.isArray(config.faqItems) &&
          config.faqItems.length > 0
            ? `FAQ Items:\n${(
                config.faqItems as Array<{ question: string; answer: string }>
              )
                .map(
                  (item, index) =>
                    `  ${index + 1}. Q: ${item.question}\n     A: ${item.answer}`
                )
                .join("\n")}`
            : "";

        // Fee Structure
        const makerFee =
          config.makerFee !== undefined ? `Maker Fee: ${config.makerFee}%` : "";
        const takerFee =
          config.takerFee !== undefined ? `Taker Fee: ${config.takerFee}%` : "";
        const rwaMakerFee =
          config.rwaMakerFee !== undefined
            ? `RWA Maker Fee: ${config.rwaMakerFee}%`
            : "";
        const rwaTakerFee =
          config.rwaTakerFee !== undefined
            ? `RWA Taker Fee: ${config.rwaTakerFee}%`
            : "";

        // Team Members
        const teamMembers =
          config.teamMembers &&
          Array.isArray(config.teamMembers) &&
          config.teamMembers.length > 0
            ? `Team Members: ${(config.teamMembers as string[]).join(", ")}`
            : "";

        // Contact Methods
        const contactMethods =
          config.contactMethods &&
          Array.isArray(config.contactMethods) &&
          config.contactMethods.length > 0
            ? `Contact Methods: ${(config.contactMethods as string[]).join(", ")}`
            : "";

        // Image Metadata (paths and dimensions for AI, not actual image data)
        const primaryLogoImage =
          config.primaryLogoImage && typeof config.primaryLogoImage === "object"
            ? `Primary Logo Image: Available at ${(config.primaryLogoImage as { path: string; width: number; height: number }).path} (${(config.primaryLogoImage as { path: string; width: number; height: number }).width}x${(config.primaryLogoImage as { path: string; width: number; height: number }).height}px)`
            : "";
        const secondaryLogoImage =
          config.secondaryLogoImage &&
          typeof config.secondaryLogoImage === "object"
            ? `Secondary Logo Image: Available at ${(config.secondaryLogoImage as { path: string; width: number; height: number }).path} (${(config.secondaryLogoImage as { path: string; width: number; height: number }).width}x${(config.secondaryLogoImage as { path: string; width: number; height: number }).height}px)`
            : "";
        const bannerImage =
          config.bannerImage && typeof config.bannerImage === "object"
            ? `Banner Image: Available at ${(config.bannerImage as { path: string; width: number; height: number }).path} (${(config.bannerImage as { path: string; width: number; height: number }).width}x${(config.bannerImage as { path: string; width: number; height: number }).height}px)`
            : "";

        // SEO Metadata
        const metaDescription =
          config.metadata &&
          (config.metadata as Record<string, unknown>).description
            ? `Meta Description: ${(config.metadata as Record<string, unknown>).description}`
            : "";
        const metaKeywords =
          config.metadata &&
          (config.metadata as Record<string, unknown>).keywords &&
          Array.isArray((config.metadata as Record<string, unknown>).keywords)
            ? `Meta Keywords: ${((config.metadata as Record<string, unknown>).keywords as string[]).join(", ")}`
            : "";

        const configParts = [
          title,
          subtitle,
          aiDesc,
          theme,
          primaryColor,
          secondaryColor,
          linkColor,
          fontFamily,
          languages,
          ctaText,
          ctaColor,
          ctaPlacement,
          enabledSections,
          telegramLink,
          discordLink,
          xLink,
          problemStatement,
          uniqueValue,
          targetAudience,
          keyFeatures,
          faqItems,
          makerFee,
          takerFee,
          rwaMakerFee,
          rwaTakerFee,
          teamMembers,
          contactMethods,
          primaryLogoImage,
          secondaryLogoImage,
          bannerImage,
          metaDescription,
          metaKeywords,
        ].filter(Boolean);

        if (configParts.length > 0) {
          configPrompt = `Based on this configuration:\n${configParts.join("\n")}\n\n`;
        }
      }

      // Use AI description from config if no prompt provided, or combine them
      const promptValue = prompt || "";
      let fullPrompt = promptValue;
      if (config?.aiDescription && !promptValue.trim()) {
        fullPrompt = config.aiDescription as string;
      } else if (config?.aiDescription && promptValue.trim()) {
        fullPrompt = `${config.aiDescription}\n\nAdditional instructions: ${promptValue}`;
      } else if (!config?.aiDescription && !promptValue.trim()) {
        return c.json(
          { message: "Either prompt or AI description in config is required" },
          { status: 400 }
        );
      }

      const finalPrompt = `${configPrompt}${fullPrompt}`;

      const threadId = `landing-page-${id}-${userId}`;
      const response = await landingPageAgent.generate({
        messages: [
          {
            role: "user",
            content: finalPrompt,
          },
        ],
        threadId,
      });

      // Parse structured output
      let generatedFiles: Array<{ path: string; content: string }> = [];

      try {
        // Try to parse as structured output first
        if (
          response.object &&
          typeof response.object === "object" &&
          "files" in response.object
        ) {
          generatedFiles = (
            response.object as {
              files: Array<{ path: string; content: string }>;
            }
          ).files;
        } else if (response.text) {
          // Fallback: try to parse JSON from text response
          try {
            const parsed = JSON.parse(response.text);
            if (parsed.files && Array.isArray(parsed.files)) {
              generatedFiles = parsed.files;
            } else {
              // Single HTML file fallback
              generatedFiles = [{ path: "index.html", content: response.text }];
            }
          } catch {
            // If not JSON, treat as single HTML file
            generatedFiles = [{ path: "index.html", content: response.text }];
          }
        }

        // Validate that index.html exists
        const hasIndexHtml = generatedFiles.some(f => f.path === "index.html");
        if (!hasIndexHtml) {
          return c.json(
            { message: "Generated files must include index.html" },
            { status: 400 }
          );
        }

        // Store files as JSON in htmlContent field (we'll update this to a proper files field later if needed)
        // For now, store the main index.html content and keep files array in a separate field
        const indexHtmlContent =
          generatedFiles.find(f => f.path === "index.html")?.content || "";

        const updateResult = await updateLandingPage(id, userId, {
          htmlContent: indexHtmlContent,
          config: {
            ...(config || {}),
            generatedFiles: generatedFiles,
          } as Prisma.InputJsonValue,
        });

        if (!updateResult.success) {
          return c.json(
            { message: updateResult.error.message },
            { status: 500 }
          );
        }

        return c.json({
          message: "Landing page generated successfully",
          landingPage: updateResult.data,
        });
      } catch (parseError) {
        console.error("Error parsing generated files:", parseError);
        return c.json(
          { message: "Failed to parse generated files. Please try again." },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Error generating landing page:", error);
      return c.json(
        { message: "Error generating landing page", error: String(error) },
        500
      );
    }
  }
);

landingPageRoutes.post("/:id/deploy", async c => {
  const id = c.req.param("id");
  const userId = c.get("userId");

  try {
    const result = await deployLandingPage(id, userId);

    if (!result.success) {
      switch (result.error.type) {
        case LandingPageErrorType.LANDING_PAGE_NOT_FOUND:
          return c.json({ message: result.error.message }, { status: 404 });
        case LandingPageErrorType.USER_NOT_AUTHORIZED:
          return c.json({ message: result.error.message }, { status: 403 });
        case LandingPageErrorType.VALIDATION_ERROR:
          return c.json({ message: result.error.message }, { status: 400 });
        case LandingPageErrorType.REPOSITORY_CREATION_FAILED:
          return c.json({ message: result.error.message }, { status: 500 });
        default:
          return c.json({ message: result.error.message }, { status: 500 });
      }
    }

    return c.json({
      message: "Landing page deployed successfully",
      landingPage: result.data,
    });
  } catch (error) {
    console.error("Error deploying landing page:", error);
    return c.json(
      { message: "Error deploying landing page", error: String(error) },
      500
    );
  }
});

landingPageRoutes.post(
  "/:id/custom-domain",
  zValidator("json", customDomainSchema),
  async c => {
    const id = c.req.param("id");
    const userId = c.get("userId");
    const { domain } = c.req.valid("json");

    try {
      const result = await updateLandingPageCustomDomain(id, domain, userId);

      if (!result.success) {
        return c.json({ message: result.error.message }, { status: 400 });
      }

      return c.json(
        {
          message: "Custom domain set successfully",
          landingPage: result.data,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error setting custom domain:", error);
      return c.json(
        { message: "Error setting custom domain", error: String(error) },
        500
      );
    }
  }
);

landingPageRoutes.delete("/:id/custom-domain", async c => {
  const id = c.req.param("id");
  const userId = c.get("userId");

  try {
    const result = await removeLandingPageCustomDomain(id, userId);

    if (!result.success) {
      if (result.error.type === LandingPageErrorType.LANDING_PAGE_NOT_FOUND) {
        return c.json({ message: result.error.message }, { status: 404 });
      }
      if (result.error.type === LandingPageErrorType.USER_NOT_AUTHORIZED) {
        return c.json({ message: result.error.message }, { status: 403 });
      }
      return c.json({ message: result.error.message }, { status: 400 });
    }

    return c.json(
      {
        message: "Custom domain removed successfully",
        landingPage: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing custom domain:", error);
    return c.json(
      { message: "Error removing custom domain", error: String(error) },
      500
    );
  }
});

export default landingPageRoutes;
