/**
 * Export the `en` object from i18n modules to a JSON file.
 * Output path: app/app/i18n/locales/en.json (relative to cwd app/)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { en } from "../app/i18n/module/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Script lives in app/scripts/; output goes to app/app/i18n/locales/en.json
const outDir = path.resolve(__dirname, "..", "app", "i18n", "locales");
const outFile = path.join(outDir, "en.json");

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(en, null, 2), "utf-8");

console.log(`Written: ${outFile}`);
