# VotAfrica

Modern business application intake and admin review platform built with Laravel 12 + Livewire.

VotAfrica delivers:

- Public-facing, no-signup application submission.
- SPA-like admin experience with Livewire navigation and reactive components.
- Advanced list management with search, archived tab, and multi-field filters.
- Soft-delete lifecycle (archive/restore) for safe record management.

## Highlights

- SPA feel across key flows using `wire:navigate` and Livewire components.
- Public submission form implemented as Livewire (`ApplicationForm`) with animated success feedback.
- Admin application list implemented as Livewire (`ApplicationsTable`).
- Admin list supports search, tabs, filter panel, pagination, detail navigation, and restore in archived view.
- Application detail page implemented as Livewire (`ApplicationDetail`).
- Detail page supports inline edit for `phone`, `business location`, `category`, and `capital range`.
- Detail page supports archive/restore actions and in-page status notices.
- Role-protected admin routes via `EnsureAdmin` middleware.

## Tech Stack

- PHP `^8.2`
- Laravel `^12`
- Livewire + Volt + Flux
- Tailwind CSS `v4`
- Vite `v6`
- SQLite/MySQL compatible Eloquent models

## Project Structure (Key Files)

- `app/Livewire/ApplicationForm.php`
- `app/Livewire/ApplicationsTable.php`
- `app/Livewire/ApplicationDetail.php`
- `app/Http/Controllers/ApplicationController.php`
- `app/Http/Middleware/EnsureAdmin.php`
- `resources/views/applications/create.blade.php`
- `resources/views/livewire/application-form.blade.php`
- `resources/views/livewire/applications-table.blade.php`
- `resources/views/livewire/application-detail.blade.php`
- `resources/views/components/layouts/app.blade.php`
- `routes/web.php`

## Getting Started

### 1. Clone + Install

```bash
git clone https://github.com/dericking01/votafrica.git
cd votafrica
composer install
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
php artisan key:generate
```

Configure DB in `.env`.

Example for SQLite:

```env
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database/database.sqlite
```

Then create database file if needed:

```bash
touch database/database.sqlite
```

### 3. Migrate + Seed

```bash
php artisan migrate --seed
```

Seeded admin user credentials:

- Email: `admin@example.com`
- Password: `password`

### 4. Run the App

Option A, one command for server + queue + Vite:

```bash
composer run dev
```

Option B, run processes manually:

```bash
php artisan serve
npm run dev
```

## Route Map

Public routes:

- `GET /` -> application form
- `POST /applications` -> create application (controller endpoint; Livewire form is primary UX)

Admin routes (auth + admin required):

- `GET /dashboard`
- `GET /applications`
- `GET /applications/{application}`

Auth routes are loaded from `routes/auth.php`.

## Core Workflows

### Public Application Submission

1. User fills public form on `/`.
2. Livewire validates and stores application.
3. Success message animates in and auto-clears.

### Admin Review

1. Admin logs in.
2. Opens `/applications` to review submissions.
3. Uses search, tabs, and filters to find records quickly.
4. Opens details page and edits fields inline.
5. Archives or restores records as needed.

## Admin List Features

- Search by organization, location, activity, phone, and category.
- Tabs: `Active` and `Archived`.
- Filter panel with status, category, capital range, date from, and date to.
- Archived-only restore action.
- Category label shorthand: `Small Entrepreneurs` displays as `SME` in the table UI.

## Detail Page Features

- Edit mode with save/cancel.
- Field validation for editable fields.
- Archive action for active records.
- Restore action for archived records.
- Status badges and contextual notices.

## Security and Access Control

- Admin pages are protected by auth middleware.
- Additional admin check is enforced by `EnsureAdmin` (`user.is_admin` must be true).
- Non-admin users receive `403` on admin endpoints.

## Useful Commands

```bash
# Clear all caches
php artisan optimize:clear

# Run tests
php artisan test

# Code style
./vendor/bin/pint
```

## Troubleshooting

If styles or Livewire interactions are not updating:

```bash
php artisan optimize:clear
npm run dev
```

If route/view cache appears stale:

```bash
php artisan route:clear
php artisan view:clear
php artisan config:clear
php artisan cache:clear
php artisan event:clear
```

## Testing Checklist

- Public form submit works and success state auto-clears.
- Admin login works with seeded credentials.
- Applications list search/tabs/filters return expected results.
- Archived tab shows restore action only where expected.
- Detail page inline edit updates DB correctly.
- Archive/restore lifecycle reflects in list and detail views.

## License

This project is open-sourced under the [MIT license](https://opensource.org/licenses/MIT).

