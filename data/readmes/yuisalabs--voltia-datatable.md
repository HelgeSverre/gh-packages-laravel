# Voltia DataTable

[![Latest Version on Packagist](https://img.shields.io/packagist/v/yuisalabs/voltia-datatable.svg?style=flat-square)](https://packagist.org/packages/yuisalabs/voltia-datatable)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/yuisalabs/voltia-datatable/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/yuisalabs/voltia-datatable/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/yuisalabs/voltia-datatable.svg?style=flat-square)](https://packagist.org/packages/yuisalabs/voltia-datatable)

Modern, elegant DataTable package for Laravel with Inertia.js support. Built with clean syntax, fully customizable, and production-ready.

## ✨ Features

- 🚀 **Easy to use** - Simple, fluent API for defining tables
- 🔍 **Full-text search** - Search across multiple columns
- 🔄 **Sorting** - Sort by any column with direction control
- 📊 **Filters** - Multiple filter types (Select, Text, Boolean, DateRange)
- 📄 **Pagination** - Built-in pagination with customizable per-page options
- 🎯 **Type-safe** - Full PHP 8.3+ type hints
- 🔗 **Eager loading** - Automatic relationship eager loading
- ⚡ **Performance** - Optimized queries for large datasets
- 🎨 **Inertia.js ready** - Perfect for Vue/React frontends

## 📦 Installation

Install the package via composer:

```bash
composer require yuisalabs/voltia-datatable
```

Publish the config file:

```bash
php artisan vendor:publish --tag="voltia-datatable-config"
```

## 🚀 Quick Start

### 1. Generate a DataTable Class

```bash
php artisan make:datatable UserTable --model=User
```

This creates `app/Tables/UserTable.php`:

```php
<?php

namespace App\Tables;

use Illuminate\Database\Eloquent\Builder;
use App\Models\User;
use Yuisalabs\VoltiaDatatable\Table;
use Yuisalabs\VoltiaDatatable\Column;
use Yuisalabs\VoltiaDatatable\Filters\SelectFilter;
use Yuisalabs\VoltiaDatatable\Filters\DateRangeFilter;

class UserTable extends Table
{
    public function query(): Builder
    {
        return User::query();
    }

    public function columns(): array
    {
        return [
            Column::make('id', 'ID')
                ->sortable(),
            
            Column::make('name', 'Name')
                ->sortable()
                ->searchable(),
            
            Column::make('email', 'Email')
                ->sortable()
                ->searchable(),
            
            Column::make('status', 'Status')
                ->sortable()
                ->format(fn ($row, $value) => ucfirst($value)),
            
            Column::make('created_at', 'Created At')
                ->sortable()
                ->format(fn ($row, $value) => $value?->format('Y-m-d H:i:s')),
        ];
    }

    protected function filters(): array
    {
        return [
            'status' => new SelectFilter('status', [
                'active' => 'Active',
                'inactive' => 'Inactive',
                'pending' => 'Pending',
            ]),
            'created_at' => new DateRangeFilter('created_at'),
        ];
    }
}
```

### 2. Use in Controller

```php
<?php

namespace App\Http\Controllers;

use App\Tables\UserTable;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(UserTable $datatable)
    {
        return Inertia::render('Users/Index', [
            'datatable' => $datatable->make(),
        ]);
    }
}
```

### 3. Frontend (Vue/React Example)

The datatable returns a structured response:

```javascript
{
  rows: [...],
  columns: [...],
  meta: {
    page: 1,
    perPage: 15,
    total: 100,
    from: 1,
    to: 15
  },
  sort: {
    sortBy: 'name',
    sortDirection: 'asc'
  },
  search: 'john',
  filters: {...}
}
```

## 📖 Usage

### Column Definition

```php
Column::make('key', 'Label')
    ->sortable()          // Enable sorting
    ->searchable()        // Enable searching
    ->hidden()            // Hide column
    ->align('center')     // Alignment: left, center, right
    ->minWidth(150)       // Minimum width in pixels
    ->format(fn ($row, $value) => ...) // Custom formatting
```

### Working with Relationships

```php
public function columns(): array
{
    return [
        Column::make('user.name', 'User Name')
            ->sortable()
            ->searchable(),
        
        Column::make('user.email', 'Email')
            ->searchable(),
    ];
}
```

The package automatically eager loads the `user` relationship!

### Available Filters

#### SelectFilter
```php
'status' => new SelectFilter('status', [
    'active' => 'Active',
    'inactive' => 'Inactive',
])
```

#### TextFilter
```php
'search' => new TextFilter('column_name')
```

#### BooleanFilter
```php
'is_verified' => new BooleanFilter('is_verified')
```

#### DateRangeFilter
```php
'created_at' => new DateRangeFilter('created_at')
```

### Custom Queries

```php
public function query(): Builder
{
    return User::query()
        ->where('status', 'active')
        ->with('roles');
}
```

### Custom Formatting

```php
Column::make('price', 'Price')
    ->format(fn ($row, $value) => 'Rp ' . number_format($value, 0, ',', '.'))

Column::make('status', 'Status')
    ->format(fn ($row, $value) => match($value) {
        'active' => '✅ Active',
        'inactive' => '❌ Inactive',
        default => '⏸ Pending'
    })
```

## ⚙️ Configuration

Published config file (`config/voltia-datatable.php`):

```php
return [
    'default_per_page' => 15,
    'per_page_options' => [10, 15, 25, 50, 100],
    'max_per_page' => 100,
    'query_string' => true,
    'date_format' => 'Y-m-d',
];
```

## 🧪 Testing

```bash
composer test
```

## 📝 Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## 🤝 Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## 🔒 Security

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## 👥 Credits

- [Ervalsa Dwi Nanda](https://github.com/yuisalabs)
- [All Contributors](../../contributors)

## 📄 License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
