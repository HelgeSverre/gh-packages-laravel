# Laravel Agent

[![Latest Version on Packagist](https://img.shields.io/packagist/v/atldays/laravel-agent.svg?logo=packagist&style=for-the-badge)](https://packagist.org/packages/atldays/laravel-agent)
[![Total Downloads](https://img.shields.io/packagist/dt/atldays/laravel-agent.svg?style=for-the-badge&color=blue)](https://packagist.org/packages/atldays/laravel-agent/stats)
[![CI](https://img.shields.io/github/actions/workflow/status/atldays/laravel-agent/ci.yml?style=for-the-badge&label=CI)](https://github.com/atldays/laravel-agent/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE.md)

`atldays/laravel-agent` is a Laravel package for parsing user-agent strings into clean, typed objects.

It gives you a comfortable Laravel-first API for working with:

- browsers
- operating systems
- devices
- bots
- request user-agent strings

Under the hood, the package uses [`matomo/device-detector`](https://github.com/matomo-org/device-detector), while exposing a clean developer experience through Laravel service container bindings, a request macro, facades, model helpers, and typed DTOs powered by `spatie/laravel-data`.

## Features

- Laravel auto-discovery support
- `request()->agent()` request macro
- `Agent` facade for the current request agent
- `AgentManager` facade for on-demand detection
- dependency injection support via `AgentContract`
- container binding for `AgentContract`
- typed DTO objects for browser, OS, device, bot, and producer data
- Eloquent cast for persisted user-agent strings
- model trait for convenient access to parsed agents
- bot-blocking middleware alias
- test coverage for real user-agent fixtures and framework integration

## Requirements

- PHP `^8.2`
- Laravel `^11.0|^12.0|^13.0`

## Installation

```bash
composer require atldays/laravel-agent
```

The package supports Laravel package auto-discovery, so no manual provider registration is required.

## Quick Start

### Request macro

```php
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    $agent = $request->agent();

    return [
        'user_agent' => $agent->userAgent(),
        'hash' => $agent->hash(),
        'browser' => $agent->browser()?->name(),
        'os' => $agent->os()?->name(),
        'device' => $agent->device()?->device(),
        'is_bot' => $agent->isBot(),
    ];
});
```

### Facades

```php
use Atldays\Agent\Facades\Agent;
use Atldays\Agent\Facades\AgentManager;

$currentAgent = AgentManager::request();
$customAgent = AgentManager::detect($userAgent);

$browser = Agent::browser();
$os = Agent::os();
$device = Agent::device();
$bot = Agent::bot();
```

### Dependency injection

```php
use Atldays\Agent\Contracts\AgentContract;

class SomeAction
{
    public function __invoke(AgentContract $agent): array
    {
        return [
            'browser' => $agent->browser()?->name(),
            'device' => $agent->device()?->device(),
            'is_bot' => $agent->isBot(),
        ];
    }
}
```

## Core API

The main parsed object is `Atldays\Agent\Contracts\AgentContract`.

Available methods:

- `userAgent(): string`
- `hash(): string`
- `browser(): ?BrowserContract`
- `os(): ?OsContract`
- `device(): ?DeviceContract`
- `bot(): ?BotContract`
- `isBot(): bool`
- `toArray(): array`

Example:

```php
$agent = request()->agent();

if ($agent->isBot()) {
    // ...
}

$browser = $agent->browser();
$os = $agent->os();
$device = $agent->device();
```

## DTO Objects

The package returns typed DTO objects instead of raw arrays.

### Browser DTO

Returned by:

- `$agent->browser()`

Class:

- `Atldays\Agent\Data\Browser`

Available data methods:

- `name(): string`
- `shortName(): ?string`
- `version(): ?string`
- `family(): ?string`
- `engine(): ?string`
- `engineVersion(): ?string`

Available helper methods:

- `isChrome(): bool`
- `isEdge(): bool`
- `isFirefox(): bool`
- `isOpera(): bool`
- `isSafari(): bool`

Example:

```php
$browser = request()->agent()->browser();

if ($browser?->isEdge()) {
    // ...
}
```

### OS DTO

Returned by:

- `$agent->os()`

Class:

- `Atldays\Agent\Data\Os`

Available data methods:

- `name(): string`
- `shortName(): ?string`
- `version(): ?string`
- `family(): ?string`
- `platform(): ?string`

Available helper methods:

- `isApple(): bool`
- `isAndroid(): bool`
- `isIos(): bool`
- `isLinux(): bool`
- `isMacOs(): bool`
- `isWindows(): bool`

Example:

```php
$os = request()->agent()->os();

if ($os?->isLinux()) {
    // ...
}
```

### Device DTO

Returned by:

- `$agent->device()`

Class:

- `Atldays\Agent\Data\Device`

Available data methods:

- `type(): DeviceType`
- `device(): string`
- `brand(): ?string`
- `model(): ?string`

Available helper methods:

- `isDesktop(): bool`
- `isMobile(): bool`
- `isTablet(): bool`
- `isPhone(): bool`
- `isApple(): bool`
- `isIphone(): bool`

Example:

```php
$device = request()->agent()->device();

if ($device?->isTablet()) {
    // ...
}
```

### Bot DTO

Returned by:

- `$agent->bot()`

Class:

- `Atldays\Agent\Data\Bot`

Available data methods:

- `name(): string`
- `category(): ?string`
- `url(): ?\Atldays\Url\Contracts\Url`
- `producer(): ?ProducerContract`

### Producer DTO

Returned by:

- `$agent->bot()?->producer()`

Class:

- `Atldays\Agent\Data\Producer`

Available data methods:

- `name(): ?string`
- `url(): ?\Atldays\Url\Contracts\Url`

## Manual Detection

If you already have a user-agent string, you can parse it directly:

```php
use Atldays\Agent\Facades\AgentManager;

$agent = AgentManager::detect($userAgent);

$browserName = $agent->browser()?->name();
$isAndroid = $agent->os()?->isAndroid();
$isMobile = $agent->device()?->isMobile();
```

You can also resolve the manager directly:

```php
use Atldays\Agent\AgentManager;

$manager = app(AgentManager::class);

$agent = $manager->detect($userAgent);
```

## Eloquent Integration

### Agent cast

Use `AgentCast` when your model stores a raw `user_agent` string but you want to work with an `AgentContract`.

```php
use Atldays\Agent\Casts\AgentCast;
use Illuminate\Database\Eloquent\Model;

class Visit extends Model
{
    protected function casts(): array
    {
        return [
            'user_agent' => AgentCast::class,
        ];
    }
}
```

Now the attribute will resolve to an `AgentContract`:

```php
$visit->user_agent->browser()?->name();
$visit->user_agent->device()?->isMobile();
```

### `HasAgent` trait

Use the trait when you want a dedicated `agent()` helper on your model.

```php
use Atldays\Agent\Concerns\HasAgent;
use Illuminate\Database\Eloquent\Model;

class Visit extends Model
{
    use HasAgent;
}
```

Example:

```php
$visit->agent()->browser()?->name();
$visit->agent()->os()?->isMacOs();
$visit->agent()->device()?->isPhone();
```

By default the trait reads from the `user_agent` column. You can override that:

```php
protected function getUserAgentColumn(): string
{
    return 'agent_string';
}
```

## Middleware

The package registers the `agent.block-bots` middleware alias.

### Block all bots

```php
Route::middleware('agent.block-bots')->group(function () {
    // ...
});
```

### Allow selected bots

```php
Route::middleware('agent.block-bots:Googlebot,Bingbot')->group(function () {
    // ...
});
```

If a request is detected as a bot and is not allow-listed, the middleware throws a `403 Forbidden` response.

## Testing

Run the test suite:

```bash
composer test
```

Run formatting:

```bash
composer format
composer format:test
```

Run both:

```bash
composer check
```

## Why Laravel Agent

Most user-agent packages stop at “parse a string into an array”.

`laravel-agent` is built to feel native inside a Laravel application:

- typed objects instead of loose arrays
- request-first API for day-to-day usage
- model integration for persisted user agents
- framework-friendly container bindings and facade support
- focused helper methods on DTOs for browser, OS, and device checks

## License

The MIT License (MIT). Please see [LICENSE.md](LICENSE.md) for more information.
