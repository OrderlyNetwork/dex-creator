---
name: translate-locales
description: 7-step workflow to export en.json from app i18n modules (or use user-provided JSON), detect new/changed keys via git diff when applicable, translate into zh/tc/ko/es using TRANSLATION_PROMPT.md, and merge into app locale JSON files.
---

## Translate Locales

When the user explicitly invokes this skill (e.g. `@translate-locales`), follow this 7-step workflow to regenerate the English locale from i18n modules, detect new or changed content, and translate it into four locales for the DApp.

### Usage

- This skill is designed **only** for the batch workflow of exporting `app/app/i18n/locales/en.json` from the app i18n modules and translating **new or changed** keys (vs. the staged version of `en.json`) into `zh`, `tc`, `ko`, and `es` under `app/app/i18n/locales/`.
- If the user provides a specific JSON file or object to translate (e.g. a custom en subset or another locale to use as source), use it as the translation source and skip regenerating en.json and computing git diff (Step 2 and Step 3).
- Use this skill **only** when the user explicitly asks to generate and translate i18n keys for the DApp (e.g. `@translate-locales` or by name).
- Do **not** use this skill for general translation requests, ad-hoc string translation, or refactoring existing i18n keys.

## Workflow

All shell commands below assume you start from the repo root. Step 1–2 run from the `app` directory; diff and merge steps refer to paths relative to the repo root.

**Entry condition:**

- **If the user has manually provided JSON**: The user has explicitly given a JSON file path (e.g. `app/app/i18n/locales/xxx.json`) or pasted/provided JSON object content, and has indicated that this JSON should be used as the translation source. In this case **skip Step 2 and Step 3**; use that JSON as the "English i18n JSON to translate" and go directly to Step 4 (check size and batch if needed), then Step 5 (translate), Step 6 (merge), and Step 7 (sync-locales).
- **If the user has not provided JSON**: Run the full sequence Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6 → Step 7.

### Step 1 – Navigate to app

- From the repo root, if the current directory is not `app`, run `cd app`. If already in `app`, skip.
- When the user has provided JSON and you skip Step 2 and Step 3, still ensure you are in (or will be in) the `app` directory before running Step 6 and Step 7.

### Step 2 – Regenerate en.json

_When the user has not manually provided a JSON file/object, run this step; otherwise skip and use the provided JSON as the input to Step 4._

- In `app`, run: `yarn export-en-json`
- This re-exports the `en` object from the i18n modules (see `app/scripts/export-en-json.ts`) into `app/app/i18n/locales/en.json`.

### Step 3 – Detect new or changed content

_When the user has not manually provided a JSON file/object, run this step to build the minimal diff JSON; otherwise skip and use the user-provided JSON as the input to Step 4._

- Ensure that the version of `app/app/i18n/locales/en.json` in the git index (staging area) represents the **last confirmed canonical English locale** (for example, staged after the previous successful translation run or commit). If not, stage that confirmed version first before proceeding.
- From the repo root (or from `app` with path `app/app/i18n/locales/en.json`), compare the current working copy of `app/app/i18n/locales/en.json` with the **staged** version in the index, e.g. run: `git diff -- app/app/i18n/locales/en.json` (no `HEAD`: diff is working tree vs staging area, not vs last commit). Git interprets this path relative to the repo root, so the command works even when run from `app`.
- Identify keys whose values are **added or modified** compared to the staged version of `en.json` (the last confirmed canonical version).
- Build a **minimal JSON object** containing only these new/changed key paths and values, preserving the same nested structure as in `en.json`.
- If there are no new or changed keys (diff JSON is empty), stop and inform the user that no translation is needed.

### Step 4 – Check size and batch (if needed)

You have **the JSON to translate** (from Step 3’s minimal diff, or from the user when Step 2 and Step 3 were skipped). Check its size:

- **If the JSON is empty or has no keys**: Stop and inform the user that no translation is needed.
- **If the JSON is large** (e.g. **more than 200 keys** or **more than 40,000 characters**): Use batch translation to avoid exceeding the model’s token limit. From the user’s perspective this remains a single `@translate-locales` run; batching is handled internally.
  - **Split**: Split the JSON to translate into smaller batches of keys (e.g. **80–150 keys per batch**), preserving the same nested key structure. You may split by key order or by top-level namespace.
  - **Per batch**: For each batch, use that batch’s JSON as the "English i18n JSON file" input to `TRANSLATION_PROMPT.md` and ask the model to produce the four JSON objects for `zh`, `tc`, `ko`, and `es` (same strict rules as in Step 5). Shallow-merge each batch’s four outputs into four accumulator objects (later batches overwrite same keys).
  - **After all batches**: Write the four accumulated locale objects to `app/app/i18n/locales/diff-zh.json`, `diff-tc.json`, `diff-ko.json`, and `diff-es.json`, then proceed to Step 6.
- **If the JSON is small** (within the thresholds above): Proceed to Step 5 and use the single-shot process there.

### Step 5 – Translate new content with TRANSLATION_PROMPT

**When the JSON to translate is small** (within the threshold in Step 4), use this single-shot process:

- The "English i18n JSON file" input is either: (1) the minimal diff JSON from Step 3 (when Step 2/3 were not skipped), or (2) the user-provided JSON file/object (when the user skipped Step 2 and Step 3). Use that JSON as the content in the prompt defined in `TRANSLATION_PROMPT.md` (in this skill directory).
- Ask the current AI to produce four JSON objects for `zh`, `tc`, `ko`, and `es`, following the strict rules in the prompt (keys unchanged, placeholders/tags/newlines and token symbols preserved, etc.).
- Write the outputs to four **per-locale** diff files under `app/app/i18n/locales/`:
  - `diff-zh.json`
  - `diff-tc.json`
  - `diff-ko.json`
  - `diff-es.json`
- Each file must contain only the keys and values for that locale (no wrapper object like `{ "zh": { ... } }`), preserving the same key structure as in `en.json` (for example):
  ```json
  {
    "common.confirm": "Confirm"
  }
  ```

### Step 6 – Merge translations into locale files

- Use the built-in merge script at `app/scripts/merge-translations.mjs`. From the `app` directory, run:
  ```bash
  node scripts/merge-translations.mjs
  ```
- The script looks for per-locale diff files `diff-zh.json`, `diff-tc.json`, `diff-ko.json`, and `diff-es.json` in `app/app/i18n/locales/` and merges their keys into `zh.json`, `tc.json`, `ko.json`, and `es.json` respectively.
- These per-locale diff files are treated as temporary input; after the merge completes the script will attempt to delete each `diff-*.json` file, so they are not processed again by `sync-locales` or future merge runs.

### Step 7 – Normalize locale files with sync-locales

- After Steps 1–6 are complete, ensure you are in the `app` directory.
- Run: `yarn sync-locales`.
- This command treats `app/app/i18n/locales/en.json` as the canonical key set and ordering, and for each other locale JSON file under `app/app/i18n/locales/` it keeps only keys present in `en.json` and rewrites them in the same key order. If the user provided a custom JSON that is not a subset of the current `en.json`, keys that do not exist in `en.json` will be dropped from the locale files during this step.

## Checklist

**When the user has not manually provided JSON** (full flow):

- [ ] In repo root, then `cd app`; `yarn export-en-json` run; `app/app/i18n/locales/en.json` updated as the latest canonical English locale
- [ ] Git diff inspected: `git diff -- app/app/i18n/locales/en.json` (working tree vs staging area, using the staged `en.json` as the last confirmed canonical version); diff JSON (new/changed keys only) prepared
- [ ] Step 4: If the diff JSON is large, use the batch flow (split, translate per batch, accumulate, then write once); otherwise go to Step 5 for single-shot; outputs written to `app/app/i18n/locales/diff-zh.json`, `diff-tc.json`, `diff-ko.json`, `diff-es.json`
- [ ] `node scripts/merge-translations.mjs` run from `app` (Step 6); per-locale `diff-*.json` files removed after merge
- [ ] In `app`, `yarn sync-locales` run (Step 7); non-English locale JSON files aligned to the key set and ordering of `en.json`, with any extra keys dropped
- [ ] Spot-check several languages to ensure placeholders, HTML tags, newlines, and token symbols are preserved and that key sets match the English source

**When the user has manually provided JSON** (skip Step 2 and Step 3):

- [ ] Ensure in `app` (or run Step 1) before merge/sync; user-provided JSON used as the translation source
- [ ] Step 4: If JSON is empty, stop; if it exceeds the thresholds, apply the batch flow; otherwise Step 5 single-shot; outputs written to `app/app/i18n/locales/diff-zh.json`, `diff-tc.json`, `diff-ko.json`, `diff-es.json`
- [ ] Step 6: `node scripts/merge-translations.mjs` run from `app`; then Step 7: `yarn sync-locales` in `app`
- [ ] Spot-check several languages to ensure placeholders, HTML tags, newlines, and token symbols are preserved and that key sets match the source

## Built-in script

The merge script `app/scripts/merge-translations.mjs` is a permanent part of the repo. It runs in **per-locale diff mode**: when called from the `app` directory, it reads `diff-zh.json`, `diff-tc.json`, `diff-ko.json`, and `diff-es.json` from `app/app/i18n/locales/` and merges their keys into `zh.json`, `tc.json`, `ko.json`, and `es.json` respectively.

Do not recreate this script; use the existing one.

## Error handling

- If `yarn export-en-json` fails: verify the script and i18n module paths exist, run `yarn install` if needed, and check `app/app/i18n/module/index.ts` exports correctly.
- If the user-provided JSON is missing, invalid, or empty: ask for a valid JSON file path or object, or stop and explain that no translation is needed.
- If translation output is invalid JSON: validate the AI output (no trailing commas, no comments, proper escaping), and re-run translation if needed.
- If a locale file is missing: the merge script creates an empty object `{}` before merging.
- If `merge-translations.mjs` fails, ensure `diff-zh.json`, `diff-tc.json`, `diff-ko.json`, and `diff-es.json` exist under `app/app/i18n/locales/` (or that missing locales are intentionally omitted), and that you are running the script from the `app` directory.
- If a single translation request fails due to token limits, switch to the batch strategy in Step 4 (split the JSON into smaller batches, e.g. 50–80 keys per batch, translate each batch, accumulate, then write the four diff files and run the merge script once).

## When NOT to use this skill

- The user only wants to translate a small number of ad-hoc strings or UI copy.
- The user is refactoring or renaming existing i18n keys rather than translating new/changed keys.
- The task is general content translation unrelated to the DApp i18n JSON files.
