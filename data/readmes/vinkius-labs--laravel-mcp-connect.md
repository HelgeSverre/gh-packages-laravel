# Laravel MCP Connect

**Laravel SDK for the [Vinkius](https://vinkius.com) MCP Catalog — discover, activate, and execute 3,400+ governed MCP servers from any Laravel application.**

[![Latest Version on Packagist](https://img.shields.io/packagist/v/vinkius/laravel-mcp-connect.svg)](https://packagist.org/packages/vinkius/laravel-mcp-connect)
[![License](https://img.shields.io/packagist/l/vinkius/laravel-mcp-connect.svg)](https://packagist.org/packages/vinkius/laravel-mcp-connect)

---

## What is this?

`laravel-mcp-connect` is the official Laravel SDK for the Vinkius MCP Catalog API. It enables any Laravel application to discover, inspect, activate, and execute tools from 3,400+ MCP servers — with zero local tool implementations.

**Instead of building tool integrations yourself**, your Laravel app delegates tool execution to the Vinkius runtime, which handles authentication, DLP, FinOps, and SSRF protection on every call.

```php
use Vinkius\McpConnect\Facades\Mcp;

// Search the marketplace
$results = Mcp::search('github issues');

// Inspect a tool's schema
$schema = Mcp::inspect('github__create_issue');

// Execute a tool
$result = Mcp::execute('github__create_issue', [
    'owner' => 'my-org',
    'repo'  => 'my-repo',
    'title' => 'Bug: Login broken on mobile',
]);

echo $result->text(); // "Issue #42 created successfully"
```

---

## Getting Started

### 1. Explore available MCP servers

Visit [vinkius.com](https://vinkius.com) to browse the full registry of 3,400+ MCP servers — AI, DevOps, data, payments, and more. Each listing shows available tools, prompt examples, and pricing.

### 2. Create your account

Sign up at [cloud.vinkius.com](https://cloud.vinkius.com) to activate MCP servers, manage subscriptions, and generate API tokens for your projects.

### 3. Install the package

```bash
composer require vinkius/laravel-mcp-connect
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=mcp-connect-config
```

### 4. Configure your token

Generate a catalog token at [cloud.vinkius.com/settings/catalog-tokens](https://cloud.vinkius.com/settings/catalog-tokens) and add it to your `.env`:

```env
VINKIUS_CATALOG_TOKEN=vk_catalog_your_token_here
```

> **Note:** The catalog token is only required for authenticated operations (tool execution, activation, analytics). Marketplace browsing — listings, categories, featured sections, and search — works without a token.

---

## Usage

### Discovery

```php
use Vinkius\McpConnect\Facades\Mcp;

// List all activated servers and their tools (requires token)
$servers = Mcp::tools();

foreach ($servers as $server) {
    echo "{$server->title}: " . implode(', ', $server->toolNames());
}

// Search the catalog (requires token)
$results = Mcp::search('stripe payments');

// Browse catalog categories (requires token)
$categories = Mcp::browse();
```

### Marketplace (Public — No Token Required)

```php
// Browse marketplace categories
$categories = Mcp::categories();

foreach ($categories as $cat) {
    echo "{$cat->label}: {$cat->listingCount} apps";
}

// Fetch paginated listings with filters
$response = Mcp::listings(['category' => 'ai', 'page' => 2, 'sort' => 'popular']);
foreach ($response['data'] as $listing) {
    echo "{$listing->title} — {$listing->priceFormatted()}";
}

// Get full detail for a single listing
$listing = Mcp::listing('github-mcp');
echo "{$listing->title}: " . implode(', ', $listing->toolNames());

// Featured sections for discovery carousels
$featured = Mcp::featured();

// Search marketplace listings
$results = Mcp::searchListings('payment processing');
```

### Inspection

```php
// Always inspect before executing — know the exact parameters
$schema = Mcp::inspect('github__create_issue');

echo $schema->description;
// "Create a new issue in a GitHub repository"

print_r($schema->inputSchema);
// ["type" => "object", "properties" => [...], "required" => [...]]
```

### Execution

```php
$result = Mcp::execute('github__create_issue', [
    'owner' => 'my-org',
    'repo'  => 'my-repo',
    'title' => 'Automated issue from Laravel',
    'body'  => 'Created via MCP Connect.',
]);

if ($result->successful()) {
    $data = $result->json(); // Parsed JSON from first content block
} else {
    $error = $result->text(); // Error message
}
```

### Lifecycle Management

```php
// Activate a marketplace listing
$activation = Mcp::activate('listing-uuid');

if ($activation->requiresCheckout()) {
    // Redirect user to checkout for paid listings
    return redirect($activation->checkoutUrl);
}

// Deactivate a subscription
Mcp::deactivate('subscription-uuid');
```

### Analytics

```php
$analytics = Mcp::analytics();

foreach ($analytics as $sub) {
    echo "{$sub->title}: {$sub->requestCount} requests ({$sub->status})";
}
```

### Health Check

```php
if (Mcp::ping()) {
    echo 'Vinkius API is reachable!';
}
```

---

## Artisan Commands

| Command | Description |
|---|---|
| `php artisan mcp:tools` | List all activated servers and tools |
| `php artisan mcp:search "query"` | Search the marketplace |
| `php artisan mcp:inspect tool_name` | View full tool schema |
| `php artisan mcp:execute tool_name --arg="key:value"` | Execute a tool |
| `php artisan mcp:browse` | Browse marketplace categories |
| `php artisan mcp:analytics` | View subscription usage stats |

---

## Events

The package dispatches events on every operation for observability:

| Event | When |
|---|---|
| `ToolExecuted` | After successful tool execution |
| `ToolExecutionFailed` | On execution error |
| `ServerActivated` | After server activation |
| `ServerDeactivated` | After server deactivation |

```php
use Vinkius\McpConnect\Events\ToolExecuted;

Event::listen(ToolExecuted::class, function (ToolExecuted $event) {
    Log::info("MCP tool executed: {$event->toolName}", [
        'duration_ms' => $event->durationMs,
        'is_error'    => $event->result->isError,
    ]);
});
```

---

## Error Handling

All exceptions extend `McpException` for easy catching:

```php
use Vinkius\McpConnect\Exceptions\McpException;
use Vinkius\McpConnect\Exceptions\AuthenticationException;
use Vinkius\McpConnect\Exceptions\ExecutionException;

try {
    $result = Mcp::execute('tool__name', $args);
} catch (AuthenticationException $e) {
    // Token invalid/expired — non-retryable
} catch (ExecutionException $e) {
    // Tool returned an error
    $errorDetail = $e->getResult()->text();
} catch (McpException $e) {
    // Any MCP-related error
}
```

---

## Configuration

```php
// config/mcp-connect.php

return [
    'base_url'        => env('VINKIUS_API_URL', 'https://api.vinkius.com'),
    'token'           => env('VINKIUS_CATALOG_TOKEN'),  // optional for marketplace
    'timeout'         => 30,
    'connect_timeout' => 10,
    'retry'           => ['times' => 2, 'sleep' => 500],
    'cache'           => [
        'enabled' => true,
        'store'   => null,  // null = default cache store
        'prefix'  => 'mcp_connect',
        'ttl'     => [
            // Catalog (authenticated)
            'tools'     => 60,
            'schema'    => 300,
            'search'    => 120,
            'browse'    => 600,
            'analytics' => 60,
            // Marketplace (public)
            'listings'  => 120,
            'featured'  => 600,
        ],
    ],
];
```

---

## Architecture

```
McpConnect (Service)
├── McpClient (HTTP Transport)
│   └── Vinkius Catalog API
├── Cache (Read-through, per-endpoint TTLs)
├── DTOs (Readonly, immutable response mapping)
├── Events (Fire-and-forget observability)
└── Exceptions (Typed, structured error handling)
```

- **Zero local tool implementations** — all execution routes through the Vinkius runtime
- **Type-safe** — every response is a `readonly` DTO with IDE autocompletion
- **Cacheable** — granular cache with per-endpoint TTLs
- **Observable** — events on every operation
- **Testable** — bind `McpConnectInterface` to a mock in tests

---

## Requirements

- PHP 8.2+
- Laravel 11 or 12

## License

Apache 2.0 — see [LICENSE](LICENSE.md)

---

<p align="center">
  Built by <a href="https://vinkius.com">Vinkius</a>
</p>
