import { defineConfig, presetUno, presetIcons } from "unocss";

export default defineConfig({
  presets: [presetUno({ important: true }), presetIcons()],
  safelist: [
    "rounded-full",
    "py-2",
    "px-6",
    "font-medium",
    "transition-all",
    "duration-200",
    "cursor-pointer",
    "border-none",
    "text-xs",
    "py-1",
    "px-3",
    "text-sm",
    "py-1.5",
    "px-4",
    "text-lg",
    "py-2.5",
    "px-8",
    "bg-gradient-to-r",
    "from-primary",
    "to-secondary",
    "text-white",
    "shadow-glow",
    "hover:from-primary-light",
    "hover:to-secondary-light",
    "hover:shadow-glow-hover",
    "hover:transform",
    "hover:-translate-y-0.5",
    "bg-primary/10",
    "border-2",
    "border-primary/50",
    "hover:border-primary/80",
    "hover:bg-primary/20",
    "shadow-sm",
    "hover:shadow",
    "bg-red-500",
    "hover:bg-red-600",
    "bg-transparent",
    "hover:bg-white/10",
    "bg-success",
    "hover:bg-success-light",
    "relative",
    "after:absolute",
    "after:inset-0",
    "after:rounded-full",
    "after:bg-primary/20",
    "after:blur-lg",
    "after:transform",
    "after:scale-110",
    "after:-z-10",
    "opacity-60",
    "cursor-not-allowed",
    "mr-2",
    "inline-block",
    "animate-spin",
    "h-4",
    "w-4",
    "opacity-25",
    "opacity-75",
    "ml-2",
    "from-purple-500/10",
    "to-transparent",
    "border-purple-500/30",
    "from-primary/10",
    "to-secondary/10",
    "border-primary/30",
  ],
  theme: {
    colors: {
      // Primary palette
      primary: {
        DEFAULT: "rgb(89, 91, 255)",
        light: "rgb(125, 125, 255)",
      },
      secondary: {
        DEFAULT: "rgb(157, 78, 221)",
        light: "rgb(187, 118, 242)",
      },
      // Background shades
      background: {
        DEFAULT: "rgb(12, 14, 30)",
        card: "rgba(22, 24, 48, 0.3)",
        light: "rgb(22, 24, 48)",
        dark: "rgb(8, 10, 20)",
      },
      // Teal accent
      teal: {
        DEFAULT: "rgb(0, 209, 255)",
        light: "rgb(129, 229, 247)",
      },
      // Purple accent (vanguard)
      purple: {
        dark: "rgb(23, 11, 41)", // #170B29 - Card/Container background
        darker: "rgb(25, 14, 44)", // #190E2C - Dialog background
        select: "rgb(40, 27, 62)", // #281B3E - Select dropdown background
        light: "rgb(188, 135, 255)", // #BC87FF - Highlight/Accent color
        surface: "rgb(15, 17, 35)",
        fallback: "rgb(81, 72, 107)", // #51486B - Fallback background color for icons
      },
      // Status colors
      success: "rgb(48, 208, 88)",
      warning: "rgb(242, 153, 74)",
      error: "rgb(242, 78, 78)",
      danger: "rgb(217, 91, 129)", // #D95B81 - Error/Warning tooltip
      base: {
        contrast: {
          DEFAULT: "rgb(var(--oui-color-base-foreground) / 0.98)",
          80: "rgb(var(--oui-color-base-foreground) / 0.80)",
          54: "rgb(var(--oui-color-base-foreground) / 0.54)",
          36: "rgb(var(--oui-color-base-foreground) / 0.36)",
          20: "rgb(var(--oui-color-base-foreground) / 0.2)",
          12: "rgb(var(--oui-color-base-foreground) / 0.12)",
          16: "rgb(var(--oui-color-base-foreground) / 0.16)",
        },
        1: "rgb(var(--oui-color-base-1) / <alpha-value>)",
        2: "rgb(var(--oui-color-base-2) / <alpha-value>)",
        3: "rgb(var(--oui-color-base-3) / <alpha-value>)",
        4: "rgb(var(--oui-color-base-4) / <alpha-value>)",
        5: "rgb(var(--oui-color-base-5) / <alpha-value>)",
        6: "rgb(var(--oui-color-base-6) / <alpha-value>)",
        7: "rgb(var(--oui-color-base-7) / <alpha-value>)",
        8: "rgb(var(--oui-color-base-8) / <alpha-value>)",
        9: "rgb(var(--oui-color-base-9) / <alpha-value>)",
        10: "rgb(var(--oui-color-base-10) / <alpha-value>)",
      },
      line: {
        4: "rgb(var(--oui-color-line, 255 255 255) / 0.04)",
        6: "rgb(var(--oui-color-line, 255 255 255) / 0.06)",
        DEFAULT: "rgb(var(--oui-color-line, 255 255 255) / 0.08)",
        12: "rgb(var(--oui-color-line, 255 255 255) / 0.12)",
        16: "rgb(var(--oui-color-line, 255 255 255) / 0.16)",
      },
    },
    extend: {
      backgroundImage: {
        // Gradients for buttons
        "gradient-primaryButton":
          "linear-gradient(135deg, rgba(89, 91, 255, 0.9), rgba(157, 78, 221, 0.9))",
        "gradient-primaryButtonHover":
          "linear-gradient(135deg, rgba(125, 125, 255, 1), rgba(187, 118, 242, 1))",
        "gradient-secondaryButton":
          "linear-gradient(135deg, rgba(22, 24, 48, 0.8), rgba(12, 14, 30, 0.8))",
      },
      boxShadow: {
        glow: "0 0 10px rgba(89, 91, 255, 0.2)",
        "glow-hover": "0 0 15px rgba(89, 91, 255, 0.3)",
      },
    },
  },
  preflights: [
    {
      getCSS: () => `
        html {
          color: white;
          background-color: #000;
          font-family: 'Atyp Text', sans-serif;
          font-feature-settings: "ss02" on, "ss03" on, "ss05" on, "ss06" on !important;
          font-weight: 400;
          margin: 0;
        }
        body {
          margin: 0;
        }
      `,
    },
  ],
});
