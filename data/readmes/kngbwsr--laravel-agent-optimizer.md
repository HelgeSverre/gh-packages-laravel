# Laravel Agent Optimizer

A Laravel package that optimizes AI agent directive files by extracting large guideline sections into modular rule files, keeping your top-level agent directives lean and focused.

Works seamlessly with [Laravel Boost](https://github.com/laravel-boost/boost)-generated agent directive files and automatically re-runs after configured trigger commands (e.g. `boost:update`, `boost:install`).

---

## Features

- **Dedicated output folder** — all generated files live inside a single `agent-optimized/` folder, making cleanup trivial and preventing stale files when config changes
- **Automatic section extraction** — scans `*.md` agent directive files for `=== title ===` sections and moves qualifying sections to dedicated rule files
- **Five extraction strategies** — `full_section`, `nested_full`, `nested_subsections`, `nested_split`, and `auto` to suit any section structure
- **Per-section strategy overrides** — apply a different strategy to individual sections without changing the global default
- **Configurable line threshold** — only extract sections that exceed a minimum line count, filtering out trivial sections
- **Configurable file naming** — control the prefix and extension for generated rule and subsection files (e.g. `.mdc` for Cursor IDE)
- **Configurable reference pretext** — customise the label inserted before every file-path reference, globally or per-strategy; supports a `<title>` token that is replaced at runtime with the actual section or sub-section title
- **Idempotent optimization** — an `<!-- agent-optimized -->` marker is written into each extracted section so standalone re-runs skip already-optimized sections without double-extracting, and the preflight step preserves rule files that are still referenced
- **Configurable header notes** — automatically prepends an LLM-readable blockquote to agent directive files and to generated rule files; content is fully customisable via config
- **Exception list** — protect specific sections from ever being extracted
- **Dry-run mode** — preview what would be extracted without writing any files
- **Laravel Boost integration** — automatically re-optimizes after configured trigger commands (default: `boost:update`, `boost:install`)
- **One-step install command** — `optimizeAgents:install` publishes the config and wires up `composer.json` in a single step
- **Reset command** — `optimizeAgents:reset` removes all generated files and re-runs Boost without re-triggering optimization
- **Laravel auto-discovery** — zero manual registration required for Laravel 13+

---

## Requirements

- PHP 8.2+
- Laravel 13+
- [Laravel Boost](https://github.com/laravel-boost/boost) (required for the `optimizeAgents:reset` command and auto-run integration)

---

## Installation

Install the package via Composer:

```bash
composer require kngbwsr/laravel-agent-optimizer
```

Laravel's auto-discovery will register the service provider automatically.

### One-step setup

Run the install command to publish the config file and add the `post-update-cmd` entry to `composer.json` in one step:

```bash
php artisan optimizeAgents:install
```

This does two things:
1. Publishes `config/agent-optimizer.php` to your application (skipped if already published)
2. Adds `@php artisan optimizeAgents:optimize --ansi` to the `post-update-cmd` array in `composer.json`

To remove the `post-update-cmd` entry later:

```bash
php artisan optimizeAgents:install --remove
```

> **Note:** Auto-discovery means the package is fully functional before you run `optimizeAgents:install`. The command is a convenience for initial project setup only — it combines the config publish and the `composer.json` edit into a single step.

---

## Output folder

All generated files are written to a dedicated `agent-optimized/` folder inside your configured `base_path`:

```
{base_path}/
└── agent-optimized/
    ├── _rule_my-section.md
    └── _rule_another-section/
        ├── _subsection_part-one.md
        └── _subsection_part-two.md
```

On each `optimizeAgents:optimize` run a **smart preflight** step runs before any extraction. If the agent files contain sections already marked as optimized the corresponding rule files are preserved; only orphaned or stale files are removed. When agent files are regenerated fresh (e.g. after `boost:update`) no markers are present and the entire `agent-optimized/` folder is wiped and recreated.

---

## Configuration

After running `optimizeAgents:install` (or `php artisan vendor:publish --tag=agent-optimizer-config`), `config/agent-optimizer.php` exposes the following options:

### Paths & file discovery

```php
// Directory (relative to base_path()) used as the parent for the dedicated
// agent-optimized/ output folder. All extracted files are written to
// {base_path}/agent-optimized/.
'base_path' => '.ai/rules',

// Directories scanned for *.md agent directive files (relative to base_path()).
// Files must contain at least one === title === section boundary.
'source_directories' => ['/'],
```

### Generated file naming

```php
// Prefix for top-level rule file names. Default produces _rule_my-section.md.
// Also used as the subdirectory prefix for nested strategies (_rule_my-section/).
'rule_file_prefix' => '_rule_',

// Prefix for subsection file names inside a rule subdirectory.
// Default produces _subsection_my-header.md.
'subsection_file_prefix' => '_subsection_',

// Extension for all generated rule files (without leading dot).
// Use 'mdc' for Cursor IDE, 'txt' if your tooling requires it.
'rule_file_extension' => 'md',
```

### Extraction behaviour

```php
// Section titles that are NEVER extracted (case-sensitive, exact match).
'exceptions' => [],

// Minimum body line count a section must exceed to be eligible for extraction.
// The --min-lines CLI flag overrides this at runtime.
'line_threshold' => 5,

// Global extraction strategy. Available values:
//   full_section       — entire section body → single flat rule file
//   nested_full        — full section + sub-headers → master file + per-subsection files
//   nested_subsections — subsections extracted individually; main header stays in-place
//   nested_split       — like nested_subsections but also extracts the main body
//   auto               — full_section when no sub-headers, auto_nested_strategy otherwise
'extraction_strategy' => 'nested_subsections',

// When strategy is 'auto' and sub-headers are detected, this concrete nested
// strategy is applied. Valid: 'nested_full', 'nested_subsections', 'nested_split'.
'auto_nested_strategy' => 'nested_full',

// Minimum line count for a sub-header to be extracted in a nested strategy.
'subsection_line_threshold' => 3,

// Per-section strategy overrides. Key = raw section title, value = strategy string.
'section_overrides' => [
    // 'filament/filament rules' => 'nested_full',
    // 'laravel/core rules'      => 'full_section',
],
```

### Reference pretext labels

Controls the label inserted before every rule file path in placeholder lines.

The special token `<title>` may be used anywhere in a label string and is replaced at runtime with the actual section or sub-section title (the text between the `=== ... ===` markers, without the equals signs). For example, `'**RULES for <title>:**'` becomes `**RULES for My Section:**` in the output file.

```php
'reference_pretext' => [

    // Fallback labels used when no strategy-specific override is set.
    // 'section'     — top-level === title === replacement lines.
    // 'sub_section' — inline Markdown sub-header replacement lines.
    'defaults' => [
        'section'     => '**RULES for <title>:**',
        'sub_section' => '**RULES:**',
    ],

    // Per-strategy overrides. Set a key to null to inherit from defaults.
    // Supply an array to override 'section' and/or 'sub_section' individually
    // (a null value for an individual key still falls back to the default).
    'strategies' => [
        'full_section'       => null,
        'nested_full'        => [
            'section'     => null,                   // use defaults.section
            'sub_section' => '**LOAD DIRECTIVE:**',
        ],
        'nested_subsections' => [
            'section'     => null,                   // use defaults.section
            'sub_section' => '**LOAD DIRECTIVE:**',
        ],
        'nested_split' => [
            'section'     => '**Rules Directory:**',
            'sub_section' => '**LOAD DIRECTIVE:**',
        ],
        'auto'               => null,
    ],
],
```

Example — embedding the title and using custom labels per strategy:

```php
'reference_pretext' => [
    'defaults' => [
        'section'     => '**For user requests which reference <title> load:**',
        'sub_section' => '**RULES:**',
    ],
    'strategies' => [
        'nested_subsections' => [
            'section'     => null,                   // use defaults.section
            'sub_section' => '**LOAD DIRECTIVE:**',
        ],
        'nested_split' => [
            'section'     => '**Rules Directory for <title>:**',
            'sub_section' => '**LOAD DIRECTIVE:**',
        ],
    ],
],
```

### Header notes

Controls the Markdown note prepended to agent directive files and generated rule files when sections are first extracted.

```php
// Prepended once to each source agent directive file (e.g. AGENTS.md, CLAUDE.md) the
// first time any of its sections are extracted. Tells the LLM that some section content
// has been moved to separate directive files and should be loaded on demand.
//
// null  = use the built-in default (a Markdown blockquote).
// string = raw Markdown; formatting is entirely your own.
'agent_file_header' => null,

// Prepended to every generated top-level rule file (_rule_*.md). Not added to
// subsection files (_subsection_*.md) — those are leaf nodes in the directive chain.
//
// null  = use the built-in default (a Markdown blockquote).
// string = raw Markdown; formatting is entirely your own.
'rule_file_header' => null,
```

> **Note:** if you change either of these values after files have already been optimized, run `php artisan optimizeAgents:reset` first so the old header is removed before the new one is written.

### Laravel Boost integration

```php
// When true, optimizeAgents:optimize runs automatically after any command listed
// in boost_trigger_commands via a CommandFinished event listener.
'auto_run_after_boost' => true,

// Artisan commands that trigger the automatic optimizeAgents:optimize re-run.
// Add custom wrappers around standard Boost commands here if needed.
'boost_trigger_commands' => [
    'boost:update',
    'boost:install',
],

// XML-like tag name that Laravel Boost wraps its generated content block with.
// Change only if you use a custom Boost fork with a different tag name.
'boost_wrapper_tag' => 'laravel-boost-guidelines',
```

---

## Usage

### Basic run

```bash
php artisan optimizeAgents:optimize
```

Scans all configured `source_directories` for agent directive Markdown files, extracts qualifying sections to `{base_path}/agent-optimized/`, and replaces each extracted block with a configurable reference placeholder.

### Preview without writing files

```bash
php artisan optimizeAgents:optimize --dry-run
```

Reports every section that *would* be extracted without modifying any file.

### Override the root directory

```bash
php artisan optimizeAgents:optimize --root=/path/to/project
```

Useful when running the command outside the project root.

### Override the minimum line threshold

```bash
php artisan optimizeAgents:optimize --min-lines=10
```

Overrides `line_threshold` from config for this run only.

### Combined example

```bash
php artisan optimizeAgents:optimize --min-lines=8 --dry-run
```

---

## Reset

```bash
php artisan optimizeAgents:reset
```

Performs a clean reset of the optimizer's output:

1. Deletes the entire `agent-optimized/` folder and all files within it
2. Runs the first configured `boost_trigger_commands` entry (default: `boost:update`) so Boost regenerates the original agent directive files
3. **Does not** re-run `optimizeAgents:optimize` afterwards, even if `auto_run_after_boost` is `true`

Use reset when:

- You want to return agent directive files to their unoptimized state
- You have changed structural config options (e.g. `base_path`, `rule_file_prefix`) and need a clean slate before re-running
- You are debugging the optimizer's output

---

## How it works

1. **Preflight:** the command scans agent files for `<!-- agent-optimized -->` markers. Rule files for already-extracted sections are preserved; orphaned files are deleted. When no markers exist (e.g. after a fresh `boost:update`) the entire `agent-optimized/` folder is wiped and recreated.
2. The command scans each configured directory for `*.md` files that contain at least one `=== title ===` section boundary.
3. Each section is parsed and checked against the configured `exceptions` list and `line_threshold`. Sections that already carry the `<!-- agent-optimized -->` marker are skipped.
4. The configured extraction strategy (global or per-section override) determines how the section is extracted:
   - A rule file is written to `{base_path}/agent-optimized/` using the configured `rule_file_prefix` and `rule_file_extension`.
   - The original section body is replaced with a reference placeholder using the configured pretext label and the file path.
   - The `agent_file_header` note is prepended to the source agent directive file (once, on first extraction).
   - The `rule_file_header` note is prepended to each top-level `_rule_*.md` file (not to `_subsection_*.md` files).
5. If the source file was modified (or needs a header added) it is written back to disk.

### Extraction strategies

| Strategy | Behaviour |
|---|---|
| `full_section` | Entire section body → single flat rule file. One placeholder replaces the whole block. |
| `nested_full` | Full section extracted to a master file; each qualifying sub-header gets its own file in a `rule_file_prefix + slug/` subdirectory. One placeholder at the extraction site. |
| `nested_subsections` | Qualifying sub-headers extracted individually into a subdirectory. The main header and its direct body stay in the source file; each sub-header is replaced with an inline reference. |
| `nested_split` | Like `nested_subsections` but the main section body is also extracted to its own root-level rule file. Only the header title and sub-header references remain in-place. |
| `auto` | No sub-headers detected → `full_section`. Sub-headers detected → strategy from `auto_nested_strategy` (default `nested_full`). |

### Boost integration detail

The `auto_run_after_boost` listener fires on the `CommandFinished` event after any command listed in `boost_trigger_commands`. This keeps extracted rule files in sync whenever Boost regenerates your agent directive files from Artisan.

The `post-update-cmd` entry added by `optimizeAgents:install` handles the case where `composer update` itself triggers a Boost update cycle.

`optimizeAgents:reset` suppresses the `auto_run_after_boost` listener for the boost run it triggers, so the reset leaves files in a clean unoptimized state rather than immediately re-optimizing.

---

## License

MIT

