# Laravel n8n MCP Server

A Laravel package that exposes the full [n8n](https://n8n.io) REST API and webhook capabilities as [Model Context Protocol (MCP)](https://modelcontextprotocol.io) tools — making every n8n action available to AI agents and coding assistants.

Built on top of [`kayedspace/laravel-n8n`](https://github.com/kayedspace/laravel-n8n) for the HTTP client layer and [`laravel/mcp`](https://github.com/laravel/mcp) for the MCP server infrastructure.

---

## Requirements

- PHP 8.2+
- Laravel 11 or 12
- `laravel/mcp` >= 0.1.0
- `kayedspace/laravel-n8n` ^1.1

---

## Installation

### 1. Require the package

```bash
composer require rajurayhan/laravel-n8n-mcp-server
```

This also installs `kayedspace/laravel-n8n` automatically as a dependency. The service provider is auto-discovered by Laravel — no manual registration needed.

### 2. Publish the config

```bash
php artisan vendor:publish --tag=n8n-mcp-config
```

### 4. Set environment variables

```env
# n8n API connection (required)
N8N_API_BASE_URL=https://your-n8n-instance.com/api/v1
N8N_API_KEY=your_api_key

# n8n webhook base URL (required for TriggerWebhook tool)
N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.com/webhook
N8N_WEBHOOK_USERNAME=your_webhook_username   # optional basic auth
N8N_WEBHOOK_PASSWORD=your_webhook_password   # optional basic auth

# MCP route (optional, defaults shown)
N8N_MCP_ROUTE_PREFIX=mcp/n8n
```

The MCP server will be available at `https://yourapp.com/mcp/n8n`.

---

## Configuration

```php
// config/n8n-mcp.php
return [
    'route_prefix'     => env('N8N_MCP_ROUTE_PREFIX', 'mcp/n8n'),
    'route_middleware' => ['web'],  // add 'auth:sanctum' to restrict access
];
```

---

## Tools Reference

**54 tools** are registered across 11 resource groups. Every public method on every client class in `kayedspace/laravel-n8n` has a corresponding MCP tool.

### Workflow (14 tools)

| Tool | Method | Description |
|---|---|---|
| `list-n8n-workflows` | GET | List workflows with optional filters (active, name, tags, projectId) |
| `get-n8n-workflow` | GET | Get full workflow definition by ID |
| `search-n8n-workflows-by-webhook` | GET | Find workflows containing a Webhook node matching a path |
| `create-n8n-workflow` | POST | Create a new workflow |
| `update-n8n-workflow` | PUT | Replace a workflow definition |
| `delete-n8n-workflow` | DELETE | Delete a single workflow |
| `delete-many-n8n-workflows` | DELETE | Delete multiple workflows by ID array |
| `activate-n8n-workflow` | POST | Activate a single workflow |
| `activate-many-n8n-workflows` | POST | Activate multiple workflows by ID array |
| `deactivate-n8n-workflow` | POST | Deactivate a single workflow |
| `deactivate-many-n8n-workflows` | POST | Deactivate multiple workflows by ID array |
| `move-n8n-workflow` | PUT | Transfer a workflow to a different project |
| `export-n8n-workflows` | GET | Export workflow definitions as JSON (backup/migration) |
| `import-n8n-workflows` | POST | Import workflow definitions (IDs stripped, creates new) |

### Workflow Tags (2 tools)

| Tool | Method | Description |
|---|---|---|
| `list-n8n-workflow-tags` | GET | List tags on a specific workflow |
| `update-n8n-workflow-tags` | PUT | Replace the full tag set on a workflow |

### Execution (4 tools)

| Tool | Method | Description |
|---|---|---|
| `list-n8n-executions` | GET | List executions with filters (status, workflowId, projectId) |
| `get-n8n-execution` | GET | Get execution details by ID, optionally including node data |
| `wait-for-n8n-execution` | GET | Poll an execution until it completes or times out |
| `delete-n8n-executions` | DELETE | Delete one or more execution records |

### Credential (6 tools)

| Tool | Method | Description |
|---|---|---|
| `list-n8n-credentials` | GET | List stored credentials |
| `get-n8n-credential` | GET | Get a credential by ID |
| `get-n8n-credential-schema` | GET | Get the JSON schema for a credential type (e.g. `slackApi`) |
| `create-n8n-credential` | POST | Create a new credential |
| `delete-n8n-credential` | DELETE | Delete a credential |
| `move-n8n-credential` | PUT | Transfer a credential to a different project |

### User (5 tools)

| Tool | Method | Description |
|---|---|---|
| `list-n8n-users` | GET | List all users |
| `get-n8n-user` | GET | Get a user by ID or email |
| `create-n8n-user` | POST | Invite one or more users |
| `change-n8n-user-role` | PATCH | Change a user's global role |
| `delete-n8n-user` | DELETE | Delete a user |

### Project (7 tools)

| Tool | Method | Description |
|---|---|---|
| `list-n8n-projects` | GET | List all projects |
| `create-n8n-project` | POST | Create a new project |
| `update-n8n-project` | PUT | Rename a project |
| `delete-n8n-project` | DELETE | Delete a project |
| `add-n8n-project-users` | POST | Add users to a project with roles |
| `change-n8n-project-user-role` | PATCH | Change a user's role within a project |
| `remove-n8n-project-user` | DELETE | Remove a user from a project |

### Variable (6 tools)

| Tool | Method | Description |
|---|---|---|
| `list-n8n-variables` | GET | List all environment variables |
| `create-n8n-variable` | POST | Create a single variable |
| `create-many-n8n-variables` | POST | Create multiple variables in one call |
| `update-n8n-variable` | PUT | Update an existing variable |
| `delete-n8n-variable` | DELETE | Delete a single variable |
| `delete-many-n8n-variables` | DELETE | Delete multiple variables by ID array |

### Tag (7 tools)

| Tool | Method | Description |
|---|---|---|
| `list-n8n-tags` | GET | List all tags |
| `get-n8n-tag` | GET | Get a single tag by ID |
| `create-n8n-tag` | POST | Create a single tag |
| `create-many-n8n-tags` | POST | Create multiple tags in one call |
| `update-n8n-tag` | PUT | Rename a tag |
| `delete-n8n-tag` | DELETE | Delete a single tag |
| `delete-many-n8n-tags` | DELETE | Delete multiple tags by ID array |

### Source Control (1 tool)

| Tool | Method | Description |
|---|---|---|
| `pull-n8n-source-control` | POST | Pull from the connected Git source control repository |

### Security / Audit (1 tool)

| Tool | Method | Description |
|---|---|---|
| `generate-n8n-security-audit` | POST | Run a security audit and return diagnostics by category |

### Webhook (1 tool)

| Tool | Method | Description |
|---|---|---|
| `trigger-n8n-webhook` | POST | Trigger an n8n workflow via its webhook path (sync or async) |

---

## Package Structure

```
src/
├── N8nMcpServiceProvider.php       # Auto-discovered, registers the MCP route
├── Server/
│   └── N8nServer.php               # MCP server definition with all 54 tools
└── Tools/
    ├── Workflow/       (14 tools)
    ├── WorkflowTag/    (2 tools)
    ├── Execution/      (4 tools)
    ├── Credential/     (6 tools)
    ├── User/           (5 tools)
    ├── Project/        (7 tools)
    ├── Variable/       (6 tools)
    ├── Tag/            (7 tools)
    ├── SourceControl/  (1 tool)
    ├── Security/       (1 tool)
    └── Webhook/        (1 tool)

config/
└── n8n-mcp.php                     # Route prefix and middleware config
```

---

## How It Works

Each tool:

1. Validates its input parameters using Laravel's `Validator`
2. Calls the corresponding method on the `N8nClient` facade from `kayedspace/laravel-n8n`
3. Catches `N8nException` (and subclasses like `ExecutionFailedException`) and returns `Response::error()`
4. Returns `Response::structured()` on success

The `kayedspace/laravel-n8n` package handles retries, timeouts, caching, event dispatching, and HTTP client configuration via your `.env` settings.

---

## Middleware / Authentication

By default the route uses the `web` middleware group. To restrict MCP access:

```php
// config/n8n-mcp.php
'route_middleware' => ['web', 'auth:sanctum'],
```

---

## License

MIT — see [LICENSE](LICENSE).
