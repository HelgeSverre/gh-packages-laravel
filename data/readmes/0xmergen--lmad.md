<div align="center">
  <img src="docs/banner.jpg" alt="LMAD - Laravel MCP API Discovery" width="100%">
</div>

# LMAD - Laravel MCP API Discovery

A Laravel 12 MCP (Model Context Protocol) package that provides AI agents with comprehensive API discovery and analysis capabilities. LMAD enables AI coding assistants to understand your Laravel application's API structure, validation rules, and response schemas.

## Features

- **Route Discovery**: List and filter API routes by path, HTTP method, domain, and vendor exclusion
- **Controller Inspection**: Get detailed controller method information including file paths and line numbers
- **Request Validation Analysis**: Parse FormRequest validation rules, custom error messages, and authorization logic
- **Response Schema Analysis**: Analyze controller return types, JsonResource structures, and Model attributes
- **Complete Endpoint Analysis**: Get comprehensive information about any endpoint in a single call
- **Dynamic Resources**: Access controller and route information via MCP URI templates

## Requirements

- **PHP**: 8.2 or higher
- **Laravel**: 12.x
- **laravel/mcp**: 0.5.x or higher

## Installation

```bash
composer require 0xmergen/lmad
```

The package will automatically register its service provider.

## Configuration

### Publish the Routes File (Optional)

If you want to customize the MCP server registration:

```bash
php artisan vendor:publish --tag=lmad-routes
```

This publishes the MCP routes to `routes/lmad.php`.

### MCP Server Registration

The LMAD MCP server is automatically registered in your application via the package's `routes/ai.php` file:

```php
use Laravel\Mcp\Facades\Mcp;
use Lmad\Mcp\LmadServer;

Mcp::local('lmad', LmadServer::class);
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `list_api_routes` | List all API routes with optional filters for path, method, domain, and vendor routes |
| `get_route_details` | Get detailed information about a specific route including controller, middleware, and file locations |
| `get_request_rules` | Parse FormRequest validation rules, custom error messages, and authorization logic |
| `get_response_schema` | Analyze what an endpoint returns (JsonResource, Model, array, JsonResponse) |
| `analyze_endpoint` | Complete endpoint analysis combining route, controller, request, and response information |

## Available MCP Resources

| Resource | URI Template | Description |
|----------|--------------|-------------|
| `api_routes` | `route://{uri}` | Dynamic access to API routes |
| `controller` | `controller://{class}/{method?}` | Controller and method information |

---

## Claude Code Setup Guide

### Step 1: Verify MCP Server

Start your Laravel development server:

```bash
composer run dev
```

### Step 2: Configure Claude Code

Create or edit your Claude Code MCP configuration file to connect to the LMAD server.

**For local MCP server via stdio:**

Add to your Claude Desktop config (`~/.claude_desktop_config.json` on macOS/Linux):

```json
{
  "mcpServers": {
    "lmad": {
      "command": "php",
      "args": [
        "/path/to/your/lmad/project/artisan",
        "mcp:serve",
        "--server=lmad"
      ],
      "env": {
        "APP_ENV": "local"
      }
    }
  }
}
```

**For HTTP-based MCP server:**

```json
{
  "mcpServers": {
    "lmad": {
      "url": "http://localhost:8000/mcp/lmad"
    }
  }
}
```

### Step 3: Restart Claude Code

Restart Claude Desktop or reload your IDE extension to activate the MCP server.

### Step 4: Verify Connection

Ask Claude Code:

```
List all available MCP tools and resources.
```

You should see LMAD tools like `list_api_routes`, `get_route_details`, etc.

### Example Usage in Claude Code

```
Get all CRM API routes:
Use list_api_routes with path filter "api/crm"

Analyze the companies endpoint:
Use analyze_endpoint for URI "api/crm/companies" with method "GET"

Get validation rules for company creation:
Use get_request_rules for "App\Http\Requests\Crm\Company\StoreRequest"
```

---

## Cline (VS Code) Setup Guide

### Step 1: Install Cline Extension

Install the [Cline extension](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.cline) from the VS Code Marketplace.

### Step 2: Configure MCP Server in Cline

1. Open VS Code Settings
2. Search for "Cline: MCP Servers"
3. Add the LMAD server configuration:

**For stdio connection:**

```json
{
  "lmad": {
    "command": "php",
    "args": [
      "/absolute/path/to/your/lmad/project/artisan",
      "mcp:serve",
      "--server=lmad"
    ],
    "env": {
      "APP_ENV": "local",
      "LARAVEL_ROOT": "/absolute/path/to/your/lmad/project"
    }
  }
}
```

**For HTTP connection:**

```json
{
  "lmad": {
    "url": "http://localhost:8000/mcp/lmad",
    "headers": {
      "Accept": "application/json"
    }
  }
}
```

### Step 3: Start Laravel Server

```bash
cd /path/to/your/lmad/project
composer run dev
```

### Step 4: Reload VS Code

Reload the VS Code window to activate the MCP server connection.

### Step 5: Test the Connection

In Cline chat, ask:

```
What MCP tools are available?
```

You should see LMAD tools listed.

### Example Usage in Cline

```
I need to understand the CRM API. Can you:
1. List all routes under "api/crm"
2. Get details for the companies store endpoint
3. Show me the validation rules for creating a company
```

Cline will use the LMAD MCP tools to gather this information.

---

## Development

### Running Tests

```bash
composer test
```

### Code Formatting

```bash
composer pint
```

### MCP Inspector

Laravel MCP provides an inspector tool for testing MCP servers:

```bash
php artisan mcp:inspector lmad
```

## License

MIT License (MIT). Please see [LICENSE](LICENSE) for more information.

## Author

**0xmergen**

- GitHub: [@0xmergen](https://github.com/0xmergen)
- X: [@0xm3rg3n](https://x.com/0xm3rg3n)

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/0xmergen/lmad).
