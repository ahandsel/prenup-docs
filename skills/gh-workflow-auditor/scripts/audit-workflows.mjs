#!/usr/bin/env node
// audit-workflows.mjs notes
// General notes:
// * Purpose: audit GitHub Actions workflow files for the gh-workflow-auditor skill.
//   Checks file extension (.yaml not .yml), the Node.js version used by
//   actions/setup-node, and whether each pinned action has a newer release that
//   is old enough to satisfy a supply-chain cool-down window.
// * Read-only. Queries the GitHub API through the `gh` CLI; never edits files.
// Usage:
//   node skills/gh-workflow-auditor/scripts/audit-workflows.mjs [options] [files...]
//   Options:
//     --json                 Emit a machine-readable JSON report.
//     --min-age-days <n>     Cool-down window for upgrades (default: 7).
//     --node-version <n>     Required Node.js major version (default: 24).
//     --no-net               Skip GitHub API calls (extension + Node checks only).
//     --help, -h             Print this help and exit.
//   With no file arguments, every tracked workflow under .github/workflows is audited.
// Output:
// * A grouped, human-readable report by default, or a JSON object with --json.
// * Exit codes: 0 = clean, 1 = one or more findings, 2 = configuration error.
// Version history:
// * v1.0 - 2026-06-29 - Initial release.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const HELP = `gh-workflow-auditor - audit GitHub Actions workflow files

Usage:
  node skills/gh-workflow-auditor/scripts/audit-workflows.mjs [options] [files...]

Options:
  --json               Emit a machine-readable JSON report.
  --min-age-days <n>   Cool-down window in days for upgrades (default: 7).
  --node-version <n>   Required Node.js major version (default: 24).
  --no-net             Skip GitHub API calls (extension + Node checks only).
  --help, -h           Print this help and exit.

With no file arguments, every tracked workflow under .github/workflows is audited.

Exit codes:
  0  no findings
  1  one or more findings
  2  configuration error (not a git checkout, gh missing, unreadable file)
`;

function fail(msg) {
  console.error(`❌ ${msg}`);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { json: false, minAgeDays: 7, nodeVersion: 24, net: true, files: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      process.stdout.write(HELP);
      process.exit(0);
    } else if (a === '--json') {
      opts.json = true;
    } else if (a === '--no-net') {
      opts.net = false;
    } else if (a === '--min-age-days') {
      opts.minAgeDays = Number(argv[++i]);
      if (!Number.isFinite(opts.minAgeDays) || opts.minAgeDays < 0) fail('--min-age-days needs a non-negative number.');
    } else if (a === '--node-version') {
      opts.nodeVersion = Number(argv[++i]);
      if (!Number.isFinite(opts.nodeVersion)) fail('--node-version needs a number.');
    } else if (a.startsWith('--')) {
      fail(`Unknown option: ${a}`);
    } else {
      opts.files.push(a);
    }
  }
  return opts;
}

function repoRoot() {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  } catch {
    fail('Not a git checkout (could not run `git rev-parse --show-toplevel`).');
  }
}

function ghAvailable() {
  try {
    execFileSync('gh', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function gh(args) {
  // Returns parsed JSON, or null on any error (missing repo, no releases, rate limit).
  try {
    const out = execFileSync('gh', ['api', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return JSON.parse(out);
  } catch {
    return null;
  }
}

function listWorkflowFiles(root) {
  let tracked = [];
  try {
    tracked = execFileSync('git', ['ls-files', '.github/workflows'], { cwd: root, encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
  } catch {
    fail('Could not list tracked files under .github/workflows.');
  }
  return tracked.filter((f) => /\.(ya?ml)$/.test(f));
}

// --- semver helpers (stable releases only; prereleases are filtered out) ---

function parseSemver(tag) {
  const m = String(tag).trim().replace(/^v/i, '').match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function cmpSemver(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

// --- per-action lookup, cached so each repo is queried once ---

const actionCache = new Map();

function actionRepo(action) {
  // owner/repo from owner/repo or owner/repo/sub/path
  const parts = action.split('/');
  return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : action;
}

function latestEligible(action, minAgeDays, now) {
  const repo = actionRepo(action);
  if (actionCache.has(repo)) return actionCache.get(repo);

  const releases = gh([`repos/${repo}/releases`, '--paginate', '-X', 'GET', '-f', 'per_page=100']);
  let result;
  if (!Array.isArray(releases) || releases.length === 0) {
    result = { error: 'no releases found (tag-only action?) - check manually' };
  } else {
    const cutoff = now.getTime() - minAgeDays * 24 * 60 * 60 * 1000;
    const stable = releases
      .filter((r) => !r.draft && !r.prerelease && parseSemver(r.tag_name))
      .map((r) => ({ tag: r.tag_name, ver: parseSemver(r.tag_name), publishedAt: r.published_at }))
      .sort((a, b) => cmpSemver(b.ver, a.ver));

    if (stable.length === 0) {
      result = { error: 'no stable semver releases found - check manually' };
    } else {
      const newest = stable[0];
      const eligible = stable.find((r) => new Date(r.publishedAt).getTime() <= cutoff);
      result = {
        newest,
        eligible: eligible || null,
        heldBack: eligible && newest.tag !== eligible.tag ? newest : null,
      };
    }
  }
  actionCache.set(repo, result);
  return result;
}

function resolveSha(action, tag) {
  const repo = actionRepo(action);
  const commit = gh([`repos/${repo}/commits/${tag}`]);
  return commit && commit.sha ? commit.sha : null;
}

// --- line parsing ---

const USES_RE = /^(\s*)(?:-\s*)?uses:\s*['"]?([^\s'"@]+)@([^\s'"#]+)['"]?\s*(#.*)?$/;
const NODE_RE = /^(\s*)node-version:\s*['"]?([^\s'"#]+)['"]?/;
const SHA_RE = /^[0-9a-f]{40}$/i;

function currentVersion(ref, comment) {
  // Prefer a version tag in the pin comment (repo style: "# owner/repo@v5.0.0, pinned").
  if (comment) {
    const m = comment.match(/@(v?\d+\.\d+\.\d+[^\s,]*)/);
    if (m) return m[1];
  }
  if (parseSemver(ref)) return ref;
  return null;
}

function auditFile(relPath, root, opts, now) {
  const findings = [];
  const abs = path.join(root, relPath);
  let content;
  try {
    content = readFileSync(abs, 'utf8');
  } catch {
    return [{ rule: 'read', level: 'fail', file: relPath, message: 'Could not read file.' }];
  }

  // Rule 1: extension must be .yaml
  if (path.extname(relPath) === '.yml') {
    findings.push({
      rule: 'extension',
      level: 'fail',
      file: relPath,
      message: `Uses .yml; rename to .yaml -> ${relPath.replace(/\.yml$/, '.yaml')}`,
    });
  }

  const lines = content.split('\n');
  lines.forEach((line, i) => {
    const ln = i + 1;

    // Rule 2: Node.js version
    const nm = line.match(NODE_RE);
    if (nm) {
      const major = String(nm[2]).split('.')[0];
      if (major !== String(opts.nodeVersion)) {
        findings.push({
          rule: 'node-version',
          level: 'fail',
          file: relPath,
          line: ln,
          current: nm[2],
          message: `node-version is "${nm[2]}"; require ${opts.nodeVersion}.`,
        });
      }
    }

    // Rule 3 + 4: action pins
    const um = line.match(USES_RE);
    if (um) {
      const [, , action, ref, comment] = um;
      const isSha = SHA_RE.test(ref);
      const cur = currentVersion(ref, comment);

      // Rule 4a: pinning style (repo convention is full-SHA pin + version comment)
      if (!isSha) {
        findings.push({
          rule: 'pinning',
          level: 'warn',
          file: relPath,
          line: ln,
          action,
          ref,
          message: `${action} is pinned to a tag/branch ("${ref}"), not a full commit SHA.`,
        });
      }

      // Rule 4b: newer eligible release available
      if (opts.net) {
        const info = latestEligible(action, opts.minAgeDays, now);
        if (info.error) {
          findings.push({ rule: 'version', level: 'warn', file: relPath, line: ln, action, message: `${action}: ${info.error}` });
        } else if (info.eligible) {
          const target = info.eligible;
          const targetVer = parseSemver(target.tag);
          const curVer = cur ? parseSemver(cur) : null;
          const outdated = !curVer || cmpSemver(targetVer, curVer) > 0;
          if (outdated) {
            const sha = resolveSha(action, target.tag);
            const recommended = sha
              ? `uses: ${action}@${sha} # ${action}@${target.tag}, pinned`
              : `uses: ${action}@${target.tag}`;
            findings.push({
              rule: 'version',
              level: 'fail',
              file: relPath,
              line: ln,
              action,
              current: cur || (isSha ? 'SHA without version comment' : ref),
              latestEligible: target.tag,
              latestAvailable: info.newest.tag,
              heldBack: !!info.heldBack,
              recommendedSha: sha,
              recommended,
              message: `${action}: ${cur || ref} -> ${target.tag}`
                + (info.heldBack ? ` (holding back ${info.newest.tag}, < ${opts.minAgeDays}d old)` : ''),
            });
          }
        } else if (info.heldBack) {
          findings.push({
            rule: 'version',
            level: 'ok-info',
            file: relPath,
            line: ln,
            action,
            message: `${action}: newest release ${info.newest.tag} is < ${opts.minAgeDays}d old; no eligible upgrade yet.`,
          });
        }
      }
    }
  });

  return findings;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const root = repoRoot();
  const now = new Date();

  if (opts.net && !ghAvailable()) {
    fail('`gh` CLI not found. Install it and run `gh auth login`, or pass --no-net to skip version checks.');
  }

  let files;
  if (opts.files.length) {
    files = opts.files
      .map((f) => path.relative(root, path.resolve(f)))
      .filter((f) => /\.(ya?ml)$/.test(f));
    if (files.length === 0) fail('None of the given files are .yml/.yaml workflow files.');
  } else {
    files = listWorkflowFiles(root);
    if (files.length === 0) fail('No tracked workflow files found under .github/workflows.');
  }

  const all = [];
  for (const f of files) all.push(...auditFile(f, root, opts, now));

  const findings = all.filter((x) => x.level !== 'ok-info');
  const info = all.filter((x) => x.level === 'ok-info');
  const hasFindings = findings.length > 0;

  if (opts.json) {
    console.log(JSON.stringify({ files, findings: all, summary: { files: files.length, findings: findings.length } }, null, 2));
    process.exit(hasFindings ? 1 : 0);
  }

  // Human-readable report
  console.log(`🔎 Audited ${files.length} workflow file(s) (min upgrade age: ${opts.minAgeDays}d, Node: ${opts.nodeVersion}).\n`);
  for (const f of files) {
    const fF = findings.filter((x) => x.file === f);
    const fI = info.filter((x) => x.file === f);
    if (fF.length === 0 && fI.length === 0) {
      console.log(`✅ ${f}`);
      continue;
    }
    console.log(`📄 ${f}`);
    for (const x of fF) {
      const icon = x.level === 'fail' ? '❌' : '⚠️';
      const where = x.line ? `:${x.line}` : '';
      console.log(`   ${icon} [${x.rule}]${where} ${x.message}`);
      if (x.recommended) console.log(`        → ${x.recommended}`);
    }
    for (const x of fI) {
      console.log(`   ℹ️  [${x.rule}] ${x.message}`);
    }
  }

  console.log('');
  if (hasFindings) {
    const fails = findings.filter((x) => x.level === 'fail').length;
    const warns = findings.filter((x) => x.level === 'warn').length;
    console.log(`⚠️  ${findings.length} finding(s): ${fails} to fix, ${warns} advisory.`);
  } else {
    console.log('✅ No findings. Workflows are up to date.');
  }

  process.exit(hasFindings ? 1 : 0);
}

main();
