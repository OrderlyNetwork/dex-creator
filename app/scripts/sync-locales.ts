import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const localesDir = path.resolve(__dirname, "..", "app", "i18n", "locales");
const enFile = path.join(localesDir, "en.json");

function readJsonFile(filePath: string): Record<string, unknown> {
  const raw = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch (error) {
    throw new Error(
      `Failed to parse JSON for ${filePath}: ${(error as Error).message}`
    );
  }
}

function main() {
  if (!fs.existsSync(enFile)) {
    console.error(`[sync-locales] Missing canonical file: ${enFile}`);
    process.exitCode = 1;
    return;
  }

  const enObj = readJsonFile(enFile);
  const enKeys = Object.keys(enObj);

  if (enKeys.length === 0) {
    console.warn("[sync-locales] en.json has no keys, nothing to sync.");
    return;
  }

  const specifiedFile = process.argv[2]; // Optional: process only the specified locale file, e.g. zh.json
  const entries = fs.readdirSync(localesDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const fileName = entry.name;
    if (!fileName.endsWith(".json")) continue;
    if (fileName === "en.json") continue;
    if (fileName.startsWith("diff-")) continue;
    if (specifiedFile && fileName !== specifiedFile) continue;

    const filePath = path.join(localesDir, fileName);

    try {
      const localeObj = readJsonFile(filePath);
      const localeKeys = Object.keys(localeObj);

      const reordered: Record<string, unknown> = {};

      for (const key of enKeys) {
        reordered[key] = Object.prototype.hasOwnProperty.call(localeObj, key)
          ? localeObj[key]
          : enObj[key];
      }

      const keptKeys = Object.keys(reordered);
      const extraKeys = localeKeys.filter(key => !enKeys.includes(key));

      // Compare with en.json to find keys missing in this locale file
      const missingKeys = enKeys.filter(
        key => !Object.prototype.hasOwnProperty.call(localeObj, key)
      );

      fs.writeFileSync(filePath, JSON.stringify(reordered, null, 2), "utf-8");

      console.log(
        `[sync-locales] ${fileName}: kept ${keptKeys.length} keys, dropped ${extraKeys.length} extra keys.`
      );

      if (missingKeys.length > 0) {
        console.log(
          `[sync-locales] ${fileName}: ${missingKeys.length} key(s) missing (vs en.json):`
        );
        missingKeys.forEach(k => console.log(`  - ${k}`));
      } else {
        console.log(
          `[sync-locales] ${fileName}: keys match en.json, none missing.`
        );
      }
    } catch (error) {
      console.error(
        `[sync-locales] Failed to process ${fileName}: ${(error as Error).message}`
      );
      process.exitCode = 1;
    }
  }
}

main();
