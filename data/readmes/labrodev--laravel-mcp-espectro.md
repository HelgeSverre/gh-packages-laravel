# laravel-mcp-espectro

A Laravel package that connects your project to the **Espectro** MCP server — giving AI assistants (Cursor, Claude, etc.) access to 159 colors and 348 color combinations from Sanzo Wada's *Dictionary of Color Combinations*.

This package does **not** run an MCP server itself. It is a connector that configures your project to talk to the hosted MCP at `https://espectro.dev/mcp/espectro`.

## Requirements

- PHP 8.2+
- Laravel 11+

## Installation

```bash
composer require labrodev/laravel-mcp-espectro
```

Then run:

```bash
php artisan espectro:install
```

This will:
1. Create a `.mcp.json` file in your project root (Cursor auto-detects this).
2. Print the MCP endpoint URL and connection instructions for Claude Desktop and other clients.

## Usage

### Cursor

After running `espectro:install`, restart Cursor. It will pick up the `.mcp.json` and connect to Espectro automatically.

### Claude Desktop

Add a new MCP server in Claude Desktop settings with URL:

```
https://espectro.dev/mcp/espectro
```

### Any MCP client

Point your MCP client to `https://espectro.dev/mcp/espectro` using the HTTP (streamable) transport.

Rate limit: **15 requests per minute** per IP.

## Available MCP tools

| Tool | Description |
|------|-------------|
| `search-colors` | Search colors by name or hex value |
| `get-color` | Get full details for a color by slug |
| `search-combinations` | Filter combinations by palette size (2, 3, or 4) |
| `get-combination` | Get a combination by ID with full color data |
| `random-combination` | Get a random palette for inspiration |
| `export-combination` | Export a combination as Tailwind config or CSS variables |

## Links

- **Website & docs**: [https://espectro.dev](https://espectro.dev)
- **Usage guide**: [https://espectro.dev/usage](https://espectro.dev/usage)
- **JSON API**: [https://espectro.dev/api/colors](https://espectro.dev/api/colors)

## License

MIT. See [LICENSE](LICENSE) for details.
