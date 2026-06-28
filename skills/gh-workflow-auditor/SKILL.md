---
name: gh-workflow-auditor
description: Audit GitHub Actions workflow files and bring them up to date. Use when a user asks to review, audit, or update the GitHub workflows or CI: enforces the .yaml extension, requires Node.js 24 in actions/setup-node, and upgrades pinned actions to the newest release that has aged past a supply-chain cool-down window (7 days by default). Reports findings, then applies the fixes and updates any docs.
---

# GitHub workflow auditor

Review every GitHub Actions workflow in `.github/workflows/` and bring it up to date. Use this skill when the user asks to audit, review, or update the workflows or CI, or after adding a new workflow.

The skill enforces four things:

* **File format.** Workflow files must use the `.yaml` extension, not `.yml` (the repo convention; see [`file-folder-name-linter`](../file-folder-name-linter/SKILL.md)).
* **Node.js version.** Any `actions/setup-node` step must request Node.js `24`, not `20` (or any other major). This matches what VitePress targets and what `deploy.yaml` already uses.
* **Up-to-date actions.** Every pinned action (`uses: owner/repo@...`) should be on the newest stable release available.
* **Supply-chain cool-down.** Never upgrade to a release younger than 7 days. A freshly published release is the prime window for a compromised-tag supply-chain attack, so the auditor holds back to the newest release that has aged past the window, even when a newer one exists.

When it recommends an upgrade, it pins to the full commit SHA with a `# owner/repo@vX.Y.Z, pinned` comment, matching the repo convention.


## Scope

In scope:

* Tracked workflow files under `.github/workflows/` ending in `.yml` or `.yaml`.

Out of scope:

* Non-workflow YAML elsewhere in the repo (`pnpm-workspace.yaml`, config, content frontmatter).
* `package.json` / project dependency upgrades. This skill audits the CI workflows, not the project's npm dependencies. (The `vitepress-auto-update.yaml` workflow handles VitePress upgrades at runtime; this skill keeps that workflow's own actions current, not the packages it bumps.)
* Reusable composite actions defined outside `.github/workflows/`.


## Quick start

Run the bundled auditor from anywhere inside the repo (requires Node.js 24+ and the `gh` CLI, authenticated via `gh auth login`):

```bash
# Audit every tracked workflow and print a grouped report.
node skills/gh-workflow-auditor/scripts/audit-workflows.mjs

# Audit specific files.
node skills/gh-workflow-auditor/scripts/audit-workflows.mjs .github/workflows/deploy.yaml

# Skip the GitHub API calls (extension + Node.js checks only, no network).
node skills/gh-workflow-auditor/scripts/audit-workflows.mjs --no-net

# Tune the cool-down window or the required Node.js major version.
node skills/gh-workflow-auditor/scripts/audit-workflows.mjs --min-age-days 14 --node-version 24

# Machine-readable output.
node skills/gh-workflow-auditor/scripts/audit-workflows.mjs --json
```

Exit codes:

* `0` - no findings; workflows are up to date.
* `1` - one or more findings.
* `2` - configuration error (not a git checkout, `gh` missing, no workflows found, unreadable file).


## Workflow

1. **Scope the run.**
   * After touching one workflow, pass its path so the report stays focused.
   * For a full health check, run with no arguments.

2. **Audit.** Run the bundled script. Read the grouped report. Each finding carries a rule, a severity, the file and line, and (for upgrades) a ready-to-paste recommended line:
   * `extension` - ❌ the file uses `.yml` and should be `.yaml`.
   * `node-version` - ❌ a `node-version:` is not the required major (24).
   * `version` - ❌ a newer eligible release exists, or ⚠️ the action has no resolvable releases (check manually), or ℹ️ the newest release is still inside the cool-down window (no action needed yet).
   * `pinning` - ⚠️ the action is pinned to a tag or branch instead of a full commit SHA.

3. **Report.** Summarize for the user: which workflows are clean, and which findings exist grouped by rule. Call out anything held back by the cool-down so the user knows an upgrade is deferred, not missed.

4. **Fix.**
   * **`.yml` -> `.yaml`:** rename with `git mv`. GitHub picks up workflows by extension, so no internal reference changes are needed - but check the repo for any doc or script that names the old filename and update it.
   * **Node.js version:** edit the `node-version:` value to `24`.
   * **Action upgrades:** replace the `uses:` line with the recommended SHA-pinned line from the report. Apply only the eligible (cool-down-aged) version the report gives you - do not jump to a newer release the auditor held back.
   * **Tag/branch pins (`pinning` warnings):** when the action also has a `version` upgrade, the recommended line already converts it to a SHA pin. For a tag-pinned action with no pending upgrade, resolve its current tag to a SHA and add the `# owner/repo@vX.Y.Z, pinned` comment to match the repo convention.

5. **Re-audit.** Run the script again on the changed files and confirm the verdict is clean.

6. **Update documentation.** Update any docs that reference the changed workflows: action version numbers in `README` or `docs/`, a workflow filename you renamed, or the Node.js version if it is documented. Search the repo for the old values before finishing.

7. **Commit.** Use the [`ai-commit`](../ai-commit/SKILL.md) skill to draft the message.


## What each check looks for

The checks are heuristics that surface candidates for review, not a hard gate. Confirm a finding by reading the workflow before acting on it.

* **Extension.** Flags any workflow file ending in `.yml`.
* **Node.js version.** Matches `node-version:` lines and compares the major component against the required version (default 24). Quoted (`'24'`) and bare (`24`) values both parse.
* **Version (upgrade).** For each unique action, queries `gh api repos/{owner}/{repo}/releases`, filters to stable semver releases (no drafts, no prereleases), and picks the newest one published at least `--min-age-days` ago. If that beats the current pin, it resolves the tag to a commit SHA via `gh api repos/{owner}/{repo}/commits/{tag}` and emits a pinned `uses:` line. The current version is read from the pin comment (`# owner/repo@v5.0.0, pinned`) when present, otherwise from the ref itself.
* **Pinning.** Flags a `uses:` ref that is not a 40-character commit SHA (a version tag like `v6` or a branch). Repo convention is to pin to a full SHA with a version comment.


## Bundled resources


### scripts/audit-workflows.mjs

Audits workflow files against the four rules and prints a per-file report. Read-only - it queries the GitHub API but never edits files. Fixes are applied by the skill workflow with your judgment.

Behavior:

* Locates the repo root via `git rev-parse --show-toplevel`.
* With no file arguments, discovers tracked workflows via `git ls-files .github/workflows`; with arguments, audits exactly those `.yml`/`.yaml` paths.
* Caches each action's release lookup so a repo is queried once even when used across multiple workflows.
* Prints a human-readable report by default, or a JSON object with `--json`.
* Exits `0` when clean, `1` on findings, `2` on a configuration error.


## Constraints

* Never upgrade past the cool-down window. If the auditor holds a release back, do not override it without an explicit request from the user, and note why.
* Apply the exact SHA and comment the report gives you. Do not hand-pick a different tag or skip the SHA pin - the recommended line already matches the repo convention.
* Treat `pinning` findings as advisory. Convert a tag pin to a SHA pin when you are already touching that line; do not churn every workflow just to clear warnings unless the user asks.
* Requires an authenticated `gh` CLI for the version checks. If `gh` is unavailable, run with `--no-net` and tell the user the version checks were skipped.
* Read the workflow before acting. The checks are heuristics and can misfire on unusual formatting or a deliberately tag-pinned action.
