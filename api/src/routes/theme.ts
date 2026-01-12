import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { OpenAI } from "openai";
import {
  themeRateLimiter,
  fineTuneRateLimiter,
  createDeploymentRateLimit,
} from "../lib/rateLimiter";
import { validateCSS } from "../lib/cssValidator";

const themeRoutes = new Hono();

const themeRateLimit = createDeploymentRateLimit(themeRateLimiter);
const fineTuneRateLimit = createDeploymentRateLimit(fineTuneRateLimiter);

const themePromptSchema = z.object({
  prompt: z.string().min(3).max(100),
  currentTheme: z.string().optional(),
});

const fineTuneSchema = z.object({
  prompt: z.string().min(3).max(200),
  html: z.string().min(1),
  elements: z.array(
    z.object({
      elementSelector: z.string(),
      computedStyles: z.record(z.string(), z.string()),
    })
  ),
  cssVariables: z.record(z.string(), z.string()),
  existingOverrides: z.string().optional(),
});

function createOpenAIClient() {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) {
    throw new Error("CEREBRAS_API_KEY environment variable is not set");
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.CEREBRAS_API_URL || "https://api.cerebras.ai/v1",
  });
}

themeRoutes.post(
  "/modify",
  themeRateLimit,
  zValidator("json", themePromptSchema),
  async c => {
    try {
      const { prompt, currentTheme } = c.req.valid("json");

      const openai = createOpenAIClient();

      const defaultTheme = `:root {
  --oui-font-family: 'Manrope', sans-serif;

  /* colors */
  --oui-color-primary: 176 132 233;
  --oui-color-primary-light: 213 190 244;
  --oui-color-primary-darken: 137 76 209;
  --oui-color-primary-contrast: 255 255 255;

  --oui-color-link: 189 107 237;
  --oui-color-link-light: 217 152 250;

  --oui-color-secondary: 255 255 255;
  --oui-color-tertiary: 218 218 218;
  --oui-color-quaternary: 218 218 218;

  --oui-color-danger: 245 97 139;
  --oui-color-danger-light: 250 167 188;
  --oui-color-danger-darken: 237 72 122;
  --oui-color-danger-contrast: 255 255 255;

  --oui-color-success: 41 233 169;
  --oui-color-success-light: 101 240 194;
  --oui-color-success-darken: 0 161 120;
  --oui-color-success-contrast: 255 255 255;

  --oui-color-warning: 255 209 70;
  --oui-color-warning-light: 255 229 133;
  --oui-color-warning-darken: 255 152 0;
  --oui-color-warning-contrast: 255 255 255;

  --oui-color-fill: 36 32 47;
  --oui-color-fill-active: 40 46 58;

  --oui-color-base-1: 93 83 123;
  --oui-color-base-2: 81 72 107;
  --oui-color-base-3: 68 61 69;
  --oui-color-base-4: 57 52 74;
  --oui-color-base-5: 51 46 66;
  --oui-color-base-6: 43 38 56;
  --oui-color-base-7: 36 32 47;
  --oui-color-base-8: 29 26 38;
  --oui-color-base-9: 22 20 28;
  --oui-color-base-10: 14 13 18;

  --oui-color-base-foreground: 255 255 255;
  --oui-color-line: 255 255 255;

  --oui-color-trading-loss: 245 97 139;
  --oui-color-trading-loss-contrast: 255 255 255;
  --oui-color-trading-profit: 41 233 169;
  --oui-color-trading-profit-contrast: 255 255 255;

  /* gradients */
  --oui-gradient-primary-start: 40 0 97;
  --oui-gradient-primary-end: 189 107 237;

  --oui-gradient-secondary-start: 81 42 121;
  --oui-gradient-secondary-end: 176 132 233;

  --oui-gradient-success-start: 1 83 68;
  --oui-gradient-success-end: 41 223 169;

  --oui-gradient-danger-start: 153 24 76;
  --oui-gradient-danger-end: 245 97 139;

  --oui-gradient-brand-start: 231 219 249;
  --oui-gradient-brand-end: 159 107 225;
  --oui-gradient-brand-stop-start: 6.62%;
  --oui-gradient-brand-stop-end: 86.5%;
  --oui-gradient-brand-angle: 17.44deg;

  --oui-gradient-warning-start: 152 58 8;
  --oui-gradient-warning-end: 255 209 70;

  --oui-gradient-neutral-start: 27 29 24;
  --oui-gradient-neutral-end: 38 41 46;

  /* rounded */
  --oui-rounded-sm: 2px;
  --oui-rounded: 4px;
  --oui-rounded-md: 6px;
  --oui-rounded-lg: 8px;
  --oui-rounded-xl: 12px;
  --oui-rounded-2xl: 16px;
  --oui-rounded-full: 9999px;

  /* spacing */
  --oui-spacing-xs: 20rem;
  --oui-spacing-sm: 22.5rem;
  --oui-spacing-md: 26.25rem;
  --oui-spacing-lg: 30rem;
  --oui-spacing-xl: 33.75rem;
}`;

      const baseTheme = currentTheme || defaultTheme;

      const systemPrompt = `You are a CSS theme designer for dark trading platforms. Modify the provided CSS theme based on the user's description.

FORMAT: Use RGB values with spaces (e.g., "176 132 233" for RGB(176,132,233)).

CORE REQUIREMENTS:
- Preserve ALL existing variables - don't add or remove any
- Keep EXACT variable names and structure
- Don't change spacing values (--oui-spacing-xs: 20rem, etc.)
- No comments in response, return ONLY the complete CSS

COLOR GUIDELINES:
1. DARK BACKGROUNDS / LIGHT TEXT - This is non-negotiable:
   • Base colors (base-1 through base-10): Dark backgrounds progressing from lightest (base-1) to darkest (base-10)
   • All foreground/text elements (base-foreground, etc.): Light colors for readability

2. CONTRAST REQUIREMENTS:
   • Text vs Background: White/light text on dark backgrounds
   • Trading colors: Bright green for profit, bright red for loss - MUST be visible on dark backgrounds
   • SCROLLBARS: Critical - Base-7 (scrollbar track) must be VISIBLY DIFFERENT from base-10 (background)
     - Make base-7 at least 3 shades lighter than base-10
     - Primary color (scrollbar thumb) must be bright against the track
     - Example: If base-10 is "14 13 18", base-7 should be "51 46 66" or lighter (NOT "36 32 47")

3. COLOR PROGRESSION:
   • Base-1 (lightest background): Like "93 83 123" - light but still dark enough for white text
   • Base-2 through Base-9: Each step progressively darker
   • Base-10 (darkest): Like "14 13 18"

4. SPECIAL COLORS:
   • Primary: Main accent color (affects scrollbar thumbs)
   • Success: Bright green like "41 233 169"
   • Danger: Bright red like "245 97 139"
   • Warning: Amber/yellow like "255 209 70"
   • Trading-profit: Bright green (visible on dark backgrounds)
   • Trading-loss: Bright red (visible on dark backgrounds)

5. GRADIENT CONSISTENCY:
   • Gradient-brand-start: Similar to primary-light
   • Gradient-brand-end: Similar to primary`;

      const themesArray: string[] = [];

      for (let index = 0; index < 3; index++) {
        try {
          const response = await openai.chat.completions.create({
            model: "qwen-3-32b",
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: `Please modify this CSS theme based on the following description: ${prompt}\n\nCurrent theme:\n${baseTheme}`,
              },
            ],
            temperature: 0.7 + index * 0.1,
          });

          let modifiedTheme = response.choices[0]?.message.content?.trim();

          if (!modifiedTheme) {
            throw new Error(`Failed to generate theme variant ${index + 1}`);
          }

          modifiedTheme = modifiedTheme.replace(
            /<think>[\s\S]*?<\/think>/gi,
            ""
          );
          modifiedTheme = modifiedTheme.replace(/<think>[\s\S]*$/gi, "");

          modifiedTheme = modifiedTheme.replace(/^```(?:css)?\s*/i, "");
          modifiedTheme = modifiedTheme.replace(/\s*```$/i, "");
          modifiedTheme = modifiedTheme.trim();

          // Validate generated CSS
          const validation = validateCSS(modifiedTheme);
          if (!validation.isValid) {
            console.error(
              `Theme variant ${index + 1} validation errors:`,
              validation.errors
            );

            return c.json(
              {
                message: `CSS validation failed: ${validation.errors.join("; ")}, please try again with a different prompt`,
              },
              { status: 500 }
            );
          }

          themesArray.push(modifiedTheme);
        } catch (error) {
          console.error(`Error generating theme variant ${index + 1}:`, error);
          if (themesArray.length === 0) {
            throw error;
          }
          if (themesArray.length > 0) {
            themesArray.push(themesArray[themesArray.length - 1]);
          }
        }
      }

      if (themesArray.length === 0) {
        return c.json(
          { error: "Failed to generate any theme variants" },
          { status: 500 }
        );
      }

      while (themesArray.length < 3) {
        themesArray.push(themesArray[themesArray.length - 1]);
      }

      return c.json({ themes: themesArray.slice(0, 3) }, { status: 200 });
    } catch (error) {
      console.error("Error modifying theme:", error);
      let message = "Failed to modify theme";

      if (error instanceof Error) {
        message = error.message;
      }

      return c.json({ error: message }, { status: 500 });
    }
  }
);

themeRoutes.post(
  "/fine-tune",
  fineTuneRateLimit,
  zValidator("json", fineTuneSchema),
  async c => {
    try {
      const { prompt, html, elements, cssVariables, existingOverrides } =
        c.req.valid("json");

      const openai = createOpenAIClient();

      const elementsData = elements
        .map(
          (el, index) => `Element ${index} (${el.elementSelector}):
Computed Styles (excluding CSS variables):
${Object.entries(el.computedStyles)
  .map(([key, value]) => `  ${key}: ${value}`)
  .join("\n")}`
        )
        .join("\n\n");

      const cssVariablesStr =
        Object.keys(cssVariables).length > 0
          ? `CSS Variables (--oui-*) from root:
${Object.entries(cssVariables)
  .map(([key, value]) => `  ${key}: ${value}`)
  .join("\n")}`
          : "";

      const systemPrompt = `You are a CSS expert specializing in fine-grained UI customization for dark trading platforms.

Your task is to generate CSS overrides that can be applied to an HTML element and its entire child structure to transform its appearance based on the user's description.

CRITICAL REQUIREMENTS:
1. Return ONLY pure CSS code - NO markdown formatting, NO code blocks, NO backticks, NO explanations
2. Return ONLY valid CSS that can be applied as CSS classes or selectors targeting the structure
3. Use RGB values with spaces for colors (e.g., "rgb(176 132 233)" or "176 132 233")
4. Maintain readability - ensure sufficient contrast for dark backgrounds
5. Preserve functionality - don't break layout or interactions
6. Target the root element AND its child elements as needed based on the HTML structure
7. Use CSS selectors (classes, element selectors, descendant selectors) to target specific parts of the structure
8. Use !important only when necessary to override existing styles
9. Return clean, minified CSS without comments
10. DO NOT wrap the response in markdown code blocks (no code fences)
11. DO NOT include any explanatory text before or after the CSS
12. **CRITICAL**: ALL CSS rules MUST be complete with proper opening and closing braces. Every opening brace { MUST have a matching closing brace }. Incomplete rules will cause validation errors.
13. **CRITICAL**: If existing CSS overrides are provided, you MUST return ALL overrides (existing + new combined). Include ALL existing overrides PLUS your new changes. You MAY modify existing overrides if the user's request conflicts with them or asks for changes. If an existing override targets the same element/selector and the user wants different styling, UPDATE that override rather than duplicating it. Return the COMPLETE set that includes everything (modified existing + new).
14. **CRITICAL**: DO NOT include image data (base64 encoded images, data: URLs, url() with image data) in background properties. For backgrounds, use only color values (rgb, hex) or gradients (linear-gradient, radial-gradient). NO background-image with data URLs or base64 images allowed.
15. **CRITICAL**: DO NOT use pseudo-elements (::before, ::after) with content that creates overlay effects or blocks user interactions. Pseudo-elements with absolute positioning and empty content can make entire screen regions unclickable. If you absolutely must use pseudo-elements for decorative effects, they MUST include "pointer-events: none" to prevent blocking clicks. Prefer using background gradients, box-shadow, or border effects directly on elements instead of pseudo-elements.

OUTPUT FORMAT:
- Return CSS class definitions with selectors targeting the structure (e.g., ".custom-override { color: rgb(255 255 255); } .custom-override > button { background-color: rgb(20 20 30); }")
- Use descendant selectors to target child elements (e.g., ".parent > .child", ".parent .nested")
- Return complete CSS rules, not inline styles
- If existing overrides are provided, return ALL overrides (existing + new combined). Include every existing override PLUS your new changes.

COLOR GUIDELINES:
- Dark backgrounds: Use RGB values like "14 13 18" to "93 83 123"
- Light text: Use RGB values like "255 255 255" or "240 240 240"
- Accent colors: Use vibrant colors like "176 132 233" (purple), "41 233 169" (green), "245 97 139" (red)
- Ensure contrast ratios meet WCAG AA standards (at least 4.5:1 for text)

SPACING GUIDELINES:
- **CRITICAL**: Do NOT add padding unless explicitly requested by the user
- Preserve existing spacing and padding values unless the user specifically asks to change them
- Only modify padding/margin when the user's description explicitly mentions spacing changes
- If the user doesn't mention padding, spacing, or margins, DO NOT add or modify these properties
- Focus on colors, borders, backgrounds, and visual effects rather than spacing

The user will provide:
- Complete HTML structure including the root element and all its children (up to depth 3)
- Computed styles for multiple elements in the hierarchy (depth 0 = selected element, depth 1-3 = child elements)
- CSS variables (--oui-*) extracted separately for each element
- A description of how they want the element and its children to look
- (Optional) Existing CSS overrides that must be INCLUDED in your response (return all existing + new combined)

You will receive computed styles for multiple elements in the hierarchy. Use this context to understand the styling relationships and generate more accurate CSS overrides.`;

      const userPrompt = `Generate CSS overrides for this HTML structure (including all child elements) based on the following description: "${prompt}"

Complete HTML Structure (root element and all children up to depth 3):
${html}

${cssVariablesStr ? `${cssVariablesStr}\n\n` : ""}Elements and Their Styles:
${elementsData}
${
  existingOverrides
    ? `\nExisting CSS Overrides (INCLUDE ALL of these PLUS your new changes - return everything combined):\n${existingOverrides}`
    : ""
}

Generate CSS overrides that will transform the root element and its child elements according to the description. ${
        existingOverrides
          ? "CRITICAL: You must return ALL overrides (existing + new combined). Include EVERY existing override PLUS your new changes. You MAY modify existing overrides if the user's request conflicts with them - update them rather than keeping duplicates. If an existing override targets the same selector and the user wants different styling, UPDATE that override. Do NOT remove or skip existing overrides unless they conflict with the user's request. Return the complete set that includes everything (modified existing + new)."
          : ""
      }

IMPORTANT SPACING RULES:
- Do NOT add padding or margin properties unless the user explicitly requests spacing changes
- If the user's description doesn't mention "padding", "spacing", "margin", or "gap", DO NOT include these properties
- Focus on visual changes: colors, backgrounds, borders, shadows, gradients, fonts - NOT spacing
- Only modify spacing when the user specifically asks for it (e.g., "add more padding", "make it more spaced out")

IMPORTANT BACKGROUND RULES:
- **CRITICAL**: DO NOT use image data in background properties (no base64, no data: URLs, no url() with image data)
- For background-color: use only color values (rgb, hex)
- For background: use only color values or gradients (linear-gradient, radial-gradient)
- If the user requests an image background, use a solid color or gradient instead
- NO background-image property with data URLs or base64 encoded images
- All other CSS properties (color, border, box-shadow, etc.) can use normal CSS values

IMPORTANT PSEUDO-ELEMENT RULES:
- **CRITICAL**: DO NOT create ::before or ::after pseudo-elements that overlay content or block interactions
- Pseudo-elements with absolute positioning and empty content (content: "") can make entire screen regions unclickable
- If you absolutely must use pseudo-elements for decorative effects, they MUST include "pointer-events: none" to prevent blocking clicks
- **PREFERRED APPROACH**: Use background gradients, box-shadow, border effects, or backdrop-filter directly on elements instead of pseudo-elements
- Avoid pseudo-elements entirely unless the user explicitly requests them and you ensure they won't interfere with interactions

Use CSS class definitions with selectors to target specific parts of the structure. 

CRITICAL VALIDATION REQUIREMENTS:
- Every CSS rule MUST be complete: every { must have a matching }
- Do NOT include incomplete rules or selectors without content
- All CSS must be valid and parseable

IMPORTANT: Return ONLY the pure CSS code. Do NOT wrap it in markdown code blocks. Do NOT include any explanations or text before or after the CSS. Return ONLY the CSS rules themselves. ${
        existingOverrides
          ? "Return ALL overrides (existing + new) - include everything, not just new changes."
          : ""
      }`;

      const overridesArray: string[] = [];

      for (let index = 0; index < 3; index++) {
        try {
          const response = await openai.chat.completions.create({
            model: "qwen-3-32b",
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: userPrompt,
              },
            ],
            temperature: 0.7 + index * 0.1,
          });

          let cssOverrides = response.choices[0]?.message.content?.trim();

          if (!cssOverrides) {
            throw new Error(
              `Failed to generate CSS override variant ${index + 1}`
            );
          }

          cssOverrides = cssOverrides.replace(/<think>[\s\S]*?<\/think>/gi, "");
          cssOverrides = cssOverrides.replace(/^```(?:css)?\s*/i, "");
          cssOverrides = cssOverrides.replace(/\s*```$/i, "");
          cssOverrides = cssOverrides.trim();

          // Validate generated CSS
          const validation = validateCSS(cssOverrides);
          if (!validation.isValid) {
            console.error(
              `CSS override variant ${index + 1} validation errors:`,
              validation.errors
            );

            return c.json(
              {
                message: `CSS validation failed: ${validation.errors.join("; ")}, please try again with a different prompt`,
              },
              { status: 500 }
            );
          }

          overridesArray.push(cssOverrides);
        } catch (error) {
          console.error(`Error generating variant ${index + 1}:`, error);
          if (overridesArray.length === 0) {
            throw error;
          }
          if (overridesArray.length > 0) {
            overridesArray.push(overridesArray[overridesArray.length - 1]);
          }
        }
      }

      if (overridesArray.length === 0) {
        return c.json(
          { error: "Failed to generate any CSS override variants" },
          { status: 500 }
        );
      }

      while (overridesArray.length < 3) {
        overridesArray.push(overridesArray[overridesArray.length - 1]);
      }

      return c.json({ overrides: overridesArray.slice(0, 3) }, { status: 200 });
    } catch (error) {
      console.error("Error fine-tuning element:", error);
      let message = "Failed to fine-tune element";

      if (error instanceof Error) {
        message = error.message;
      }

      return c.json({ error: message }, { status: 500 });
    }
  }
);

export default themeRoutes;
