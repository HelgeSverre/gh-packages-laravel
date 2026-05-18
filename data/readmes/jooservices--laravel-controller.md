# JOOservices Laravel Controller

[![codecov](https://codecov.io/gh/jooservices/laravel-controller/branch/develop/graph/badge.svg)](https://codecov.io/gh/jooservices/laravel-controller)
[![CI](https://github.com/jooservices/laravel-controller/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/jooservices/laravel-controller/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/jooservices/laravel-controller/badge)](https://securityscorecards.dev/viewer/?uri=github.com/jooservices/laravel-controller)
[![PHP Version](https://img.shields.io/badge/PHP-8.5%2B-blue.svg)](https://www.php.net/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Packagist Version](https://img.shields.io/packagist/v/jooservices/laravel-controller)](https://packagist.org/packages/jooservices/laravel-controller)

**JOOservices Laravel Controller** is a Laravel API controller foundation for standardized JSON response envelopes, resource-friendly helpers, pagination metadata, status endpoints, trace IDs, and formatter-based response customization.

Composer package: `jooservices/laravel-controller`

Current release: `1.3.0`

## Features

- base API controller helpers for success, error, validation, status, and no-content responses
- Laravel `JsonResource` and `ResourceCollection` friendly response helpers
- standardized response envelope with configurable keys
- length-aware, cursor, and offset pagination helpers
- trace ID support through a configurable request header
- optional status endpoint with version, environment, maintenance, and health-check metadata
- custom `ResponseFormatter` contract for teams that need a different top-level JSON shape
- optional exception response helper for common Laravel exceptions
- read-only `php artisan laravel-controller:doctor` diagnostics

## Installation

```bash
composer require jooservices/laravel-controller
```

## Publish Config

```bash
php artisan vendor:publish --provider="JOOservices\LaravelController\Providers\LaravelControllerServiceProvider" --tag="config"
```

Optional translations:

```bash
php artisan vendor:publish --provider="JOOservices\LaravelController\Providers\LaravelControllerServiceProvider" --tag="laravel-controller-lang"
```

## Quick Start

Use the package at the controller boundary. Keep request validation, business logic, and persistence in your application layers:

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\UserIndexRequest;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use JOOservices\LaravelController\Http\Controllers\BaseApiController;

final class UserController extends BaseApiController
{
    public function index(UserIndexRequest $request, UserService $users): JsonResponse
    {
        return $this->respondWithPagination(
            paginator: $users->paginate($request->validated()),
            resourceClass: UserResource::class,
            message: 'Users retrieved successfully.',
        );
    }
}
```

## Standard Architecture Usage

Recommended flow:

```text
Request -> Controller -> FormRequest -> Service -> Repository -> Model
Model / entity / data object -> Laravel Resource -> API response envelope -> JsonResponse
```

Laravel Resource remains the presentation transformer. JOOservices Laravel Controller wraps the transformed payload in the API response envelope.

## Response Envelope Example

```json
{
  "success": true,
  "code": 200,
  "message": "Users retrieved successfully.",
  "data": [],
  "meta": {},
  "errors": null,
  "trace_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Resource Example

```php
public function show(UserShowRequest $request, UserService $users): JsonResponse
{
    return $this->respondWithResource(
        resource: new UserResource($users->findForDisplay($request->validated('id'))),
        message: 'User retrieved successfully.',
    );
}
```

DTOs, `Arrayable`, `JsonSerializable`, and objects with `toArray()` may be accepted as input data, but they do not replace Laravel Resources as the presentation layer.

## Pagination Example

```php
public function index(UserIndexRequest $request, UserService $users): JsonResponse
{
    return $this->respondWithPagination(
        paginator: $users->paginate($request->validated()),
        resourceClass: UserResource::class,
        message: 'Users retrieved successfully.',
    );
}
```

## Error Response Example

```php
public function archive(UserArchiveRequest $request, UserService $users): JsonResponse
{
    if (! $users->canArchive($request->validated('id'))) {
        return $this->respondWithError(
            message: 'User cannot be archived.',
            code: 409,
            errors: ['user' => ['The user has active dependencies.']],
        );
    }

    $users->archive($request->validated('id'));

    return $this->respondNoContent();
}
```

## Status Endpoint

When package routes are enabled, the status endpoint is available under the configured prefix:

```bash
GET /api/v1/status
```

Run diagnostics from the CLI:

```bash
php artisan laravel-controller:doctor
php artisan laravel-controller:doctor --json
```

## Custom Formatter

```php
<?php

namespace App\Support;

use JOOservices\LaravelController\Contracts\ResponseFormatter;

final class ApiResponseFormatter implements ResponseFormatter
{
    public function format(array $response): array
    {
        return [
            'ok' => $response['success'],
            'status' => $response['code'],
            'message' => $response['message'],
            'payload' => $response['data'],
            'error' => $response['errors'],
            'request_id' => $response['trace_id'],
        ];
    }
}
```

## Configuration

Important config keys:

- `response_formatter`
- `keys`
- `trace_id.header`
- `use_translations`
- `envelope_204`
- `success_codes`
- `validation.message`
- `routes.enabled`
- `routes.prefix`
- `routes.auto_map_host_routes`
- `status`
- `pagination_links`
- `item_links`

## Current Limitations And Non-Goals

This package is:

- base API controller helpers
- standard response envelope helpers
- pagination and status response helpers
- formatter contract
- optional exception response helper

This package is not:

- CRUD generator
- service layer replacement
- repository replacement
- validation package
- full application exception-handler framework
- JSON:API full implementation
- business logic layer

## Documentation

- [Documentation Hub](docs/README.md)
- [Architecture](docs/00-architecture/01-project-overview.md)
- [Getting Started](docs/01-getting-started/quick-start.md)
- [User Guide](docs/02-user-guide/response-envelopes.md)
- [Examples](docs/03-examples/basic-controller.md)
- [Development](docs/04-development/setup.md)
- [Release Process](docs/04-development/release-process.md)
- [Maintenance](docs/05-maintenance/01-risks-legacy-and-gaps.md)

## AI Contributor Support

- [AGENTS.md](AGENTS.md)
- [CLAUDE.md](CLAUDE.md)
- [AI Skills Map](ai/skills/README.md)
- [AI Skills Usage Guide](ai/skills/USAGE.md)

## Development Commands

```bash
composer lint
composer lint:all
composer lint:fix
composer test
composer test:coverage
composer check
composer ci
```

## Security And Contributing

Use GitHub issues for bug reports and security coordination unless a dedicated security policy is added.

## License

JOOservices Laravel Controller is open-sourced software licensed under the MIT license.
