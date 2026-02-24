---
name: translate-locales
description: Export en.json from app i18n modules, detect new/changed keys via git diff, translate them into zh/tc/ko/es using TRANSLATION_PROMPT.md, and merge into app locale JSON files.
---

## Translate Locales

When the user explicitly invokes this skill (e.g. `@translate-locales`), follow this 6-step workflow to regenerate the English locale from i18n modules, detect new or changed content, and translate it into four locales for the DApp.

### Usage

- This skill is designed **only** for the batch workflow of exporting `app/app/i18n/locales/en.json` from the app i18n modules and translating **new or changed** keys (vs. the staged version of `en.json`) into `zh`, `tc`, `ko`, and `es` under `app/app/i18n/locales/`.
- Use this skill **only** when the user explicitly asks to generate and translate i18n keys for the DApp (e.g. `@translate-locales` or by name).
- Do **not** use this skill for general translation requests, ad-hoc string translation, or refactoring existing i18n keys.

## Workflow

All shell commands below assume you start from the repo root. Step 1–2 run from the `app` directory; diff and merge steps refer to paths relative to the repo root.

### Step 1 – Navigate to app

- From the repo root, if the current directory is not `app`, run `cd app`. If already in `app`, skip.

### Step 2 – Regenerate en.json

- In `app`, run: `yarn export-en-json`
- This re-exports the `en` object from the i18n modules (see `app/scripts/export-en-json.ts`) into `app/app/i18n/locales/en.json`.

### Step 3 – Detect new or changed content

- From the repo root (or from `app` with path `app/app/i18n/locales/en.json`), compare the current working copy of `app/app/i18n/locales/en.json` with the **staged** version in the index, e.g. run: `git diff -- app/app/i18n/locales/en.json` (no `HEAD`: diff is working tree vs staging area, not vs last commit).
- Identify keys whose values are **added or modified** compared to the staged version of `en.json`.
- Build a **minimal JSON object** containing only these new/changed key paths and values, preserving the same nested structure as in `en.json`.
- If there are no new or changed keys (diff JSON is empty), stop and inform the user that no translation is needed.

### Step 4 – Translate new content with TRANSLATION_PROMPT

- Use the diff JSON (new/changed keys only) as the "English i18n JSON file" content in the prompt defined in `TRANSLATION_PROMPT.md` (in this skill directory).
- Ask the current AI to produce four JSON objects for `zh.json`, `tc.json`, `ko.json`, and `es.json`, following the strict rules in the prompt (keys unchanged, placeholders/tags/newlines and token symbols preserved, etc.). Output can be in-memory or written to temporary files.

### Step 5 – Merge translations into locale files

- For each of `zh`, `tc`, `ko`, `es`:
  - Read the existing locale file under `app/app/i18n/locales/<locale>.json` (create an empty object `{}` if the file does not exist).
  - Merge the translated diff JSON into that locale by **adding or updating only the keys present in the diff JSON**; leave all other existing keys unchanged.
  - Write the result back to `app/app/i18n/locales/<locale>.json` as valid UTF-8 JSON with 2-space indentation.

### Step 6 – Normalize locale files with sync-locales

- After Steps 1–5 are complete, ensure you are in the `app` directory.
- Run: `yarn sync-locales`.
- This command sorts the locale JSON files and removes duplicate keys across `en`, `zh`, `tc`, `ko`, and `es` under `app/app/i18n/locales/`.

## Checklist

- [ ] In repo root, then `cd app`; `yarn export-en-json` run; `app/app/i18n/locales/en.json` updated
- [ ] Git diff inspected: `git diff -- app/app/i18n/locales/en.json` (working tree vs staging area); diff JSON (new/changed keys only) prepared
- [ ] Translations for the diff JSON generated for `zh.json`, `tc.json`, `ko.json`, `es.json` using `TRANSLATION_PROMPT.md`
- [ ] Locale files under `app/app/i18n/locales/` updated by merging translated diff JSON into `zh.json`, `tc.json`, `ko.json`, `es.json`
- [ ] In `app`, `yarn sync-locales` run; locale JSON files sorted and duplicate keys removed across locales
- [ ] Spot-check several languages to ensure placeholders, HTML tags, newlines, and token symbols are preserved and that key sets match the English source

## Error handling

- If `yarn export-en-json` fails: verify the script and i18n module paths exist, run `yarn install` if needed, and check `app/app/i18n/module/index.ts` exports correctly.
- If translation output is invalid JSON: validate the AI output (no trailing commas, no comments, proper escaping), and re-run translation if needed.
- If a locale file is missing: create it with an empty object `{}` before merging.

## When NOT to use this skill

- The user only wants to translate a small number of ad-hoc strings or UI copy.
- The user is refactoring or renaming existing i18n keys rather than translating new/changed keys.
- The task is general content translation unrelated to the DApp i18n JSON files.
