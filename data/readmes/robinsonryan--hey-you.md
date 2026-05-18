# HeyYou

A Laravel package.

## Installation

```bash
composer require robinsonryan/hey-you
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=hey-you-config
```

## Usage

TODO: Add usage examples.

## Testing

```bash
composer test
```

## Development

### Code Quality

```bash
# Run all quality checks
composer quality

# Individual commands
composer lint        # Fix code style
composer lint:check  # Check code style
composer analyze     # Run static analysis
composer test        # Run tests
```

### DDEV

```bash
ddev start    # Start development environment
ddev test     # Run tests
ddev quality  # Run all quality checks
```

## License

MIT License. See [LICENSE.md](LICENSE.md) for details.
