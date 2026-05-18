# Housekeeping

A Laravel package that brings GitHub issue management into the terminal, reducing context switching and keeping developers in flow.

## Requirements

- PHP 8.2+
- Laravel 10 or 11

## Installation

```bash
composer require gordon-fcl/housekeeping
```

The service provider is auto-discovered. No manual registration needed.

## Configuration

Add your GitHub personal access token to `.env`:

```
GITHUB_TOKEN=ghp_your_token_here
```

The token needs `repo` scope to read issues and labels.

Optionally publish the config to customise the default label and base branch:

```bash
php artisan vendor:publish --tag=housekeeping-config
```

This creates `config/housekeeping.php` where you can set:

- `HOUSEKEEPING_LABEL` - default issue label to filter by (default: `housekeeping`)
- `HOUSEKEEPING_BASE_BRANCH` - branch to create working branches from (default: `staging`)

## Usage

```bash
php artisan housekeeping:list
```

This will:

1. Fetch your GitHub repositories
2. Prompt you to select one
3. Fetch labels from that repository
4. Prompt you to select a label (or pass `--tag=bug` to skip)
5. Display matching issues in a table

### Options

```bash
php artisan housekeeping:list --tag=bug
```

Skip the label selection prompt by passing a label directly.

## Development

```bash
git clone https://github.com/gordon-fcl/housekeeping.git
cd housekeeping
composer install
```

Run the test suite:

```bash
composer test
```

Individual checks:

```bash
composer lint          # Pint
composer test:types    # PHPStan
composer test:unit     # Pest
composer refacto       # Rector
```

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on the fork-and-PR workflow.

## Licence

MIT. See [LICENSE.md](LICENSE.md).
