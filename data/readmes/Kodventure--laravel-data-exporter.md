# Laravel Data Exporter

**A Laravel package for exporting Eloquent query results as CSV, XLSX, JSON, and more — with support for filters, pagination, and selected rows.**

This package makes it easy to export data from your Laravel applications, whether it's a full dataset, filtered results, a specific page, or selected rows. Designed to work seamlessly with both standard Eloquent queries and tools like [Filament](https://filamentphp.com), it provides a clean, extensible interface for exporting data in various formats.

## ✨ Features

- ✅ Export to **CSV**, **XLSX**, **JSON** (more coming soon!)
- ✅ Supports **entire dataset**, **paginated page**, or **selected rows**
- ✅ Fully compatible with **Eloquent builder queries**
- ✅ Built-in support for **filtering and searching**
- ✅ Easily extendable with custom formats
- ✅ Optional integration with **Filament Tables** (coming soon)

## 📦 Installation

```bash
composer require kodventure/laravel-data-exporter
```

## 🚀 Usage

```php
use App\Models\User;
use Kodventure\LaravelDataExporter\Facades\DataExporter;
use Kodventure\LaravelDataExporter\Enums\ExportFormat;
use Kodventure\LaravelDataExporter\Enums\ExportMode;

DataExporter::export(
    source: User::query(),
    mode: ExportMode::All, // ExportMode::Page | ExportMode::Selected
    format: ExportFormat::CSV,
    page: null,
    perPage: null,
    selectedIds: [],
    user: auth()->user(), // Optional, for notifications
    async: true,
);
```

## 🔧 Advanced

You can customize your exporter pipeline using builder classes, custom formatters, and DTOs. See the [docs](#) for more information.


## 📄 License

This package is open-sourced software licensed under the [MIT license](LICENSE).
