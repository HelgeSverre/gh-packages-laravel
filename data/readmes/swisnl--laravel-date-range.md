# Laravel Date Range
    
[![Latest Version on Packagist](https://img.shields.io/packagist/v/swisnl/laravel-date-range.svg?style=flat-square)](https://packagist.org/packages/swisnl/laravel-date-range)
[![Software License](https://img.shields.io/packagist/l/swisnl/laravel-date-range.svg?style=flat-square)](LICENSE.md)
[![Buy us a tree](https://img.shields.io/badge/Treeware-%F0%9F%8C%B3-lightgreen.svg?style=flat-square)](https://plant.treeware.earth/swisnl/laravel-date-range)
[![Made by SWIS](https://img.shields.io/badge/%F0%9F%9A%80-made%20by%20SWIS-%230737A9.svg?style=flat-square)](https://www.swis.nl)

Laravel integration for the [Date Range PHP library](https://github.com/swisnl/date-range). This package provides a 
simple way to work with date ranges in your Eloquent models.

## Installation

You can install the package via composer:

```bash
composer require swisnl/laravel-date-range
```

## Usage

To use the package, add the `\Swis\DateRange\Eloquent\Concerns\HasDateRange` trait to your Eloquent model.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Swis\DateRange\Eloquent\Concerns\HasDateRange;

class MyModel extends Model
{
    use HasDateRange;

    protected $fillable = [
        'start_date',
        'end_date',
    ];
}
```

Also make sure to add the `start_date` and `end_date` columns to your database table.

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('my_models', function (Blueprint $table) {
            $table->id();
            
            $table->string('name');

            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('my_models');
    }
};
```

The trait provides some methods and scopes to work with date ranges.

```php
// Get the start date as a \Carbon\CarbonImmutable instance or null
$model->getStartDate(); 

// Get the end date as a \Carbon\CarbonImmutable instance or null
$model->getEndDate(); 

// Set the start date
$model->setStartDate('2023-01-01');

// Set the end date
$model->setEndDate('2023-01-31');

// Get the date range as a \Swis\DateRange\DateRange instance
$model->getDateRange();

// Set the date range from a \Swis\DateRange\DateRange instance
$model->setDateRange(DateRange::make('2023-01-01', '2023-01-31'));

// Scope to order the query by start date and end date
\App\Models\MyModel::query()->orderByDateRange()->get();
\App\Models\MyModel::query()->orderByDateRange('desc')->get();

// Scope to filter models that overlap with a given date range
\App\Models\MyModel::query()->whereDateRangeOverlaps(\Swis\DateRange\DateRange::make('2023-01-15', '2023-01-20'))->get();

// Scope to filter models that overlap with a given date range set
\App\Models\MyModel::query->whereDateRangeSetOverlaps(\Swis\DateRange\DateRangeSet::make([
    DateRange::make('2023-01-10', '2023-01-15'),
    DateRange::make('2023-01-20', '2023-01-25'),
)->get();

// Scope to filter models where the date range is active (given date is within
// the date range).
\App\Models\MyModel::query()->whereDateRangeActive()->get(); // default to today
\App\Models\MyModel::query()->whereDateRangeActive('2023-01-15')->get();

// Scope to filter models where the date range is in the past (ends before
// the given date).
\App\Models\MyModel::query()->whereDateRangePast()->get(); // default to today
\App\Models\MyModel::query()->whereDateRangePast('2023-01-15')->get();

// Scope to filter models where the date range is in the future (starts after
// the given date).
\App\Models\MyModel::query()->whereDateRangeFuture()->get(); // default to today
\App\Models\MyModel::query()->whereDateRangeFuture('2023-01-15')->get();

// Order models to first show active models and then inactive models.
\App\Models\MyModel::query()->orderByDateRangeActive()->get(); // default to today
\App\Models\MyModel::query()->orderByDateRangeActive('2023-01-15')->get();
\App\Models\MyModel::query()->orderByDateRangeActive('2023-01-15', 'asc')->get(); // inactive first
```

All `where` scopes also have equivalent `orWhere`, `whereNot` and `orWhereNot` scopes.

```php
// Equivalent queries
\App\Models\MyModel::query()->whereNotDateRangeActive()->get();
\App\Models\MyModel::query()->whereDateRangePast()->orWhereDateRangeFuture()->get();
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](https://github.com/swisnl/laravel-date-range/blob/main/CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/swisnl/laravel-date-range/blob/main/CONTRIBUTING.md) and [CODE_OF_CONDUCT](https://github.com/swisnl/laravel-date-range/blob/main/CODE_OF_CONDUCT.md) for details.

## Security

If you discover any security related issues, please email security@swis.nl instead of using the issue tracker.

## Credits

- [Rolf van de Krol](https://github.com/rolfvandekrol)
- [All Contributors](https://github.com/swisnl/laravel-date-range/contributors)

## License

The MIT License (MIT). Please see [License File](https://github.com/swisnl/laravel-date-range/blob/main/LICENSE.md) for more information.

This package is [Treeware](https://treeware.earth). If you use it in production, then we ask that you
[**buy the world a tree**](https://plant.treeware.earth/swisnl/laravel-date-range) to thank us for our work. By
contributing to the Treeware forest you’ll be creating employment for local families and restoring wildlife habitats.

## SWIS ❤️ Open Source

[SWIS](https://www.swis.nl) is a web agency from Leiden, the Netherlands. We love working with open source software.
