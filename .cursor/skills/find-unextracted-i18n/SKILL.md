---
name: find-unextracted-i18n
description: Scans TypeScript/JavaScript source files to find files that still contain hardcoded, non-i18n text and outputs only the file paths. Use when auditing localization coverage, checking a directory, or reviewing a commit for missing i18n extraction.
---

# Find Unextracted i18n

This skill helps audit i18n coverage by scanning a set of source files and listing **only those files that still contain hardcoded user-facing text that has not been extracted to i18n keys**.

It is a lightweight companion to [`extract-i18n-keys`](../extract-i18n-keys/SKILL.md):

- **`find-unextracted-i18n`**: *finds* files that still have hardcoded copy.
- **`extract-i18n-keys`**: *extracts* that copy into i18n modules and updates usages.

Use this skill when you want to quickly see **which files still need i18n work** without actually modifying them.

## When to Use

Use `find-unextracted-i18n` when:

- Auditing a directory (e.g. `app/app/components/`) for remaining hardcoded text.
- Checking whether a specific file has fully extracted its user-facing copy.
- Reviewing a commit or branch to see which touched files still have non-i18n text.
- Doing a final pass before merging i18n work to ensure no obvious strings were missed.

This skill is **read-only**: it should not modify any source files or i18n modules.

## Inputs

The input options mirror those of `extract-i18n-keys` so you can use them together in the same workflows.

Provide **one** of the following (relative to the repo root):

- **Option A: Path**
  - A single **file path** (e.g. `app/app/components/SafeInstructions.tsx`), or
  - A **directory path** (e.g. `app/app/components/`) to scan recursively.

- **Option B: Git commits**
  - A **single commit hash**, meaning “files changed in this commit”.
  - A **commit range** (`base..head`), meaning “files changed between these commits”.

If both a path and commit information are provided, prefer the more specific scope or ask the user to clarify.

## File Selection

From the candidate set (path or commit-based), build the list of files to scan using the same filters as `extract-i18n-keys`.

- **Include only these extensions**:
  - `.ts`
  - `.tsx`
  - `.js`
  - `.jsx`

- **Exclude**:
  - Any file under an `i18n` directory (paths containing `/i18n/`, such as `app/app/i18n/**`).
  - Any file matching `*.test.*` or `*.spec.*`.

Result: a **list of source files** to audit for unextracted text.

### How to collect files

You can construct the file list in different ways depending on the input:

- **Directory input**:
  - Recursively gather files under that directory.
  - Filter by extension and exclusion rules above.

- **Single file input**:
  - Use that file directly (verify it matches the allowed extensions and is not excluded).

- **Git commit / range input**:
  - Use `git diff --name-only <commit>^..<commit>` for a single commit, or
  - `git diff --name-only <base>..<head>` for a range.
  - Then filter the resulting paths through the same extension/exclusion rules.

## Detection Logic (What counts as “unextracted”)

This skill reuses the **core detection rules** from `extract-i18n-keys` but does not perform any extraction.

> For full details, see **Section 2: Extract hardcoded texts** in [`extract-i18n-keys/SKILL.md`](../extract-i18n-keys/SKILL.md). That section is the authoritative source of truth for what is considered a hardcoded text candidate and what should be excluded.

At a high level, a file is considered to have **unextracted i18n text** if you find at least **one** candidate that:

1. Looks like user-facing copy (labels, placeholders, helper text, descriptions, headings, etc.), and  
2. Is **not** already handled by `t()`, `i18n.t()`, or `Trans`, and  
3. Is **not** covered by any of the explicit ignore / exclusion rules.

**Include files with partial i18n coverage**: A file that already uses `t()`, `i18n.t()`, or `Trans` in some places must **still be included** in the output list if it contains any other hardcoded user-facing text. Do not exclude a file merely because it has partial i18n coverage—any remaining unextracted copy means the file needs i18n extraction.

### Candidate types (simplified)

When scanning a file, treat the following as **potential candidates**:

- **String literals**  
  - Double or single quoted strings of length ≥ 2 that look like user-facing text (often multiple words or containing spaces/punctuation).
  - Example: `"Create new campaign"`, `"Advanced settings"`.

- **Template literals**  
  - Template strings that include user-facing text, e.g. `` `You have ${qty} items` ``.

- **JSX text nodes**  
  - Non-empty text rendered inside JSX elements like `<div>`, `<span>`, `<Button>`, `<p>`, `<li>`, headings, etc.
  - Example: `<Button>Confirm</Button>`, `<p>Your changes have been saved.</p>`.

- **JSX attribute strings**  
  - Attributes such as `placeholder`, `title`, `label`, etc., whose values are string literals and look like UI copy.
  - Example: `placeholder="Enter name"`, `title="Submit order"`.

### Exclusions (do NOT count these)

Apply the same exclusion rules as `extract-i18n-keys` to avoid false positives:

- Text that is **already localized**:
  - Inside `t("...")`.
  - Inside `i18n.t("...")`.
  - Text handled via `Trans` components.

- **Explicit opt-outs**:
  - Elements with `data-i18n-ignore` (skip those elements and descendants).
  - Lines immediately following a comment containing `// i18n-ignore` (or `/* i18n-ignore */`).

- **Non-user-facing or technical strings**:
  - Class names, CSS/Tailwind utility strings.
  - Route paths, IDs, enum keys, log tags, tokens, pure numbers/symbols.
  - Pure URLs or domain names (e.g. `https://...`, `example.com`).

- **Accessibility/metadata attributes**:
  - `alt`, `aria-label`, and all `data-*` attributes are excluded.

- **Route meta exports**:
  - Route-level `meta` exports (e.g. `export const meta: MetaFunction = () => [...]`) are excluded and should not be counted.

For any nuanced edge case, **follow the same judgment and rules as in `extract-i18n-keys`**. When in doubt, re-open that skill file and mirror its interpretation.

### Early exit per file

For performance, this skill does **not** need to enumerate all candidates in a file:

- As soon as you find **one** candidate that qualifies as unextracted according to the rules above, you can:
  - Mark this file as “needs i18n extraction”.
  - **Stop scanning further in this file** and move on to the next file.

## Output Format

The output is a simple, human-readable summary listing only the file paths that still contain unextracted i18n text.

- If **at least one file** has unextracted text, print:

```text
Files with un-extracted i18n text:
- app/app/components/SafeInstructions.tsx
- app/app/components/DexSectionRenderer.tsx
- app/app/routes/_layout.board_.$dexId.tsx

Total: 3 file(s) need i18n extraction.
```

- If **no files** have unextracted text, print:

```text
All checked files have complete i18n coverage.
```

### Output rules

- Always output **only file paths**, one per line, prefixed with `- ` under the header.
- Do **not** print the individual text snippets or the number of snippets per file (this skill is intentionally coarse-grained).
- Do **not** modify any files; this is a read-only audit.
- Optionally, keep the file list sorted alphabetically for stable output.

## Typical Workflow

Here are common ways to use this skill in this repo.

### 1. Audit a component directory

Goal: find which shared components still have hardcoded copy.

1. Ask the user (or decide) which directory to scan, e.g. `app/app/components/`.
2. Collect all matching `.ts` / `.tsx` / `.js` / `.jsx` files under that directory (excluding `i18n/**`, tests, and specs).
3. Apply the detection logic to each file with early exit per file.
4. Print the list of files with unextracted text, or “All checked files have complete i18n coverage.”.

### 2. Audit files changed in a commit or branch

Goal: review only the files that changed in a particular change set.

1. Ask for a commit hash or `<base>..<head>` range.
2. Use `git diff --name-only` to get changed files.
3. Filter them using the same file selection rules.
4. Run the detection logic per file and output any files that still have hardcoded text.

This is particularly useful for code review workflows: quickly see whether a PR introduced or left behind any non-i18n text.

### 3. Spot-check a single file

Goal: confirm whether one specific file has finished i18n extraction.

1. Take the file path from the user (or from the editor).
2. If the file extension is allowed and not excluded, run the detection logic.
3. If any unextracted candidate is found, output that single file path and `Total: 1 file(s) need i18n extraction.`.
4. Otherwise, output “All checked files have complete i18n coverage.”.

## Notes and Relationship to `extract-i18n-keys`

- Always treat [`extract-i18n-keys/SKILL.md`](../extract-i18n-keys/SKILL.md) as the **single source of truth** for:
  - What types of strings should be localized.
  - Which attributes/elements are excluded.
  - How to interpret JSX fragments with interleaved text and components.
- This skill intentionally keeps detection logic **aligned** with that skill but focuses on:
  - **Discoverability**: which files still contain candidates.
  - **Read-only operation**: no edits or key generation.

In practice, you can use them together:

1. Run `find-unextracted-i18n` on a directory or commit to list files that still need attention.
2. For each reported file, use `extract-i18n-keys` to actually extract and replace hardcoded text.

