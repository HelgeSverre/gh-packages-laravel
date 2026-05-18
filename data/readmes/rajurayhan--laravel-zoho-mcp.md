# Laravel Zoho MCP

Laravel package that exposes **Zoho REST APIs** to AI clients through the [Model Context Protocol](https://modelcontextprotocol.io), using Laravel’s first-party **[Laravel MCP](https://laravel.com/docs/mcp)** package (`laravel/mcp`) — not a separate low-level MCP SDK.

## Requirements

- **PHP 8.3+**
- **Laravel 13+** (this release aligns with `laravel/mcp` and Illuminate 13 components)
- A Zoho OAuth **client** (client id + secret) in [Zoho API Console](https://api-console.zoho.com/)

`laravel/mcp` is a **direct dependency**; installing this package pulls it in and registers the MCP console commands (for example `mcp:start`).

## Installation

```bash
composer require laravel-zoho/mcp-server
```

The service provider **loads migrations automatically**. Run `php artisan migrate` in your app.

Publish configuration (optional):

```bash
php artisan vendor:publish --tag=zoho-mcp-config
```

## Multi-user OAuth (recommended)

Each Laravel user completes the **Zoho authorization code** flow in the browser. Tokens are stored in `zoho_mcp_oauth_connections` (encrypted). Each user then gets an **MCP access token** (`zmcp_…`) from `POST /zoho-mcp/mcp-access-tokens` to pass as `ZOHO_MCP_ACCESS_TOKEN`.

See `config/zoho-mcp.php` for `ZOHO_OAUTH_CALLBACK_URL`, scopes, route prefix, and middleware.

## Running the MCP server (local / stdio)

This package registers a **local** MCP server handle (default **`zoho`**, overridable with `ZOHO_MCP_LOCAL_HANDLE` / `config('zoho-mcp.mcp_local_handle')`):

```bash
php artisan mcp:start zoho
```

Compatibility wrapper (sets `--token` for this process, then calls `mcp:start`):

```bash
php artisan zoho:mcp --token='zmcp_....'
# or
export ZOHO_MCP_ACCESS_TOKEN='zmcp_....'
php artisan zoho:mcp
```

Legacy single-tenant mode still works when `ZOHO_REFRESH_TOKEN` and client credentials are set and no MCP access token is provided (see `BootstrapZohoCredentials`).

### Cursor example

```json
{
  "mcpServers": {
    "zoho": {
      "command": "php",
      "args": ["/absolute/path/to/your/project/artisan", "mcp:start", "zoho"],
      "cwd": "/absolute/path/to/your/project",
      "env": {
        "ZOHO_MCP_ACCESS_TOKEN": "zmcp_your_personal_token_here"
      }
    }
  }
}
```

You may use `zoho:mcp` instead of `mcp:start zoho` if you prefer the wrapper command.

## MCP tools (Zoho CRM v8)

Tools are `Laravel\Mcp\Server\Tool` classes and return `Laravel\Mcp\Response::json()` (or `Response::error()` for recoverable issues). They map closely to [Zoho CRM V8 APIs](https://www.zoho.com/crm/developer/docs/api/v8/). Grant matching OAuth scopes (defaults in `config/zoho-mcp.php` include modules, users, settings, and org read).

| Tool | Zoho CRM v8 area |
|------|-------------------|
| `zoho_api_request` | Escape hatch: any REST method/path under your API base (other products or undocumented endpoints). |
| `zoho_crm_get_organization` | `GET /org` |
| `zoho_crm_list_modules` | `GET /settings/modules` |
| `zoho_crm_get_module_metadata` | `GET /settings/modules/{module}` |
| `zoho_crm_get_fields` | `GET /settings/fields?module=` |
| `zoho_crm_get_layouts` | `GET /settings/layouts?module=` |
| `zoho_crm_get_related_lists_metadata` | `GET /settings/related_lists?module=` |
| `zoho_crm_list_users` | `GET /users` |
| `zoho_crm_get_user` | `GET /users/{id}` |
| `zoho_crm_list_roles` | `GET /settings/roles` |
| `zoho_crm_get_role` | `GET /settings/roles/{id}` |
| `zoho_crm_list_profiles` | `GET /settings/profiles` |
| `zoho_crm_get_profile` | `GET /settings/profiles/{id}` |
| `zoho_crm_list_territories` | `GET /settings/territories` |
| `zoho_crm_get_territory` | `GET /settings/territories/{id}` |
| `zoho_crm_get_records` | Module list |
| `zoho_crm_get_record` | Single record |
| `zoho_crm_create_records` | `POST` create |
| `zoho_crm_update_records` | `PUT` update |
| `zoho_crm_delete_records` | `DELETE` by ids |
| `zoho_crm_coql_query` | COQL |
| `zoho_crm_search_records` | Criteria search |
| `zoho_crm_get_related_records` | Related list rows |
| `zoho_crm_composite_requests` | `POST /__composite_requests` (≤5 sub-requests) |

Additional OAuth scopes may be required for some calls (for example Zoho documents `ZohoCRM.composite_requests.CUSTOM` for composite). Adjust `ZOHO_OAUTH_SCOPES` when connecting Zoho.

## Security

- MCP access tokens are secrets; rotate via expiry or DB deletion.
- Zoho refresh tokens in the database are encrypted with your app key.

## License

MIT
