/**
 * Find i18n keys that share the same English value (2+ times), verify translations
 * are identical in all locales. Never auto-applies: run without flags to get a
 * replacement plan and suggestions; after human review, use --apply to execute.
 *
 * - Same prefix (e.g. board.revenue, board.tableRevenue): in-module dedup — keep
 *   one key, remove others, replace all refs with the kept key. No common.ts.
 * - Different prefix (e.g. themeCustomizationSection.x, aiThemeGeneratorModal.y):
 *   suggestion only; recommend merging to common.xxx (no file changes).
 *
 * Usage:
 *   npx tsx scripts/consolidate-duplicate-i18n-keys.ts           # report only (plan + suggestions)
 *   npx tsx scripts/consolidate-duplicate-i18n-keys.ts --dry-run # preview same-prefix changes
 *   npx tsx scripts/consolidate-duplicate-i18n-keys.ts --apply  # apply same-prefix dedup only
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const APP_ROOT = path.resolve(__dirname, "..");
const MODULE_DIR = path.join(APP_ROOT, "app", "i18n", "module");
const LOCALES_DIR = path.join(APP_ROOT, "app", "i18n", "locales");
const EXCLUDE_DIRS = [
  "node_modules",
  "app/i18n/module",
  "app/i18n/locales",
  ".git",
];
const SOURCE_EXT = [".ts", ".tsx", ".js", ".jsx"];
const LOCALE_FILES = ["en.json", "zh.json", "tc.json", "ko.json", "es.json"];
const MODULE_EXCLUDE = new Set(["index.ts", "common.ts"]);

type KeyEntry = {
  key: string;
  value: string;
  filePath: string;
  start: number;
  end: number;
};

/** Unescape a double-quoted string value (handles \", \\, \n, etc.) */
function unescapeValue(s: string): string {
  return s
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t");
}

/** Parse module file content and return key-value entries with line ranges (1-based). */
function parseModuleFile(content: string, filePath: string): KeyEntry[] {
  const lines = content.split(/\r?\n/);
  const result: KeyEntry[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const singleMatch = line.match(
      /^\s*"([^"]+)":\s*"((?:[^"\\]|\\.)*)"\s*,?\s*$/
    );
    if (singleMatch) {
      const [, key, rawValue] = singleMatch;
      result.push({
        key,
        value: unescapeValue(rawValue),
        filePath,
        start: i + 1,
        end: i + 1,
      });
      i += 1;
      continue;
    }
    const keyOnlyMatch = line.match(/^\s*"([^"]+)":\s*$/);
    if (keyOnlyMatch && i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      const valueMatch = nextLine.match(/^\s*"((?:[^"\\]|\\.)*)"\s*,?\s*$/);
      if (valueMatch) {
        const key = keyOnlyMatch[1];
        const rawValue = valueMatch[1];
        result.push({
          key,
          value: unescapeValue(rawValue),
          filePath,
          start: i + 1,
          end: i + 2,
        });
        i += 2;
        continue;
      }
    }
    i += 1;
  }
  return result;
}

function collectAllKeys(): KeyEntry[] {
  const entries: KeyEntry[] = [];
  const files = fs.readdirSync(MODULE_DIR, { withFileTypes: true });
  for (const ent of files) {
    if (
      !ent.isFile() ||
      !ent.name.endsWith(".ts") ||
      MODULE_EXCLUDE.has(ent.name)
    )
      continue;
    const filePath = path.join(MODULE_DIR, ent.name);
    const content = fs.readFileSync(filePath, "utf-8");
    entries.push(...parseModuleFile(content, filePath));
  }
  return entries;
}

/** Group keys by identical English value; keep only groups with 2+ keys. */
function groupByValue(entries: KeyEntry[]): Map<string, KeyEntry[]> {
  const byValue = new Map<string, KeyEntry[]>();
  for (const e of entries) {
    const list = byValue.get(e.value) ?? [];
    list.push(e);
    byValue.set(e.value, list);
  }
  const result = new Map<string, KeyEntry[]>();
  for (const [value, list] of byValue) {
    if (list.length >= 2) result.set(value, list);
  }
  return result;
}

function loadLocale(localeFile: string): Record<string, string> | null {
  const filePath = path.join(LOCALES_DIR, localeFile);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw) as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

/** For a group of keys, check if in this locale they all have the same translation. */
function localeValuesConsistent(
  keys: string[],
  locale: Record<string, string>
): boolean {
  const values = keys.map(k => locale[k]).filter(v => v !== undefined);
  if (values.length !== keys.length) return false;
  const first = values[0];
  return values.every(v => v === first);
}

/** Filter to groups that have identical translations in all locale files. */
function filterMergeable(
  groups: Map<string, KeyEntry[]>
): Map<string, KeyEntry[]> {
  const mergeable = new Map<string, KeyEntry[]>();
  const localeData: Record<string, Record<string, string>> = {};
  for (const name of LOCALE_FILES) {
    const data = loadLocale(name);
    if (data) localeData[name] = data;
  }
  for (const [value, entries] of groups) {
    const keys = entries.map(e => e.key);
    const allConsistent = Object.values(localeData).every(locale =>
      localeValuesConsistent(keys, locale)
    );
    if (allConsistent) mergeable.set(value, entries);
  }
  return mergeable;
}

/** First segment of key (prefix before first dot). */
function getKeyPrefix(key: string): string {
  const dot = key.indexOf(".");
  return dot >= 0 ? key.slice(0, dot) : key;
}

/** Split mergeable groups into same-prefix (in-module dedup) vs different-prefix (suggestion only). */
function splitByPrefix(mergeable: Map<string, KeyEntry[]>): {
  samePrefix: Array<{ value: string; entries: KeyEntry[] }>;
  differentPrefix: Array<{ value: string; entries: KeyEntry[] }>;
} {
  const samePrefix: Array<{ value: string; entries: KeyEntry[] }> = [];
  const differentPrefix: Array<{ value: string; entries: KeyEntry[] }> = [];
  for (const [value, entries] of mergeable) {
    const prefixes = new Set(entries.map(e => getKeyPrefix(e.key)));
    if (prefixes.size === 1) {
      samePrefix.push({ value, entries });
    } else {
      differentPrefix.push({ value, entries });
    }
  }
  return { samePrefix, differentPrefix };
}

/** Pick canonical key for same-prefix group: first alphabetically. */
function chooseCanonicalKey(entries: KeyEntry[]): string {
  const keys = entries.map(e => e.key).sort();
  return keys[0];
}

/** Derive a suggested suffix for common.xxx from the English value (e.g. "Confirm delete?" -> "confirmDelete"). */
function suggestCommonKeySuffix(value: string): string {
  const cleaned = value
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .toLowerCase();
  const words = cleaned.split(/\s+/).filter(Boolean).slice(0, 4);
  if (words.length === 0) return "sharedKey";
  return words.map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1))).join("");
}

/** Count how many source files contain a reference to key (t/i18n.t/i18nKey). */
function countKeyRefs(key: string, sourceFiles: string[]): number {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `(\\bt\\s*\\(|i18n\\.t\\s*\\(|i18nKey\\s*=)\\s*["']${escaped}["']`,
    "g"
  );
  let count = 0;
  for (const filePath of sourceFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    const matches = content.match(re);
    if (matches) count += matches.length;
  }
  return count;
}

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

/** Remove lines [start, end] (1-based) from content. */
function removeLines(
  content: string,
  ranges: Array<{ start: number; end: number }>
): string {
  const lines = content.split(/\r?\n/);
  const toDelete = new Set<number>();
  for (const { start, end } of ranges) {
    for (let i = start; i <= end; i++) toDelete.add(i);
  }
  return lines.filter((_, i) => !toDelete.has(i + 1)).join("\n");
}

/** Replace in content every occurrence of oldKey with newKey in t(), i18n.t(), i18nKey=. */
function replaceKeyInSource(
  content: string,
  oldKey: string,
  newKey: string
): string {
  const escaped = oldKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    [new RegExp(`(\\bt\\s*\\(\\s*["'])${escaped}(["'])`, "g"), `$1${newKey}$2`],
    [
      new RegExp(`(i18n\\.t\\s*\\(\\s*["'])${escaped}(["'])`, "g"),
      `$1${newKey}$2`,
    ],
    [
      new RegExp(`(i18nKey\\s*=\\s*["'])${escaped}(["'])`, "g"),
      `$1${newKey}$2`,
    ],
  ] as [RegExp, string][];
  let out = content;
  for (const [re, repl] of patterns) {
    out = out.replace(re, repl);
  }
  return out;
}

type SamePrefixGroup = {
  value: string;
  entries: KeyEntry[];
  canonicalKey: string;
};
type DifferentPrefixGroup = { value: string; entries: KeyEntry[] };

function report(
  samePrefix: SamePrefixGroup[],
  differentPrefix: DifferentPrefixGroup[],
  sourceFiles: string[]
): void {
  const total = samePrefix.length + differentPrefix.length;
  if (total === 0) {
    console.log(
      "No mergeable duplicate key groups found (same en value and same translation in all locales)."
    );
    return;
  }

  console.log(
    `Found ${total} mergeable group(s) (${samePrefix.length} same-prefix, ${differentPrefix.length} different-prefix).\n`
  );

  if (samePrefix.length > 0) {
    console.log(
      "--- Same prefix (replacement plan — run --apply to execute) ---\n"
    );
    for (const { value, entries, canonicalKey } of samePrefix) {
      const toRemove = entries.filter(e => e.key !== canonicalKey);
      console.log(
        `  Value (en): "${value.slice(0, 60)}${value.length > 60 ? "..." : ""}"`
      );
      console.log(`    Keep: ${canonicalKey}`);
      for (const e of toRemove) {
        const refs = countKeyRefs(e.key, sourceFiles);
        console.log(
          `    Remove: ${e.key} (${path.relative(APP_ROOT, e.filePath)}) — ${refs} reference(s) will be updated`
        );
      }
      console.log("");
    }
  }

  if (differentPrefix.length > 0) {
    console.log(
      "--- Different prefix (suggestion only — recommend merging to common.xxx) ---\n"
    );
    for (const { value, entries } of differentPrefix) {
      const suffix = suggestCommonKeySuffix(value);
      const suggestedCommonKey = `common.${suffix}`;
      console.log(
        `  Value (en): "${value.slice(0, 60)}${value.length > 60 ? "..." : ""}"`
      );
      for (const e of entries) {
        console.log(`    - ${e.key} (${path.relative(APP_ROOT, e.filePath)})`);
      }
      console.log(
        `    Consider merging to common-prefix key, e.g.: "${suggestedCommonKey}"\n`
      );
    }
  }

  console.log(
    "Run with --dry-run to preview same-prefix changes, or --apply to execute them (after review)."
  );
}

function main() {
  const dryRun = process.argv.includes("--dry-run");
  const apply = process.argv.includes("--apply");

  const allEntries = collectAllKeys();
  const groups = groupByValue(allEntries);
  const mergeable = filterMergeable(groups);
  const { samePrefix: samePrefixRaw, differentPrefix } =
    splitByPrefix(mergeable);

  const sourceFiles = collectSourceFiles(APP_ROOT, APP_ROOT);
  const samePrefix: SamePrefixGroup[] = samePrefixRaw.map(
    ({ value, entries }) => ({
      value,
      entries,
      canonicalKey: chooseCanonicalKey(entries),
    })
  );

  report(samePrefix, differentPrefix, sourceFiles);

  if (samePrefix.length === 0 && differentPrefix.length === 0) return;
  if (!apply && !dryRun) return;

  // Only same-prefix groups are actionable; different-prefix are suggestion-only
  if (samePrefix.length === 0) {
    if (dryRun) {
      console.log(
        "\n--- DRY RUN: no same-prefix groups to apply (only suggestions above). ---"
      );
    }
    return;
  }

  /** Maps removed key -> canonical key for source replacement. */
  const keyToNewKey = new Map<string, string>();
  /** Per-file: line ranges to remove (non-canonical entries only). */
  const removeByFile = new Map<string, Array<{ start: number; end: number }>>();

  for (const { entries, canonicalKey } of samePrefix) {
    for (const e of entries) {
      if (e.key === canonicalKey) continue;
      keyToNewKey.set(e.key, canonicalKey);
      const ranges = removeByFile.get(e.filePath) ?? [];
      ranges.push({ start: e.start, end: e.end });
      removeByFile.set(e.filePath, ranges);
    }
  }

  const localeData: Record<string, Record<string, string>> = {};
  for (const name of LOCALE_FILES) {
    const data = loadLocale(name);
    if (data) localeData[name] = { ...data };
  }

  if (dryRun) {
    console.log(
      "\n--- DRY RUN: would apply the following (same-prefix in-module dedup only) ---\n"
    );
    for (const { entries, canonicalKey } of samePrefix) {
      const toRemove = entries.filter(e => e.key !== canonicalKey);
      let totalRefs = 0;
      for (const e of toRemove) {
        totalRefs += countKeyRefs(e.key, sourceFiles);
      }
      console.log(
        `  Keep "${canonicalKey}", remove ${toRemove.map(e => e.key).join(", ")}; ${totalRefs} reference(s) would be updated.`
      );
    }
    console.log("\nModule files to update (remove duplicate keys):");
    for (const [filePath, ranges] of removeByFile) {
      console.log(
        `  ${path.relative(APP_ROOT, filePath)}: ${ranges.length} key(s)`
      );
    }
    console.log("\nLocales: remove duplicate keys (canonical key retained).");
    console.log("Source: replace removed keys with canonical key.");
    return;
  }

  if (!apply) return;

  // 1. Remove non-canonical keys from module files
  for (const [filePath, ranges] of removeByFile) {
    const content = fs.readFileSync(filePath, "utf-8");
    const newContent = removeLines(content, ranges);
    fs.writeFileSync(filePath, newContent, "utf-8");
    console.log(`Updated ${path.relative(APP_ROOT, filePath)}`);
  }

  // 2. Remove deleted keys from locale JSONs (canonical key stays)
  for (const oldKey of keyToNewKey.keys()) {
    for (const data of Object.values(localeData)) {
      delete data[oldKey];
    }
  }
  for (const [localeName, data] of Object.entries(localeData)) {
    const filePath = path.join(LOCALES_DIR, localeName);
    const sorted = Object.keys(data).sort();
    const obj: Record<string, string> = {};
    for (const k of sorted) obj[k] = data[k];
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), "utf-8");
    console.log(`Updated ${localeName}`);
  }

  // 3. Replace in source: removed key -> canonical key
  for (const filePath of sourceFiles) {
    let content = fs.readFileSync(filePath, "utf-8");
    let changed = false;
    for (const [oldKey, newKey] of keyToNewKey) {
      const next = replaceKeyInSource(content, oldKey, newKey);
      if (next !== content) {
        content = next;
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`Updated ${path.relative(APP_ROOT, filePath)}`);
    }
  }

  console.log(
    "\nDone (in-module dedup only). You may run: npm run export-en-json && npm run sync-locales"
  );
}

main();
