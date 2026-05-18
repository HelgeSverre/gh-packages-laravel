<h1 align="center">Internal Company CRM</h1>

<p align="center">
  Venue-scoped internal CRM for admin and employee operations, ledgers, reports, exports, and attachments.
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/github/license/DakshIOT/Internal-Company-CRM?color=111827">
  <img alt="Last Commit" src="https://img.shields.io/github/last-commit/DakshIOT/Internal-Company-CRM/main?color=2563eb">
  <img alt="Repo Size" src="https://img.shields.io/github/repo-size/DakshIOT/Internal-Company-CRM?color=0f766e">
  <img alt="Venue Scoped" src="https://img.shields.io/badge/Data-Venue%20Scoped-0f766e">
  <img alt="Setup Flow" src="https://img.shields.io/badge/Admin-Employee%20Centered%20Setup-1d4ed8">
  <img alt="Laravel" src="https://img.shields.io/badge/Laravel-9.52-ef4444">
  <img alt="PHP" src="https://img.shields.io/badge/PHP-8.0%2B-777bb4">
  <img alt="Livewire" src="https://img.shields.io/badge/Livewire-2.12-fb70a9">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/TailwindCSS-3.x-38bdf8">
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-8%2B-00758f">
  <img alt="Hostinger Ready" src="https://img.shields.io/badge/Hostinger-Ready-673de6">
  <img alt="Responsive UI" src="https://img.shields.io/badge/UI-Mobile%20Responsive-0891b2">
  <img alt="Exports" src="https://img.shields.io/badge/Exports-Excel%20Ready-166534">
  <img alt="Status" src="https://img.shields.io/badge/Status-Internal%20Use%20Only-111827">
</p>

Laravel-based internal CRM for venue-scoped business operations. The application supports fixed employee roles, mandatory venue selection for employees, server-side totals, symbol-free money display, attachment handling, admin reports, and Excel exports.

Released under the [MIT License](LICENSE).

## Why This Repo Exists

- Give admin one controlled workspace for employees, venues, packages, services, reports, and exports.
- Give employees a clean venue-scoped workflow with strict access isolation.
- Keep financial calculations server-owned and deployment simple enough for Hostinger shared hosting.

## About

Internal Company CRM is built for one organization to manage venue-scoped operations through a clean admin and employee workflow. It is intentionally not a public SaaS product. The system focuses on strict access control, role-based visibility, server-side calculations, attachment handling, exports, and a responsive UI that works well on desktop and mobile.

## About Us

This repository represents an internal operations platform for company teams that manage:

- venue-based work allocation
- employee-specific service and package access
- function-level financial tracking
- daily income and billing ledgers
- vendor handling for Employee Type B
- admin reporting and Excel exports

## Highlights

- Fixed roles: `admin`, `employee_a`, `employee_b`, `employee_c`
- Employee flow: `Login -> Venue Selection -> Dashboard`
- Strict venue isolation across all employee-facing data
- Function Entry workflow with packages, extra charges, installments, discounts, and attachments
- Daily Income, Daily Billing, Vendor Entry, and Admin Income ledgers
- Admin reporting with explicit employee, venue, module, service, package, and vendor filters
- Excel exports with plain numeric output and no currency symbols
- Responsive Blade UI built for desktop and mobile

## UI and Workflow Notes

- Admin setup is employee-centered: create employee, assign venues, then manage packages and services in the employee setup workspace.
- Employee Type A supports frozen fund per assigned venue.
- Employee Type B uses the 4 vendor slots defined per venue.
- Reports use explicit admin filters and never depend on employee venue session state.

## Tech Stack

- Laravel 9
- Blade
- Livewire 2
- Alpine.js
- Tailwind CSS
- Vite
- MySQL / MariaDB
- `maatwebsite/excel`

## Quality Signals

- Feature-tested admin master-data flows
- Feature-tested reports and exports
- Attachment handling with preview/download authorization
- Hostinger deployment pack included in the repo
- Blade + Tailwind UI tuned for desktop and mobile

## Codex Agents

This project was planned and implemented with Codex agent guidance.

- [`AGENTS.md`](./AGENTS.md) defines durable repo rules, business invariants, testing gates, UI discipline, and deployment constraints.
- [`.agents/skills/architecture/SKILL.md`](./.agents/skills/architecture/SKILL.md) documents Laravel architecture and schema guardrails.
- [`.agents/skills/premium-responsive-ui/SKILL.md`](./.agents/skills/premium-responsive-ui/SKILL.md) defines the responsive UI system and interaction expectations.
- [`.agents/skills/auth-roles-venue-workflow/SKILL.md`](./.agents/skills/auth-roles-venue-workflow/SKILL.md) locks the role and venue-selection rules.
- [`.agents/skills/reports-exports/SKILL.md`](./.agents/skills/reports-exports/SKILL.md) guides admin filters, totals, and workbook exports.
- [`.agents/skills/qa-review/SKILL.md`](./.agents/skills/qa-review/SKILL.md) captures regression and release-readiness checks.

If you continue this project with Codex, these files should remain the source of truth for implementation behavior and guardrails.

## Business Rules

- Admin can access the global dashboard without selecting a venue.
- Employees must select an assigned venue before entering protected modules.
- Venue context is stored in session as `selected_venue_id`.
- Only `employee_b` has Vendor Entry access.
- Each venue has exactly 4 vendor slots.
- Money is stored in integer minor units.
- No currency symbol or currency code appears in the UI or exports.

## Core Modules

### Admin

- Admin dashboard
- Venues
- Employees
- Employee assignment workspace
- Services
- Packages
- Admin Income
- Reports and Excel exports

### Employee

- Dashboard
- Venue selection and switching
- Function Entry
- Daily Income
- Daily Billing
- Vendor Entry for `employee_b`

## Local Setup

1. Clone the repository:

```bash
git clone https://github.com/DakshIOT/Internal-Company-CRM.git
cd Internal-Company-CRM
```

2. Install dependencies:

```bash
composer install
npm install
```

3. Create the environment file:

```bash
cp .env.example .env
```

4. Configure `.env`:

```env
APP_NAME="Interior CRM"
APP_ENV=local
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=interior_crm
DB_USERNAME=root
DB_PASSWORD=
```

5. Generate the app key and seed the database:

```bash
php artisan key:generate
php artisan migrate:fresh --seed
```

6. Run the app:

```bash
npm run dev
php artisan serve
```

Open:

```text
http://127.0.0.1:8000
```

## Demo Credentials

Password for all demo users:

```text
Password@123
```

Users:

- Admin: `admin@interiorcrm.local`
- Employee A: `employee.a@interiorcrm.local`
- Employee B: `employee.b@interiorcrm.local`
- Employee C: `employee.c@interiorcrm.local`

## Employee Access Notes

- `employee_a`: Function Entry, Daily Income, Daily Billing
- `employee_b`: Function Entry, Daily Income, Daily Billing, Vendor Entry
- `employee_c`: Function Entry only
- Frozen fund applies only to `employee_a`

## Testing

Run the full suite:

```bash
php artisan test
```

Build production assets:

```bash
npm run build
```

## Hostinger Deployment

This project is designed to stay compatible with Hostinger Business shared hosting:

- no Redis requirement
- no Horizon
- no websocket dependency
- standard Laravel filesystem usage
- synchronous export support

Recommended production target:

- PHP `8.2`
- MySQL / MariaDB
- SSH enabled

Deployment files included in this repo:

- Production environment template: [`.env.production.example`](./.env.production.example)
- Full Hostinger checklist: [`docs/HOSTINGER_DEPLOY.md`](./docs/HOSTINGER_DEPLOY.md)

### Deploy Steps

1. Create the domain or subdomain in Hostinger hPanel.
2. Create a production database and database user in hPanel.
3. Set the site PHP version to `8.2`.
4. Enable SSH access in hPanel.
5. Upload the Laravel application above `public_html`, for example:

```text
/home/username/domains/yourdomain.com/crm-app
```

6. Copy the contents of Laravel `public/` into `public_html`.
7. Update `public_html/index.php` so it points to the real app folder:

```php
require __DIR__.'/../crm-app/vendor/autoload.php';
$app = require_once __DIR__.'/../crm-app/bootstrap/app.php';
```

8. Configure production `.env`:

```env
APP_NAME="Interior CRM"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_user
DB_PASSWORD=your_password
```

9. Build assets locally before upload or on the server if Node is available:

```bash
npm install
npm run build
```

10. SSH into Hostinger and run:

```bash
cd ~/domains/yourdomain.com/crm-app
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --seed --force
php artisan storage:link
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

11. Fix writable directories if needed:

```bash
chmod -R 775 storage bootstrap/cache
```

12. Smoke test production:

- admin login
- employee login -> venue selection
- function entry
- daily income
- daily billing
- vendor entry for employee B
- report filtering
- Excel export
- attachment preview and download

## Repository Guidance

- Business source of truth: [`CRM_BRIEF.md`](./CRM_BRIEF.md)
- Implementation source of truth: [`PROJECT_PLAN.md`](./PROJECT_PLAN.md)
- Repo working rules: [`AGENTS.md`](./AGENTS.md)

## License

This repository is available under the [MIT License](./LICENSE).

## Notes

- This is an internal company CRM, not a multi-tenant SaaS.
- Role and venue rules are intentionally fixed in code.
- Server-side totals are authoritative.
