# Integration Core

> Core framework for building integration packages for the [Laravel AI SDK](https://github.com/laravel/ai). Part of the [OpenCompany](https://github.com/OpenCompanyApp) ecosystem.

Provides the contracts, credential abstraction, and auto-discovery registry that all OpenCompany integration packages build on. Think of it as the shared foundation — like n8n's node SDK, but for Laravel AI agents.

## About OpenCompany

[OpenCompany](https://github.com/OpenCompanyApp) is an AI-powered workplace platform where teams deploy and coordinate multiple AI agents alongside human collaborators. It combines team messaging, document collaboration, task management, and intelligent automation in a single workspace — with built-in approval workflows and granular permission controls so organizations can adopt AI agents safely and transparently.

This core package enables OpenCompany's plugin architecture for integrations — each external integration (astronomy, analytics, messaging, etc.) is a separate Composer package that any Laravel app can install independently.

OpenCompany is built with Laravel, Vue 3, and Inertia.js. Learn more at [github.com/OpenCompanyApp](https://github.com/OpenCompanyApp).

## Installation

```console
composer require opencompanyapp/integration-core
```

Laravel auto-discovers the service provider. No manual registration needed.

## What's Included

| Component | Purpose |
|-----------|---------|
| `ToolProvider` interface | Contract every integration package implements — declares tools, metadata, and factory method |
| `CredentialResolver` interface | Abstraction for API keys/config — swap between config files, databases, or vaults |
| `ConfigCredentialResolver` | Default resolver that reads from `config/ai-tools.php` |
| `ToolProviderRegistry` | Singleton registry that collects all tool providers for discovery |
| `IntegrationCoreServiceProvider` | Binds everything with sensible defaults (all overridable) |

## Quick Start: Building an Integration Package

### 1. Implement `ToolProvider`

```php
use Laravel\Ai\Contracts\Tool;
use OpenCompany\IntegrationCore\Contracts\ToolProvider;

class WeatherToolProvider implements ToolProvider
{
    public function appName(): string
    {
        return 'weather';
    }

    public function appMeta(): array
    {
        return [
            'label'       => 'weather, forecasts, temperature',
            'description' => 'Weather data and forecasts',
            'icon'        => 'ph:cloud-sun',
            'logo'        => 'ph:cloud-sun',
        ];
    }

    public function tools(): array
    {
        return [
            'get_weather' => [
                'class'       => GetWeather::class,
                'type'        => 'read',
                'name'        => 'Get Weather',
                'description' => 'Current weather and forecasts for any location.',
                'icon'        => 'ph:cloud-sun',
            ],
        ];
    }

    public function isIntegration(): bool
    {
        return true;  // Can be toggled per agent
    }

    public function createTool(string $class, array $context = []): Tool
    {
        $credentials = app(\OpenCompany\IntegrationCore\Contracts\CredentialResolver::class);

        return new GetWeather(
            apiKey: $credentials->get('weather', 'api_key'),
            units: $context['units'] ?? 'metric',
        );
    }
}
```

### 2. Register in Your Service Provider

```php
use OpenCompany\IntegrationCore\Support\ToolProviderRegistry;

class WeatherServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        if ($this->app->bound(ToolProviderRegistry::class)) {
            $this->app->make(ToolProviderRegistry::class)
                ->register(new WeatherToolProvider());
        }
    }
}
```

### 3. Create Your Tool Class

```php
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Illuminate\Contracts\JsonSchema\JsonSchema;

class GetWeather implements Tool
{
    public function __construct(
        private string $apiKey,
        private string $units = 'metric',
    ) {}

    public function description(): string
    {
        return 'Get current weather and forecasts for any location.';
    }

    public function handle(Request $request): string
    {
        // Your implementation
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'location' => $schema->string()->description('City or coordinates')->required(),
        ];
    }
}
```

## Credential Management

The `CredentialResolver` interface abstracts where API keys come from. Integration packages call `CredentialResolver` to get credentials without knowing or caring about the storage backend.

**In OpenCompany**, credentials are managed through the Integrations UI and stored encrypted in the database. Users never need to touch config files — everything is configured through the admin interface.

**For standalone usage** in other Laravel apps, the default `ConfigCredentialResolver` reads from a config file:

```php
// config/ai-tools.php
return [
    'plausible' => [
        'api_key' => env('PLAUSIBLE_API_KEY'),
        'url'     => env('PLAUSIBLE_URL', 'https://plausible.io'),
    ],
];
```

You can swap the resolver to use any storage backend (database, vault, secrets manager) by binding your own implementation:

```php
$this->app->singleton(
    \OpenCompany\IntegrationCore\Contracts\CredentialResolver::class,
    YourCustomResolver::class
);
```

## Integration Packages

All installed integration packages auto-register via Laravel service provider discovery. The `ToolProviderRegistry` collects them:

```php
$registry = app(ToolProviderRegistry::class);

$registry->all();              // All registered providers
$registry->has('celestial');   // Check if a provider exists
$registry->get('celestial');   // Get a specific provider
```

| Package | Description |
|---------|-------------|
| [ai-tool-celestial](https://github.com/OpenCompanyApp/ai-tool-celestial) | Moon phases, sunrise/sunset, planet positions, eclipses, night sky reports |

## Requirements

- PHP 8.2+
- Laravel 11 or 12
- [Laravel AI SDK](https://github.com/laravel/ai) ^0.1

## License

MIT — see [LICENSE](LICENSE)
