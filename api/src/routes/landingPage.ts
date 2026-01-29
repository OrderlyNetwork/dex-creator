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

const landingPageOutputSchema = z.object({
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    })
  ),
});

async function generateLandingPageContentOnly(
  userId: string,
  config: Record<string, unknown> | null,
  prompt?: string,
  existingFiles?: Array<{ path: string; content: string }>
): Promise<{
  success: boolean;
  generatedFiles?: Array<{ path: string; content: string }>;
  error?: string;
}> {
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
    const linkColor = config.linkColor ? `Link Color: ${config.linkColor}` : "";
    const fontFamily = config.fontFamily
      ? `Font Family: ${config.fontFamily}`
      : "";
    const languages = config.languages
      ? `Supported Languages: ${(config.languages as string[]).join(", ")}`
      : "";
    const ctaText = config.ctaButtonText
      ? `CTA Button Text: ${config.ctaButtonText}`
      : "";
    const ctaColor = config.ctaButtonColor
      ? `CTA Button Color: ${config.ctaButtonColor}`
      : "";
    const ctaPlacement = config.ctaPlacement
      ? `CTA Placement: ${config.ctaPlacement} (hero, footer, or both)`
      : "";
    const ctaLink = config.ctaButtonLink
      ? `CTA Button Link: ${config.ctaButtonLink}`
      : "";
    const enabledSections = config.enabledSections
      ? `Enabled Sections: ${(config.enabledSections as string[]).join(", ")}`
      : "";
    const telegramLink = config.telegramLink
      ? `Telegram Link: ${config.telegramLink}`
      : "";
    const discordLink = config.discordLink
      ? `Discord Link: ${config.discordLink}`
      : "";
    const xLink = config.xLink ? `X (Twitter) Link: ${config.xLink}` : "";
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
    const teamMembers =
      config.teamMembers &&
      Array.isArray(config.teamMembers) &&
      config.teamMembers.length > 0
        ? `Team Members:\n${(
            config.teamMembers as Array<{
              name: string;
              description?: string;
              links?: Array<{ label: string; url: string }>;
              imageData?: string;
            }>
          )
            .map(
              (member, index) =>
                `  ${index + 1}. Name: ${member.name}${member.description ? `\n     Description: ${member.description}` : ""}${member.links && member.links.length > 0 ? `\n     Links: ${member.links.map(link => `${link.label}: ${link.url}`).join(", ")}` : ""}${member.imageData ? `\n     Image: assets/team/member${index + 1}.webp` : ""}`
            )
            .join("\n")}`
        : "";
    const contactMethods =
      config.contactMethods &&
      Array.isArray(config.contactMethods) &&
      config.contactMethods.length > 0
        ? `Contact Methods: ${(config.contactMethods as string[]).join(", ")}`
        : "";
    const primaryLogoImage =
      config.primaryLogoImage && typeof config.primaryLogoImage === "object"
        ? `Primary Logo Image: Available at ${(config.primaryLogoImage as { path: string; width: number; height: number }).path} (${(config.primaryLogoImage as { path: string; width: number; height: number }).width}x${(config.primaryLogoImage as { path: string; width: number; height: number }).height}px)`
        : "";
    const secondaryLogoImage =
      config.secondaryLogoImage && typeof config.secondaryLogoImage === "object"
        ? `Secondary Logo Image: Available at ${(config.secondaryLogoImage as { path: string; width: number; height: number }).path} (${(config.secondaryLogoImage as { path: string; width: number; height: number }).width}x${(config.secondaryLogoImage as { path: string; width: number; height: number }).height}px)`
        : "";
    const bannerImage =
      config.bannerImage && typeof config.bannerImage === "object"
        ? `Banner Image: Available at ${(config.bannerImage as { path: string; width: number; height: number }).path} (${(config.bannerImage as { path: string; width: number; height: number }).width}x${(config.bannerImage as { path: string; width: number; height: number }).height}px)`
        : "";
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
      ctaLink,
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
      `The current year is ${new Date().getFullYear()}`,
    ].filter(Boolean);

    if (configParts.length > 0) {
      configPrompt = `Based on this configuration:\n${configParts.join("\n")}\n\n`;
    }
  }

  const promptValue = prompt || "";
  let fullPrompt = promptValue;
  if (config?.aiDescription && !promptValue.trim()) {
    fullPrompt = config.aiDescription as string;
  } else if (config?.aiDescription && promptValue.trim()) {
    fullPrompt = `${config.aiDescription}\n\nAdditional instructions: ${promptValue}`;
  } else {
    fullPrompt = "";
  }

  let existingFilesContext = "";
  if (existingFiles && existingFiles.length > 0) {
    existingFilesContext = `\n\nEXISTING LANDING PAGE FILES (use as reference for structure and style, but regenerate based on new config):\n${existingFiles.map(file => `\n--- File: ${file.path} ---\n${file.content.substring(0, 2000)}${file.content.length > 2000 ? "\n... (truncated)" : ""}`).join("\n")}\n\nIMPORTANT: Regenerate the landing page based on the updated configuration above, but maintain similar structure and quality. Use the existing files as a reference for the expected output format and code style.`;
  }

  const finalPrompt =
    `${configPrompt}${fullPrompt}${existingFilesContext}`.trim();

  if (!finalPrompt || finalPrompt.length === 0) {
    return {
      success: false,
      error: "Prompt cannot be empty",
    };
  }

  const threadId = `landing-page-preview-${userId}-${Date.now()}`;

  let response;
  try {
    response = await landingPageAgent.generate(finalPrompt, {
      threadId,
      structuredOutput: {
        schema: landingPageOutputSchema,
      },
    });
  } catch (error) {
    return {
      success: false,
      error: `Failed to generate content: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  if (!response) {
    return {
      success: false,
      error: "No response received from generation agent",
    };
  }

  if (!response.object && !response.text) {
    return {
      success: false,
      error: "Empty response received from generation agent",
    };
  }

  let generatedFiles: Array<{ path: string; content: string }> = [];

  try {
    const parsed = response.object as {
      files: Array<{ path: string; content: string }>;
    };
    generatedFiles = parsed.files;

    if (generatedFiles.length === 0) {
      return {
        success: false,
        error: "No files were generated",
      };
    }

    const hasIndexHtml = generatedFiles.some(f => f.path === "index.html");
    if (!hasIndexHtml) {
      return {
        success: false,
        error: `Generated files must include index.html. Received: ${generatedFiles.map(f => f.path).join(", ")}`,
      };
    }

    const indexHtmlContent =
      generatedFiles.find(f => f.path === "index.html")?.content || "";

    if (!indexHtmlContent || indexHtmlContent.trim().length === 0) {
      return {
        success: false,
        error: "Generated HTML content is empty",
      };
    }

    return {
      success: true,
      generatedFiles: generatedFiles,
    };
  } catch (parseError) {
    console.error("Error parsing generated files:", parseError);
    return {
      success: false,
      error: "Failed to parse generated files. Please try again.",
    };
  }
}

async function generateLandingPageContent(
  id: string,
  userId: string,
  config: Record<string, unknown> | null,
  prompt?: string,
  existingFiles?: Array<{ path: string; content: string }>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const generateResult = await generateLandingPageContentOnly(
    userId,
    config,
    prompt,
    existingFiles
  );

  if (!generateResult.success) {
    return {
      success: false,
      error: generateResult.error,
    };
  }

  const updateResult = await updateLandingPage(id, userId, {
    config: {
      ...(config || {}),
      generatedFiles: generateResult.generatedFiles,
    } as Prisma.InputJsonValue,
  });

  if (!updateResult.success) {
    return {
      success: false,
      error: `Failed to save generated content: ${updateResult.error.message}`,
    };
  }

  return {
    success: true,
    data: updateResult.data,
  };
}

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
  languages: z.preprocess(
    val => {
      if (Array.isArray(val)) return val;
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [val];
        } catch {
          return [val];
        }
      }
      return val;
    },
    z
      .array(z.string())
      .min(1, "At least one language must be selected")
      .default(["en"])
  ),
  // CTA Customization
  ctaButtonText: z
    .string()
    .max(50, "CTA button text cannot exceed 50 characters")
    .default("Start Trading"),
  ctaButtonColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format")
    .optional(),
  useCustomCtaColor: z.preprocess(val => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") {
      if (val === "true" || val === "1") return true;
      if (val === "false" || val === "0" || val === "") return false;
      try {
        const parsed = JSON.parse(val);
        return Boolean(parsed);
      } catch {
        return false;
      }
    }
    return false;
  }, z.boolean().default(false)),
  ctaPlacement: z.enum(["hero", "footer", "both"]).default("both"),
  // Section Templates
  enabledSections: z.preprocess(
    val => {
      const validSections = [
        "hero",
        "features",
        "feeStructure",
        "faq",
        "team",
        "contact",
        "socials",
        "about",
      ];
      let array: unknown[] = [];
      if (Array.isArray(val)) {
        array = val;
      } else if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          array = Array.isArray(parsed) ? parsed : [];
        } catch {
          array = [];
        }
      }
      // Filter out invalid values
      return array.filter(
        item => typeof item === "string" && validSections.includes(item)
      );
    },
    z
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
      .default(["hero", "features", "contact"])
  ),
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
  keyFeatures: z.preprocess(val => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return val;
  }, z.array(z.string()).default([])),
  faqItems: z.preprocess(
    val => {
      if (Array.isArray(val)) return val;
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return val;
    },
    z
      .array(
        z.object({
          question: z.string().min(1, "Question is required"),
          answer: z.string().min(1, "Answer is required"),
        })
      )
      .default([])
  ),
  sections: z.preprocess(
    val => {
      if (Array.isArray(val)) return val;
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return val;
    },
    z
      .array(
        z.object({
          type: z.enum(["hero", "features", "about", "contact", "custom"]),
          content: z.record(z.string(), z.any()),
          order: z.number().min(0),
        })
      )
      .default([])
  ),
  metadata: z.preprocess(
    val => {
      if (typeof val === "object" && val !== null && !Array.isArray(val))
        return val;
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          return typeof parsed === "object" &&
            parsed !== null &&
            !Array.isArray(parsed)
            ? parsed
            : undefined;
        } catch {
          return undefined;
        }
      }
      return val;
    },
    z
      .object({
        description: z
          .string()
          .max(300, "Description cannot exceed 300 characters")
          .optional(),
        keywords: z.array(z.string()).default([]),
        favicon: z.string().url().optional(),
      })
      .optional()
  ),
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

      const rawFormData = await c.req.formData();
      const { config } = await processLandingPageFormData(rawFormData);

      const generateResult = await generateLandingPageContentOnly(
        userId,
        config as Record<string, unknown> | null
      );

      if (!generateResult.success) {
        return c.json(
          {
            error: "Failed to generate landing page content",
            details: generateResult.error,
          },
          { status: 500 }
        );
      }

      const configObj =
        config && typeof config === "object" && !Array.isArray(config)
          ? (config as Record<string, unknown>)
          : ({} as Record<string, unknown>);
      const configWithGeneratedContent: Prisma.InputJsonValue = {
        ...configObj,
        generatedFiles: generateResult.generatedFiles,
      };

      const result = await createLandingPage(
        userId,
        configWithGeneratedContent
      );

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

      if (result.data && result.data.id) {
        const currentConfig = result.data.config as Record<
          string,
          unknown
        > | null;
        const updateResult = await updateLandingPage(result.data.id, userId, {
          config: {
            ...(currentConfig || {}),
            generatedFiles: generateResult.generatedFiles,
          } as Prisma.InputJsonValue,
        });

        if (!updateResult.success) {
          await deleteLandingPage(result.data.id, userId);
          return c.json(
            {
              error: "Failed to save generated content",
              details: updateResult.error.message,
            },
            { status: 500 }
          );
        }

        let finalLandingPage = updateResult.data;
        try {
          const deployResult = await deployLandingPage(
            updateResult.data.id,
            userId
          );
          if (deployResult.success && deployResult.data) {
            finalLandingPage = deployResult.data;
          } else if (!deployResult.success) {
            console.error(
              "[CREATE] Deployment failed:",
              deployResult.error.message
            );
          }
        } catch (deployError) {
          console.error("[CREATE] Failed to auto-deploy:", deployError);
        }

        return c.json(finalLandingPage, { status: 201 });
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
      config?: Prisma.InputJsonValue;
      repoUrl?: string;
      customDomain?: string;
    } = {};

    if (contentType.includes("multipart/form-data")) {
      const rawFormData = await c.req.formData();
      const { config } = await processLandingPageFormData(rawFormData);
      updatePayload.config = config;
    } else {
      const jsonData = await c.req.json();
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

    if (result.data.repoUrl) {
      try {
        await deployLandingPage(id, userId);
      } catch (deployError) {
        console.error("[UPDATE] Failed to auto-deploy:", deployError);
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

const regenerateSchema = z.object({
  prompt: z.string().optional(),
  existingFiles: z
    .array(
      z.object({
        path: z.string(),
        content: z.string(),
      })
    )
    .optional(),
});

landingPageRoutes.post(
  "/:id/regenerate",
  zValidator("json", regenerateSchema),
  async c => {
    const id = c.req.param("id");
    const userId = c.get("userId");
    const { prompt, existingFiles } = c.req.valid("json");

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
          {
            message: "Unauthorized to regenerate content for this landing page",
          },
          403
        );
      }

      const config = existingPage.config as Record<string, unknown> | null;

      const generateResult = await generateLandingPageContent(
        id,
        userId,
        config,
        prompt,
        existingFiles
      );

      if (!generateResult.success) {
        return c.json(
          {
            message:
              generateResult.error || "Failed to regenerate landing page",
          },
          { status: 500 }
        );
      }

      try {
        await deployLandingPage(id, userId);
      } catch (deployError) {
        console.error("[REGENERATE] Failed to auto-deploy:", deployError);
      }

      return c.json({
        message: "Landing page regenerated successfully",
        landingPage: generateResult.data,
      });
    } catch (error) {
      console.error("Error regenerating landing page:", error);
      return c.json(
        { message: "Error regenerating landing page", error: String(error) },
        500
      );
    }
  }
);

const editElementSchema = z.object({
  elementHtml: z.string(),
  elementPath: z.string(),
  parentContext: z.string(),
  prompt: z.string(),
  currentFiles: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    })
  ),
});

landingPageRoutes.post(
  "/:id/edit-element",
  zValidator("json", editElementSchema),
  async c => {
    const id = c.req.param("id");
    const userId = c.get("userId");
    const { elementHtml, elementPath, parentContext, prompt, currentFiles } =
      c.req.valid("json");

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
          { message: "Unauthorized to edit this landing page" },
          403
        );
      }

      const indexFile = currentFiles.find(f => f.path === "index.html");
      if (!indexFile) {
        return c.json({ error: "index.html not found" }, { status: 400 });
      }

      const openingTagMatch = elementHtml.match(/^<([a-z0-9-]+)([^>]*)>/i);
      if (!openingTagMatch) {
        return c.json(
          { error: "Could not parse element - invalid HTML" },
          { status: 400 }
        );
      }

      const tagName = openingTagMatch[1].toLowerCase();
      const tagAttrs = openingTagMatch[2];

      const idMatch = tagAttrs.match(/id="([^"]+)"/);
      const classMatch = tagAttrs.match(/class="([^"]+)"/);

      const lines = indexFile.content.split("\n");
      let startLine = -1;
      let searchPattern: RegExp;

      if (idMatch) {
        searchPattern = new RegExp(`<${tagName}[^>]*id="${idMatch[1]}"`, "i");
      } else if (classMatch) {
        const classes = classMatch[1]
          .split(/\s+/)
          .filter(c => c && !c.includes(":"))
          .slice(0, 3);
        if (classes.length > 0) {
          const classPattern = classes
            .map(c => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
            .join('[^"]*');
          searchPattern = new RegExp(
            `<${tagName}[^>]*class="[^"]*${classPattern}`,
            "i"
          );
        } else {
          searchPattern = new RegExp(`<${tagName}[^>]*>`, "i");
        }
      } else {
        searchPattern = new RegExp(`<${tagName}[^>]*>`, "i");
      }

      for (let i = 0; i < lines.length; i++) {
        if (searchPattern.test(lines[i])) {
          startLine = i;
          break;
        }
      }

      if (startLine === -1) {
        return c.json(
          {
            error:
              "Could not locate element in source HTML. Try selecting a different element.",
          },
          { status: 400 }
        );
      }

      let depth = 0;
      let endLine = startLine;
      let foundStart = false;

      for (let i = startLine; i < lines.length; i++) {
        const line = lines[i];
        const opens = (
          line.match(new RegExp(`<${tagName}(?:\\s|>|/)`, "gi")) || []
        ).length;
        const closes = (line.match(new RegExp(`</${tagName}>`, "gi")) || [])
          .length;
        const selfClose = (
          line.match(new RegExp(`<${tagName}[^>]*/>`, "gi")) || []
        ).length;

        if (!foundStart && opens > 0) {
          foundStart = true;
          depth = opens - selfClose;
        } else if (foundStart) {
          depth += opens - selfClose;
        }
        depth -= closes;

        if (foundStart && depth <= 0) {
          endLine = i;
          break;
        }
      }

      const sourceElement = lines.slice(startLine, endLine + 1).join("\n");

      if (sourceElement.length > 5000) {
        return c.json(
          {
            error: `Element is too large (${Math.round(sourceElement.length / 1000)}KB, lines ${startLine + 1}-${endLine + 1}). Please select a smaller element.`,
          },
          { status: 400 }
        );
      }

      const editPrompt = `TASK: Modify this HTML element based on the user's request.

ELEMENT TO MODIFY (lines ${startLine + 1}-${endLine + 1}):
\`\`\`html
${sourceElement}
\`\`\`

ELEMENT PATH: ${parentContext} > ${elementPath}

USER REQUEST: ${prompt}

CRITICAL RULES:
1. Return the COMPLETE modified element - must be valid HTML
2. Start with opening tag, end with matching closing tag
3. If element is <div>...</div>, your response must start with <div and end with </div>
4. NEVER return partial HTML or cut off in the middle
5. Preserve Alpine.js directives (x-data, x-text, @click, :class, etc.)
6. Use Tailwind CSS classes for styling

ICONS:
- Use Iconify: <iconify-icon icon="mdi:check" class="text-2xl text-green-500"></iconify-icon>
- Common: mdi:check, mdi:star, mdi:arrow-right, mdi:rocket, mdi:shield, mdi:lightning-bolt
- Social: mdi:telegram, mdi:discord, mdi:twitter, mdi:github
- NEVER use dynamic bindings for icons`;

      const editOutputSchema = z.object({
        modifiedElement: z
          .string()
          .describe(
            "The complete modified HTML element. Must start with opening tag (e.g. <div) and end with closing tag (e.g. </div>). No markdown, no explanation, just the raw HTML."
          ),
      });

      const response = await landingPageAgent.generate(editPrompt, {
        structuredOutput: {
          schema: editOutputSchema,
        },
      });

      const responseObj = response.object as { modifiedElement: string } | null;
      if (!responseObj?.modifiedElement) {
        return c.json(
          { error: "Failed to generate modified element" },
          { status: 500 }
        );
      }

      const modifiedElement = responseObj.modifiedElement.trim();

      if (!modifiedElement.startsWith("<") || !modifiedElement.endsWith(">")) {
        console.error(
          "Invalid HTML - doesn't start/end with tags:",
          modifiedElement.slice(0, 100)
        );
        return c.json(
          { error: "AI returned invalid HTML - please try again" },
          { status: 500 }
        );
      }

      const openTagMatch = modifiedElement.match(/^<([a-z0-9]+)/i);
      if (!openTagMatch) {
        console.error(
          "Could not extract opening tag:",
          modifiedElement.slice(0, 100)
        );
        return c.json(
          { error: "AI returned invalid HTML - please try again" },
          { status: 500 }
        );
      }

      const responseTagName = openTagMatch[1].toLowerCase();

      const selfClosingTags = [
        "img",
        "br",
        "hr",
        "input",
        "meta",
        "link",
        "iconify-icon",
      ];
      const isSelfClosing =
        selfClosingTags.includes(responseTagName) ||
        modifiedElement.endsWith("/>");

      if (
        !isSelfClosing &&
        !modifiedElement.endsWith(`</${responseTagName}>`)
      ) {
        return c.json(
          { error: "AI returned incomplete HTML - please try again" },
          { status: 500 }
        );
      }

      const beforeLines = lines.slice(0, startLine);
      const afterLines = lines.slice(endLine + 1);
      const updatedContent = [
        ...beforeLines,
        modifiedElement,
        ...afterLines,
      ].join("\n");

      return c.json({
        updatedHtml: updatedContent,
        originalHtml: indexFile.content,
      });
    } catch (error) {
      console.error("Error editing element:", error);
      return c.json(
        { message: "Error editing element", error: String(error) },
        500
      );
    }
  }
);

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

      const generateResult = await generateLandingPageContent(
        id,
        userId,
        config,
        prompt
      );

      if (!generateResult.success) {
        return c.json(
          {
            message: generateResult.error || "Failed to generate landing page",
          },
          { status: 500 }
        );
      }

      return c.json({
        message: "Landing page generated successfully",
        landingPage: generateResult.data,
      });
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
    const body = await c.req.json().catch(() => ({}));
    if (body.generatedFiles && Array.isArray(body.generatedFiles)) {
      const prisma = await getPrisma();
      const existingPage = await prisma.landingPage.findUnique({
        where: { id },
      });

      if (existingPage && existingPage.userId === userId) {
        const currentConfig =
          (existingPage.config as Record<string, unknown>) || {};
        await prisma.landingPage.update({
          where: { id },
          data: {
            config: {
              ...currentConfig,
              generatedFiles: body.generatedFiles,
            },
          },
        });
      }
    }

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

      if (result.data.repoUrl) {
        try {
          await deployLandingPage(id, userId);
        } catch (deployError) {
          console.error("[CUSTOM_DOMAIN] Failed to auto-deploy:", deployError);
        }
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

    if (result.data.repoUrl) {
      try {
        await deployLandingPage(id, userId);
      } catch (deployError) {
        console.error("[REMOVE_DOMAIN] Failed to auto-deploy:", deployError);
      }
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
