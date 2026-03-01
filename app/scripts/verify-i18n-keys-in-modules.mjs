#!/usr/bin/env node
/**
 * 校验 commit 中引用的 i18n key 是否都存在于对应 module。
 * 用法: node scripts/verify-i18n-keys-in-modules.mjs [commitHash]
 * 默认 commit: 49a44cbd15dc79852be377c26037b743ef31d15c
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MODULE_DIR = path.join(ROOT, "app", "i18n", "module");

const COMMIT = process.argv[2] || "49a44cbd15dc79852be377c26037b743ef31d15c";

// 从源码中提取 t("key") / i18n.t("key") / i18nKey="key"
const KEY_IN_SOURCE_RE =
  /(?:^|[^\w.])(?:t|i18n\.t)\s*\(\s*["'`]([^"'`]+)["'`]|i18nKey\s*=\s*["']([^"']+)["']/g;

// 从 module 文件中提取 "key": 的 key 名（value 可能是 "、'、` 或换行）
const KEY_IN_MODULE_RE = /"([^"]+)"\s*:/g;

function getChangedFiles(commit) {
  const out = execSync(`git show --name-only --pretty=format: ${commit}`, {
    encoding: "utf-8",
    cwd: ROOT,
  });
  return out
    .trim()
    .split("\n")
    .filter(
      f =>
        /\.(ts|tsx|js|jsx)$/.test(f) &&
        !f.includes("/i18n/") &&
        !/\.(test|spec)\./.test(f)
    );
}

function getFileContentAtCommit(commit, filePath) {
  try {
    // 转义 $ 等字符，避免 shell 展开（如 _layout.board_.$dexId.tsx）
    const escaped = filePath
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\$/g, "\\$");
    return execSync(`git show "${commit}:${escaped}"`, {
      encoding: "utf-8",
      cwd: ROOT,
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch {
    return "";
  }
}

function extractKeysFromSource(content) {
  const keys = new Set();
  let m;
  KEY_IN_SOURCE_RE.lastIndex = 0;
  while ((m = KEY_IN_SOURCE_RE.exec(content)) !== null) {
    const key = m[1] || m[2];
    if (key && key.length > 0) keys.add(key);
  }
  return keys;
}

function extractKeysFromModuleFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const keys = new Set();
  let m;
  KEY_IN_MODULE_RE.lastIndex = 0;
  while ((m = KEY_IN_MODULE_RE.exec(content)) !== null) {
    if (m[1]) keys.add(m[1]);
  }
  return keys;
}

function loadAllModuleKeys() {
  const allKeys = new Set();
  const files = fs.readdirSync(MODULE_DIR);
  for (const f of files) {
    if (f === "index.ts" || !f.endsWith(".ts")) continue;
    const fullPath = path.join(MODULE_DIR, f);
    if (!fs.statSync(fullPath).isFile()) continue;
    for (const k of extractKeysFromModuleFile(fullPath)) {
      allKeys.add(k);
    }
  }
  return allKeys;
}

function main() {
  console.log(`Commit: ${COMMIT}\n`);

  const changedFiles = getChangedFiles(COMMIT);
  console.log(`Changed source files (to scan): ${changedFiles.length}`);

  const keysInSource = new Set();
  const keyToFiles = new Map();

  for (const file of changedFiles) {
    const content = getFileContentAtCommit(COMMIT, file);
    const keys = extractKeysFromSource(content);
    for (const k of keys) {
      keysInSource.add(k);
      if (!keyToFiles.has(k)) keyToFiles.set(k, []);
      keyToFiles.get(k).push(file);
    }
  }

  console.log(
    `Unique keys referenced in changed files: ${keysInSource.size}\n`
  );

  const moduleKeys = loadAllModuleKeys();
  console.log(`Keys defined in i18n modules: ${moduleKeys.size}\n`);

  const missing = [...keysInSource].filter(k => !moduleKeys.has(k)).sort();

  if (missing.length === 0) {
    console.log("OK: All referenced keys exist in modules.");
    process.exit(0);
  }

  console.log(`Missing keys (${missing.length}):\n`);
  for (const key of missing) {
    const files = keyToFiles.get(key).slice(0, 3);
    const rest = keyToFiles.get(key).length - files.length;
    const fileList = files.join(", ") + (rest > 0 ? ` (+${rest} more)` : "");
    console.log(`  ${key}`);
    console.log(`    used in: ${fileList}`);
  }
  process.exit(1);
}

main();
