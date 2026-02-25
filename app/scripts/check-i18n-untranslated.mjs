#!/usr/bin/env node
/**
 * i18n untranslated keys check script.
 *
 * Rules:
 * - For all locale files configured in LOCALES (en/zh/tc/ko/es)
 * - If a key exists in all locales and its value is the same non-empty string
 *   everywhere, the key is considered "untranslated" (same copy used for all locales)
 *
 * Output:
 * - Writes untranslated.json under app/app/i18n/locales
 * - Format: { [key: string]: string }, value taken from en.json (same across all locales)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root of app subproject: .../dex-creator-main/app
const ROOT = path.resolve(__dirname, "..");
// Locales dir: .../dex-creator-main/app/app/i18n/locales
const LOCALES_DIR = path.join(ROOT, "app", "i18n", "locales");

// List of locales to compare; add or remove as needed
const LOCALES = ["en", "zh", "tc", "ko", "es"];

/**
 * Load and parse a locale JSON file.
 */
function loadLocale(locale) {
  const filePath = path.join(LOCALES_DIR, `${locale}.json`);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to read or parse: ${filePath}`, err.message);
    process.exit(1);
  }
}

function main() {
  const data = {};
  const allKeys = new Set();

  // Load all locale JSON files and collect all keys
  for (const locale of LOCALES) {
    const json = loadLocale(locale);
    data[locale] = json;
    for (const key of Object.keys(json)) {
      allKeys.add(key);
    }
  }

  // Collect key -> value for "likely untranslated" keys (using en value)
  const untranslated = {};

  for (const key of allKeys) {
    let baseValue = undefined;
    let allEqual = true;

    for (const locale of LOCALES) {
      const value = data[locale][key];

      // Only keys that exist in all locales with non-empty string values are considered for "untranslated"
      if (typeof value !== "string" || value.trim() === "") {
        allEqual = false;
        break;
      }

      if (baseValue === undefined) {
        baseValue = value;
      } else if (value !== baseValue) {
        // If any locale has a different value, skip (considered translated)
        allEqual = false;
        break;
      }
    }

    if (allEqual && baseValue !== undefined) {
      // All locales have the same value; treat as untranslated and record (value from en.json)
      untranslated[key] = data["en"][key];
    }
  }

  const outPath = path.join(LOCALES_DIR, "untranslated.json");
  fs.writeFileSync(outPath, JSON.stringify(untranslated, null, 2), "utf-8");

  const count = Object.keys(untranslated).length;
  if (count === 0) {
    console.info(
      "No untranslated keys found (no keys with identical non-empty value across all locales)."
    );
  } else {
    console.info(`Found ${count} likely untranslated key(s), written to ${outPath}`);
  }

  // To fail CI when untranslated keys are found, change the next line to:
  // process.exit(count > 0 ? 1 : 0);
  process.exit(0);
}

main();
