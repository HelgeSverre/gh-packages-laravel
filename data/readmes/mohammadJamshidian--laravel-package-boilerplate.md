# Example Package

package description

## Features

- ✨ **Feature 1**: Describe your main feature here
- 🚀 **Feature 2**: Describe another key feature
- 🔧 **Feature 3**: Add more features as needed
- 📦 **Laravel 11/12 Compatible**: Built for Laravel 11.x and 12.x

## Requirements

- PHP 8.2 or higher
- Laravel 11.x or 12.x
- Composer

## Installation

You can install the package via composer:

```bash
composer require teleminergmbh/example-package
```

The package will automatically register its service provider thanks to Laravel's package discovery.

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag="example-package-config"
```

This will create a `config/example-package.php` file where you can customize the package settings.

## Usage

### Basic Usage

```php
use Teleminergmbh\ExamplePackage\ExamplePackage;

// Resolve from container
$service = app(ExamplePackage::class);

// Example call
$result = $service->ping();
```

### Advanced Usage

```php
use Teleminergmbh\ExamplePackage\ExamplePackage;

config()->set('example-package.base_url', 'https://api.example.com');

$service = app(ExamplePackage::class);
$result = $service->ping();
```

### Service Container Integration

```php
// The package is automatically registered in the service container
app(ExamplePackage::class)->ping();
```

## API Reference

### ExamplePackage

#### Constructor

```php
public function __construct(\Teleminergmbh\ExamplePackage\Contracts\ExamplePackageClientInterface $client)
```

Creates a new ExamplePackage instance.

**Parameters:**
- `$client`: An implementation of `ExamplePackageClientInterface`

#### Methods

##### `ping()`

```php
public function ping(): array
```

Performs a sample `/ping` request using the configured HTTP client.

**Returns:** `array` - Decoded JSON response

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable/disable the package |
| `base_url` | string | `https://example.com` | Base URL for the 3rd-party API |
| `api_key` | string | `null` | Your API key |
| `timeout` | integer | `30` | Request timeout in seconds |
| `cache.enabled` | boolean | `true` | Enable caching |
| `cache.ttl` | integer | `3600` | Cache time-to-live in seconds |

## Development

See `DEVELOPMENT.md` for:

- local setup
- quality gates (Pint/PHPStan/tests)
- how freelancers should implement integrations in this boilerplate

## Testing

Run the tests with:

```bash
composer test
```

Run tests with coverage:

```bash
composer test-coverage
```

## Code Quality

The package includes several code quality tools:

```bash
# Run static analysis
composer analyse

# Format code
composer format

# Check code formatting
composer format-test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Author Name](https://github.com/teleminergmbh)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

This package was generated using the [Laravel Package Generator](https://stacktoast.com/tools/laravel-package-boilerplate-generator/).

