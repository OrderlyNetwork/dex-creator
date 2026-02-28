---
name: extract-i18n-keys
description: Extracts hardcoded copy from ts/tsx/js/jsx files, writes i18n keys to app/app/i18n/module by route/component prefix, and replaces strings with t() or i18n.t(). Use when extracting i18n keys, hardcoded copy, localization, or running extract-i18n-keys. Supports file/directory or commit hash as input; requires no unstaged changes (staged changes are allowed).
---

# Extract i18n Keys

You are responsible for extracting hardcoded copy from TypeScript/JavaScript files in this repo and writing them as i18n module keys under `app/app/i18n/module/`. Execute only when there are no unstaged changes (staged changes are allowed). Do not merge new keys into `app/app/i18n/locales/en.json`; locale sync is handled by the project.

## 0. Conventions and paths

- Module dictionaries: `app/app/i18n/module/`
- Module index: `app/app/i18n/module/index.ts`
- Usage in components: `import { useTranslation } from "~/i18n"` then `t("prefix.slugKey")`
- Usage outside components: `import { i18n } from "~/i18n"` then `i18n.t("prefix.slugKey")`
- **Trans** (inline components / rich text): `import { Trans } from "~/i18n"`. Use when the string interleaves text with inline nodes (e.g. links, styled spans). Translation value uses `<0>...</0>`, `<1>...</1>` placeholders; pass a `components` array in the same order. Example:
  - Module: `"prefix.richSentence": "Read the <0>documentation</0> for details."`
  - JSX: `<Trans i18nKey="prefix.richSentence" components={[<a key="0" href="/docs" className="text-primary" />]} />`
  - Multiple placeholders: `"prefix.feeSplit": "Split: <0>X</0> to you, <1>Y</1> to protocol."` → `components={[<span key="0" className="font-medium text-success" />, <span key="1" className="font-medium text-primary" />]}`

## 1. Pre-checks and parameters

**1.1 No unstaged changes**

Before any extraction or writes:

- Run `git status --porcelain`.
- If any line has a **non-space second character** (i.e. there are unstaged changes in the working tree), **abort** and tell the user to commit, stash, or discard those unstaged changes. Do not proceed.
- If all lines have a space as the second character (only index/staged changes), or there is no output, **continue**. Staged changes are allowed.

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

- **String literals**: Double/single-quoted strings, length ≥ 2, e.g. `"([^"\\n]{2,})"`, `'([^'\\n]{2,})'`. Single-character or two-character strings that are technical/abbreviation (e.g. `"OK"`, `"id"`) do not need extraction; treat as exclude in 2.3.
- **Template literals**: With or without `${...}`; e.g. `` `([^`\n]{2,})` ``.
- **React JSX text nodes**: Text inside elements, e.g. `<div>button</div>` → `button`, `<Button>Confirm</Button>` → `Confirm`. Identify JSXText / text children and treat as candidates. **Include text inside heading elements** (`h1`, `h2`, `h3`, `h4`, `h5`, `h6`)—section headings are user-facing copy and must be extracted (e.g. `<h3>Trading fees fund a self-sustaining treasury for:</h3>` → extract the full heading text).
- **JSX interleaving text and components**: When you see a fragment or block that **interleaves** user-facing text with React nodes (e.g. `<>Sentence one <a href="...">link text</a> sentence two.</>` or `<>Label <span className="...">{{var}}</span> suffix.</>`), treat it as **one Trans candidate**, not multiple t() candidates. The replacement will use a single key with `<0>...</0>` placeholders and `Trans` with `components={[...]}` so the link/span styling is preserved. This applies not only to fragments (`<>...</>`), but also to block-level elements like `<p>`, `<div>`, `<li>`, etc. For example, `<p><span className="font-medium text-warning">Important:</span> You must use the <span className="font-medium">exact same wallet</span> for staking...</p>` should be treated as a single Trans candidate rather than multiple `t()` calls.
- **Trans over child nodes**: When a parent node (fragment, `<p>`, `<div>`, `<li>`, etc.) has children that alternate between text and inline components (`<a>`, `<span>`, etc.), prefer treating the **parent** as one Trans candidate and do **not** extract each child text node separately.
- **JSX attribute strings**: e.g. `placeholder="Enter name"`, `title="Submit"`. Treat as string literal candidates, **excluding `img` elements' `alt` attributes, `aria-label` attributes, and all `data-*` attributes** (e.g. `data-testid`, `data-cy`).

**2.2 Template literal interpolation**

- Extract the full template string including interpolations.
- Convert `${variableName}` to `{{variableName}}` (camelCase).
- For complex expressions like `${format(date, "HH:mm")}`, use a semantic placeholder (e.g. `{{formattedDate}}`).

**2.3 Filtering**

- Exclude text already inside `t("...")`, `i18n.t("...")`, or `Trans`.
- **Exclude text with opt-out marker**: When a JSX element has the `data-i18n-ignore` attribute, do not extract the text content of that element or its descendants. Usage: `<div data-i18n-ignore>© 2025 Orderly.</div>` keeps the copyright text hardcoded and untranslated.
- **Exclude text with comment opt-out**: When a line has the comment `// i18n-ignore` (or `/* i18n-ignore */`), do not extract any string literals on the **immediately following line** (e.g. `placeholder="R G B"`, `title="..."`, or other attribute/expression values). Usage: `// i18n-ignore` on the line above `placeholder="R G B"` keeps the placeholder hardcoded and untranslated.
- Exclude: class names, CSS, Tailwind tokens, routes, variable names, enum keys, log tags, URLs, hex, pure numbers/symbols. Exclude single-letter and two-character technical/abbreviation tokens (e.g. `"OK"`, `"id"`) unless clearly a UI label.
- **Exclude pure URL values**: Do not extract or create i18n keys for any string value (in placeholders, JSX text, attributes, or literals) that is a **pure URL or URL-like** (e.g. starts with `http://` or `https://`, or is clearly a domain/hostname — **including bare domains without protocol prefixes** — such as `https://t.me/your-group`, `https://discord.gg/your-server`, `https://your-dex.com`, `example.com`). These are not user-facing copy and do not need translation; keep them hardcoded in source.
- For attribute handling, follow section 2.1 as the single source of truth (`img alt`, `aria-label`, and `data-*` are excluded there).
- Exclude: route-level `meta` exports at the top of route files, such as `export const meta: MetaFunction = () => [ { title: "Case Studies | Orderly One" }, ... ];`. Do not extract or replace the strings inside these `meta` definitions; they should remain hardcoded.
- **Colon-suffixed strings**: When a candidate string **ends with** a colon (half-width `:` or full-width `：`), extract **only the part without the colon** as the i18n key value. The colon (and any trailing space before it) remains hardcoded in the source — e.g. render as `{t("prefix.key")}:` or `{t("prefix.key")}: `. Example: for `"Base Fee:"` use key value `"Base Fee"` and in JSX write `<span>{t("baseFeeExplanation.baseFee")}:</span>`. **Exception for Trans blocks**: if this colon-suffixed string is part of a larger Trans candidate block (text + inline components forming one sentence inside a parent like `<p>`/`<div>`/`<>`), do **not** split it out as its own candidate; instead, keep the colon inside the Trans translation string (e.g. `"<0>Important:</0> You must use the <1>exact same wallet</1> for staking..."`).
- **Colon-prefixed strings**: When a candidate string **starts with** a colon (e.g. `": value"`), extract only the part after the colon; the leading colon remains hardcoded in the source.
- **Parentheses are not translated**: When a candidate string is **wrapped in parentheses** (after trim, starts with `(` or `（` and ends with `)` or `）`), do **not** put the parentheses into the i18n key value. Extract and translate **only the content inside** the parentheses. The parentheses (and any leading space) remain hardcoded in the source — e.g. render as ` ({t("prefix.key")})`. Example: for ` (Optional)` use key value `"Optional"` and in JSX write ` ({t("accordionItem.optional")})`.
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
- **Directory component**: Use **filename** without extension, PascalCase → camelCase when the file has a distinct PascalCase name (e.g. `authGuard/ConnectWalletAuthGuard.tsx` → `connectWalletAuthGuard`). When the file is `index.tsx` or the filename is the directory name (e.g. `languageSwitcher/languageSwitcher.ui.tsx`, `select/index.tsx`), use the **directory name** as prefix (`languageSwitcher`, `select`).

**3.4 Fallback**

- Files not under routes or components (e.g. `app/app/utils/**`): if inferable from imports, use that route’s module; otherwise use `common`.

## 4. Key generation and de-duplication

- **Format**: `<prefix>.<slugKey>`. Prefix from section 3 (route or component name, camelCase). Key may have multiple levels (e.g. `home.dialog.title`, `home.dialog.description`); **at most 5 levels** (e.g. `home.dialog.confirm.button.submit`). If semantics require more depth, compress levels or use a shorter slugKey.
- **slugKey**: Short, readable identifier from the text; preserve placeholders like `{{qty}}`.
- **De-duplication (context-aware)**:
  - Reuse an existing key only when both the **English text and UI semantics/context** are the same.
  - Do **not** auto-reuse a key based only on identical English value.
  - If the same English text appears in different contexts (e.g. button label vs status text vs tooltip), create a new semantic key (for example: `.button`, `.status`, `.tooltip`).

**4.1 slugKey naming rules (hierarchical and dotted)**

- **Logical groupings**: Use dotted sub-namespaces for related keys instead of flat suffixes. Prefer `prefix.concept.subKey` over `prefix.conceptSubKey` when the concept has multiple variants.
  - Good: `distributor.completeProfile.step.3`, `distributor.completeProfile.step.4` (variant is step count).
  - Avoid: `distributor.completeProfile3Steps`, `distributor.completeProfile4Steps`.
- **Numeric or unit segments**: When the slug encodes a number, unit, or scale (e.g. volume 10M, 30M, 1B), put that segment after a dot so the key reads as a hierarchy: `prefix.vol.10m`, `prefix.vol.1b`, not `prefix.vol10m`, `prefix.vol1b`.
  - Good: `distributor.vol.10m`, `distributor.vol.30m`, `distributor.vol.90m`, `distributor.vol.1b`, `distributor.vol.10b`.
  - Avoid: `distributor.vol10m`, `distributor.vol1b`.
- **Step or ordinal variants**: For “step 1”, “step 2”, or “N steps” flows, use a single parent and dot suffix: e.g. `prefix.flowName.step.1`, `prefix.flowName.step.2`, or `prefix.completeProfile.step.3`.

## 5. Write to module and index

- **Route/page modules**: Target file is `app/app/i18n/module/<prefix>.ts`. **New module**: Create `app/app/i18n/module/<prefix>.ts` with `export const <prefix> = { "<prefix>.<slugKey>": "Original English", ... };` and add to `app/app/i18n/module/index.ts` (import + spread in `en`, alphabetical order). **Existing module**: Append new keys to that file.
- **Component modules** (files under `app/app/components/`): Do **not** create separate files per component. **Append** all new keys to `app/app/i18n/module/components.ts`. Key format is `componentName.slugKey` (e.g. `loginModal.title`, `themePreviewModal.close`), where `componentName` is the prefix from section 3.3.
- **Existing module** (for route modules): Append new keys inside the exported object (at the end); optionally keep keys alphabetically ordered.

## 6. Locales

- **Do not** merge new or changed keys into `app/app/i18n/locales/en.json`. Locale files are updated by the project's own process (e.g. build script or manual).

## 7. Replace in source

- **Inside React components**: Add `import { useTranslation } from "~/i18n"` if missing; use `const { t } = useTranslation();` and replace with `t("prefix.slugKey")` or `t("prefix.slugKey", { var1, var2 })` for interpolations. Placeholder names must match the object keys (e.g. `{{var1}}` → `{ var1 }`).
- **Outside components** (e.g. utils, scripts, class methods): Add `import { i18n } from "~/i18n"` and replace with `i18n.t("prefix.slugKey")` or `i18n.t("prefix.slugKey", { var1, var2 })`.
- **Trans vs t()** — apply during replacement:
  - **Use `t()`** when the original is plain static text with no rich structure (no inline `<a>`, `<span>`, or other components in the middle of the sentence).
  - **Use `Trans`** when the original **interleaves** user-facing text with React nodes that must keep their structure (e.g. inline links, styled spans). **Trigger**: You see patterns like `<>text <a href="...">link text</a> more text</>` or `<>prefix <span className="...">{{var}}</span> suffix</>`.
  - **Trans procedure**: (1) Create **one** key whose value is the full sentence with component placeholders: use `<0>wrapped text</0>` for the first component, `<1>...</1>` for the second, and `{{varName}}` inside a tag if the component wraps a variable. (2) Replace the JSX with `<Trans i18nKey="prefix.slugKey" components={[<a key="0" href="..." className="..." />, ...]} />` (or with `values={{ varName }}` when using `{{varName}}` in the key). (3) Import `Trans` from `"~/i18n"` if missing.
- **Examples**:
  - Simple: `<span>Confirm</span>` → `<span>{t("common.confirm")}</span>`
  - With interpolation: `` `${qty} items` `` → `t("cart.itemCount", { qty })`
  - **Trans (inline link)**: Original `<>Your DEX is earning fee share revenue! <a href="/dex/graduation" className="...">Visit the graduation page</a> to access your earnings.</>` → one key `"prefix.earningFeeShareWithLink": "Your DEX is earning fee share revenue! <0>Visit the graduation page</0> to access your earnings."` and replace with `<Trans i18nKey="prefix.earningFeeShareWithLink" components={[<a key="0" href="/dex/graduation" className="..." />]} />`.
  - **Trans (styled variable)**: Original `<>Your broker ID <span className="font-mono">{{brokerId}}</span> has been created.</>` → one key with `"...<0>{{brokerId}}</0>..."` and replace with `<Trans i18nKey="..." values={{ brokerId }} components={[<span key="0" className="font-mono ..." />]} />`.
  - **Trans (styled spans, no link)**: Original `<p><span className="font-medium text-warning">Important:</span> You must use the <span className="font-medium">exact same wallet</span> for staking ORDER tokens that you used to set up this DEX. This ensures proper tier attribution and benefits.</p>` → one key `"prefix.importantWalletNote": "<0>Important:</0> You must use the <1>exact same wallet</1> for staking ORDER tokens that you used to set up this DEX. This ensures proper tier attribution and benefits."` and replace with `<Trans i18nKey="prefix.importantWalletNote" components={[<span key="0" className="font-medium text-warning" />, <span key="1" className="font-medium" />]} />`.

### 7.1 Constants and config objects

- **Module-scope constants** (config objects/arrays outside React components): For fields that need i18n (e.g. `title`, `label`, `description`), use `i18n.t("prefix.key")` **directly as the property value**. Do **not** introduce separate properties like `titleKey`, `descKey`, or `labelKey` to store i18n keys and resolve them later in render (e.g. `t(step.titleKey)`). Example: `title: i18n.t("dexSectionRenderer.distributorCode.title")`.
- When UI is driven by **constant config objects/arrays** (e.g. `const steps = [{ title: "...", desc: "..." }]`), **do not rename existing property names** just to store i18n keys. Keep the original shape (`title`, `description`, `label`, etc.).
- If the constant is created **inside a React component scope**, using `t(...)` is fine (e.g. `title: t("distributor.step1.title")`).
- If the constant is created at **module scope** (outside React components), do **not** call hook-derived `t` there. Use `i18n.t(...)` directly in the config, or a factory function that receives `t` (e.g. `const getSteps = (t) => [...]`) and call it inside the component.
- **Avoid key indirection**: Do **not** introduce separate key-mapping objects (e.g. `MENU_LABEL_KEYS`, `MENU_INFO_KEYS`, `KEY_MAP`) or extra properties such as `titleKey`/`descKey` that only store i18n keys. Instead, call `i18n.t("prefix.key")` directly where needed — either inline, or via a small helper (e.g. `function getLabel(id) { return i18n.t("prefix." + id); }` or a switch that returns `i18n.t("prefix.specificKey")`). This keeps the source simpler and avoids redundant key indirection.

## Additional reference

- Note: Attribute extraction exclusions are defined in section 2.1 (single source of truth).
- **Opt-out marker**: Use `data-i18n-ignore` on any JSX element to skip extraction of its text content (e.g. copyright notices, brand names). Use `// i18n-ignore` on the line above to skip extraction of the next line (e.g. placeholders like `"R G B"`).
- **URLs and domains**: Any string that is a pure URL or URL-like (e.g. `http://...`, `https://...`, or domain/hostname) is not translated; do not extract and keep it hardcoded.
- For route→module table, component-name examples, regex/filter details, and edge cases, see [reference.md](reference.md) if present.

## Checklist

- [ ] No unstaged changes (`git status --porcelain`); abort if any.
- [ ] Input: file/directory path or commit hash(s) from user.
- [ ] Files filtered: `.ts`/`.tsx`/`.js`/`.jsx` only; exclude `i18n/**`, `*.test.*`, `*.spec.*`.
- [ ] Candidates extracted; excluded: already in `t`/`i18n.t`/`Trans`, `data-i18n-ignore`, `// i18n-ignore` (next line), URLs, `alt`/`aria-label`, `data-*`, meta, class names, etc.
- [ ] Prefix resolved: route → module name; component under `app/app/components/` → component name (Section 3.3).
- [ ] Keys written: route → `app/app/i18n/module/<prefix>.ts` (or new module + index); component → append to `components.ts`.
- [ ] Source updated: `t("prefix.slugKey")` or `i18n.t(...)` or `Trans` as appropriate.
