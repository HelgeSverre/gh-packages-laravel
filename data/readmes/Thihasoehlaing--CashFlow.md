# CashFlow

CashFlow is a self-hosted personal finance admin panel for tracking accounts, income, expenses, transfers, clients, projects, quotations, invoices, project costs, PDF documents, and business defaults in one private Laravel application.

It is designed for a single user who wants a practical finance back office rather than a public SaaS product. The interface uses a dark private-banking style, gold accents, responsive layouts, localized labels, and server-rendered PDF exports.

## Features

- Dashboard with monthly cashflow, net worth, charts, top categories, and recent activity.
- Account tracking for bank, e-wallet, remittance, and cash balances.
- Income and expense modules with MYR conversion previews.
- Transfers between accounts with exchange-rate handling and fees.
- Client and project records for freelance or service work.
- Project cost tracking for domain, server, maintenance, and other recurring costs.
- Quotations and invoices with line items, discounts, tax, PDF download, and accepted quotation-to-draft-invoice conversion.
- Settings for business profile, PDF payment accounts, FX rates, tax defaults, payment terms, and expense categories.
- English and Myanmar locale support.
- Single-user session authentication through Laravel Fortify / Livewire starter auth.

## Tech Stack

- Laravel 13
- PHP 8.4 compatible
- Livewire 4
- Alpine.js
- Tailwind CSS 4
- Blade
- MySQL
- Pest
- barryvdh/laravel-dompdf
- blade-ui-kit/blade-heroicons
- Chart.js via CDN

## Requirements

- PHP 8.4+
- Composer
- Node.js and npm
- MySQL
- A local Laravel environment such as Herd, Valet, Sail, Laragon, or a standard web server

## Installation

If you want to customize CashFlow or keep your own copy, fork this repository on GitHub first. Then clone your fork:

```bash
git clone https://github.com/<your-username>/<your-fork>.git cashflow
cd cashflow
composer install
npm install
cp .env.example .env
php artisan key:generate
```

If you only want to try the project locally, you can clone the original public repository instead of forking.

Update `.env` with your MySQL credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cashflow
DB_USERNAME=root
DB_PASSWORD=
```

Then run:

```bash
php artisan migrate --seed
php artisan storage:link
npm run build
```

The default seeded login is:

```text
Email: admin@cashflow.test
Password: password
```

Change this account immediately after installation.

## Development

For frontend assets:

```bash
npm run dev
```

If you are not using Herd, Valet, Sail, or another local web server, you can use Laravel's built-in server:

```bash
php artisan serve
```

## Testing

```bash
php artisan test --compact
```

Format PHP code with:

```bash
vendor/bin/pint --dirty --format agent
```

## Scheduled Tasks

CashFlow includes a scheduled invoice check that marks sent invoices as overdue when their due date has passed. Configure Laravel's scheduler in production:

```bash
* * * * * cd /path/to/cashflow && php artisan schedule:run >> /dev/null 2>&1
```

## Notes

- This project is intended as a private, self-hosted admin panel.
- Seeded data is generic and safe for a public repository.
- Use MySQL for local and production environments.
- Review security, backups, mail, HTTPS, and server permissions before deploying publicly.

## License

MIT
