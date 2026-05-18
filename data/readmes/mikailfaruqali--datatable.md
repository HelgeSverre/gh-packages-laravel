# Laravel DataTable Package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mikailfaruqali/datatable.svg?style=flat-square)](https://packagist.org/packages/mikailfaruqali/datatable)
[![Total Downloads](https://img.shields.io/packagist/dt/mikailfaruqali/datatable.svg?style=flat-square)](https://packagist.org/packages/mikailfaruqali/datatable)
[![License](https://img.shields.io/packagist/l/mikailfaruqali/datatable.svg?style=flat-square)](https://packagist.org/packages/mikailfaruqali/datatable)

A powerful Laravel package for building server-side DataTables with custom column builders, easy frontend integration, and comprehensive export functionality.

## Features

- 🚀 **Server-side Processing**: Efficient handling of large datasets
- 🎨 **Custom Column Builders**: Flexible column customization and formatting
- 📊 **Export Functionality**: Built-in Excel export with formatting
- 🖨️ **Print Support**: Professional print layouts
- 🔍 **Advanced Filtering**: Column-specific filtering and search
- 📱 **Responsive Design**: Mobile-friendly tables
- 🌐 **Multi-language Support**: Localization ready (English, Arabic, Kurdish)
- 🎛️ **Column Visibility**: User-controlled column hiding/showing
- 📈 **Aggregation Support**: Built-in totals and calculations
- ⚡ **Performance Optimized**: Efficient query building and caching

## Requirements

- PHP >= 7.4
- Laravel >= 5.0
- Maatwebsite/Excel package

## Installation

Install the package via Composer:

```bash
composer require mikailfaruqali/datatable
```

### Publish Assets

Publish the package configuration, views, and language files:

```bash
php artisan vendor:publish --tag=snawbar-datatable-assets
```

### Run Migrations

The package includes migrations for column visibility preferences:

```bash
php artisan migrate
```

## Configuration

After publishing assets, configure your DataTable settings in `config/snawbar-datatable.php`:

```php
return [
    // Session key for text direction (LTR/RTL)
    'local-direction-session-key' => 'direction',
    
    // Default table CSS classes
    'table-style' => 'table table-bordered w-100',
    
    // Font URL (optional)
    'font' => null,
    
    // CSS assets for DataTables
    'datatable-css' => [
        'https://cdn.datatables.net/1.13.4/css/dataTables.bootstrap5.min.css',
        'https://cdn.datatables.net/buttons/2.3.6/css/buttons.bootstrap5.min.css',
    ],
    
    // JavaScript assets for DataTables
    'datatable-js' => [
        'https://code.jquery.com/jquery-3.6.0.min.js',
        'https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js',
        'https://cdn.datatables.net/1.13.4/js/dataTables.bootstrap5.min.js',
        'https://cdn.datatables.net/buttons/2.3.6/js/dataTables.buttons.min.js',
    ],
    
    // Print-specific CSS
    'datatable-print-css' => [
        // Add print-specific stylesheets
    ],
];
```

## Quick Start

### 1. Generate a DataTable Class

Use the Artisan command to generate a new DataTable class:

```bash
php artisan make:datatable UserDataTable
```

This creates a new class in `app/DataTables/UserDataTable.php`.

### 2. Configure Your DataTable

```php
<?php

namespace App\DataTables;

use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Snawbar\DataTable\Components\DataTable;
use Snawbar\DataTable\Services\Column;
use App\Models\User;

class UserDataTable extends DataTable
{
    public function query(Request $request): Builder
    {
        return User::query()
            ->select(['id', 'name', 'email', 'created_at'])
            ->when($request->search['value'], function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            });
    }

    public function columns(): array
    {
        return [
            Column::make('id')->title('ID')->orderable(),
            Column::make('name')->title('Name')->orderable(),
            Column::make('email')->title('Email')->orderable(),
            Column::make('created_at')->title('Created At')->orderable(),
        ];
    }

    public function tableId(): string
    {
        return 'users-table';
    }

    public function setupColumns(): void
    {
        $this->editColumn('created_at', function ($row) {
            return $row->created_at->format('Y-m-d H:i:s');
        });

        $this->addColumn('actions', function ($row) {
            return '<button class="btn btn-sm btn-primary">Edit</button>';
        });
    }

    public function isOrderable(): bool
    {
        return true;
    }

    public function length(): int
    {
        return 25;
    }

    public function exportTitle(): ?string
    {
        return 'Users Export';
    }
}
```

### 3. Use in Controller

```php
<?php

namespace App\Http\Controllers;

use App\DataTables\UserDataTable;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request, UserDataTable $dataTable)
    {
        if ($request->isAjaxDatatable()) {
            return $dataTable->builder()->ajax();
        }

        return view('users.index', [
            'dataTable' => $dataTable->builder()
        ]);
    }
}
```

### 4. Display in Blade View

Add the DataTable CSS and JS assets to your layout:

```blade
{{-- In your layout head --}}
@datatableCss

{{-- Before closing body tag --}}
@datatableJs
```

Display the DataTable in your view:

```blade
{{-- resources/views/users/index.blade.php --}}
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Users</h1>
    
    {!! $dataTable->html() !!}
    {!! $dataTable->tableTotalableHtml() !!}
</div>
@endsection
```

## Advanced Features

### Column Customization

#### Edit Existing Columns

```php
public function setupColumns(): void
{
    // Format currency
    $this->editColumn('price', function ($row) {
        return '$' . number_format($row->price, 2);
    });

    // Format dates
    $this->editColumn('created_at', function ($row) {
        return $row->created_at->format('M d, Y');
    });

    // Conditional formatting
    $this->editColumn('status', function ($row) {
        $class = $row->status === 'active' ? 'success' : 'danger';
        return "<span class='badge bg-{$class}'>{$row->status}</span>";
    });
}
```

#### Add Custom Columns

```php
public function setupColumns(): void
{
    // Add action buttons
    $this->addColumn('actions', function ($row) {
        return view('partials.action-buttons', compact('row'))->render();
    });

    // Add computed values
    $this->addColumn('full_name', function ($row) {
        return "{$row->first_name} {$row->last_name}";
    });
}
```

### Column Types and Options

```php
public function columns(): array
{
    return [
        Column::make('id')
            ->title('ID')
            ->orderable()
            ->className('text-center'),
            
        Column::make('name')
            ->title('Full Name')
            ->orderable()
            ->searchable(),
            
        Column::make('price')
            ->title('Price')
            ->type('number')
            ->orderable(),
            
        Column::make('actions')
            ->title('Actions')
            ->orderable(false)
            ->printable(false)
            ->exportable(false),
    ];
}
```

### Totals and Aggregations

```php
public function totalableColumns(): ?array
{
    return [
        'price' => 'sum',
        'quantity' => 'sum',
        'id' => 'count',
    ];
}
```

### Export Configuration

```php
public function exportTitle(): ?string
{
    return 'Sales Report - ' . now()->format('Y-m-d');
}

// Custom export data processing
protected function prepareExportData(): array
{
    // Custom logic for export data
    return $this->builder->get()->toArray();
}
```

### Filtering and Search

```php
public function query(Request $request): Builder
{
    return Product::query()
        ->select(['id', 'name', 'price', 'category_id'])
        ->with('category')
        ->when($request->input('category'), function ($query, $category) {
            $query->where('category_id', $category);
        })
        ->when($request->search['value'], function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('category', function ($categoryQuery) use ($search) {
                      $categoryQuery->where('name', 'like', "%{$search}%");
                  });
            });
        });
}

public function filterContainer(): ?string
{
    return '#custom-filter-container';
}
```

### Print Customization

```php
public function attachPrintSubitems(object $row): ?Collection
{
    // Add sub-items for detailed print view
    return collect([
        ['label' => 'Order Items', 'value' => $row->items->count()],
        ['label' => 'Total Amount', 'value' => '$' . number_format($row->total, 2)],
    ]);
}
```

### Callbacks and JavaScript Integration

```php
public function callbacks(): ?array
{
    return [
        'initComplete' => 'function() { console.log("Table initialized"); }',
        'drawCallback' => 'function() { 
            $("[data-toggle=tooltip]").tooltip(); 
        }',
        'rowCallback' => 'function(row, data, index) {
            if (data.status === "inactive") {
                $(row).addClass("table-warning");
            }
        }'
    ];
}
```

## Blade Directives

The package provides several helpful Blade directives:

### Asset Loading

```blade
{{-- Load DataTable CSS --}}
@datatableCss

{{-- Load DataTable JavaScript --}}
@datatableJs

{{-- Load print-specific CSS --}}
@datatablePrintCss
```

### Table Spacing

```blade
{{-- Add empty rows for spacing --}}
@datatableRowSpace(3)
```

## Helper Functions

The package includes useful helper functions:

```php
// Process DataTable request
$process = datatableProcess($dataTableInstance);

// Handle asset URLs
$url = assetOrUrl('/css/custom.css'); // Returns asset() or the URL as-is

// Conditional rendering
$html = datatableWhen($condition, '<b>Bold</b>', 'Normal');

// Print HTML safely
datatablePrintHtml($htmlContent);
```

## Request Macro

Check if the current request is a DataTable AJAX request:

```php
if (request()->isAjaxDatatable()) {
    return $dataTable->ajax();
}
```

## Localization

The package supports multiple languages. Publish the language files and customize:

```bash
php artisan vendor:publish --tag=snawbar-datatable-assets
```

Available languages:
- English (`en`)
- Arabic (`ar`)
- Kurdish (`ku`)

## Styling and Theming

### Bootstrap Integration

The package works seamlessly with Bootstrap:

```php
// In config/snawbar-datatable.php
'table-style' => 'table table-striped table-bordered table-hover',
```

### Custom CSS

Add custom styles to your DataTable:

```css
.dataTables_wrapper .dataTables_filter input {
    border-radius: 0.375rem;
    border: 1px solid #ced4da;
}

.dataTables_wrapper .dataTables_length select {
    border-radius: 0.375rem;
    border: 1px solid #ced4da;
}
```

## Performance Optimization

### Database Optimization

```php
public function query(Request $request): Builder
{
    return User::query()
        ->select(['id', 'name', 'email', 'created_at']) // Select only needed columns
        ->with(['role:id,name']) // Eager load relationships
        ->when($request->search['value'], function ($query, $search) {
            // Use indexes for search
            $query->whereRaw('MATCH(name, email) AGAINST(? IN BOOLEAN MODE)', [$search]);
        });
}
```

### Caching

```php
public function query(Request $request): Builder
{
    $cacheKey = "datatable.users." . md5(serialize($request->all()));
    
    return cache()->remember($cacheKey, 300, function () use ($request) {
        return User::query()->select(['id', 'name', 'email', 'created_at']);
    });
}
```

## Testing

```php
use Tests\TestCase;
use App\DataTables\UserDataTable;

class UserDataTableTest extends TestCase
{
    public function test_datatable_returns_correct_structure()
    {
        $request = request()->merge(['draw' => 1]);
        $dataTable = new UserDataTable($request);
        
        $response = $dataTable->builder()->ajax();
        
        $this->assertArrayHasKey('data', $response->getData(true));
        $this->assertArrayHasKey('recordsTotal', $response->getData(true));
    }
}
```

## Troubleshooting

### Common Issues

1. **Missing jQuery**: Ensure jQuery is loaded before DataTables JavaScript
2. **Column Mismatch**: Verify that column count matches between frontend and backend
3. **Export Issues**: Check that Maatwebsite/Excel is properly installed
4. **Permission Errors**: Ensure proper authentication for column visibility features

### Debug Mode

Enable debug mode to see SQL queries:

```php
// In your DataTable class
public function query(Request $request): Builder
{
    \DB::enableQueryLog();
    $query = User::query()->select(['id', 'name', 'email']);
    \Log::info(\DB::getQueryLog());
    return $query;
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This package is open-sourced software licensed under the [MIT license](LICENSE.md).

## Credits

- [Snawbar](https://github.com/mikailfaruqali)
- Built with [Laravel](https://laravel.com)
- Powered by [DataTables](https://datatables.net)
- Export functionality by [Maatwebsite/Excel](https://laravel-excel.com)

## Support

If you discover any security vulnerabilities or bugs, please send an e-mail to alanfaruq85@gmail.com.