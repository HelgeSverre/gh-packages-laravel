# Artisan Agent Output

Agent-optimized output for Laravel Artisan commands. Detects AI coding agents and replaces verbose, decorated output with clean text or structured JSON.

## The Problem

AI coding agents waste tokens on Artisan's decorative output — ANSI colors, box-drawing tables, progress bars, Unicode symbols. None of this is useful to an LLM.

**Before (444 tokens):**
```
 ┌──────────────────────────────────────────────────────┐
 │                    Application                        │
 ├──────────────────────────────────────────────────────┤
 │ Application Name ····················· Laravel        │
 │ Laravel Version ······················ 13.2.0         │
 │ PHP Version ·························· 8.4.19         │
 │ Environment ·························· local          │
 │ Debug Mode ··························· ENABLED        │
 └──────────────────────────────────────────────────────┘
```

**After (38 tokens):**
```json
{"environment":{"application_name":"Laravel","laravel_version":"13.2.0","php_version":"8.4.19","environment":"local","debug_mode":true}}
```

## Installation

```bash
composer require skylence/laravel-artisan-agent-output
```

Zero config. The package auto-discovers its service provider and activates only when an AI agent is detected (Claude Code, Cursor, Devin, Gemini CLI, etc.). Humans see normal output.

## How It Works

### Layer 1: Cleaned Text (all commands)

Strips ANSI colors, box-drawing characters, decorative Unicode, and excess whitespace from all Artisan output. Works with every command automatically.

### Layer 2: Structured JSON (10 core commands)

For commands with registered parsers, the cleaned text is suppressed entirely and replaced with compact structured JSON. Ships with parsers for 10 core Laravel commands.

## Supported Commands

| Command | JSON Output |
|---------|------------|
| `about` | App name, versions, environment, debug, drivers |
| `migrate:status` | Migrations with name, status, batch number |
| `route:list` | Routes with method, URI, name, action, middleware, domain, constraints, exclusions |
| `db:show` | Connection info, tables with sizes |
| `db:table` | Columns with types, indexes, foreign keys |
| `schedule:list` | Scheduled tasks with cron expression, next run time |
| `model:show` | Attributes, relations, casts, events, observers |
| `queue:failed` | Failed jobs with ID, connection, queue, exception |
| `event:list` | Events with registered listeners |
| `config:show` | Configuration key-value pairs |

All other commands get cleaned text output (Layer 1).

## JSON Output Examples

### `php artisan migrate:status`

```json
{
  "total": 96,
  "ran": 96,
  "pending": 0,
  "migrations": [
    {"name": "0001_01_01_000000_create_users_table", "status": "ran", "batch": 1},
    {"name": "0001_01_01_000001_create_cache_table", "status": "ran", "batch": 1}
  ]
}
```

### `php artisan route:list`

```json
{
  "total": 402,
  "routes": [
    {
      "method": "GET|HEAD",
      "uri": "dashboard/team/settings",
      "name": "dashboard.team.settings.index",
      "action": "Closure",
      "middleware": ["web", "LogRequests", "EnsureTeamAccess", "CheckApiToken"]
    },
    {
      "method": "GET|HEAD",
      "uri": "tenant/dashboard",
      "name": "tenant.dashboard",
      "action": "Closure",
      "middleware": ["web"],
      "domain": "{tenant}.example.com"
    },
    {
      "method": "GET|HEAD",
      "uri": "admin/reports/{type}",
      "name": "admin.reports.show",
      "action": "Closure",
      "middleware": ["web"],
      "wheres": {"type": "sales|inventory|finance"}
    },
    {
      "method": "GET|HEAD",
      "uri": "light",
      "name": "light",
      "action": "Closure",
      "middleware": ["web", "LogRequests"],
      "without_middleware": ["CheckApiToken", "EnsureTeamAccess"]
    }
  ]
}
```

Route entries include `domain`, `wheres`, and `without_middleware` only when present.

### `php artisan schedule:list`

```json
{
  "total": 14,
  "tasks": [
    {"command": "backup:run --only-db", "expression": "0 1 * * *", "description": "", "next_run": "2026-04-10 01:00:00"},
    {"command": "exact:refresh-tokens", "expression": "*/5 * * * *", "description": "exact:refresh-tokens", "next_run": "2026-04-09 13:40:00"}
  ]
}
```

### `php artisan about`

```json
{
  "environment": {
    "application_name": "Laravel",
    "laravel_version": "13.2.0",
    "php_version": "8.4.19",
    "environment": "local",
    "debug_mode": true,
    "url": "myapp.test",
    "timezone": "Europe/Brussels",
    "locale": "en"
  },
  "cache": {"config": false, "events": false, "routes": false, "views": false},
  "drivers": {"broadcasting": "log", "cache": "redis", "database": "pgsql", "queue": "redis", "session": "redis"}
}
```

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=artisan-agent-output-config
```

```php
return [
    // Set to false to disable JSON parsers (cleaned text only for all commands)
    'json' => true,

    // Commands to exclude from JSON parsing (will still get cleaned text)
    'exclude' => [],
];
```

## Registering Custom Parsers

Third-party packages can register their own JSON parsers:

```php
use Skylence\ArtisanAgentOutput\Facades\AgentOutput;

// In your service provider's boot() method:
AgentOutput::register('horizon:status', HorizonStatusParser::class);
```

Implement the `CommandParser` interface:

```php
use Illuminate\Contracts\Foundation\Application;
use Skylence\ArtisanAgentOutput\Contracts\CommandParser;

class HorizonStatusParser implements CommandParser
{
    public function parse(Application $app): array
    {
        $horizon = $app->make('horizon');

        return [
            'status' => $horizon->status(),
            'processes' => $horizon->processCount(),
        ];
    }
}
```

Parsers should query Laravel services directly from the container rather than parsing text output.

## Kill Switch

Set the `AGENT_OUTPUT_DISABLE` environment variable to bypass all processing:

```bash
AGENT_OUTPUT_DISABLE=1 php artisan about
```

## How It Complements Other Tools

| Tool | What it does | How it relates |
|------|-------------|----------------|
| **[PAO](https://github.com/nunomaduro/pao)** | Optimizes PHPUnit/Pest/PHPStan output for agents | PAO handles test runners, this package handles Artisan |
| **[Laravel Boost](https://github.com/laravel/boost)** | MCP server helping agents discover commands | Boost helps agents know *what to run*, this cleans *what comes back* |

## Requirements

- PHP 8.3+
- Laravel 12 or 13

## License

MIT
