# larascan

A Claude Code skill that scans a Laravel codebase for security issues, performance traps, AI-generated code smells, and deploy hygiene — produces a scored HTML/PDF report AND can auto-fix the safe stuff.

Built for developers, consultants, and agencies who need a fast, defensible health check on a Laravel app they didn't write.

---

## v0.5 highlights

- **Composer install** — `composer require --dev mjgapp/larascan`, use via `vendor/bin/larascan`
- **Baseline file** — `--update-baseline` snapshots current findings to `.larascan/baseline.json`; subsequent scans filter them. Adopt on legacy codebases without every PR failing.
- **Config file** — `.larascan/config.json` sets profile, excluded rules, excluded paths, webhooks, brand. CLI overrides.
- **SARIF output** — `--format=sarif` emits GitHub Security tab-compatible SARIF 2.1.0
- **Rule profiles** — `--profile=pre-launch | rescue | monthly | default`
- **Diff mode** — compare two reports, get added/removed/unchanged + score delta
- **Custom rule plugins** — drop `userRule_*` functions into `<repo>/.larascan/rules/`
- **Webhooks** — Slack, Discord, or generic
- **Interactive walkthrough** — `--interactive` fix/skip/open/quit
- **`--fix` mode** — safe auto-corrections for 6 rules
- **Trend tracking** — `.larascan/history/` + score delta
- **GitHub Actions template** — drop-in PR-comment CI
- **23 rules** across Security, Blade, Performance, AI-slop, Deploy hygiene

---

## What it checks (v0.5.4 — 24 rules)

**Security (11)**

- `APP_DEBUG=true` in `.env`
- `$guarded = []` mass-assignment on Eloquent models
- Raw SQL with variable interpolation (`DB::statement("... $var ...")`)
- Hardcoded API keys / secrets in source (Stripe, OpenAI, AWS, GitHub tokens)
- `dd()` / `dump()` / `var_dump()` / `print_r()` left in production code
- `unserialize()` calls — classic PHP object injection / RCE vector
- `eval()` calls — immediate RCE if any input is user-controlled
- `APP_KEY` empty, placeholder, or too short
- `APP_ENV` set to `local` (dev helpers leak, prod safeguards skipped)
- Session cookie `http_only` or `secure` disabled
- SQL keyword string with variable interpolation (SHOW/CREATE/ALTER/DROP/etc. with `{$var}` — catches identifier-injection patterns outside of `DB::` call sites)

**Blade (2)**

- Unescaped Blade output (`{!! $var !!}`) — XSS risk
- State-changing form missing `@csrf` directive

**Performance (4)**

- Potential N+1 queries inside `foreach` loops
- Foreign key columns without indexes
- Synchronous `Mail::send` that should be queued
- `Model::all()` loading every row into memory

**AI-slop tells (3)**

- High TODO/FIXME/HACK density per file
- Multiple stub functions returning only `null` / `[]` / `true`
- PHP classes in `app/` missing a namespace

**Deploy hygiene (4)**

- `composer.lock` missing
- `composer.lock` older than `composer.json`
- PHP version not constrained in `composer.json`
- `SESSION_DRIVER=file` (breaks on multi-instance deploys)

Each finding comes with a severity (critical / high / medium / low), the exact file and line, a plain-English explanation of why it matters, and a one-line fix.

The scan produces a score (0–100) with per-severity caps so one noisy rule can't tank a large repo, and a letter grade (A–F).

---

## Installation

**Requirements**

- PHP 8.1 or newer on your system (`php -v`). Works with Herd, Valet, Homebrew, or any standard PHP install. Zero runtime dependencies.
- Optional: Claude Code (`claude.ai/code`) for the conversational skill UX.

**Option 1 — Composer (recommended for CI + team use)**

```
composer require --dev mjgapp/larascan
vendor/bin/larascan . --pretty
```

**Option 2 — Claude Code skill**

1. Unzip the download.
2. Move the `larascan` folder into your Claude Code skills directory:

   ```
   mv larascan ~/.claude/skills/
   ```

3. Restart Claude Code — the skill auto-registers. Ask Claude to *"audit this Laravel app"*.

Both install paths use the same scanner and produce the same reports.

---

## Usage

Open any Laravel project in Claude Code and ask:

- *"audit this Laravel app"*
- *"is this repo production ready?"*
- *"run larascan"*
- *"health check this codebase"*

Claude will scan the repo, print a summary in chat, and drop a standalone HTML report at `<repo>/larascan-report.html`. Open it in any browser and `Cmd+P → Save as PDF` to archive or send to a client.

You can also run the scanner directly without Claude:

```bash
# Scan only
php ~/.claude/skills/larascan/scripts/audit.php /path/to/your/laravel-app --pretty

# Use a named profile
php ~/.claude/skills/larascan/scripts/audit.php /path/to/your/laravel-app --profile=pre-launch
php ~/.claude/skills/larascan/scripts/audit.php /path/to/your/laravel-app --profile=rescue
php ~/.claude/skills/larascan/scripts/audit.php /path/to/your/laravel-app --profile=monthly

# Preview what auto-fix would change
php ~/.claude/skills/larascan/scripts/audit.php /path/to/your/laravel-app --fix --dry-run

# Apply safe fixes (commit or stash first — aborts on dirty working tree)
php ~/.claude/skills/larascan/scripts/audit.php /path/to/your/laravel-app --fix

# Save summary to .larascan/history/ for trend tracking
php ~/.claude/skills/larascan/scripts/audit.php /path/to/your/laravel-app --save-history

# Walk findings one at a time (requires TTY)
php ~/.claude/skills/larascan/scripts/audit.php /path/to/your/laravel-app --interactive

# Send the summary to Slack / Discord / a generic webhook
php ~/.claude/skills/larascan/scripts/audit.php /path/to/your/laravel-app --webhook=https://hooks.slack.com/...

# Compare two reports
php ~/.claude/skills/larascan/scripts/diff.php last-month.json this-month.json
```

---

## CI integration (GitHub Actions)

Copy `templates/github-workflows/larascan.yml` into your repo at `.github/workflows/larascan.yml`, and vendor the two scanner scripts into `.larascan/scripts/` in the same repo. The workflow runs on every pull request, posts findings as a sticky bot comment, and fails the build if the grade is F.

---

## White-labelling the report (free with any license)

If you audit client codebases and want the report to carry *your* name, drop a `config.json` next to `SKILL.md`:

```json
{
  "brand_name": "Acme Code Reviews",
  "brand_url":  "https://acme.example.com",
  "footer_cta": "Want the full human-reviewed audit? Book a call."
}
```

The report footer will show your name, link, and optional call-to-action on the right side. Leave any field blank to omit it. Global location also works: `~/.config/larascan/config.json`. Per-invocation override: `LARAVEL_AUDIT_CONFIG=/path/to/config.json`.

Without a config, the footer just shows the generator line — no branding anywhere in the report.

---

## What it is and isn't

**It is:** a fast, deterministic, dependency-free first pass at Laravel code quality — the kind of scan you'd run before quoting a rescue job, onboarding a new codebase, or signing off on a deploy.

**It isn't:** a replacement for a human security audit, Larastan/PHPStan, Psalm, or a full penetration test. The rules are heuristics. Some findings — especially N+1 detection — will be false positives, and the skill tells Claude to say "potential" rather than "confirmed".

---

## Support & updates

- Report issues or suggest rules: reply to your Gumroad receipt email.
- Updates are delivered through Gumroad library — re-download any time.

---

## License

Single-user commercial license. You may use this skill on unlimited client projects. You may not redistribute, resell, or publish the scripts.

© 2026 Marcel Gelinas. All rights reserved.
