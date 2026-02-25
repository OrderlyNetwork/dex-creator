#!/usr/bin/env node
/**
 * merge translations into each language file
 * per-locale mode: read diff-<locale>.json files for each locale
 */
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = join(__dirname, "../app/i18n/locales");

const locales = ["zh", "tc", "ko", "es"];

// per-locale mode: read diff-<locale>.json for each locale
for (const locale of locales) {
  const diffPath = join(localesDir, `diff-${locale}.json`);
  if (!existsSync(diffPath)) {
    continue;
  }

  let diff = {};
  try {
    diff = JSON.parse(readFileSync(diffPath, "utf-8"));
  } catch {
    diff = {};
  }

  const filePath = join(localesDir, `${locale}.json`);
  let existing = {};
  try {
    existing = JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    existing = {};
  }

  const merged = { ...existing, ...diff };
  writeFileSync(filePath, JSON.stringify(merged, null, 2) + "\n", "utf-8");

  try {
    unlinkSync(diffPath);
  } catch {
    // ignore cleanup errors
  }
}

