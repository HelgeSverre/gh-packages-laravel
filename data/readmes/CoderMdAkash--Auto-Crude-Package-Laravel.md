# Laravel Auto CRUD Generator

Laravel package for generating model-based advanced CRUD scaffold with smart schema detection and dynamic form config.

## Installation

```bash
composer require mdakashmia/laravel-auto-crude
```

Laravel package discovery will auto register the service provider.

## Command

```bash
php artisan generate:crude {ModelName} {--table=} {--force}
```

Examples:

```bash
php artisan generate:crude Post
php artisan generate:crude Category --table=blog_categories
php artisan generate:crude Comment --force
```

## What Gets Generated

- `app/Http/Controllers/{Model}Controller.php`
- `app/Http/Requests/Store{Model}Request.php`
- `app/Http/Requests/Update{Model}Request.php`
- `config/auto-crude/{model_plural}.php`
- `resources/views/{model-plural}/index.blade.php`
- `resources/views/{model-plural}/create.blade.php`
- `resources/views/{model-plural}/edit.blade.php`
- `resources/views/{model-plural}/show.blade.php`
- `resources/views/{model-plural}/_form.blade.php`
- `resources/views/{model-plural}/field-config.blade.php`
- Route entries in `routes/web.php`

## Core CRUD Features

- Create / Read / Update / Delete
- Model-based auto CRUD generation
- Pagination (`per_page`), sorting (`sort_by`, `sort_direction`), search (`q`)
- Column filtering:
  - Date range (`field_from`, `field_to`)
  - Enum/status filters
  - Boolean filters
  - Foreign-key relation filters
- Bulk actions:
  - `delete`
  - `restore` (when soft delete enabled)
  - `force_delete` (when soft delete enabled)
  - `update` (single field/value across selected rows)
- Soft delete support when `deleted_at` exists

## Dynamic Form Builder

- Multiple input type support:
  - `text`, `textarea`, `number`, `date`, `datetime-local`, `select`, `relation-select`, `toggle`, `checkbox`, `file`
- Validation rules are generated into Store/Update request classes
- Conditional field metadata support (`conditional` key)
- Repeatable field support (`repeatable` key)
- Custom field configuration UI:
  - `GET /{resource}/field-config`
  - `POST /{resource}/field-config`
  - User overrides saved in `storage/app/auto-crude/{resource}_fields.json`

## Smart Field Detection

- DB column type to input mapping
- `enum` columns to dropdown options
- `boolean/tinyint` columns to toggle
- Foreign key columns to relation-select with `exists` validation
- Date/datetime/timestamp columns to date filters
- String/text columns as searchable

## Query Parameters (Index)

- `q` for global search
- `sort_by`, `sort_direction`
- `per_page`
- `{enum_column}` for enum filter
- `{boolean_column}` for boolean filter
- `{relation_column}` for relation filter
- `{date_column}_from`, `{date_column}_to` for date range
- `trashed=with|only` for soft deleted records

## Notes

- Schema introspection for enum/foreign key/nullability is optimized for MySQL (`information_schema`).
- Use `--force` if you want to overwrite generated files.
- The generator assumes your model namespace is `App\Models`.
