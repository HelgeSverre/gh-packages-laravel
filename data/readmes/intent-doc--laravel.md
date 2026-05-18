# IntentDoc for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/intent-doc/laravel.svg?style=flat-square)](https://packagist.org/packages/intent-doc/laravel)
[![Total Downloads](https://img.shields.io/packagist/dt/intent-doc/laravel.svg?style=flat-square)](https://packagist.org/packages/intent-doc/laravel)
[![License](https://img.shields.io/packagist/l/intent-doc/laravel.svg?style=flat-square)](https://packagist.org/packages/intent-doc/laravel)

**Developer-first API documentation that lives where your code lives.**

IntentDoc allows you to describe the intent behind your API endpoints directly where they are defined. By attaching human-readable metadata (purpose, rules, and context) to routes using a fluent, expressive API, IntentDoc generates a clear, structured representation of what each endpoint is meant to do.

## Why IntentDoc?

- **Intent-Driven**: Document the "why", not just the "what"
- **Clean Syntax**: Fluent API that feels natural in Laravel
- **Zero Pollution**: No heavy annotations or controller clutter
- **Multiple Formats**: Generate JSON, Markdown, or HTML documentation
- **Framework-Friendly**: Built specifically for Laravel's routing system
- **Lightweight**: Minimal dependencies, maximum clarity

## Installation

Install via Composer:

```bash
composer require intent-doc/laravel
```

The service provider will be automatically registered.

## Usage

### Basic Example

In your route files (`routes/api.php` or `routes/web.php`):

```php
use Illuminate\Support\Facades\Route;

Route::post('/payments', [PaymentController::class, 'store'])
    ->intent('Process payment')
    ->description('Processes a customer payment transaction')
    ->rules([
        'Authenticated user required',
        'User must have valid payment method',
        'Amount must be positive',
    ]);
```

### Advanced Example

```php
Route::get('/users/{id}', [UserController::class, 'show'])
    ->intent('Get user details')
    ->description('Retrieves detailed information about a specific user')
    ->rules([
        'Authenticated user required',
        'Admin or user must own the resource',
    ])
    ->request([
        'headers' => [
            'Authorization' => 'Bearer {token}',
        ],
    ])
    ->response([
        'data' => [
            'id' => 1,
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ],
    ]);
```

### Available Methods

- `->intent(string $name)` - The name/intent of the endpoint (required)
- `->description(string $description)` - Detailed description of what the endpoint does
- `->rules(array $rules)` - Business rules and constraints
- `->request(array $request)` - Example request structure
- `->response(array $response)` - Example response structure

## Generating Documentation

IntentDoc provides an Artisan command to generate documentation in multiple formats:

### Quick Start - Interactive Documentation

The easiest way to generate documentation is to run the command without any options:

```bash
php artisan intent-doc:generate
```

This will automatically:

1. Create an `intent-doc/` folder in your project root
2. Generate `intent-doc/api-doc.json` with all your documented endpoints
3. Generate `intent-doc/index.html` - a beautiful, interactive documentation viewer

Simply open `intent-doc/index.html` in your browser to view your API documentation!

**Features of the interactive viewer:**

- Search endpoints by name, path, or method
- Expandable sections for each endpoint
- Color-coded HTTP methods (GET, POST, PUT, DELETE, etc.)
- Clean, modern interface with syntax highlighting
- No server required - works offline

![IntentDoc Interactive Viewer](docs/images/simple_example.png)

### Custom Output (Advanced)

You can also generate documentation in specific formats to custom locations:

#### JSON Format

```bash
php artisan intent-doc:generate --format=json --output=docs/custom-api.json
```

#### Markdown Format

```bash
php artisan intent-doc:generate --format=markdown --output=docs/API.md
```

#### HTML Format

```bash
php artisan intent-doc:generate --format=html --output=docs/api.html
```

### Example Output Structure

The generated `api-doc.json` follows this structure:

```json
{
  "version": "1.0",
  "generated_at": "2024-01-15T10:30:00Z",
  "endpoints": [
    {
      "name": "Process payment",
      "description": "Processes a customer payment transaction",
      "method": "POST",
      "endpoint": "/api/payments",
      "rules": [
        "Authenticated user required",
        "User must have valid payment method"
      ],
      "request": {
        "amount": 99.99,
        "currency": "USD"
      },
      "response": {
        "id": 12345,
        "status": "completed"
      }
    }
  ]
}
```

### Version Control

You can choose to commit the `intent-doc/` folder to your repository or generate it on-demand:

**Option 1: Commit documentation (Recommended)**

- Keep `intent-doc/` in version control
- Useful for sharing documentation with the team
- Documentation is always available without regeneration

**Option 2: Generate on-demand**

- Add `intent-doc/` to your `.gitignore`
- Generate documentation when needed
- Keeps repository lighter

```gitignore
# Add to .gitignore if you prefer to generate on-demand
/intent-doc/
```

## Real-World Example

```php
// routes/api.php

Route::prefix('api/v1')->group(function () {

    Route::post('/auth/login', [AuthController::class, 'login'])
        ->intent('User authentication')
        ->description('Authenticates a user and returns an access token')
        ->rules([
            'Rate limited to 5 attempts per minute',
            'Credentials must be valid',
        ])
        ->request([
            'email' => 'user@example.com',
            'password' => 'password123',
        ])
        ->response([
            'token' => 'eyJhbGciOiJIUzI1...',
            'expires_at' => '2024-01-15T12:00:00Z',
        ]);

    Route::middleware('auth:sanctum')->group(function () {

        Route::get('/orders', [OrderController::class, 'index'])
            ->intent('List user orders')
            ->description('Retrieves a paginated list of orders for the authenticated user')
            ->rules([
                'Authenticated user required',
                'Returns only orders owned by the user',
            ])
            ->response([
                'data' => [
                    ['id' => 1, 'total' => 99.99, 'status' => 'completed'],
                    ['id' => 2, 'total' => 149.99, 'status' => 'pending'],
                ],
                'meta' => [
                    'current_page' => 1,
                    'total' => 45,
                ],
            ]);

        Route::post('/orders', [OrderController::class, 'store'])
            ->intent('Create new order')
            ->description('Creates a new order for the authenticated user')
            ->rules([
                'Authenticated user required',
                'Cart must not be empty',
                'All items must be in stock',
                'Payment method must be valid',
            ])
            ->request([
                'items' => [
                    ['product_id' => 1, 'quantity' => 2],
                    ['product_id' => 5, 'quantity' => 1],
                ],
                'shipping_address_id' => 3,
                'payment_method_id' => 2,
            ])
            ->response([
                'data' => [
                    'id' => 123,
                    'total' => 199.99,
                    'status' => 'pending',
                ],
            ]);
    });
});
```

## Benefits

### For Developers

- **Documentation lives with code**: No more outdated separate docs
- **Quick onboarding**: New developers understand intent immediately
- **Self-documenting**: The code explains business logic
- **Type-safe**: Fluent API with IDE autocomplete

### For Teams

- **Alignment**: Business intent is explicit in technical implementation
- **Maintainability**: Easy to understand what endpoints should do
- **Communication**: Bridge between technical and business teams
- **Evolution**: See how APIs should change over time

### For Projects

- **API Discovery**: Automatically generate documentation
- **Contract Testing**: Use intent definitions for testing
- **API Governance**: Ensure endpoints meet business requirements
- **Integration**: Share documentation with frontend teams

## Philosophy

IntentDoc follows these principles:

1. **Intent Over Implementation**: Document _why_ before _how_
2. **Proximity**: Documentation should live next to the code it describes
3. **Clarity**: Simple, readable, human-friendly syntax
4. **Flexibility**: Multiple output formats for different needs
5. **Zero Overhead**: Minimal performance impact

## Requirements

- PHP 8.2, 8.3, or 8.4
- Laravel 10.x, 11.x, or 12.x

## Testing

Run the tests with:

```bash
composer test
```

Generate coverage report:

```bash
composer test-coverage
```

### Local Testing with Docker

You can test all PHP/Laravel version combinations locally using Docker without relying on GitHub Actions:

```bash
# Run all tests across multiple PHP and Laravel versions
./run-tests-docker.sh
```

This will:

- Test PHP 8.2, 8.3, and 8.4
- Test Laravel 10.x, 11.x, and 12.x
- Generate a compatibility matrix in `COMPATIBILITY.md`
- Save detailed logs in `test-results/`

The script uses official PHP Docker images and provides colored output showing which combinations passed (✓), failed (✗), or are not supported (⊘).

**Requirements:**

- Docker installed and running
- Internet connection (first run only)

**View results:**

```bash
# See the compatibility matrix
cat COMPATIBILITY.md

# Check specific test logs
cat test-results/php-8.2-laravel-10.*.log
```

## Development

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Changelog

Please see [CHANGELOG.md](CHANGELOG.md) for recent changes.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/intent-doc/laravel/issues) on GitHub.

---

Made with ❤️ for Laravel developers who believe good documentation starts with clear intent.
# laravel
