/**
 * Scan all keys under app/app/i18n/module and check if they are used in the project (t / i18n.t / Trans i18nKey).
 * Unused keys are removed from the corresponding module files.
 *
 * Usage: tsx scripts/remove-unused-i18n-keys.ts [--dry-run]
 * --dry-run: Only print keys that would be removed; do not modify files.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const APP_ROOT = path.resolve(__dirname, "..");
const MODULE_DIR = path.join(APP_ROOT, "app", "i18n", "module");

// Directories to exclude when searching for key usage (paths relative to APP_ROOT)
const EXCLUDE_DIRS = [
  "node_modules",
  "app/i18n/module",
  "app/i18n/locales",
  ".git",
];
const SOURCE_EXT = [".ts", ".tsx", ".js", ".jsx"];

/** Parse all keys and their line ranges [startLine, endLine] (1-based) from module file content. */
function parseKeysAndRanges(
  content: string
): Array<{ key: string; start: number; end: number }> {
  const lines = content.split(/\r?\n/);
  const result: Array<{ key: string; start: number; end: number }> = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Match "key": or "key": "value",
    const singleLineMatch = line.match(
      /^\s*"([^"]+)":\s*"(?:[^"\\]|\\.)*",?\s*$/
    );
    if (singleLineMatch) {
      result.push({ key: singleLineMatch[1], start: i + 1, end: i + 1 });
      i += 1;
      continue;
    }
    const keyOnlyMatch = line.match(/^\s*"([^"]+)":\s*$/);
    if (keyOnlyMatch && i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      if (/^\s*"(?:[^"\\]|\\.)*",?\s*$/.test(nextLine)) {
        result.push({ key: keyOnlyMatch[1], start: i + 1, end: i + 2 });
        i += 2;
        continue;
      }
    }
    i += 1;
  }
  return result;
}

/** Collect all .ts files (except index.ts) under the module dir and their keys with line ranges. */
function collectModuleKeys(): Map<
  string,
  Array<{ key: string; start: number; end: number }>
> {
  const fileToKeys = new Map<
    string,
    Array<{ key: string; start: number; end: number }>
  >();
  const files = fs.readdirSync(MODULE_DIR, { withFileTypes: true });
  for (const ent of files) {
    if (!ent.isFile() || !ent.name.endsWith(".ts") || ent.name === "index.ts")
      continue;
    const filePath = path.join(MODULE_DIR, ent.name);
    const content = fs.readFileSync(filePath, "utf-8");
    const keys = parseKeysAndRanges(content);
    if (keys.length > 0) fileToKeys.set(filePath, keys);
  }
  return fileToKeys;
}

/** Recursively collect all source files to scan under the given directory. */
function collectSourceFiles(dir: string, relativeTo: string): string[] {
  const out: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    const rel = path.relative(relativeTo, full);
    if (ent.isDirectory()) {
      if (
        EXCLUDE_DIRS.some(
          ex => rel.startsWith(ex) || ent.name === "node_modules"
        )
      )
        continue;
      out.push(...collectSourceFiles(full, relativeTo));
    } else if (SOURCE_EXT.some(ext => ent.name.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

/** Whether the key appears in source as t("key"), i18n.t("key"), i18nKey="key", etc. */
function isKeyUsedInSources(key: string, sourceFiles: string[]): boolean {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Only match t("key"), i18n.t("key"), i18nKey="key" to avoid false positives from comments/other strings
  const patterns = [
    new RegExp(`\\bt\\s*\\(\\s*["']${escaped}["']`, "m"),
    new RegExp(`i18n\\.t\\s*\\(\\s*["']${escaped}["']`, "m"),
    new RegExp(`i18nKey\\s*=\\s*["']${escaped}["']`, "m"),
  ];
  for (const filePath of sourceFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    if (patterns.some(re => re.test(content))) return true;
  }
  return false;
}

/** Remove the given line ranges (1-based) from file content and return the new content. */
function removeLines(
  content: string,
  ranges: Array<{ start: number; end: number }>
): string {
  const lines = content.split(/\r?\n/);
  const toDelete = new Set<number>();
  for (const { start, end } of ranges) {
    for (let i = start; i <= end; i++) toDelete.add(i);
  }
  const newLines = lines.filter((_, i) => !toDelete.has(i + 1));
  return newLines.join("\n");
}

function main() {
  const dryRun = process.argv.includes("--dry-run");
  const sourceFiles = collectSourceFiles(APP_ROOT, APP_ROOT);
  const fileToKeys = collectModuleKeys();

  let totalUnused = 0;
  const toRemoveByFile = new Map<
    string,
    Array<{ key: string; start: number; end: number }>
  >();

  for (const [filePath, keys] of fileToKeys) {
    const unused = keys.filter(
      ({ key }) => !isKeyUsedInSources(key, sourceFiles)
    );
    if (unused.length > 0) {
      toRemoveByFile.set(filePath, unused);
      totalUnused += unused.length;
    }
  }

  if (totalUnused === 0) {
    console.log("No unused i18n keys found; nothing to remove.");
    return;
  }

  console.log(`Found ${totalUnused} unused key(s):\n`);
  for (const [filePath, unused] of toRemoveByFile) {
    const short = path.relative(APP_ROOT, filePath);
    console.log(`  ${short}:`);
    for (const { key } of unused) console.log(`    - ${key}`);
    console.log("");
  }

  if (dryRun) {
    console.log("(--dry-run: no files modified)");
    return;
  }

  for (const [filePath, unused] of toRemoveByFile) {
    const content = fs.readFileSync(filePath, "utf-8");
    const ranges = unused.map(({ start, end }) => ({ start, end }));
    const newContent = removeLines(content, ranges);
    fs.writeFileSync(filePath, newContent, "utf-8");
    console.log(`Updated: ${path.relative(APP_ROOT, filePath)}`);
  }
}

main();
