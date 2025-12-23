import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

// Global ignores for the entire project
const ignores = globalIgnores([
  "**/node_modules/",
  "**/dist/",
  "**/build/",
  ".git/",
  "**/*.json",
  "**/*.md",
  ".specstory/",
  "app/public/tradingview/",
  "api/types/",
  "api/src/lib/generated/",
]);

export default defineConfig([
  ignores,
  // Base configuration for all JavaScript files
  {
    name: "dex-creator/js-base",
    files: ["**/*.{js,cjs,mjs}"],
    ...eslint.configs.recommended,
    rules: {
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "prefer-const": "error",
      semi: ["error", "always"],
      "no-console": ["warn", { allow: ["error", "info"] }],
    },
  },
  // TypeScript specific configuration
  {
    name: "dex-creator/ts-base",
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        // No project reference to avoid tsconfig.json issues
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // Using basic recommended rules without type checking
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // Special rule for JavaScript configuration files (like this one)
  {
    name: "dex-creator/js-config-files",
    files: ["**/*.config.js"],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  // React/JSX specific rules
  {
    name: "dex-creator/react",
    files: ["**/*.{jsx,tsx}"],
    rules: {
      "react/prop-types": "off",
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
    },
  },
  // Prettier configuration for all files
  {
    name: "dex-creator/prettier",
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      "prettier/prettier": "error", // Use the .prettierrc.js file for configuration
    },
  },
  // Frontend app specific rules
  {
    name: "dex-creator/frontend",
    files: ["app/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        document: "readonly",
        window: "readonly",
        navigator: "readonly",
      },
    },
  },
  // Backend API specific rules
  {
    name: "dex-creator/backend",
    files: ["api/**/*.{js,ts}"],
    rules: {
      // Note: This inherits the console rule from js-base
    },
  },
]);
