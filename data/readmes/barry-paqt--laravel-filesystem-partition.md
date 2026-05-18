# Laravel Filesystem Partitions

[![Code style](https://github.com/barry-paqt/laravel-filesystem-partition/actions/workflows/code-style.yaml/badge.svg)](https://github.com/barry-paqt/laravel-filesystem-partition/actions/workflows/code-style.yaml)
[![Static analysis](https://github.com/barry-paqt/laravel-filesystem-partition/actions/workflows/static-analysis.yaml/badge.svg)](https://github.com/barry-paqt/laravel-filesystem-partition/actions/workflows/static-analysis.yaml)
[![Tests](https://github.com/barry-paqt/laravel-filesystem-partition/actions/workflows/run-tests.yaml/badge.svg)](https://github.com/barry-paqt/laravel-filesystem-partition/actions/workflows/run-tests.yaml)

A lightweight Laravel package that provides a simple decorator for the filesystem, allowing you to create instances of a
storage disk with a default path prefix.

This is useful when you want to logically scope files (e.g., per tenant, per user, per feature, per environment) without
manually prepending paths every time you interact with the disk.

## Install the package

1. Add the repository to your `composer.json`

```shell
composer config repositories.barry-paqt/laravel-filesystem-partition vcs git@github.com:barry-paqt/laravel-filesystem-partition.git
```

2. Require the composer package

```shell
composer require barry-paqt/laravel-filesystem-partition:dev-master
```

The package will auto-register via Laravel package discovery.

## Examples

### Multi-Tenant Example

```php
use Illuminate\Support\Facades\Storage;

$tenantDisk = Storage::disk()->partition("tenants/{$tenant->id}");
$tenantDisk->put('invoices/invoice.pdf', $pdf);
```

All filesystem operations (put, get, delete, exists, files, etc.) are automatically scoped.

### Using the Service Container

```php
use BarryPaqt\FilesystemPartition\FilesystemPartition;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->when(ExampleClass::class)
            ->needs(Filesystem::class)
            ->give(fn () => new FilesystemPartition(Storage::disk(), 'partition/path/example/'));
            // ->give(fn () => Storage::disk()->partition('partition/path/example/')); // Or use the partition macro

    }
}
```

## Tests

You can find all tools in the justfile.

```shell
just analyse       # Run static analysis
just check         # Run all checks
just fix           # Fix code style issues
just list          # List commands
just test          # Run tests
just test-coverage # Run tests with coverage
just validate      # Validate for code style issues
```