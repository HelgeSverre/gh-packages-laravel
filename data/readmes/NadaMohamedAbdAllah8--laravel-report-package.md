# Laravel Report Package

This repository contains a Laravel 12 application that powers the internal report builder tooling for our HR and finance teams. It ships with a full PHP 8.3 stack, PHPUnit tests, and first-party Docker tooling so you can get productive quickly in any environment.

## Requirements

- PHP 8.3 with the required Laravel extensions.
- Composer 2.x.
- SQLite, MySQL, or PostgreSQL for persistence.
- Docker Desktop (optional, only if you prefer a containerized runtime).

## Quick Installation

1. Clone the repository, then copy the base environment file:
   ```bash
   git clone git@github.com:your-org/laravel-report-package.git
   cd laravel-report-package
   cp .env.example .env
   ```
2. Install PHP dependencies and generate the application key:
   ```bash
   composer install
   php artisan key:generate
   ```
3. Configure your `.env` database connection, queue, and cache drivers.
4. Run the migrations (and optional seeders):
   ```bash
   php artisan migrate --seed
   ```
5. Start the local server:
   ```bash
   php artisan serve
   ```

## Installing With Docker

The root-level `Dockerfile` defines the PHP-FPM image used by `docker-compose.yml`. This stack gives you PHP 8.3, Composer, Node.js, and all system dependencies without installing them on your host machine.

1. Ensure Docker Desktop is running, then build the containers:
   ```bash
   docker compose build
   ```
2. Start the services defined in `docker-compose.yml`:
   ```bash
   docker compose up -d
   ```
3. Install dependencies and initialize the application inside the `app` container:
   ```bash
   docker compose exec app composer install
   docker compose exec app php artisan key:generate
   docker compose exec app php artisan migrate --seed
   ```
4. Visit the application on the port configured in `docker-compose.yml` (default `http://localhost:8080`).

## Installing Without Docker

If you prefer to run the stack natively:

1. Install PHP 8.3, Composer, and a database server locally.
2. Follow the **Quick Installation** steps to install dependencies, generate the key, and run migrations.
3. Start the development server with `php artisan serve` or point your local web server (Valet, Homestead, etc.) at the `public/` directory.

## Testing

Make sure the suite passes before pushing changes:

```bash
php artisan test
```

You can target a single test file while developing, for example `php artisan test tests/Unit/AuthServiceTest.php`.
