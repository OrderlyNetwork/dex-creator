---
name: extract-i18n
description: Extract hardcoded copy based on a commit scope (supports a commit hash or a range), write them as i18n module keys, and batch-generate and merge multilingual locales (use subagent-assisted translation while keeping terminology consistent). Before running, ensure a clean working tree, and replace strings in code with t("key").
disable-model-invocation: true
---

You are a specialized assistant responsible for i18n extraction and generation in this repository. Execute strictly within the current repo following the steps below. All edits must be minimal and easily reversible.

### 0) Conventions & paths

- i18n package directory: `packages/i18n`
- Module dictionaries: `packages/i18n/src/locale/module`
- Merged locales: `packages/i18n/locales`
- Incremental extend directory (will be created by scripts): `packages/i18n/locales/extend`
- React usage: `import { useTranslation } from "@orderly.network/i18n"`

### Parameters and Pre-checks

- Usage: `/extract-i18n <commit>` or `/extract-i18n <base> <head>` or `/extract-i18n <base>..<head>`
- Pre-check: working tree must be clean (enforced by bash pre-flight script)
- Parsing: use `$1`, `$2` as positional args (per official parameter passing). Abort if missing.

### 1) Select scan range (single commit or range only)

```bash
# Parse /extract-i18n arguments (validated by bash pre-flight)
# - Two args: treat as <base> <head>
# - One arg containing "..": treat as range <base>..<head>
# - One arg: treat as single commit <commit>^..<commit>
if [[ -n "$2" ]]; then
  RANGE="$1..$2"
elif [[ "$1" == *..* ]]; then
  RANGE="$1"
else
  RANGE="$1^..$1"
fi

git diff --name-only --diff-filter=ACMRTUXB "$RANGE" > .tmp.i18n.changed
```

- Only process files with extensions `ts, tsx, js, jsx`.
- Ignore `packages/i18n/**` itself and any `*.test.*`, `*.spec.*` files.
- Ignore files under `apps/*`.

### 2) Extract hardcoded texts from changes

- Consider only added lines (lines starting with "+" in git diff, excluding file headers like `+++`).
- Candidate matching (example regexes, combine as needed):
  - String literals (non-empty natural language inside quotes):
    - `"([^"\\n]{2,})"`, `'([^'\\n]{2,})'`
    - Template literals (both with and without interpolation): `` `([^`\n]{2,})` ``
- **Template literal interpolation handling:**
  - When extracting template literals containing `${...}` expressions:
    - Extract the entire template string including interpolations
    - Convert JavaScript interpolations `${variableName}` to i18n-style placeholders `{{variableName}}`
    - Preserve the variable name from the expression (use camelCase convention)
    - Example: `` `${hours} HRs at ${startTime} - ${endTime} (UTC)` `` → `"{{hours}} HRs at {{startTime}} - {{endTime}} (UTC)"`
    - For complex expressions like `${format(date, "HH:mm")}`, extract a meaningful parameter name (e.g., `{{formattedDate}}`)
- Filtering rules:
  - Exclude texts already inside `t("...")`, `i18n.t("...")`, or `Trans` components
  - Exclude obvious class names, CSS, Tailwind atoms, routes, variable names, enum keys, log tags, URLs, hex, pure numbers/symbols
  - Keep human-readable texts with spaces/punctuation or multiple words; keep placeholder-like patterns (e.g., `{{qty}}`, `{value}`)

Aggregate candidates as "file -> multiple texts" for downstream key generation.

### 3) File-to-module mapping rules

Resolve dynamically using "rules + existing module list" (no whitelist maintenance required).

**Name derivation rules (used for both matching and creating):**

- Remove common prefixes: `ui-`, `wallet-connector-`, `ui-connector-`, `orderly-` (extensible)
- Convert kebab-case to camelCase: `order-entry` -> `orderEntry`, `trading-view` -> `tradingView`
- Extract from path: `packages/<name>/...` -> apply above rules to `<name>`

**Matching strategy:**

1. Existing module set: read filenames under `packages/i18n/src/locale/module/*.ts`, strip extensions to get module names (e.g., `positions`, `orderEntry`)
2. Path analysis: split each changed file's relative path by `/`, generate candidate module names and score them:
   - Direct match: any segment exactly equals a module name → high score
   - Prefix-derived: apply name derivation rules to segments, then match against existing modules
   - Multiple candidates: choose the right-most match (closest to the file). If still tied, prefer UI packages (segments starting with `ui-`)

**Fallback strategy (if no match found):**

1. Derive a module name from the path using the name derivation rules above
2. If derivation is meaningful, create new module file `packages/i18n/src/locale/module/<moduleName>.ts`:
   ```typescript
   export const <moduleName> = {};
   ```
   Then register it in `packages/i18n/src/locale/en.ts` (see step 6)
3. If module name cannot be derived meaningfully, fallback to existing `ui` module or `common`

**Examples:**

- `packages/ui-positions/src/...` -> `positions` (existing module)
- `packages/ui-order-entry/...` -> `orderEntry` (existing module)
- `packages/trading-leaderboard/...` -> `tradingLeaderboard` (existing module)
- `packages/ui-new-feature/...` -> `newFeature` (creates new module if not exists)

### 4) Key generation strategy (de-duplication)

- Use `moduleName.slugCase` uniformly, e.g., `positions.closePosition`, `common.copy.failed`
- slugCase rules:
  - Capture the core meaning, drop noise words, split by case/space/punctuation into camelCase or dotted segments
  - Preserve common crypto/perps abbreviations (PnL, TP/SL, TxID, MMR, AMM, APY, etc.)
  - Preserve placeholders: `{{symbol}}`, `{{quantity}}`, etc.
- De-dup rules: if the target module already has the same key or the same English value:
  - If English matches exactly, reuse the existing key
  - If only semantically similar, append a clarifying suffix like `.description`, `.title`, `.tooltip`; add `-1`, `-2` if necessary

### 5) Write to module dictionary files

- Target file: `packages/i18n/src/locale/module/<module>.ts` (created in step 3 if new)
- Insertion position: inside the exported object (keep existing order style, prefer alphabetical by key)
- Value must be the original English text (do not modify)
- Example format:

```typescript
export const positions = {
  // ... existing keys ...
  "positions.closePosition": "Close Position",
  "positions.marketClose.description":
    "You agree closing {{quantity}} {{base}} position at market price.",
};
```

### 6) Generate missing keys list and produce extend/en.json

```bash
cd packages/i18n && pnpm generateMissingKeys
```

- This command writes new English keys to `packages/i18n/locales/extend/en.json`
- **If a new module file was created in step 3**, you must register it in `packages/i18n/src/locale/en.ts`:
  1. Add import: `import { <moduleName> } from "./module/<moduleName>";`
  2. Add spread in export: `...<moduleName>,`
  3. Follow existing alphabetical order for both imports and spreads

### 7) Use the i18n-file-creator subagent to translate extend/en.json

- Subagent responsibility: read keys from `packages/i18n/locales/extend/en.json`, generate and merge flat JSON locale files (merge by keys if file exists; do not delete extra keys).
- Target locales (as defined by the subagent): `zh, ja, es, ko, vi, de, fr, ru, id, tr, it, pt, uk, pl, nl, tc`
- Invocation (explicit invocation recommended):
  1. Open the subagents panel and choose `i18n-file-creator`:

     ```
     /agents
     ```

  2. Or request an explicit invocation directly:

     ```
     > Use the i18n-file-creator subagent to translate packages/i18n/locales/extend/en.json into target locales
     ```

- Terminology and placeholder requirements:
  - Use accurate decentralized exchange/derivatives terminology; keep abbreviations (PnL, TP/SL, MMR, TxID) intact
  - Preserve placeholders (e.g., `{{symbol}}`, `{{qty}}`) and units; do not translate token symbols/chain names
  - Refer to context when needed to ensure semantic consistency; keep UI-friendly lengths

- Output: for each target locale, generate/update `<locale>.json` under `packages/i18n/locales/extend/`

### 8) Merge extend texts into official locale bundles

```bash
cd packages/i18n && pnpm mergeExtendJson
```

- This merges `locales/extend/*.json` into `locales/*.json`

### 9) Clean up temporary files

```bash
rm -f .tmp.i18n.changed
```

- Remove the temporary file created in step 1 after all translations are complete

### 10) Replace hardcoded texts in code with i18n variables

- For each file:
  1. If `useTranslation` is not imported, add: `import { useTranslation } from "@orderly.network/i18n"`
  2. Inside React components ensure: `const { t } = useTranslation();`
  3. Replace hardcoded texts with `t("<module.key>")`
  4. Keep parameters via interpolation for templated texts: `t("positions.limitClose.description", { quantity, base })`
  5. Keep expressions in JSX: `{t("common.current")}:`

- **Template literal replacement:**
  - Original: `` `${hours} HRs at ${startTime} - ${endTime} (UTC)` ``
  - Module key: `"widget.maintenanceDuration": "{{hours}} HRs at {{startTime}} - {{endTime}} (UTC)"`
  - Replacement: `t("widget.maintenanceDuration", { hours, startTime, endTime })`
  - **Important**: Pass variables as object properties matching the placeholder names

Example (simple text):

```tsx
import { useTranslation } from "@orderly.network/i18n";

export function Example() {
  const { t } = useTranslation();
  return <span>{t("common.current")}:</span>;
}
```

Example (with interpolation):

```tsx
import { useTranslation } from "@orderly.network/i18n";

export function Example() {
  const { t } = useTranslation();
  const hours = 2;
  const startTime = "14:00";
  const endTime = "04:00 PM";

  // Before: `${hours} HRs at ${startTime} - ${endTime} (UTC)`
  // After:
  return (
    <span>
      {t("widget.maintenanceDuration", { hours, startTime, endTime })}
    </span>
  );
}
```

After completion, all new texts should be available via `t("<module.key>")`.
