# Skills

This folder contains local Codex skills used by this repository.


## Usage

To use a skill, enter the skill's name in the AI interface (VS Code extension, terminal prompt, or desktop app) with the appropriate prefix for AI tool.

| Tool           | Input       | Example                                        |
| -------------- | ----------- | ---------------------------------------------- |
| Claude         | /skill-name | `/ai-commit --auto` or `/gh-pr-reporter <URL>` |
| Codex          | $skill-name | `$ai-commit --auto` or `$gh-pr-reporter <URL>` |
| GitHub Copilot | @skill-name | `@ai-commit --auto` or `@gh-pr-reporter <URL>` |

> [!TIP]
> Ask the AI `What does [skill name] do?` to get a description of the skill's functionality and usage instructions.


## Available skills


### Daily utility skills

| Skill                     | Description                                                                                                                                                                                                        | Last updated (UTC) |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| [`ai-commit`][]           | Auto-gather git changes, confirm scope with the user, and draft a commit title and message following the project commit style guide.                                                                               | 2026-06-03 13:30   |
| [`avoid-ai-writing`][]    | Audits and rewrites content to remove AI writing patterns ("AI-isms"): supports detect-only, edit-in-place, and rewrite modes, an optional voice profile, and an iterate-to-convergence pass. Tailored for this repo with a bilingual scope (English tables plus a Japanese AI-isms section), legal/relationship domain boilerplate, and cross-links to `japanese-tech-writing`, `text-proofreading`, `general-en-polisher`, and `thinking-first-draft`. Imported from `conorbronsdon/avoid-ai-writing`. | 2026-06-28 00:00   |
| [`general-en-polisher`][] | Polishes Markdown files to enforce the repo core writing rules (straight quotes, no contractions, the Oxford comma, sentence case headings, plain hyphens, and more), then runs `link-polisher` on the same files. | 2026-06-03 09:37   |
| [`blog-md-linter`][]      | Lints and polishes a Markdown file, or every Markdown file under a folder such as `contents/`: runs the repo auto-fixers, refreshes any table of contents, converts links to reference-style links per the repo convention, and checks style-guide compliance. | 2026-06-14 00:00   |
| [`blog-content-auditor`][] | Audits one content Markdown file for content quality: verifies facts are correct and up-to-date, checks style-guide compliance, and confirms the content is logically sound and complete, then reports findings grouped by accuracy, style, and sense. | 2026-06-26 00:00   |
| [`blog-translator`][]     | Translates a paired content Markdown file between English and Japanese to keep the two language versions in 1-to-1 sync, applying the target-language style guides and the EN-JA glossary and reconciling the `localization` frontmatter state.                       | 2026-06-26 00:00   |
| [`ja-to-en-translator`][] | Translates Japanese text (a file, pasted text, or a selection) into natural, idiomatic English that follows the repository's English style guides and the EN-JA glossary, preserving Markdown, code, links, frontmatter structure, and VitePress directives.         | 2026-06-26 00:00   |
| [`ja-tech-writing`][]     | Japanese-prose writing norms for technical docs and book manuscripts: one-sentence-per-line formatting, paragraph/argument structure, rigor checks, reader-load management, restrained rhetoric, no LLM-style filler, and concision. Imported from a [k16shikano gist][ja-tech-writing-src]. | 2026-06-28 00:00   |
| [`text-proofreading`][]   | Proofreads, summarizes, and suggests improvements for prose (誤字脱字，grammar, awkward phrasing) and returns text stats, corrections, a summary, and improvement notes. Imported from `nogataka/skill-agent-chat`. | 2026-06-28 00:00   |
| [`thinking-first-draft`][] | Interviews the author for "thinking material" (motive, audience, the one key point, project context) before drafting a blog post, report, review, or design, so output is not hollow / "AI-like" (AI っぽい). Distilled from a [RIO Zenn essay][thinking-first-draft-src]. | 2026-06-28 00:00   |

[`ai-commit`]: ./ai-commit/SKILL.md
[`avoid-ai-writing`]: ./avoid-ai-writing/SKILL.md
[`blog-content-auditor`]: ./blog-content-auditor/SKILL.md
[`blog-md-linter`]: ./blog-md-linter/SKILL.md
[`blog-translator`]: ./blog-translator/SKILL.md
[`general-en-polisher`]: ./general-en-polisher/SKILL.md
[`ja-to-en-translator`]: ./ja-to-en-translator/SKILL.md
[`ja-tech-writing`]: ./ja-tech-writing/SKILL.md
[ja-tech-writing-src]: https://gist.github.com/k16shikano/fd287c3133457c4fd8f5601d34aa817d
[`text-proofreading`]: ./text-proofreading/SKILL.md
[`thinking-first-draft`]: ./thinking-first-draft/SKILL.md
[thinking-first-draft-src]: https://github.com/rioX432/zenn-article/blob/master/articles/ai-likeness-not-about-writing-style.md


### Repository maintenance skills

| Skill                          | Description                                                                                                                                                                                    | Last updated (UTC) |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| [`file-folder-name-linter`][]  | Lints repository file and folder names against three fixed rules (`notes/` date prefix, `.yaml` not `.yml`, kebab-case) via `pnpm lint-naming`, with style-guide pointers for the reviewer.    | 2026-06-05 00:00   |
| [`folder-readme-maintainer`][] | Audits the repository for missing or outdated folder `README.md` files and creates or updates them. Run after adding, moving, or renaming folder contents.                                     | 2026-06-09 00:00   |
| [`gh-workflow-auditor`][]      | Audits GitHub Actions workflows: enforces the `.yaml` extension and Node.js 24, and upgrades pinned actions to the newest stable release that has aged past a 7-day supply-chain cool-down window (full-SHA pins, via `gh`). | 2026-06-29 00:00   |
| [`readme-maintainer`][]        | Audits the repository for missing or outdated folder `README.md` files and creates or updates them.                                                                                            | 2026-06-03 04:16   |
| [`script-auditor`][]           | Audits helper scripts in `scripts/` and `skills/*/scripts/` against the `AGENTS.md` script guidelines (no Python, prefer `.mjs` or zsh, require `--help`, a notes section, and status emojis). | 2026-06-04 01:36   |
| [`skill-allowlist-syncer`][]   | Fully syncs the `Skill(<name>)` entries in `.claude/settings.json` under `permissions.allow` with the skills in the repo `skills/` folder, adding new skills and removing deleted ones.        | 2026-06-01 09:37   |

[`file-folder-name-linter`]: ./file-folder-name-linter/SKILL.md
[`folder-readme-maintainer`]: ./folder-readme-maintainer/SKILL.md
[`gh-workflow-auditor`]: ./gh-workflow-auditor/SKILL.md
[`readme-maintainer`]: ./readme-maintainer/SKILL.md
[`script-auditor`]: ./script-auditor/SKILL.md
[`skill-allowlist-syncer`]: ./skill-allowlist-syncer/SKILL.md


### Other utility skills

| Skill                    | Description                                                                                                                                                                                             | Last updated (UTC) |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| [`gh-cli`][]             | Interact with GitHub repositories using the GitHub CLI (gh). Covers PRs, issues, releases, workflow runs, and branch operations.                                                                        | 2026-05-14 06:13   |
| [`gh-issue-to-task`][]   | Generates a `tasks/<n>-<slug>.md` scaffold from a GitHub issue: fetches the issue, extracts linked specs and Figma URLs, infers Phrase project, tag, and branch, and writes the file (optional enrich). | 2026-06-08 00:00   |
| [`gh-pr-reporter`][]     | Fetches every comment on a GitHub PR (reviews, inline review comments, and general comments) and emits a single consolidated Markdown report.                                                           | 2026-06-04 14:30   |
| [`link-polisher`][]      | Rewrites raw URLs in Markdown files as Markdown links with a human-readable label fetched from the source (Figma file name, GitHub issue or pull request title).                                        | 2026-06-03 04:16   |

[`gh-cli`]: ./gh-cli/SKILL.md
[`gh-issue-to-task`]: ./gh-issue-to-task/SKILL.md
[`gh-pr-reporter`]: ./gh-pr-reporter/SKILL.md
[`link-polisher`]: ./link-polisher/SKILL.md
