# Laravel MCP Pusher

Laravel package to push lessons learned and project implementation details from your projects to a central MCP server via HTTP API. Works with the [Lessons Learned MCP Server](https://github.com/ashwinmram/mcp-server) so AI agents (e.g. Cursor) can query your knowledge base.

- [GitHub](https://github.com/ashwinmram/mcp-pusher)
- [Packagist](https://packagist.org/packages/ashwinmram/mcp-pusher)

**Important**: This package pushes to a **remote MCP server** via HTTP API. It does **not** interact with your local database or include Lesson model classes.

## Requirements

- PHP 8.2+
- Laravel 12.x or 13.x
- An MCP server that accepts pushes (e.g. [Lessons Learned MCP Server](https://github.com/ashwinmram/mcp-server))

## Installation

```bash
composer require ashwinmram/mcp-pusher
```

## Configuration

Add MCP configuration to your project's `config/services.php`:

```php
'mcp' => [
    'server_url' => env('MCP_SERVER_URL'),
    'api_token' => env('MCP_API_TOKEN'),
],
```

Add environment variables to your `.env`:

```
MCP_SERVER_URL=https://your-mcp-server.com
MCP_API_TOKEN=your-api-token-here
```

## Usage

**Workflow:** At the end of each coding session, populate the lessons learned and project details files (`docs/lessons-learned.md`, `docs/lessons_learned.json`, `docs/project-details.md`, `docs/project_details.json`) as required. You need content in at least one source file per command before you can push. **Source files are truncated (emptied) after each successful push** — this prevents duplicate pushes. Regenerate the files at the end of the next session and push again.

### Recommended AI prompts

#### Generic lessons

Use this prompt to generate session-agnostic lessons:

```text
Let's update lessons-learned.md and lessons_learned.json files and with any lessons learned during this session and save it to the docs folder.    Please ensure the json title and summary are AI friendly so that an AI Agent will easily be able to discern whether or not to use the skill.
```

#### Project-specific lessons

Use this prompt to capture repository/project implementation details:

```text
Let's update two files in the docs folder: project-details.md and project_details.json with any project specific lessons learned during this session.  Please ensure the json title and summary are AI friendly so that an AI Agent will easily be able to discern whether or not to use the skill.
```

### Push lessons

```bash
php artisan mcp:push-lessons --source=your-project
```

| Option | Description |
|--------|-------------|
| `--source=` | Source project name (default: directory name). Must match the `project` query param when connecting to Project Details MCP. |
| `--lessons-learned=` | Path to `lessons-learned.md` (default: `docs/lessons-learned.md`) |
| `--lessons-json=` | Path to `lessons_learned.json` (default: `docs/lessons_learned.json`) |

### Push project details

```bash
php artisan mcp:push-project-details --source=your-project
```

| Option | Description |
|--------|-------------|
| `--source=` | Source project name (must match `?project=` in Project Details MCP URL) |
| `--project-details-file=` | Path to markdown file (default: `docs/project-details.md`) |
| `--project-details-json-dir=` | Directory for `project_details.json` or `project_details_*.json` (default: `docs`) |
| `--no-truncate` | Do not empty source files after a successful push |

## File Layout

By default, the package reads from these locations:

```
your-project/
└── docs/
    ├── lessons-learned.md      ← Markdown lessons (optional)
    ├── lessons_learned.json    ← JSON array of lessons (optional)
    ├── project-details.md      ← Markdown project details (optional)
    └── project_details.json    ← JSON array of project details (optional)
```

**Lessons** are pushed to `/api/lessons`; **project details** to `/api/project-details`. You need at least one source file with content for each command.

## How It Works

### Lessons

- **`lessons-learned.md`**: Categorized as `guidelines` with tags: `laravel`, `lessons-learned`, `guidelines`, `best-practices`, `markdown`
- **`lessons_learned.json`**: JSON array; each object can have `title`, `summary`, `category`, `subcategory`, `type`, `tags`, `content`, `metadata`. Category and tags from the object are used; content keywords add more tags (e.g. "Pest" → `pest`).

### Project details

- **`project-details.md`**: Same H2/H3/H4 structure as lessons-learned.md
- **`project_details.json`** or **`project_details_*.json`**: JSON array with same field order as lessons (`title`, `summary`, `category`, `subcategory`, `type`, `tags`, `content`, `metadata`). Use `type` `"project_detail"` or `"ai_output"`.

### API

Normalized data is POSTed to the remote MCP server. The server handles storage, deduplication (by content hash), and validation.

## MCP Server

This package pushes to an MCP server that exposes `/api/lessons` and `/api/project-details`. For a ready-made server, see the [Lessons Learned MCP Server](https://github.com/ashwinmram/mcp-server).

## License

MIT
