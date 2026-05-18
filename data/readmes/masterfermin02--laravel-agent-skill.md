# Laravel Best Practices Skill Installer

This package publishes an AI agent skill covering Laravel best practices — including Inertia + React conventions — into multiple locations to support various AI agents and editors.

## Install

### Via Laravel Boost (recommended)

Install individual skills directly — no Composer package required:

```bash
# Laravel best practices skill
php artisan boost:add-skill masterfermin02/laravel-agent-skill --skill laravel-best-practices

# PHP upgrade with Rector skill
php artisan boost:add-skill masterfermin02/laravel-agent-skill --skill php-update-with-rector

# Laravel upgrade with Rector skill
php artisan boost:add-skill masterfermin02/laravel-agent-skill --skill laravel-update-with-rector
```

### Via npx skills

```bash
# Laravel best practices skill
npx skills add https://github.com/masterfermin02/laravel-agent-skill --skill laravel-best-practices

# PHP upgrade with Rector skill
npx skills add https://github.com/masterfermin02/laravel-agent-skill --skill php-update-with-rector

# Laravel upgrade with Rector skill
npx skills add https://github.com/masterfermin02/laravel-agent-skill --skill laravel-update-with-rector
```

### Via Claude Code plugin

```bash
/plugin install https://github.com/masterfermin02/laravel-agent-skill
```

### Via Composer

```bash
composer require fperdomo/laravel-agent-skill --dev
```

## Usage

### Quick install — everything

```bash
php artisan lbpa:install

# Overwrite existing files
php artisan lbpa:install --force
```

### Laravel Boost — install all at once

```bash
php artisan boost:install
```

To keep skills up-to-date when dependencies are updated, add this to your project's `composer.json`:

```json
"scripts": {
    "post-update-cmd": [
        "@php artisan boost:update --ansi"
    ]
}
```

To publish manually to the Boost location (`.ai/skills/`):

```bash
php artisan vendor:publish --tag=lbpa-boost
# Publishes to: .ai/skills/laravel-best-practices/ and .ai/skills/inertia-development/
```

### Publish to Codex skill locations

**Project workspace (primary):**
```bash
php artisan vendor:publish --tag=lbpa-skill
# Publishes to: .codex/skills/laravel-best-practices/
```

**User home directory (global, shared across all projects):**
```bash
php artisan vendor:publish --tag=lbpa-skill-home
# Publishes to: ~/.codex/skills/laravel-best-practices/
```

**VS Code:**
```bash
php artisan vendor:publish --tag=lbpa-skill-vscode
# Publishes to: .vscode/codex/skills/laravel-best-practices/
```

**JetBrains IDEs (PhpStorm, IntelliJ, etc.):**
```bash
php artisan vendor:publish --tag=lbpa-skill-jetbrains
# Publishes to: .idea/codex/skills/laravel-best-practices/
```

**All Codex locations at once:**
```bash
php artisan vendor:publish --tag=lbpa-skill-all
```

### Publish AI agent adapters

```bash
php artisan vendor:publish --tag=lbpa-claude    # → CLAUDE.md
php artisan vendor:publish --tag=lbpa-copilot   # → .github/copilot-instructions.md
php artisan vendor:publish --tag=lbpa-agents    # → AGENTS.md
```

**Everything (all adapters + all skill locations):**
```bash
php artisan vendor:publish --tag=lbpa-all
```

---

## PHP Upgrade with Rector Skill

Upgrades a PHP project to a newer PHP version using Rector.

### Install

**Project workspace:**
```bash
php artisan vendor:publish --tag=rector-php
# Publishes to: .codex/skills/php-update-with-rector/
```

**User home directory (global):**
```bash
php artisan vendor:publish --tag=rector-php-home
# Publishes to: ~/.codex/skills/php-update-with-rector/
```

**VS Code:**
```bash
php artisan vendor:publish --tag=rector-php-vscode
# Publishes to: .vscode/codex/skills/php-update-with-rector/
```

**JetBrains IDEs:**
```bash
php artisan vendor:publish --tag=rector-php-jetbrains
# Publishes to: .idea/codex/skills/php-update-with-rector/
```

### Install via npx skills

```bash
npx skills add https://github.com/masterfermin02/laravel-agent-skill --skill php-update-with-rector
```

### Install via Laravel Boost

```bash
php artisan boost:add-skill masterfermin02/laravel-agent-skill --skill php-update-with-rector
```

---

## Laravel Upgrade with Rector Skill

Upgrades a Laravel application or package to a newer Laravel version (up to Laravel 13) using Rector and `driftingly/rector-laravel`.

### Install

**Project workspace:**
```bash
php artisan vendor:publish --tag=rector-laravel
# Publishes to: .codex/skills/laravel-update-with-rector/
```

**User home directory (global):**
```bash
php artisan vendor:publish --tag=rector-laravel-home
# Publishes to: ~/.codex/skills/laravel-update-with-rector/
```

**VS Code:**
```bash
php artisan vendor:publish --tag=rector-laravel-vscode
# Publishes to: .vscode/codex/skills/laravel-update-with-rector/
```

**JetBrains IDEs:**
```bash
php artisan vendor:publish --tag=rector-laravel-jetbrains
# Publishes to: .idea/codex/skills/laravel-update-with-rector/
```

### Install via npx skills

```bash
npx skills add https://github.com/masterfermin02/laravel-agent-skill --skill laravel-update-with-rector
```

### Install via Laravel Boost

```bash
php artisan boost:add-skill masterfermin02/laravel-agent-skill --skill laravel-update-with-rector
```

---

## What's included

### Backend rules

| ID | Rule | Severity |
|----|------|----------|
| SRP-001 | Single Responsibility Principle | high |
| FUNC-001 | Methods should do one thing | medium |
| MVC-001 | Skinny controllers; move logic out | high |
| VAL-001 | Validation in FormRequest classes | **critical** |
| SVC-001 | Business logic in service/action classes | high |
| AUTH-001 | Use Policies for authorization | high |
| CONF-001 | Never call `env()` outside config files | high |
| DRY-001 | Don't repeat yourself | medium |
| ELO-001 | Prefer Eloquent + Collections (`sole()`, `firstOrCreate()`, casts) | low |
| BLADE-001 | No queries in Blade; eager load to avoid N+1 | **critical** |
| PERF-001 | Chunk/stream large dataset operations | medium |
| NAMING-001 | Follow Laravel naming conventions | medium |

### Inertia + React rules

| ID | Rule |
|----|------|
| INRT-001 | Directory conventions (`common`, `modules`, `pages`, `shadcn`) |
| INRT-002 | Page components: `Page` suffix, default export |
| INRT-003 | One component per file, PascalCase, function declarations |
| INRT-004 | Wrap shadcn components; avoid direct app-wide imports |
| INRT-005 | No barrel files; absolute aliased imports |
| INRT-006 | Type page props with TypeScript interfaces |
| INRT-007 | Use `useForm` for submissions; avoid raw axios/fetch |
| INRT-008 | Use `usePage` for shared data; avoid prop drilling |
| INRT-009 | Use `<Link>` for internal navigation; avoid plain `<a>` |
| INRT-010 | Use partial reloads (`router.reload`) instead of full visits |

### Inertia + Vue rules

| ID | Rule |
|----|------|
| INRT-VUE-001 | Directory conventions |
| INRT-VUE-002 | Page components: `Page` suffix, default export |
| INRT-VUE-003 | One component per `.vue` file, `<script setup>` |
| INRT-VUE-004 | Wrap third-party UI library components |
| INRT-VUE-005 | No barrel files; absolute aliased imports |

## Published structure

```
.ai/skills/laravel-best-practices/         # Laravel Boost — general skill
  SKILL.md
.ai/skills/inertia-development/            # Laravel Boost — Inertia React + Vue skill
  SKILL.md

.codex/skills/laravel-best-practices/      # Codex / project workspace
  SKILL.md
  references/
    rulebook.json
    laravel-best-practices-summary.md
    inertia-react.md
    inertia-react-summary.md
    inertia-vue.md
  scripts/
    detect-laravel-context.php
    review-diff.sh

CLAUDE.md                                  # Claude Code adapter
.github/copilot-instructions.md            # GitHub Copilot adapter
AGENTS.md                                  # Generic agent adapter
```
