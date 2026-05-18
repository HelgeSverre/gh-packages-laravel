# peppol-package-demo

Laravel application demonstrating [**peppol-package/laravel-peppol-invoices**](https://packagist.org/packages/peppol-package/laravel-peppol-invoices).

- **`/`** — Landing with integration notes (FR)
- **`/playground`** — Interactive invoice + XML + transmit flow
- **`GET /demo/status`** — JSON health check

## Local setup (sibling clone)

Clone next to the package repo:

```text
www-projects/
  peppol-package-laravel/    # the Composer package
  peppol-package-demo/       # this app
```

```bash
cd peppol-package-demo
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan serve --port=8484
```

Open http://127.0.0.1:8484/

## Docker

From the **parent** directory that contains both `peppol-package-laravel` and `peppol-package-demo`:

```bash
cd ..
docker compose -f peppol-package-demo/docker-compose.yml up --build -d
```

## After the package is on Packagist

You can remove the `repositories` entry from `composer.json` and use:

```json
"require": {
    "peppol-package/laravel-peppol-invoices": "^1.0"
}
```

## Links

| Resource | URL |
|----------|-----|
| Package | [peppol-package-laravel](https://github.com/martin-lechene/peppol-package-laravel) |
| Landing (static) | [peppol-package-landingpage](https://github.com/martin-lechene/peppol-package-landingpage) |
