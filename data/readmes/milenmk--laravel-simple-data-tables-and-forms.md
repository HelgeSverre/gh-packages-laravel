# Laravel Simple Datatables And Forms

<div align="center">

<a href="https://packagist.org/packages/milenmk/laravel-simple-datatables-and-forms">![Latest Version on Packagist](https://img.shields.io/packagist/v/milenmk/laravel-simple-datatables-and-forms.svg?style=flat)</a>
<a href="https://packagist.org/packages/milenmk/laravel-simple-datatables-and-forms">![Total Downloads](https://img.shields.io/packagist/dt/milenmk/laravel-simple-datatables-and-forms.svg?style=flat)</a>
<a href="https://github.com/milenmk/laravel-simple-datatables-and-forms">![GitHub User's stars](https://img.shields.io/github/stars/milenmk/laravel-simple-datatables-and-forms)</a>
<a href="https://laravel.com/docs">![Laravel 10 Support](https://img.shields.io/badge/Laravel-10.x|11.x|12.x-orange?style=flat&logo=laravel)</a>
<a href="https://www.php.net">![PHP Version Support](https://img.shields.io/packagist/php-v/milenmk/laravel-simple-datatables-and-forms?style=flat)</a>
<a href="https://github.com/milenmk/laravel-simple-datatables-and-forms/blob/develop/LICENSE.md">![License](https://img.shields.io/packagist/l/milenmk/laravel-simple-datatables-and-forms.svg?style=flat)</a>
<a href="https://github.com/milenmk/laravel-simple-datatables-and-forms/issues">![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)</a>
<a href="https://www.patreon.com/c/LaravelAddonsbyMilen">![Sponsor me](https://img.shields.io/badge/Sponsor-%E2%9D%A4-ff69b4?style=flat)</a>

</div>

A lightweight, easy-to-use Laravel package for creating interactive data tables and dynamic forms with Livewire
integration.

![Screenshot](resources/img/light.png)
![Screenshot](resources/img/dark.png)

## Overview

Laravel Simple Datatables And Forms provides two powerful components for your Laravel applications:

### 📊 Data Tables

Create interactive, feature-rich data tables with minimal code. Includes advanced search, sorting, filtering, grouping,
and export capabilities.

### 📝 Dynamic Forms

Build dynamic forms with fluent API, multiple field types, validation, and model binding support.

## Key Features

- 🔍 **Advanced Search** - Debounced search with minimum character requirements
- 🔄 **Column Sorting** - Click-to-sort functionality for table columns
- 🧹 **Filtering & Grouping** - Multiple filter types with advanced grouping options
- 📤 **Data Export** - Export to CSV, Excel, and PDF formats
- 📝 **Dynamic Forms** - Fluent features for building complex forms
- 🔧 **Multiple Field Types** - Input, Select, Checkbox, Toggle, Textarea, and more
- ✅ **Validation Integration** - Built-in Laravel validation support
- 📱 **Responsive Design** - Mobile-friendly components
- ⚡ **Performance Optimized** - Intelligent caching and query optimization
- 🔒 **Security Features** - CSRF protection and input sanitization
- 🧩 **Seamless Livewire Integration** - Built specifically for Livewire 3.x

## Requirements

- PHP 8.2 or higher (compatible with PHP 8.3 and 8.4)
- Laravel 10.x or higher (compatible with Laravel 11.x and 12.x)
- Livewire 3.x or higher

## Quick Start

### Installation

```bash
composer require milenmk/laravel-simple-datatables-and-forms
```

### Publish Configurations

```bash
php artisan vendor:publish --tag=laravel-simple-datatables-and-forms-config
```

### Publish Assets

```bash
php artisan simple-datatables-and-forms:publish-assets
```

### Include Assets in Your Layout

```blade
<head>
    @SimpleDatatablesStyle
</head>
<body>
    <!-- Your content -->
    @SimpleDatatablesScript
</body>
```

### Create Your First Data Table

Generate a table component:

```bash
php artisan make:milenmk-datatable UserList User --generate
```

Or create manually:

```php
use Milenmk\LaravelSimpleDatatablesAndForms\Traits\HasTable;

class UserList extends Component
{
    use HasTable;

    public function table(Table $table): Table
    {
        return $table
            ->query(User::query())
            ->schema([
                TextColumn::make('name')->searchable()->sortable(),
                TextColumn::make('email')->searchable(),
                ToggleColumn::make('is_active')->label('Active'),
            ])
            ->striped()
            ->paginate();
    }
}
```

### Create Your First Form

Generate a form component:

```bash
php artisan make:milenmk-form CreateUser create User --generate
```

Or create manually:

```php
use Milenmk\LaravelSimpleDatatablesAndForms\Traits\HasForm;

class CreateUser extends Component
{
    use HasForm;

    public function form(Form $form): Form
    {
        return $form->model(User::class)->schema([
            InputField::make('name')->required(),
            InputField::make('email')->email()->required(),
            SelectField::make('role')
                ->options(['admin' => 'Admin', 'user' => 'User'])
                ->required(),
        ]);
    }
}
```

## Documentation

### 📚 Complete Documentation

- **[Documentation Hub](docs/README.md)** - Complete documentation index and navigation guide
- **[Troubleshooting Guide](docs/troubleshooting.md)** - Common issues and solutions

### 📊 Data Tables Documentation

- **[Getting Started](docs/tables/getting-started.md)** - Quick start guide for tables
- **[Column Types](docs/tables/column-types.md)** - Complete reference for all column types
- **[Configuration](docs/tables/configuration.md)** - Configuration guide and options
- **[Advanced Features](docs/tables/search.md)** - Search, filtering, export, and caching

### 📝 Forms Documentation

- **[Getting Started](docs/forms/getting-started.md)** - Quick start guide for forms
- **[Field Types](docs/forms/field-types.md)** - Complete reference for all field types
- **[Validation](docs/forms/validation.md)** - Validation rules and techniques
- **[Advanced Features](docs/forms/model-binding.md)** - Model binding and relationships

## Tailwind CSS Integration

Add the package views to your Tailwind configuration:

```js
// tailwind.config.js
module.exports = {
    content: [
        // ... your existing content paths
        './vendor/milenmk/laravel-simple-datatables-and-forms/resources/views/**/*.blade.php',
    ],
    // ... rest of your configuration
};
```

## Contributing

Contributions are welcome! Please visit
our [GitHub repository](https://github.com/milenmk/laravel-simple-datatables-and-forms) to:

- Report bugs or request features
- Submit pull requests
- Browse existing issues
- Join discussions

## Support

- **[Documentation](docs/README.md)** - Comprehensive guides and examples
- **[GitHub Issues](https://github.com/milenmk/laravel-simple-datatables-and-forms/issues)** - Bug reports and feature
  requests
- **[Email Support](mailto:support@minkov.dev)** - Direct support for complex issues

## Changelog

Please see [CHANGELOG.md](CHANGELOG.md) for more information on what has changed recently.

## Support My Work

If this package saves you time, you can support ongoing development:  
👉 [Become a Patron](https://www.patreon.com/c/LaravelAddonsbyMilen)

## Other Packages

Check out my other Laravel packages:

- **[Laravel GDPR Cookie Manager](https://packagist.org/packages/milenmk/laravel-gdpr-cookie-manager)** - GDPR-compliant
  cookie consent management with user preference tracking
- **[Laravel Blacklist](https://packagist.org/packages/milenmk/laravel-blacklist)** - A Laravel package for blacklist
  validation of user input
- **[Laravel Email Change Confirmation](https://packagist.org/packages/milenmk/laravel-email-change-confirmation)** -
  Secure email change confirmation system
- **[Laravel GDPR Exporter](https://packagist.org/packages/milenmk/laravel-gdpr-exporter)** - GDPR-compliant data export
  functionality
- **[Laravel Locations](https://packagist.org/packages/milenmk/laravel-locations)** - Add Countries, Cities, Areas,
  Languages and Currencies models to your Laravel application
- **[Laravel Rate Limiting](https://packagist.org/packages/milenmk/laravel-rate-limiting)** - Advanced rate limiting
  capabilities with exponential backoff

## License

This package is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Disclaimer

This package is provided "as is", without warranty of any kind, express or implied, including but not limited to
warranties of merchantability, fitness for a particular purpose, or noninfringement.

The author(s) make no guarantees regarding the accuracy, reliability, or completeness of the code, and shall not be held
liable for any damages or losses arising from its use.

Please ensure you thoroughly test this package in your environment before deploying it to production.
