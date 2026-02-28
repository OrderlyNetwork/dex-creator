# verify-i18n-replacements Reference

Use this when resolving key prefixes to modules and when applying exclusion rules. Rules must match [extract-i18n-keys](../extract-i18n-keys/SKILL.md) and its [reference](../extract-i18n-keys/reference.md).

## Route → module (prefix) table

| Route file or path segment | Module (prefix) |
|----------------------------|-----------------|
| `_layout._index`, `_index` | `home` |
| `_layout.board`, `_layout.board_.$dexId` | `board` |
| `_layout.admin` | `admin` |
| `_layout.case-studies` | `caseStudies` |
| `_layout.dex`, `_layout.dex_.config`, `_layout.dex_.graduation` | `dex` |
| `_layout.dex_.card` | `dexCard` |
| `_layout.distributor` (and nested route.tsx, vanguard, etc.) | `distributor` |
| `_layout.points` (and nested route.tsx, components) | `points` |
| `_layout.referral`, `_layout.referral_old` | `referral` |
| `_layout.tsx`, `_preview` | Use segment or fallback to `common` |

**Rule**: From `_layout.<segment>` or top-level route segment, take `<segment>`, convert kebab-case to camelCase. Nested route dirs (e.g. `_layout.distributor/...`) still use segment: `distributor`.

## Component → prefix (for files under app/app/components/)

| File path | Prefix |
|-----------|--------|
| `app/app/components/ThemePreviewModal.tsx` | `themePreviewModal` |
| `app/app/components/languageSwitcher/languageSwitcher.ui.tsx` | `languageSwitcher` |
| `app/app/components/select/index.tsx` | `select` |
| `app/app/components/tooltip/tooltip.tsx` | `tooltip` |
| `app/app/components/authGuard/ConnectWalletAuthGuard.tsx` | `connectWalletAuthGuard` |

**Rules**:
- Single file: filename without extension, PascalCase → camelCase.
- Directory: if file is `index.tsx` or filename equals dir name (e.g. `languageSwitcher/languageSwitcher.ui.tsx`), use **directory name** as prefix; otherwise use filename → camelCase (e.g. `ConnectWalletAuthGuard.tsx` → `connectWalletAuthGuard`).
- All component keys live in **`app/app/i18n/module/components.ts`** with keys like `componentName.slugKey`.

**Files under routes**: e.g. `app/app/routes/_layout.distributor/.../components/Card.tsx` → use **route** module `distributor`, not component name.

## Trans: when required and placeholder format

- **Use Trans** when the original JSX **interleaves** user-facing text with inline React nodes (e.g. `<>text <a href="...">link</a> more</>`, `<p><span className="...">X</span> text</p>`). If such a block is translated with `t()` or multiple `t()` calls instead of one Trans, report [Trans required].
- **Trans value format**: One key with `<0>...</0>`, `<1>...</1>` etc. for each component slot. Example: `"prefix.richSentence": "Read the <0>documentation</0> for details."` with `components={[<a key="0" href="/docs" />]}`.
- **Multiple placeholders**: `"prefix.feeSplit": "Split: <0>X</0> to you, <1>Y</1> to protocol."` → `components={[<span key="0" ... />, <span key="1" ... />]}`. Count of placeholders must match length of `components`.
- **Interpolation in Trans**: `{{varName}}` in value → call site must pass `values={{ varName: ... }}`.

## Over-extraction: exclusion list

When verifying, treat a key as **should not have been extracted** if its module value or context matches:

- **Pure URL/domain**: Value starts with `http://`, `https://`, or is clearly a domain (including bare domain). Keep hardcoded.
- **Class names / CSS / Tailwind**: className, Tailwind tokens, CSS-related strings.
- **Attribute exclusions**: Key used for `img` alt, `aria-label`, or any `data-*` (e.g. `data-testid`, `data-cy`).
- **Route meta**: Usage inside `export const meta: MetaFunction = () => [...]` in a route file.
- **Explicit opt-out**: Node was inside element with `data-i18n-ignore`, or line immediately after `// i18n-ignore` (or `/* i18n-ignore */`).
- **Technical / non-user copy**: Route paths, variable names, enum keys, log tags, hex, pure numbers/symbols; single- or two-character technical/abbreviation (e.g. `"OK"`, `"id"`) unless clearly a UI label.

Report these under "Should not have been extracted (over-extraction)" with key, location, and reason.
