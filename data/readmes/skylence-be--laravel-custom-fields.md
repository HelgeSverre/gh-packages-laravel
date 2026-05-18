# Laravel Custom Fields

[![Latest Version on Packagist](https://img.shields.io/packagist/v/xve/laravel-custom-fields.svg?style=flat-square)](https://packagist.org/packages/xve/laravel-custom-fields)
[![Total Downloads](https://img.shields.io/packagist/dt/xve/laravel-custom-fields.svg?style=flat-square)](https://packagist.org/packages/xve/laravel-custom-fields)

A powerful Laravel package that allows you to dynamically add custom fields to any Eloquent model without modifying your database schema or codebase. Built with Livewire 3 for a modern, reactive admin interface.

## Features

- ✅ **11 Field Types**: Text, Textarea, Select, Radio, Checkbox, Toggle, Checkbox List, DateTime, Rich Editor, Markdown, Color Picker
- ✅ **Column-Based Storage**: Custom fields are stored as actual database columns for optimal performance
- ✅ **Livewire 3 UI**: Modern, reactive admin interface for managing custom fields
- ✅ **Simple Integration**: Just add a trait to your models
- ✅ **Automatic Column Management**: Database columns are created/deleted automatically
- ✅ **Soft Deletes**: Safe deletion with optional permanent removal
- ✅ **Searchable & Filterable**: Built-in search and filtering in the admin interface
- ✅ **Sortable Fields**: Control the display order of your custom fields
- ✅ **Validation Support**: Full Laravel validation rule support
- ✅ **Multi-Model Support**: Add custom fields to multiple models

## Installation

You can install the package via composer:

```bash
composer require xve/laravel-custom-fields
```

Run the migrations:

```bash
php artisan migrate
```

**That's it!** The package works out of the box with sensible defaults.

### Optional: Publish Configuration

You only need to publish the config if you want to customize routes, middleware, or other settings:

```bash
php artisan vendor:publish --tag="custom-fields-config"
```

### Optional: Publish Views

You only need to publish views if you want to customize the admin interface:

```bash
php artisan vendor:publish --tag="custom-fields-views"
```

## Configuration

The package works with sensible defaults. If you've published the config file, it's located at `config/custom-fields.php`:

```php
return [
    // Route configuration (default: /admin/fields with web & auth middleware)
    'route' => [
        'prefix' => 'admin/fields',
        'middleware' => ['web', 'auth'],
        'name_prefix' => 'custom-fields.',
    ],

    // Database table name (default: custom_fields)
    'table_name' => 'custom_fields',

    // Models that can have custom fields (optional - for UI dropdown)
    'customizable_types' => [
        // Example: App\Models\User::class => 'Users',
        // Example: App\Models\Post::class => 'Posts',
    ],

    // Pagination (default: 15)
    'per_page' => 15,

    // Enable soft deletes (default: true)
    'enable_soft_deletes' => true,

    // Enable default option selection (default: true)
    'enable_default_options' => true,
];
```

## Usage

### Step 1: Add Trait to Your Model

Add the `HasCustomFields` trait to any model you want to support custom fields:

```php
use Illuminate\Database\Eloquent\Model;
use Skylence\LaravelCustomFields\Traits\HasCustomFields;

class Employee extends Model
{
    use HasCustomFields;

    protected $fillable = [
        'name',
        'email',
        // Custom field codes will be automatically merged
    ];
}
```

### Step 2: Create Custom Fields via Admin Interface

Navigate to `/admin/fields` in your browser to access the custom fields management interface.

**Create a new field:**
1. Click "Create New Field"
2. Fill in the details:
   - **Name**: Display label (e.g., "Employee Rating")
   - **Code**: Database column name (e.g., "employee_rating")
   - **Type**: Select from 11 field types
   - **Model Type**: Select which model this field belongs to
   - **Options**: Add options for select/radio/checkbox list types
   - **Display Settings**: Toggle "Show in table columns"

3. Click "Create Field"

The package will automatically:
- Create a database column on the model's table
- Make the field available in your model
- Add appropriate casts and fillable attributes

### Step 3: Use Custom Fields in Your Code

Once created, custom fields work like regular model attributes:

```php
// Create a new record with custom fields
$employee = Employee::create([
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'employee_rating' => 'Excellent', // Custom field
    'department_code' => 'IT',         // Custom field
]);

// Update custom fields
$employee->employee_rating = 'Good';
$employee->save();

// Access custom field values
echo $employee->employee_rating; // 'Good'

// Use helper methods
$rating = $employee->getCustomField('employee_rating');
$employee->setCustomField('employee_rating', 'Excellent');

// Get all custom field values
$customValues = $employee->getCustomFieldValues();
```

### Step 4: Query with Custom Fields

Custom fields are stored as actual database columns, so you can use them in queries:

```php
// Where clauses
$employees = Employee::where('employee_rating', 'Excellent')->get();

// Order by
$employees = Employee::orderBy('department_code')->get();

// Select specific fields
$employees = Employee::select('name', 'employee_rating')->get();
```

## Field Types

The package supports 11 different field types:

- **Text Input**: Basic text with subtypes (email, numeric, integer, password, tel, url)
- **Textarea**: Multi-line text
- **Select Dropdown**: Single or multi-select with custom options
- **Radio Buttons**: Mutually exclusive options
- **Checkbox**: Single boolean checkbox
- **Toggle**: Toggle switch (boolean)
- **Checkbox List**: Multiple checkboxes (array)
- **Date & Time**: DateTime picker
- **Rich Text Editor**: WYSIWYG editor
- **Markdown Editor**: Markdown with preview
- **Color Picker**: Color selection

## Admin Interface Routes

The package provides three main routes:

- **Index**: `/admin/fields` - List all custom fields
- **Create**: `/admin/fields/create` - Create a new custom field
- **Edit**: `/admin/fields/{field}/edit` - Edit an existing custom field

All routes are protected by the middleware specified in the config file (default: `['web', 'auth']`).

## Programmatic Field Creation

You can also create fields programmatically:

```php
use Skylence\LaravelCustomFields\Models\Field;

Field::create([
    'name' => 'Employee Rating',
    'code' => 'employee_rating',
    'type' => 'select',
    'options' => ['Excellent', 'Good', 'Average', 'Poor'],
    'customizable_type' => App\Models\Employee::class,
    'use_in_table' => true,
    'sort' => 10,
]);
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Jonas Vanderhaegen](https://github.com/jonasvanderhaegen-xve)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
