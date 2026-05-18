# record-api-request

A Laravel package for recording API requests via middleware, with a built-in dashboard endpoint for browsing them.

Each request that passes through the middleware is persisted with its timestamp (to millisecond precision), path, status, response time, response length, IP, authenticated user, query string, and user agent. A paginated, sortable listing endpoint is registered at `GET /api-requests`.

## Requirements

- PHP `^8.3`
- Laravel `^11.0 || ^12.0`
- The dashboard endpoint defaults to being protected by [Laravel Sanctum](https://laravel.com/docs/sanctum) with an `access-api-requests` token ability. The middleware stack is configurable — see [Configuring the dashboard endpoint](#configuring-the-dashboard-endpoint) if you use a different auth driver.

## Installation

```bash
composer require mahbubhelal/record-api-request
```

Publish and run the migration:

```bash
php artisan vendor:publish --tag=record-api-request-migrations
php artisan migrate
```

Optionally publish the config file if you want to customise the dashboard route path or middleware stack:

```bash
php artisan vendor:publish --tag=record-api-request-config
```

## Recording requests

Apply the `RecordApiRequest` middleware to the routes you want to track. The middleware records the request during Laravel's `terminate` phase, so it does not add latency to the response.

For example, to track every route in your `api` group, add it to `bootstrap/app.php`:

```php
use Mahbub\RecordApiRequest\Http\Middleware\RecordApiRequest;

->withMiddleware(function (Middleware $middleware) {
    $middleware->api(append: [
        RecordApiRequest::class,
    ]);
})
```

Or attach it to individual routes:

```php
Route::middleware(RecordApiRequest::class)->get('/orders', ...);
```

## Viewing recorded requests

The package registers `GET /api-requests` behind `auth:sanctum` and `ability:access-api-requests` by default. Issue a Sanctum token with that ability to the users who should be allowed to view the dashboard:

```php
$token = $user->createToken('dashboard', ['access-api-requests']);
```

### Configuring the dashboard endpoint

The middleware stack and route path are driven by `config/record-api-request.php`:

```php
return [
    'route' => [
        'path' => 'api-requests',
        'middleware' => [
            'api',
            'auth:sanctum',
            'ability:access-api-requests',
        ],
    ],
];
```

Replace `middleware` with whatever stack fits your app (e.g. `['web', 'auth']` for a session-authenticated dashboard, or a custom gate middleware) and set `path` if you want to mount the endpoint somewhere other than `/api-requests`.

### Query parameters

| Parameter | Description |
| --- | --- |
| `sort` | Sort field. Prefix with `-` for descending. Allowed: `time`, `status`, `responseTime`, `responseLength`. Defaults to `-time`. |
| `perPage` | Page size. Defaults to `15`. |
| `page` | Page number. Defaults to `1`. |

### Response shape

```json
{
    "data": {
        "amountPerPage": 15,
        "page": 1,
        "totalAmount": 120,
        "totalPages": 8,
        "requests": [
            {
                "time": "2026-04-09 14:23:11.482",
                "status": 200,
                "responeTime": "42ms",
                "responseLength": "1.2kB",
                "ip": "203.0.113.7",
                "user": "Ada Lovelace (ada@example.com)",
                "url": "https://example.test/api/orders?status=active",
                "userAgent": "Mozilla/5.0 ..."
            }
        ]
    }
}
```

## Development

The package ships with a Docker-based dev environment. Common commands:

```bash
./dc buildup          # build and start the containers
./dc pest             # run the test suite
./dc pest --coverage  # run tests with coverage
./dc phpstan          # run static analysis
./dc pint             # run the formatter
./dc rector           # run automated refactors
```

## License

The MIT License (MIT). See [LICENSE](LICENSE).
