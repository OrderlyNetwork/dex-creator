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
  updateLandingPageCustomDomain,
  removeLandingPageCustomDomain,
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
  theme: z.enum(["light", "dark"]).default("light"),
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
    .min(10, "Prompt must be at least 10 characters")
    .max(2000, "Prompt cannot exceed 2000 characters"),
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
  zValidator("json", landingPageConfigSchema),
  async c => {
    try {
      const userId = c.get("userId");
      const config = c.req.valid("json");

      const result = await createLandingPage(
        userId,
        config as Prisma.InputJsonValue
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

      return c.json(result.data, { status: 201 });
    } catch (error) {
      console.error("Error creating landing page:", error);
      return c.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

landingPageRoutes.put(
  "/:id",
  zValidator("json", updateLandingPageSchema),
  async c => {
    const id = c.req.param("id");
    const userId = c.get("userId");
    const updateData = c.req.valid("json");

    try {
      const updatePayload: {
        htmlContent?: string;
        config?: Prisma.InputJsonValue;
        repoUrl?: string;
        customDomain?: string;
      } = {};

      if (updateData.htmlContent !== undefined) {
        updatePayload.htmlContent = updateData.htmlContent;
      }
      if (updateData.config !== undefined) {
        updatePayload.config = updateData.config as Prisma.InputJsonValue;
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
  }
);

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
      const configPrompt = config
        ? `Based on this configuration: ${JSON.stringify(config)}. `
        : "";
      const fullPrompt = `${configPrompt}${prompt}`;

      const threadId = `landing-page-${id}-${userId}`;
      const response = await landingPageAgent.generate({
        messages: [
          {
            role: "user",
            content: fullPrompt,
          },
        ],
        threadId,
      });

      const generatedHtml = response.text;

      const updateResult = await updateLandingPage(id, userId, {
        htmlContent: generatedHtml,
      });

      if (!updateResult.success) {
        return c.json({ message: updateResult.error.message }, { status: 500 });
      }

      return c.json({
        message: "Landing page generated successfully",
        landingPage: updateResult.data,
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
