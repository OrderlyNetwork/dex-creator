---
name: verify-i18n-replacements
description: Verifies that i18n replacements (t/i18n.t/Trans) in source code follow extract-i18n-keys rules and that keys exist in modules with correct English copy; also checks for over-extraction (content that should not have been extracted, e.g. URLs, class names, alt/aria-label/data-*, meta, technical strings). When given a commit or range, scopes verification to changed files and optionally checks that replaced text matches module values via diff. Use for PR/commit review, i18n audit, or post-replacement validation. Read-only.
---

# Verify i18n Replacements

You verify that existing i18n usage in this repo follows the rules from [extract-i18n-keys](../extract-i18n-keys/SKILL.md) and that key values are correct. You do **not** modify any files; you only produce a structured report.

**When to use**: User asks to check i18n replacements by commit, audit replaced copy, verify rules, or find over-extracted content (e.g. "check i18n by commit", "verify i18n replacements", "did replaced text change", "are there i18n keys that should not have been extracted", "do inline components use Trans").

## 0. Key-value storage

i18n key-value pairs live under **`app/app/i18n/module/`**: route modules as `<prefix>.ts`, component keys in **`components.ts`**. Entry: `app/app/i18n/module/index.ts`. Use these modules as the source of truth when checking key existence and values.

## 1. Input and scope

**Preferred: commit or commit range**

- **Single commit**: `git diff --name-only <commit>^..<commit>` or `git show --name-only --pretty= <commit>` to get changed files.
- **Range**: `git diff --name-only <base>..<head>`; if user gives two refs, treat as `<base> <head>`.
- Filter the list: keep only `.ts`, `.tsx`, `.js`, `.jsx`; exclude any path under `i18n` (e.g. `**/i18n/**`), and `*.test.*`, `*.spec.*`.
- **Only these changed source files** are verified.

**Optional: path**

- Single file or directory (relative to repo root). Same extension and exclusion filters. Recursively collect files under the directory.

Result: **list of files to verify**.

## 2. Checks to perform

### 2.1 Key existence and module

- Collect every key from: `t("...")`, `t('...')`, `` t(`...`) ``, `i18n.t("...", ...)`, `<Trans i18nKey="..."`.
- Resolve key to module using extract-i18n-keys prefix rules: key is `prefix.slugKey`; route modules in `app/app/i18n/module/<prefix>.ts`, component keys in `app/app/i18n/module/components.ts` (see [reference.md](reference.md) for route→prefix and component→prefix).
- **Report**: any key that does not exist in the corresponding module as "Missing key" with file:line.

### 2.2 Rule compliance (extract-i18n-keys)

- **t vs i18n.t**: Inside a React component (with `useTranslation()`), use `t(...)`. At module top-level or outside components (e.g. config objects, utils), **must** use `i18n.t(...)`; never `t()` at top-level (hooks rule). Report violations.
- **Prefix vs file location**: File under `app/app/routes/_layout.<segment>/` → key prefix should match that route’s module name (e.g. distributor, points, dex). File under `app/app/components/` → prefix should match component name (camelCase from filename or directory; see reference). Report "prefix does not match file location" when inconsistent.
- **Trans usage**:
  - **Inline components / rich text must use Trans**: If JSX has user-facing text interleaved with inline nodes (e.g. `<>text <a href="...">link</a> more</>`, `<p><span className="...">X</span> text</p>`), it must be translated with `<Trans i18nKey="..." components={[...]} />` and `<0>...</0>` placeholders in the module value, not with `t()` or multiple `t()` calls. Report "inline components / rich text should use Trans component for translation" when such structure is translated without Trans.
  - When `<Trans i18nKey="..." components={[...]} />` is used, the module value must contain placeholders `<0>`, `<1>`, … matching the length of `components`. Report "Trans placeholders do not match components" if missing or count wrong.
  - If the key’s value has `{{varName}}`, the call site must pass `values={{ varName: ... }}`. Report missing interpolation.
- **Colon/parentheses**: If source renders as `{t("x")}:`, the module value must **not** end with a colon. If source renders as ` ({t("x")})`, the module value must **not** include the parentheses. Report violations.
- **No key indirection**: Config must not use `titleKey`/`descKey`/`labelKey` and then `t(step.titleKey)`; use `i18n.t("prefix.key")` directly. Report "key indirection present; use i18n.t directly".
- **Key depth**: Key at most 5 levels (e.g. `home.dialog.confirm.button.submit`). Warn if deeper.

### 2.3 Content consistency (replaced text unchanged)

- Every referenced key must exist in the module and have a non-empty string value.
- If source calls `t("key", { var1, var2 })`, the module value must contain `{{var1}}`, `{{var2}}` (or match Trans `values`). If value has `{{x}}` but call does not pass `x`, report "missing interpolation".
- **When input is a commit/range**: For each changed file, use `git diff <commit>^..<commit> -- <file>` (or range diff) to get (oldText, key) where oldText was replaced by `t("key")`/`i18n.t("key")`/Trans. Normalize oldText (e.g. `${x}` → `{{x}}`, strip colon/paren that stay in source only) and compare to current module value for that key. If different, report "content changed after replacement: key `xxx` module value does not match the original text replaced in this commit".
- Without commit: only check existence, non-empty, and interpolation; optionally list key→value for manual review.

### 2.4 Over-extraction (should not have been extracted)

Using extract-i18n-keys **exclusion rules**, if a key’s value (or the replaced text from diff) is in an excluded category, report "this content does not require i18n; should not use i18n key".

**Exclusion criteria** (align with extract-i18n-keys §2.3, 2.1):

- **Pure URL/domain**: Value starts with `http://`/`https://` or is clearly a domain (including bare domains). Keep hardcoded.
- **Class names / CSS / Tailwind**: className, Tailwind tokens, CSS strings. Do not extract.
- **Attribute exclusions**: Key used for `img` alt, `aria-label`, or any `data-*` (e.g. `data-testid`, `data-cy`). Do not extract.
- **Route meta**: Usage inside `export const meta: MetaFunction = () => [...]` in a route file. Meta strings stay hardcoded.
- **Explicit opt-out**: Replaced node was inside `data-i18n-ignore` or line immediately after `// i18n-ignore`. Do not extract.
- **Technical / non-user copy**: Route paths, variable names, enum keys, log tags, hex, pure numbers/symbols; single- or two-character technical/abbreviation (e.g. `"OK"`, `"id"`) unless clearly UI label. Do not extract.

For each referenced key, use module value and context (attribute name, parent, inside meta, ignore markers). If it matches an exclusion, add to report and suggest reverting to hardcoded (this skill does not edit files).

## 3. Output format

Produce a structured report (Markdown or plain text) with:

1. **Scope**: Commit/range if any, list of files verified, total counts of t(), i18n.t(), Trans.
2. **Missing keys**: key + file:line.
3. **Rule violations**: type tag (e.g. [prefix], [Trans required], [colon]) + location + short suggestion.
4. **Interpolation**: keys with missing or mismatched placeholders/values.
5. **Content mismatch** (commit mode only): (oldText, key) where module value ≠ normalized oldText.
6. **Should not have been extracted**: key + location + reason (URL, class name, alt/aria-label/data-*, meta, technical string, etc.); suggest hardcoding.
7. **Summary**: Pass / Warning / Error counts; optionally key→value list for manual check.

Example:

```text
## Verify i18n Replacements

**Scope**: commit abc1234 (3 files changed), 12 usages (8 t(), 2 i18n.t(), 2 Trans).

### Missing keys
- `distributor.step.5.title` in app/app/routes/_layout.distributor/.../Steps.tsx:42

### Rule violations
- [prefix] app/app/components/Footer.tsx:10 — key `home.cta` used in component file; expected prefix `footer` (component name).
- [Trans required] app/.../InfoCard.tsx:15 — JSX has inline `<a>documentation</a>` mixed with text; should use Trans with components, not t().
- [colon] app/.../Card.tsx:20 — key `distributor.label` value in module ends with `:`; colon should be in source only, e.g. `{t("...")}:`.

### Content mismatch (replaced text ≠ module value)
- key `distributor.submitLabel`: in commit the replaced text was "Submit order", module value is "Submit" — possible content change.

### Should not have been extracted (over-extraction)
- key `common.footerLink` in app/.../Footer.tsx:8 — module value "https://docs.example.com" is a URL; keep hardcoded, do not use i18n.
- key `home.metaTitle` in app/.../route.tsx:5 — used inside `meta` export; meta strings should remain hardcoded per extract-i18n-keys.

### Interpolation
- `orderlyKeyLoginModal.switchNetworkMultisig` in ... — value has `{{networkName}}` but call site does not pass `networkName`.

### Summary
- Pass: 9 | Warnings: 2 | Errors: 1
```

## 4. Implementation notes (for the agent)

- **Scope**: If user gives commit or base..head, run `git diff --name-only` first; filter by extension and exclusions; verify **only** those files.
- **Parse keys**: Regex or AST for `t("key")`, `t('key')`, `` t(`key`) ``, `i18n.t("key", ...)`, `<Trans i18nKey="key"`; handle multiline and escapes.
- **Inline/rich detection**: Scan JSX for blocks that mix text nodes with inline elements (e.g. fragment or block with both text and `<a>`/`<span>` children). If such a block is translated, it must use Trans; otherwise report [Trans required].
- **Resolve prefix**: First segment of key is prefix (e.g. `distributor.completeProfile.step.3` → `distributor`). Component keys in components.ts use first segment as component prefix.
- **Load modules**: Read `app/app/i18n/module/*.ts` and `components.ts`; collect key→value from exported objects (regex for `"key": "value"` or parse object literals).
- **File path → expected prefix**: Use [reference.md](reference.md) (route→module table, component name rules); route segment to camelCase, component file/dir to camelCase.
- **Commit diff for content**: For each changed file, get diff hunks; match removed string/JSX to added t()/i18n.t()/Trans key; build (oldText, key); normalize oldText and compare to module value; report mismatches.
- **Over-extraction**: For each key, use module value and context (attribute, inside meta, data-i18n-ignore, // i18n-ignore). If URL/domain, class/Tailwind, alt/aria-label/data-*/meta/ignore, or technical string, add to "Should not have been extracted".
- **Read-only**: Do not write to modules or change source; only output the report.

## Checklist

- [ ] Input: commit/range or path; scope = changed files (or path) after filters.
- [ ] Keys collected from t(), i18n.t(), Trans in scope files.
- [ ] Keys resolved to module (prefix → module file); missing keys reported.
- [ ] Rules: t vs i18n.t, prefix vs path, Trans required for inline/rich, Trans placeholders, colon/paren, no key indirection, key depth.
- [ ] Content: key exists, non-empty; interpolation matches; if commit, diff-based (oldText, key) vs module value.
- [ ] Over-extraction: exclusions applied; report "Should not have been extracted" where applicable.
- [ ] Output: scope, missing keys, rule violations, interpolation, content mismatch, over-extraction, summary.
