# LaraPrunable

[![Latest Version on Packagist](https://img.shields.io/packagist/v/devsarfo/laraprunable.svg?style=flat-square)](https://packagist.org/packages/devsarfo/laraprunable)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/devsarfo/laraprunable/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/devsarfo/laraprunable/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/devsarfo/laraprunable.svg?style=flat-square)](https://packagist.org/packages/devsarfo/laraprunable)


A Laravel package that extends the built-in pruning functionality to support models using the `SoftDeletes` trait. This package allows you to safely prune (soft delete) records based on custom criteria without purging them from the database.

## Features

- **SoftDeletes Support**: Prune soft-deleted models without remove database records
- **Mass Pruning**: Efficiently prune large datasets in chunks
- **Laravel Integration**: Seamlessly extends Laravel's existing `php artisan model:prune` command

## Installation

You can install the package via composer using the following command. The command will install the latest applicable version of the package.

```bash
composer require devsarfo/laraprunable
```

The package will automatically register its service provider and extend Laravel's prune command.

## Requirements

- Laravel 8.0 or higher

## Usage

### 1. Add the Trait to Your Model

Choose the appropriate trait based on your pruning needs:

#### For Individual Pruning (SoftPrunable)

Use this trait when you need to prune models one by one, which is useful for models with complex pruning logic or when you need to perform additional operations during pruning.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use DevSarfo\LaraPrunable\Traits\SoftPrunable;

class Post extends Model
{
    use SoftDeletes, SoftPrunable;

    /**
     * Get the prunable model query.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function prunable()
    {
        return static::where('deleted_at', '<=', now()->subDays(30));
    }

    /**
     * Prepare the model for pruning.
     *
     * @return void
     */
    protected function pruning()
    {
        // Perform any cleanup before pruning
        // e.g., delete related files, log activity, etc.
    }
}
```

#### For Mass Pruning (SoftMassPrunable)

Use this trait when you need to prune large numbers of records efficiently. This performs bulk deletions in chunks.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use DevSarfo\LaraPrunable\Traits\SoftMassPrunable;

class Comment extends Model
{
    use SoftDeletes, SoftMassPrunable;

    /**
     * Get the prunable model query.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function prunable()
    {
        return static::where('deleted_at', '<=', now()->subDays(7));
    }
}
```

### 2. Run the Prune Command

Use Laravel's built-in prune command. The package automatically extends it to recognize models using the `SoftPrunable` and `SoftMassPrunable` traits.

```bash
php artisan model:prune
```

You can also specify a specific model:

```bash
php artisan model:prune --model=App\\Models\\Post
```

### 3. Scheduling Pruning

You can schedule pruning to run automatically using Laravel's task scheduler:
You are free to choose the appropriate interval at which this command should be run:

```php
// In routes/console.php
use Illuminate\Support\Facades\Schedule;

Schedule::command('model:prune')->daily();
```
OR
```php
// In app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    $schedule->command('model:prune')->daily();
}
```

## Configuration

No additional configuration is required. The package automatically:

- Registers the service provider
- Extends Laravel's `PruneCommand`
- Recognizes models using the provided traits

## Testing

```bash
composer test
```

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security

If you discover any security related issues, please email devsarfo@gmail.com instead of using the issue tracker.

## Credits

- [Bernard Sarfo Twumasi](https://github.com/devsarfo)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.