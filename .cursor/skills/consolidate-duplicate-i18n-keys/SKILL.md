---
name: consolidate-duplicate-i18n-keys
description: Finds i18n keys in app/app/i18n/module that share the same English value (2+ occurrences), verifies translations are identical across app/app/i18n/locales (zh, tc, ko, es). Classifies by prefix (first segment of key). Same prefix → in-module dedup (keep one key, remove others, replace refs); different prefix → suggestion only: recommend merging to a common-prefix key (e.g. common.xxx). Never auto-applies; run without flags to get a replacement plan and suggestions, then after human review use --apply to execute same-prefix dedup only.
---

# Consolidate Duplicate i18n Keys

## When to use

Apply this skill when the user wants to:
- Consolidate duplicate i18n keys
- Deduplicate i18n keys that have the same value (same-prefix: in-module dedup; different-prefix: get suggestions to merge to common.xxx)

## Execution principle

**Do not auto-apply.** When using this skill, first run the script **without** `--apply` to get the full replacement plan and suggestions. Present the report (same-prefix replacement plan + different-prefix suggestions) to the user for review. Only after the user explicitly confirms should you run with `--apply` (or instruct the user to run it). Never run `--apply` in the same turn as the initial report.

## Overview

**Prefix** = the first segment of the key (before the first `.`), e.g. `board`, `themeCustomizationSection`, `aiThemeGeneratorModal`.

1. **Collect**: Scan all `.ts` files in `app/app/i18n/module` (excluding `index.ts` and `common.ts`). Parse each key and its English value; record which module file each key comes from.
2. **Group by value**: Group keys by identical English value. Keep only groups where the value appears **2 or more times**.
3. **Check locale consistency**: For each group, read `app/app/i18n/locales` (zh, tc, ko, es; en if needed). In each locale, check that every key in the group has the **same** translation. If any locale has different translations for keys in the group, **exclude** that group.
4. **Classify by prefix**: For each mergeable group, check if all keys share the same prefix.
   - **Same prefix** (e.g. `board.revenue`, `board.tableRevenue`): In-module dedup. Pick one canonical key (e.g. first alphabetically). Remove the other keys from the module file and from all locale JSONs; replace every reference in source (`t(...)`, `i18n.t(...)`, `i18nKey=...`) with the canonical key. **Do not** add any key to `common.ts`.
   - **Different prefix** (e.g. `board.cancel`, `dex.cancel`): Suggestion only. Do not modify any files. In the report, list the keys and **suggest merging to a common-prefix key** (e.g. `common.xxx`), so the user can manually add the key to `common.ts` and update refs if desired.
5. **Report**: Output "Same prefix (replacement plan)" with keep/remove/ref counts, then "Different prefix (suggestion only)" with a suggested `common.xxx` key per group.
6. **Generate manual-edit MD**: After running the script, generate (or update) a Markdown document for manual consolidation. Save it under `app/docs/` (e.g. `duplicate-i18n-keys-for-manual-consolidation.md`). The document must contain a table with exactly these columns (use the user’s language for headers if they requested a non-English doc):
   - **English value** — the duplicated copy (same text in English).
   - **All keys involved** — all keys that share this value (comma-separated or listed).
   - **Suggested key (or new key)** — the suggested common-prefix key (e.g. `common.xxx`) or a new key to use.
   Include a short "How to use" section explaining: add the suggested key to `common.ts`, update locale files, replace refs in source, then remove old keys from modules and locales.
7. **Apply** (only after human review): Run with `--apply` to execute same-prefix dedup only — remove non-canonical keys from modules and locales, replace refs in source. Different-prefix groups are never modified by the script.

## Boundaries

- Only consider groups where the **exact same** English value appears 2+ times. Do not merge keys with similar but different values.
- If in **any** locale the translations for that value differ between keys, do **not** merge that group.
- **Same prefix**: in-module dedup only; never write to `common.ts`.
- **Different prefix**: suggestion only; suggest merging to `common.xxx`; never automatically change keys.
- **Never** run `--apply` without first showing the report and getting human review.
- Do not change `app/app/i18n/module/index.ts`.

## Optional script / workflow

From the app directory (`app/`):

**Step 1 — Report (no file changes):**

```bash
npm run consolidate-duplicate-i18n-keys
# or: npx tsx scripts/consolidate-duplicate-i18n-keys.ts
```

**Step 2 — Generate manual-edit MD** (after report): Create or update `app/docs/duplicate-i18n-keys-for-manual-consolidation.md` with a table of columns: 英文方案, 涉及的所有 key, 建议使用的 key（或者新的 key）. Include a short "How to use" section for manual consolidation.

**Step 3 — Human review** the output (same-prefix replacement plan + different-prefix suggestions) and the generated MD. Optionally run `--dry-run` to preview which files would be changed.

```bash
npx tsx scripts/consolidate-duplicate-i18n-keys.ts --dry-run
```

**Step 4 — Apply** (only after user confirms): executes same-prefix in-module dedup only.

```bash
npx tsx scripts/consolidate-duplicate-i18n-keys.ts --apply
```

Different-prefix groups appear only in the "Suggestion" section (with a suggested common.xxx key per group) and are never modified by the script.

## Related

- **remove-unused-i18n-keys.ts**: Same module parsing (key + line ranges) and source-usage patterns (`t`, `i18n.t`, `i18nKey`). Reuse or mirror that logic for deleting keys and finding usages.
- **export-en-json.ts**: After editing modules, re-export en from modules to `en.json` if the project uses it.
- **sync-locales.ts**: Keeps other locale files aligned with en key order/missing keys.
