# extract-i18n-keys Reference

## Route → module mapping table

| Route file or path segment | Module (prefix) |
|----------------------------|-----------------|
| `_layout._index`, `_index` | `home` |
| `_layout.board`, `_layout.board_.$dexId` | `board` |
| `_layout.admin` | `admin` |
| `_layout.case-studies` | `caseStudies` |
| `_layout.dex`, `_layout.dex_.card`, `_layout.dex_.config`, `_layout.dex_.graduation` | `dex` |
| `_layout.distributor` (and nested `route.tsx`, vanguard, etc.) | `distributor` |
| `_layout.points` (and nested `route.tsx`, components) | `points` |
| `_layout.referral`, `_layout.referral_old` | `referral` |
| `_layout.tsx`, `_preview` | Use segment or fallback to `common` |

**Rule**: From `_layout.<segment>` or the top-level route segment, take `<segment>`, convert kebab-case to camelCase (e.g. `case-studies` → `caseStudies`). For nested route directories (e.g. `_layout.distributor/...`), the module is still the segment: `distributor`.

## Component name derivation examples

| File path | Prefix |
|-----------|--------|
| `app/app/components/ThemePreviewModal.tsx` | `themePreviewModal` |
| `app/app/components/languageSwitcher/languageSwitcher.ui.tsx` | `languageSwitcher` |
| `app/app/components/select/index.tsx` | `select` |
| `app/app/components/tooltip/tooltip.tsx` | `tooltip` |
| `app/app/components/authGuard/ConnectWalletAuthGuard.tsx` | `connectWalletAuthGuard` |
| `app/app/routes/_layout.distributor/vanguard/components/Card.tsx` | `distributor` (route module, not component name) |

**Rules**:
- Under `app/app/components/`: single file → filename without ext, PascalCase → camelCase; directory → directory name (already camelCase or lowercase).
- Under `app/app/routes/.../components/`: use the route’s module (e.g. `distributor`, `points`).

## Regex and filter details

**Candidate regexes (combine as needed)**:
- Double-quoted: `"([^"\\n]{2,})"`
- Single-quoted: `'([^'\\n]{2,})'`
- Template literal: `` `([^`\n]{2,})` `` (note: backslash before `n` for newline)

**Exclude**:
- Inside `t("...")`, `i18n.t("...")`, `<Trans>...</Trans>`
- Class names, `className` values that look like Tailwind/CSS
- Paths, URLs, hex colors, pure numbers
- Enum keys, variable names, log tags
- Single-letter or very short technical tokens unless clearly UI label

**Keep**:
- Strings with spaces, punctuation, or multiple words that read like copy
- Placeholder-like patterns: `{{qty}}`, `{value}`

**JSX text**: Same filters; exclude trim-empty and pure punctuation/digits. Single words that are clearly button/label text (e.g. "Confirm", "Cancel") may be kept.

## Edge cases

1. **File in both routes and components**: Prefer route when the file is under `app/app/routes/` (e.g. `routes/_layout.points/components/EnablePointsCard.tsx` → prefix `points`).
2. **index.tsx / index.ts**: Under a directory, use the directory name for the prefix (e.g. `select/index.tsx` → `select`).
3. **Multiple components in one file**: Use the same prefix for the file (from route or from filename/dir); differentiate with slugKey (e.g. `home.dialog.title`, `home.dialog.description`).
4. **Template with complex expression**: Replace with one placeholder, e.g. `${format(date, "HH:mm")}` → `{{formattedTime}}` and pass `formattedTime` at call site.
5. **Key already exists with same value**: Reuse the existing key. Same value in another module: still reuse if it’s the same logical string, or use a new key under the correct prefix.
6. **New module**: Create `app/app/i18n/module/<prefix>.ts` and add to `app/app/i18n/module/index.ts` (import + spread in `en`), keeping alphabetical order.
