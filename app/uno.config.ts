import { defineConfig, presetUno, presetWebFonts, presetIcons } from "unocss";

export default defineConfig({
  presets: [
    presetUno(),
    presetWebFonts({
      provider: "google",
      fonts: {
        sans: "Inter:400,500,600,700",
      },
    }),
    presetIcons(),
  ],
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
      // Status colors
      success: "rgb(48, 208, 88)",
      warning: "rgb(242, 153, 74)",
      error: "rgb(242, 78, 78)",
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
});
