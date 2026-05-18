# Laravel Model Inspector MCP

An MCP (Model Context Protocol) server that gives AI coding assistants deep introspection into your Laravel application's Eloquent models, relationships, and database schema.

## What it does

Exposes four tools to any MCP-compatible client (Claude Code, Cursor, VS Code, PhpStorm, etc.):

| Tool | Description |
|------|-------------|
| `eloquent-list-models` | List all Eloquent models with their tables and relationship counts. Auto-discovers models from Composer PSR-4 autoload paths. |
| `eloquent-inspect-model` | Inspect a model's columns, fillable/guarded, casts, relationships, scopes, observers, and policy. |
| `eloquent-get-relationships` | Map relationships for one or more models: types, foreign keys, pivot tables, morph types. |
| `eloquent-get-table-schema` | Get the database schema for a model or table: columns, types, indexes, and foreign keys. |

Models are auto-discovered from all Composer PSR-4 namespaces containing `Models` in the path — your app models and vendor package models are found automatically without configuration.

## Requirements

- PHP 8.2+
- Laravel 11 or 12
- `laravel/mcp` ^0.3.0 or ^0.5.0

## Installation

```bash
composer require skylence/laravel-model-inspector-mcp --dev
```

### Quick setup with the install command

```bash
php artisan model-inspector:install
```

This detects your IDE (Claude Code, Cursor, VS Code, PhpStorm) and configures the MCP server automatically.

### Manual setup

Add to your `.mcp.json` in the project root:

```json
{
    "mcpServers": {
        "laravel-model-inspector-mcp": {
            "command": "php",
            "args": ["artisan", "model-inspector:mcp"]
        }
    }
}
```

If using Laravel Sail:

```json
{
    "mcpServers": {
        "laravel-model-inspector-mcp": {
            "command": "./vendor/bin/sail",
            "args": ["artisan", "model-inspector:mcp"]
        }
    }
}
```

Restart your editor/AI tool to connect to the MCP server.

## Configuration

Publish the config file (optional):

```bash
php artisan vendor:publish --tag=model-inspector-mcp-config
```

```php
// config/model-inspector-mcp.php
return [
    // Disable specific tools
    'tools' => [
        'model-discovery' => true,
        'model-inspector' => true,
        'relationship-map' => true,
        'schema-inspector' => true,
    ],

    // Add paths for models outside standard PSR-4 "Models" directories
    'extra_model_paths' => [
        // 'packages/my-package/src/Entities',
    ],
];
```

## Usage examples

Once connected, your AI assistant can use the tools automatically. You can also prompt it directly:

- *"List all models in this project"* — calls `eloquent-list-models`
- *"Show me the Order model's relationships"* — calls `eloquent-get-relationships`
- *"What columns does the sales_orders table have?"* — calls `eloquent-get-table-schema`
- *"Inspect the Customer model"* — calls `eloquent-inspect-model`

## Security

MCP routes are only registered in `local` and `testing` environments. The MCP server runs over stdio and is not exposed over HTTP.

## License

MIT
