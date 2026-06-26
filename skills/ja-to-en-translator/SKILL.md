---
name: ja-to-en-translator
description: Translate Japanese text into natural, idiomatic English that follows this repository's English style guides and EN-JA glossary. Accepts a file path, pasted Japanese text, or a selection, and produces guide-compliant English while preserving Markdown, code, links, frontmatter structure, and VitePress directives. Use when a user asks to translate Japanese into English, render a Japanese passage in English, or draft the English version of Japanese source text. For keeping a paired `contents/en/` and `contents/ja/` file in 1-to-1 sync, use the `blog-translator` skill instead.
---

# Japanese to English translator

Translate Japanese source text into English that reads as natural, idiomatic prose and follows this repository's English writing conventions. The output must conform to the English style guides and the EN-JA glossary, not be a literal word-for-word transfer.

Use this skill when the user asks to translate Japanese into English, render a Japanese passage or document in English, or draft an English version of Japanese source text.

> [!NOTE]
> If the goal is to keep a paired file under `contents/en/` and `contents/ja/` in 1-to-1 parity (mirrored path, `localization` frontmatter syncing), use the `blog-translator` skill instead. This skill is the general-purpose JA->EN translator: it handles any Japanese input - a file, pasted text, or a selection - and does not manage localization state.


## Required input

Japanese source text, supplied as any of:

* A file path (typically a `.md` file, but any text file works).
* Pasted Japanese text in the user's message.
* The current editor selection.

If the source is not specified, default to the file currently open or named in the most recent user turn. Confirm the scope before writing if it is ambiguous.

If the source is already entirely English, say so and do not invent a translation.


## Read before translating

Read the English-side references first; do not translate from memory.

* [EN-JA glossary](../../docs/glossary.yaml) - the approved English-Japanese term pairs. When a Japanese term matches a glossary `ja` entry, use the corresponding English `en` rendering. Apply it consistently throughout; do not invent alternatives.
* [General style guide - English](../../docs/general-style-guide-english.md) - baseline rules: active voice, no contractions, the Oxford comma, sentence case headings, capitalization, punctuation, date and time formats, and the word list.
* [Technical style guide - English](../../docs/technical-style-guide-english.md) - documentation rules: sentence structure, lists, preparations sections, procedural steps, inline formatting, and alert banners.
* [Markdown style guide](../../docs/markdown-style-guide.md) - banner and reference-style link conventions, when the source is Markdown.

The output must read as natural, idiomatic English that follows these guides - never a literal transliteration of the Japanese sentence structure.


## What to translate, what to preserve

Translate:

* Prose: paragraphs, list items, table cell text, headings, image alt text and captions, and the human-readable label of Markdown links.
* The `title` and `description` frontmatter values (these render on the page).
* The visible label text inside banners (for example, the `Note:` / `Tip:` lead-in and the sentence after it), keeping the banner keyword token unchanged.

Preserve exactly (do not translate or reformat):

* Frontmatter keys and structural values: `head`, `meta`, `keywords` content, and any non-prose keys. Keep `keywords` as-is unless the user asks otherwise.
* Fenced code blocks, inline code spans, and `<pre>`/`<code>` content.
* Link targets, URLs, file paths, anchors, image `src` paths, and reference-style link definitions (`[id]: url`).
* VitePress directives and tokens: `[[toc]]`, `{{$frontmatter.title}}`, `{{$frontmatter.description}}`, and similar.
* Banner keyword tokens: keep `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!CAUTION]` literally; translate only the surrounding label and sentence.
* Overall document structure: heading order and depth, list nesting, and table shape should match the source.


## Workflow

1. **Resolve scope.** Identify the Japanese source (file path, pasted text, or selection). Confirm if ambiguous. If the source is already English, stop and report that.
2. **Read the references.** Load the glossary, the English general and technical style guides, and (for Markdown) the Markdown style guide.
3. **Read the source fully.** Identify the prose regions to translate and the regions to preserve verbatim (code, links, directives, frontmatter structure).
4. **Translate into English.** Produce natural, guide-compliant English. Apply every matching glossary term. Use plain hyphens (never en-dash or em-dash), straight quotes, no contractions, the Oxford comma, and sentence case headings. Keep the document structure aligned with the source.
5. **Deliver the result.**
   * If the source was a file, write the English translation where the user asked. If no destination was given, ask whether to overwrite the source, write a sibling file, or just return the text inline.
   * If the source was pasted text or a selection, return the English translation inline.
6. **Lint (when a Markdown file was written).** Run `pnpm lint` (or note it should be run) so Prettier and markdownlint normalize the output.
7. **Report.** Summarize what was translated, where the output went, any glossary terms applied, and anything you preserved verbatim or flagged for human review.


## Edge cases

* **Glossary gap.** If a key term is not in the glossary, choose the clearest English rendering, keep it consistent throughout, and flag it in the report so it can be added to the glossary.
* **Mixed-language source.** If the source already contains English, keep intentional English intact and translate only the Japanese prose.
* **Untranslatable proper nouns.** Place names, product names, and people's names follow the glossary if listed; otherwise keep the established romaji or native form and stay consistent.
* **Legal and financial terms.** This repository covers prenuptial agreements. Render legal and financial terms with their standard English equivalents, and flag any term whose precise meaning is uncertain rather than guessing - this content must not mislead.
* **Ambiguous source.** Japanese frequently omits the subject. Infer it from context where the meaning is clear; where it is genuinely ambiguous, choose the most likely reading and flag it in the report.


## What success looks like

* The English output is a faithful, natural-reading translation that follows the English style guides and the glossary.
* Document structure, code, links, image paths, directives, and frontmatter shape match the source where the source was structured Markdown.
* The English uses plain hyphens, straight quotes, no contractions, the Oxford comma, and sentence case headings.
* `pnpm lint` passes when a Markdown file was written.
* The report states what was translated, where it went, glossary terms applied, and any flags for human review.
