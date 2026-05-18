# LaraMag

LaraMag is a Laravel 13 + Botble CMS based publishing platform with a modular architecture (`core`, `packages`, `plugins`, `themes`) for building content and magazine-style websites.

## Tech Stack

- PHP 8.3/8.4
- Laravel 13
- Botble CMS modules
- MySQL 8+
- Node.js + Laravel Mix (asset build)

## Features

- Modular CMS architecture with plugin/theme support
- Admin panel with role/permission system
- Built-in installer flow
- API support via Botble API package
- Theme system with LaraMag theme included

## Requirements

- PHP `^8.3|^8.4`
- Composer 2.x
- Node.js 20+ and npm
- MySQL 8+

Required PHP extensions:

- `curl`
- `gd`
- `mbstring`
- `pdo_mysql`
- `xml` (`dom`, `simplexml`, `xmlreader`, `xmlwriter`)
- `zip`

Ubuntu install example (PHP 8.4):

```bash
sudo apt update
sudo apt install php8.4-mbstring php8.4-mysql php8.4-curl php8.4-gd php8.4-xml php8.4-zip
```

## Quick Start

```bash
composer install
cp .env.example .env
php artisan key:generate
npm install
```

Update database settings in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel_db
DB_USERNAME=laravel_user
DB_PASSWORD=laravel_password
```

Run migrations and install CMS:

```bash
php artisan migrate --force
php artisan cms:install
php artisan serve
```

Open: [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Using Docker MySQL (Example)

If your MySQL container exposes `3306:3306` on host, use:

- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_DATABASE=<MYSQL_DATABASE>`
- `DB_USERNAME=<MYSQL_USER>`
- `DB_PASSWORD=<MYSQL_PASSWORD>`

Example from a container env:

- `MYSQL_DATABASE=laravel_db`
- `MYSQL_USER=laravel_user`
- `MYSQL_PASSWORD=laravel_password`

## Default Admin Account

When seeded with default demo credentials:

- Email: `admin@company.com`
- Password: `12345678` (or `CMS_DEMO_ACCOUNT_PASSWORD` if overridden)

## Common Issues

- `Call to undefined function ... mb_split()`
  - Install/enable `mbstring`.

- `could not find driver (Connection: mysql...)`
  - Install/enable `pdo_mysql` (`php8.4-mysql` on Ubuntu).

- Installer cannot connect to DB
  - Verify `.env` DB values match your actual MySQL container credentials.
  - Clear config cache: `php artisan config:clear`.

## Development Commands

```bash
# Backend
php artisan serve

# Frontend build
npm run dev
npm run prod
```

## Project Structure

- `app/` - Laravel app code
- `platform/core/` - Core CMS modules
- `platform/packages/` - Shared packages
- `platform/plugins/` - Feature plugins
- `platform/themes/` - Frontend themes
- `routes/` - Web/API routes

## License

This repository is licensed under the [MIT License](LICENSE) unless noted otherwise by included vendor packages.
