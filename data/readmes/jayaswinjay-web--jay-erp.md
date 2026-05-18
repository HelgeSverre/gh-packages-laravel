<div align="center">
  <img src="https://raw.githubusercontent.com/jayaswinjay-web/shared-assets/main/screenshots/jay-erp-demo.svg" width="100%" alt="JAY ERP Screenshot">
</div>

<br>

<div align="center">

[![License](https://img.shields.io/github/license/jayaswinjay-web/jay-erp?style=flat&color=1a8a7a)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/jayaswinjay-web/jay-erp?style=flat&color=1a8a7a)](https://github.com/jayaswinjay-web/jay-erp/commits)
[![CI](https://github.com/jayaswinjay-web/jay-erp/actions/workflows/ci.yml/badge.svg)](https://github.com/jayaswinjay-web/jay-erp/actions)
[![Repo Size](https://img.shields.io/github/repo-size/jayaswinjay-web/jay-erp?style=flat&color=1a8a7a)](https://github.com/jayaswinjay-web/jay-erp)
[![Stars](https://img.shields.io/github/stars/jayaswinjay-web/jay-erp?style=social)](https://github.com/jayaswinjay-web/jay-erp)

---

### ⭐ Support This Project — [Star on GitHub](https://github.com/jayaswinjay-web/jay-erp) ⭐

---

</div>

# JAY ERP

Production-grade, modular, white-label ERP system built on Laravel for small to medium businesses.

## Tech Stack
- Backend: Laravel 10.x, PHP 8.2+
- Database: MySQL 8.0+
- Frontend: Tailwind CSS 3.x, Alpine.js 3.x, Inter Font
- Build Tools: Node.js 18+, Composer 2.x, Vite

## Features/Modules
- Dashboard with key metrics
- CRM (Leads, Contacts, Deals)
- Sales (Quotes, Invoices, Payments)
- Purchasing (Vendors, Purchase Orders, Bills)
- Inventory (Products, Stock Management)
- Accounting (Chart of Accounts, Transactions, Reports)
- HR (Employees, Payroll, Payslips)
- Project Management (Tasks, Milestones, Time Tracking)
- Admin Panel (White-label settings, Module toggles, User management)
- Multi-company support
- Custom fields for major entities
- Email notifications

## Requirements
- PHP 8.2+ with extensions: BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML
- MySQL 8.0+
- Node.js 18+
- Composer 2.x
- mod_rewrite enabled (for cPanel deployment)

## Installation
1. Clone the repository: `git clone <repo-url> D:\jay erp`
2. Install PHP dependencies: `composer install`
3. Install Node.js dependencies: `npm install`
4. Copy environment file: `cp .env.example .env`
5. Generate app key: `php artisan key:generate`
6. Configure database in `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=jay_erp
   DB_USERNAME=root
   DB_PASSWORD=
   ```
7. Run migrations and seeders: `php artisan migrate --seed`
8. Compile frontend assets: `npm run dev`
9. Start local server: `php artisan serve`

## Project Structure
```
D:\jay erp\
├── app/
│   ├── Modules/       # Modular ERP components
│   └── ...            # Standard Laravel app files
├── config/
│   ├── nexus.php      # Custom branding/config
│   └── ...            # Standard Laravel config
├── resources/
│   ├── views/
│   │   ├── mail/      # Email templates
│   │   └── ...        # Blade views
│   └── ...            # JS, CSS assets
└── ...                # Standard Laravel files
```

## Available Artisan Commands
- `php artisan serve`: Start local development server
- `php artisan migrate`: Run database migrations
- `php artisan db:seed`: Seed database with test data
- `php artisan storage:link`: Create symbolic link for public storage
- `php artisan schedule:run`: Run scheduled tasks
- `php artisan config:cache`: Cache configuration
- `php artisan route:cache`: Cache routes

## Testing
Run tests with:
```bash
php artisan test
```

## Deployment
Refer to [DEPLOYMENT.md](./DEPLOYMENT.md) for cPanel deployment instructions.
Refer to [CLIENT_CUSTOMIZATION.md](./CLIENT_CUSTOMIZATION.md) for white-label customization.

## Show Your Support

- ⭐ **Star this repo** — helps others discover it
- 🐛 **Report issues** — I respond within 24 hours
- 📬 **Share feedback** — contact@jaytechsoln.in
- ☕ **Buy me a coffee** — [Sponsor](https://github.com/sponsors/jayaswinjay-web)

Made with ❤️ by [Aswin Jay](https://github.com/Aswinajay) — part of [JAY TECH SOLUTIONS](https://jaytechsoln.in)
