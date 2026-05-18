# Aurix Core

Laravel authentication/RBAC package with built-in social auth support.

## Requirements

- PHP 8.1+
- Laravel 10/11/12
- Laravel authentication scaffolding available (`login` route)

## Installation

### 1. Install package

```bash
composer require aurix/core
```

For local path testing only:

```bash
composer require aurix/core:@dev
```

### 2. Run package setup

```bash
php artisan aurix:install --seed
php artisan aurix:make-admin your-email@example.com
```

Or use one command:

```bash
php artisan aurix:setup \
  --admin-email=your-email@example.com \
  --create-admin \
  --admin-name="Admin User" \
  --admin-password="strong-password"
```

### 3. Add traits to your User model

```php
use Aurix\Models\Concerns\HasAurixRoles;
use Aurix\Models\Concerns\HasSocialAccounts;

class User extends Authenticatable
{
    use HasAurixRoles, HasSocialAccounts;
}
```

### 4. Seed and configure social providers

```bash
php artisan db:seed --class="Aurix\\Database\\Seeders\\SocialProvidersSeeder"
```

Then open:

- `http://127.0.0.1:8000/auth/rbac/setup`

Configure provider credentials in the Social Providers tab.

Current first-party provider support:

- Google
- GitHub

Other providers are listed in the UI as `Coming Soon`.

### 5. Optional publish steps

```bash
php artisan vendor:publish --tag=aurix-config
php artisan vendor:publish --tag=aurix-views
php artisan vendor:publish --tag=aurix-auth-views
php artisan vendor:publish --tag=aurix-assets
```

## Core Routes

- `GET /auth/{provider}/redirect`
- `GET /auth/{provider}/callback`
- `GET /api/auth/providers`
- `PUT /api/auth/providers/{provider}`
- `POST /api/auth/providers/{provider}/toggle`
- `POST /api/auth/providers/seed`

## Run Tests

```bash
composer install
vendor/bin/phpunit --testdox
```

## Notes

- RBAC admin UI path default: `/auth/rbac`
- API prefix default: `/api/auth`
- Social redirect after login default: `/dashboard`

## Contributing

1. Fork and create a feature branch.
2. Run `vendor/bin/phpunit`.
3. Keep changes scoped and include tests.
