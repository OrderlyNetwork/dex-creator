I’m developing a decentralized trading platform (DApp). Please keep the tone professional, clear, and finance/trading-focused. Buttons and titles should be as short and direct as possible, avoiding slang.

**Input:** The English i18n JSON content (may be full or partial—e.g. only new/changed keys from a diff). Translate all keys present in the input.

Produce **JSON objects** for the following 4 languages: `zh.json`, `tc.json`, `ko.json`, `es.json`.

Language file mapping (must follow this exactly):

- zh.json: Simplified Chinese
- tc.json: Traditional Chinese (must always use dedicated Traditional Chinese translations; do not simply copy or reuse strings from `zh.json`)
- ko.json: Korean
- es.json: Spanish

Strict requirements:

- Only translate the values; keys must remain completely unchanged. Do not add, delete, or rename any keys.
- `tc.json` must **not** be a direct copy of `zh.json`; always provide proper Traditional Chinese translations distinct from Simplified Chinese.
- For each language, the JSON must contain **all keys** present in the English source; no keys may be missing or extra.
- Output must be valid UTF-8 JSON, with 2-space indentation.
- Each JSON file must be a standalone, valid JSON object: no trailing commas, no comments, no additional fields. **Each file must contain exactly one JSON object**—do not concatenate or duplicate JSON content within a single file.
- You **must preserve exactly as-is**: placeholders (such as `{{variable}}`), HTML/XML tags (such as `<b>...</b>`), newline characters `\n`, and any interpolation/formatting fragments.
- Do not change or localize ticker symbols, token symbols, or codes such as `BTC`, `ETH`, `USDC`, or similar identifiers.
- If a value is not a string (very rare), keep it unchanged.
- After translation, self-check: ensure every `{{...}}` placeholder appears with the same count and content as in English, and that all tags are properly paired and not broken.
- If you are unsure about a specialized financial term, prefer to keep the original English term rather than guessing an incorrect translation.
