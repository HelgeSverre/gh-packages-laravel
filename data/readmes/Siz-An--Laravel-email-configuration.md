# Laravel Email Configuration

Store reusable email templates in the database and manage them through a JSON API, including variable substitution and test sends.

## Requirements

- PHP 8.1+
- Laravel 10.48+, 11.x, or 12.x

## Installation

### From Packagist (recommended)

After the package is [published on Packagist](https://packagist.org):

```bash
composer require siz-an/laravel-email-configuration
```

The service provider is auto-discovered. Run migrations:

```bash
php artisan migrate
```

### From GitHub (before Packagist)

This package is self-contained: routes, controllers, models, and migrations run from the package namespace, and the only optional publishable artifact is the config file.

Add a VCS repository in your app’s `composer.json`, then require the branch you use (for example `main`):

```json
"repositories": [
    {
        "type": "vcs",
        "url": "https://github.com/Siz-An/Laravel-email-configuration.git"
    }
],
"require": {
    "siz-an/laravel-email-configuration": "dev-main"
}
```

Use `dev-main` or `dev-master` depending on your default branch name, then run `composer update`.

### Local path (development)

```json
"repositories": [
    { "type": "path", "url": "../package" }
],
"require": {
    "siz-an/laravel-email-configuration": "*"
}
```

Then `composer update siz-an/laravel-email-configuration` and run `php artisan migrate`.

## After `composer require`

Nothing is wrong if **`database/migrations/` in your app stays unchanged**. This package registers its migration from inside **`vendor/siz-an/laravel-email-configuration/database/migrations/`** via `loadMigrationsFrom()`. Laravel still runs it with Artisan.

1. **Create the table**

   ```bash
   php artisan migrate
   ```

2. **Confirm Laravel sees the migration** (optional)

   ```bash
   php artisan migrate:status
   ```

   You should see a pending migration whose path contains `siz-an/laravel-email-configuration`.

3. **Optional — publish config** (only if you want `config/email-configuration.php` in your app)

   ```bash
   php artisan vendor:publish --tag=email-configuration-config
   ```

   You can also publish the same config file with `php artisan vendor:publish --tag=email-configuration`.

### Configuration (optional)

Publish the config file:

```bash
php artisan vendor:publish --tag=email-configuration-config
```

Key options in `config/email-configuration.php`:

| Key | Purpose |
|-----|---------|
| `route_prefix` | URL prefix before `email-configurations` (default: `api`). |
| `middleware` | Middleware stack for package routes (default: `['api']`). Add `auth:sanctum` or similar for protected APIs. |
| `table` | Database table name. |
| `user_model` | FQCN for `createdBy` / `updatedBy` relations. If empty, the default auth provider’s `model` from `config/auth.php` is used, then `App\Models\User`. |
| `per_page` | Default page size for the index endpoint. |
| `per_page_max` | Maximum allowed `per_page` query value. |

Environment variables mirror these keys with the `EMAIL_CONFIGURATION_` prefix (see the config file).

## Routes

All routes are relative to your app URL and the configured `route_prefix`.

| Method | URI | Action |
|--------|-----|--------|
| GET | `/{prefix}/email-configurations` | Paginated list (see query parameters below). |
| POST | `/{prefix}/email-configurations` | Create a template. |
| GET | `/{prefix}/email-configurations/{id}` | Show one template. |
| PUT/PATCH | `/{prefix}/email-configurations/{id}` | Update a template. |
| DELETE | `/{prefix}/email-configurations/{id}` | Delete a template. |
| POST | `/{prefix}/email-configurations/{id}/test-send` | Send a test message. |

With the default prefix, list templates at `GET /api/email-configurations`.

## Index: pagination and filters

`GET /api/email-configurations` returns a Laravel [length-aware paginator](https://laravel.com/docs/pagination) JSON payload (`data`, `links`, `meta`, etc.).

### Query parameters

| Parameter | Description |
|-----------|-------------|
| `per_page` | Page size (default from config, capped by `per_page_max`). |
| `search` | Case-insensitive match on `name`, `subject`, or `slug` (partial match). |
| `type` | Exact match on the `type` column (e.g. `transactional`, `marketing`, `system`). |
| `is_active` | Boolean filter (`true` / `false`, `1` / `0`, etc.). |

Examples:

```http
GET /api/email-configurations?per_page=20&search=welcome
GET /api/email-configurations?type=transactional&is_active=1
```

## Model: users and display accessors

`Sizan\EmailConfiguration\Models\EmailConfiguration` defines:

- `createdBy()` — `BelongsTo` the configured user model (`created_by`).
- `updatedBy()` — `BelongsTo` the same user model (`updated_by`).

When the index, show, and store/update responses load these relations, the serialized JSON includes nested `created_by` / `updated_by` user objects (shape depends on your user model).

Display helpers (not appended to JSON by default):

- `created_by_display` — prefers `name`, then `email`, then `#id` on the related user.
- `updated_by_display` — same for the last editor.

Ensure `user_model` (or your auth provider’s `model`) points at your real `User` (or admin) class if those classes differ from `App\Models\User`.

## Programmatic usage

```php
use Sizan\EmailConfiguration\Models\EmailConfiguration;

$template = EmailConfiguration::query()
    ->where('slug', 'welcome-email')
    ->first();

$template?->load('createdBy', 'updatedBy');
$label = $template?->created_by_display;
```

Variable placeholders in stored content use `{{variable_name}}` syntax. Use the package’s `EmailTemplateRenderer` or your own logic before sending mail.

## License

MIT.

## Publishing on Packagist

1. Push this repository to GitHub (default branch `main` is typical).
2. Create **git tags** for each release (for example `v1.0.0`). Packagist maps installable versions to these tags. This repository already includes a `v1.0.0` tag you can use for the first Packagist version.
3. On [packagist.org](https://packagist.org/packages/submit), submit the repository URL `https://github.com/Siz-An/Laravel-email-configuration.git`.
4. Packagist reads `composer.json` from the default branch; tagged versions appear as installable releases.
