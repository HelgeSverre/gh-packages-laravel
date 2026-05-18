# OpenCharity

Open-source charity and family assistance management, built on Laravel + Filament.

[![Laravel](https://img.shields.io/badge/Laravel-13-red?style=flat-square)](https://laravel.com)
[![Filament](https://img.shields.io/badge/Filament-5-orange?style=flat-square)](https://filamentphp.com)
[![PHP](https://img.shields.io/badge/PHP-8.3%2B-blue?style=flat-square)](https://www.php.net)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

## About

OpenCharity is a full-featured admin system designed for NGOs, mosques, and community foundations that need to manage beneficiary families from intake to ongoing assistance. It covers the complete lifecycle: registering families and their members, opening charity cases, scheduling and conducting visits, delivering assistance, storing documents, and running donation campaigns — all with fine-grained role-based access control and Arabic/English bilingual support.

## System Architecture

![OpenCharity System Architecture](public/opencharity-diagram.svg)

## Key Features

**Family & Member Registry**
- Detailed family profiles: housing status, monthly income, address with map picker, contact information
- Member records with relation, gender, birth date, education, employment, health, and income fields
- Printable family member reports with grid layout
- Soft-delete with full audit trail

**Case Management**
- Flexible case types defined by administrators
- Priority levels (low → urgent) and a complete status lifecycle (draft → closed)
- Active and assigned case scoping per user role
- Linked visits, documents, assistance schedules, and donation targets per case

**Visit Tracking**
- Visit types: field visit, office interview, phone call, follow-up, reassessment
- FullCalendar scheduling with next-visit reminders
- Summary, findings, and recommendations per visit

**Assistance Scheduling & Delivery**
- Assistance types with configurable units (amount, item, service)
- Recurring schedules (once, daily, weekly, monthly, quarterly, yearly, custom)
- Per-schedule funding status and delivery records with proof-of-delivery file upload

**Document Vault**
- Categorized documents: identity, housing, financial, medical, legal, social research, committee decisions
- Document types include national ID, birth certificate, rent contract, medical reports, and more
- Verification status, expiry tracking, and visibility controls (family-only, case-only, shared)

**Donations & Fundraising**
- Donation targets at family, case, or campaign level with goal/collected amount tracking
- Public donation detail page per target with progress bar and direct donation link
- Online donations toggle in system settings to enable or disable the donation flow
- Multi-currency support: EGP, USD, SAR
- Payment gateway tracking: Paymob, Stripe, Fawry, manual, and others
- Full donation allocation chain: donation → target → case → assistance schedule

**Public Website**
- Public landing page with hero, about, services, statistics, testimonials, FAQ, active cases, and donation call-to-action
- Browse active donation cases list and per-case detail page with progress bar
- Paymob payment gateway integration with callback handling and success page
- Fully SEO-optimized: per-page `<title>`, meta description, canonical URL, hreflang, OpenGraph (og:title, og:description, og:type, og:image, og:locale), Twitter Cards, and JSON-LD structured data (Organization, WebSite, Project, DonateAction)

**Admin Panel**
- Filament 5 admin panel with Shield roles and permissions
- Arabic/English multi-language UI with translatable content (Spatie Translatable)
- System settings for branding, social links, contact info, and online donation toggle
- Phone input with country validation, map picker for addresses, icon picker

## Tech Stack

| Layer | Package |
|---|---|
| Framework | Laravel 13, PHP 8.3+ |
| Admin UI | Filament 5, Livewire 4 |
| Frontend | Tailwind CSS 4, Alpine.js |
| Database | MySQL 8+ |
| Testing | Pest 4 |
| Auth & Roles | Filament Shield |
| i18n | Laravel Lang, Spatie Translatable, Chained Translation Manager |
| Scheduling UI | Saade FullCalendar |
| Payments | Akaunting Laravel Money, Paymob |
| SEO | artesaos/seotools (OpenGraph, Twitter Cards, JSON-LD) |

## Requirements

- PHP 8.3+
- Composer
- Node.js 20+
- MySQL 8+
- [Laravel Herd](https://herd.laravel.com) (recommended for local development)

## Installation

```bash
git clone https://github.com/your-org/open-charity.git
cd open-charity

composer install

cp .env.example .env
php artisan key:generate

# Configure your database in .env, then:
php artisan migrate --seed

php artisan shield:install --fresh
php artisan storage:link

npm install && npm run build
```

## Demo Credentials

Running `php artisan migrate --seed` creates an admin account and seeds the full dataset:

| Field | Value |
|---|---|
| Email | `admin@test.com` |
| Password | `123456789` |
| URL | `/admin` |

The seeder also creates: 5 case types, 5 assistance types, 10 families with 2–6 members each, 1–3 charity cases per family, visits, documents, assistance schedules with deliveries, donation targets, and donations.

## Development

Run all development services concurrently (server, queue, log tail, Vite):

```bash
composer run dev
```

Or use the quick setup script (install + migrate + build in one command):

```bash
composer run setup
```

## Domain Model

A **Family** is the central entity. Each family can have multiple **FamilyMembers** and one or more **CharityCases** opened against it. Each case tracks **Visits** (scheduled or completed), **AssistanceSchedules** (with individual **AssistanceDeliveries**), and **Documents**.

Fundraising works through **DonationTargets** (scoped to a family, case, or campaign). **Donations** are recorded against targets and then split via **DonationAllocations** that trace exactly which funds went to which family, case, or assistance schedule.

## Contributing

Pull requests are welcome. Please:

- Follow the existing code conventions (check sibling files before writing new code)
- Format PHP with Pint before submitting: `vendor/bin/pint`
- Wrap all user-facing strings with `__()`
- Use conventional commits (`feat:`, `fix:`, `refactor:`, etc.)
- Do not add inline comments unless the logic is genuinely non-obvious

## License

OpenCharity is open-sourced software licensed under the [MIT license](LICENSE).

## Credits

Built with [Laravel](https://laravel.com), [Filament](https://filamentphp.com), and the wider Laravel ecosystem.
