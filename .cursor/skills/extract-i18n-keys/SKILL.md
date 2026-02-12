---
name: extract-i18n-keys
description: Extracts hardcoded copy from ts/tsx/js/jsx files, writes i18n keys to app/app/i18n/module by route/component prefix, and replaces strings with t() or i18n.t(). Use when extracting i18n keys, hardcoded copy, localization, or running extract-i18n-keys. Supports file/directory or commit hash as input; requires a clean working tree.
---

# Extract i18n Keys

You are responsible for extracting hardcoded copy from TypeScript/JavaScript files in this repo and writing them as i18n module keys under `app/app/i18n/module/`. Execute only when the working tree is clean. Do not merge new keys into `app/app/i18n/locales/en.json`; locale sync is handled by the project.

## 0. Conventions and paths

- Module dictionaries: `app/app/i18n/module/`
- Module index: `app/app/i18n/module/index.ts`
- Usage in components: `import { useTranslation } from "~/i18n"` then `t("prefix.slugKey")`
- Usage outside components: `import { i18n } from "~/i18n"` then `i18n.t("prefix.slugKey")`

## 1. Pre-checks and parameters

**1.1 Clean working tree**

Before any extraction or writes:

- Run `git status --porcelain`. If there is any output, **abort** and tell the user to commit or stash changes. Do not proceed.

**1.2 Input (user must provide one of)**

- **Option A**: One file path or one directory path, relative to the repo root. If a directory, recursively collect all files under it, then apply the filters in 1.3.
- **Option B**: Commit hash(s)—**single commit** or **range** (`base..head`):
  - Single commit: `git diff --name-only <commit>^..<commit>` or `git show --name-only --pretty= <commit>`.
  - Range: e.g. `git diff --name-only <base>..<head>`; if user gives two args, treat as `<base> <head>`.

**1.3 File filters**

From the candidate list, keep only:

- Extensions: `.ts`, `.tsx`, `.js`, `.jsx`.

Exclude:

- Any file under an `i18n` directory (e.g. `app/app/i18n/**`, or any path containing `/i18n/`).
- Any file matching `*.test.*` or `*.spec.*`.

Result: the **list of files to scan**.

## 2. Extract hardcoded texts

**2.1 Candidate matching**

- **String literals**: Double/single-quoted strings, length ≥ 2, e.g. `"([^"\\n]{2,})"`, `'([^'\\n]{2,})'`.
- **Template literals**: With or without `${...}`; e.g. `` `([^`\n]{2,})` ``.
- **React JSX text nodes**: Text inside elements, e.g. `<div>button</div>` → `button`, `<Button>Confirm</Button>` → `Confirm`. Identify JSXText / text children and treat as candidates.
- **JSX attribute strings**: e.g. `placeholder="Enter name"`, `title="Submit"`, `aria-label="Close"`. Treat as string literal candidates, **excluding `img` elements' `alt` attributes**.

**2.2 Template literal interpolation**

- Extract the full template string including interpolations.
- Convert `${variableName}` to `{{variableName}}` (camelCase).
- For complex expressions like `${format(date, "HH:mm")}`, use a semantic placeholder (e.g. `{{formattedDate}}`).

**2.3 Filtering**

- Exclude text already inside `t("...")`, `i18n.t("...")`, or `Trans`.
- Exclude: class names, CSS, Tailwind tokens, routes, variable names, enum keys, log tags, URLs, hex, pure numbers/symbols.
- Exclude: JSX `img` elements' `alt` attribute values from extraction (do not create i18n keys for them).
- Keep: human-readable text with spaces/punctuation or multiple words; placeholder patterns like `{{qty}}`, `{value}`.
- For JSX text: apply the same rules; exclude trim-empty, pure punctuation/digits; single words that are clearly UI labels (e.g. button text) may be kept.

Aggregate per file: **file → list of extracted texts** for module mapping and key generation.

## 3. File → module mapping (prefix)

**3.1 Route vs component**

- **Route files**: Under `app/app/routes/` (e.g. `_layout.*.tsx`, `route.tsx`). Use **page name** as prefix.
- **Component files**: Under `app/app/components/`, or components inside route directories (e.g. `routes/_layout.distributor/.../components/Card.tsx`). For components **inside a route directory**, prefer the **route’s module name**. For files under `app/app/components/`, use **component name** as prefix.

**3.2 Route → module name**

- `_layout._index` / `_index` → `home`
- `_layout.board`, `_layout.board_.$dexId` → `board`
- Others: take segment from `_layout.<segment>` or path, convert to camelCase (e.g. `case-studies` → `caseStudies`, `dex` → `dex`, `points` → `points`, `distributor` → `distributor`, `referral` → `referral`, `admin` → `admin`).

**3.3 Component name (for `app/app/components/` only)**

- **Single-file component**: From filename without extension, PascalCase → camelCase (e.g. `ThemePreviewModal.tsx` → `themePreviewModal`).
- **Directory component**: From directory name (e.g. `languageSwitcher/languageSwitcher.ui.tsx` → `languageSwitcher`, `select/index.tsx` → `select`).

**3.4 Fallback**

- Files not under routes or components (e.g. `app/app/utils/**`): if inferable from imports, use that route’s module; otherwise use `common`.

## 4. Key generation and de-duplication

- **Format**: `<prefix>.<slugKey>`. Prefix from section 3 (route or component name, camelCase). Key may have multiple levels (e.g. `home.dialog.title`, `home.dialog.description`); **at most 5 levels** (e.g. `home.dialog.confirm.button.submit`). If semantics require more depth, compress levels or use a shorter slugKey.
- **slugKey**: Short, readable identifier from the text; preserve placeholders like `{{qty}}`.
- **De-duplication**: If the target module already has the same key or same English value, reuse it. If only similar, add a suffix (e.g. `.description`, `.title`) or `-1`, `-2`.

## 5. Write to module and index

- **Target**: `app/app/i18n/module/<prefix>.ts`.
- **New module**: Create `app/app/i18n/module/<prefix>.ts` with `export const <prefix> = { "<prefix>.<slugKey>": "Original English", ... };`. Add to `app/app/i18n/module/index.ts`: `import { <prefix> } from "./<prefix>";` and `...<prefix>` in the `en` object, keeping imports and spreads in alphabetical order.
- **Existing module**: Append new keys inside the exported object (at the end); optionally keep keys alphabetically ordered.

## 6. Locales

- **Do not** merge new or changed keys into `app/app/i18n/locales/en.json`. Locale files are updated by the project’s own process (e.g. build script or manual).
- If the project has a locale sync script, run it after extraction to update other language files.

## 7. Replace in source

- **Inside React components**: Add `import { useTranslation } from "~/i18n"` if missing; use `const { t } = useTranslation();` and replace with `t("prefix.slugKey")` or `t("prefix.slugKey", { var1, var2 })` for interpolations. Placeholder names must match the object keys (e.g. `{{var1}}` → `{ var1 }`).
- **Outside components** (e.g. utils, scripts, class methods): Add `import { i18n } from "~/i18n"` and replace with `i18n.t("prefix.slugKey")` or `i18n.t("prefix.slugKey", { var1, var2 })`.
- **Trans vs t()**: If the original is plain static text with no rich text or HTML, replace with `t()`. If it contains React nodes or complex structure (e.g. inline links, components), keep `Trans` and follow project conventions.
- **Examples**:
  - Simple: `<span>Confirm</span>` → `<span>{t("common.confirm")}</span>`
  - With interpolation: `` `${qty} items` `` → `t("cart.itemCount", { qty })`

## Additional reference

- Note: JSX `img` elements' `alt` texts are intentionally excluded from extraction.
- For route→module table, component-name examples, regex/filter details, and edge cases, see [reference.md](reference.md) if present.
