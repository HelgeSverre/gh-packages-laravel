# mb4it/laravel-seo

Reusable Laravel SEO package for any Eloquent model via `UseSeo` trait.

## Features

- Locale-aware SEO records in separate `seo_entries` table (polymorphic relation).
- Configurable SEO fields with type map.
- Model-level SEO templates with placeholders (`{name}`, `{description}`).
- Artisan command for adding new physical SEO columns with migration generation.

## Installation

```bash
composer require mb4it/laravel-seo
```

Publish config and migrations:

```bash
php artisan vendor:publish --tag=laravel-seo-config
php artisan vendor:publish --tag=laravel-seo-migrations
php artisan migrate
```

## Configure fields

`config/seo.php` supports two formats:

```php
'fields' => ['h1', 'title']
```

All fields from list format default to `string`.

```php
'fields' => [
    'h1' => 'string',
    'title' => 'string',
    'description' => 'text',
    'image' => 'string',
]
```

Supported types: `string`, `text`, `integer`, `boolean`, `json`.

## Use in model

```php
use MB\Laravel\Seo\Concerns\UseSeo;

class News extends Model
{
    use UseSeo;
}
```

Available API:

- `seoEntries(): MorphMany`
- `seo(?string $locale = null): MorphOne|MorphMany`
- `setSeo(array $data, ?string $locale = null): SeoEntry`
- `getSeo(?string $locale = null): ?SeoEntry`

## SEO templates

If model defines `seoTemplates()`, templates are applied automatically after model save.

```php
public function seoTemplates(): array
{
    return [
        'h1' => '{name} - Site',
        'description' => '{description}',
    ];
}
```

Rules:

- Placeholder format: `{attribute_name}`.
- Missing attributes are replaced with empty string.
- Explicitly saved SEO values (via `setSeo`) are not overwritten by template values.

## Add new SEO field (physical column)

Use command:

```bash
php artisan seo:add-field og_image string
```

What it does:

1. Creates migration `*_add_og_image_to_seo_entries_table.php`.
2. Tries to append `'og_image' => 'string'` to `config/seo.php`.

Options:

- `--no-config` - skip config file auto-update.

Example:

```bash
php artisan seo:add-field og_image string --no-config
```
