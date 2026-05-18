![Tests](https://github.com/parthokar90/admin-core/actions/workflows/ci-package.yml/badge.svg)

![License](https://img.shields.io/badge/license-MIT-blue.svg)

# Admin Core

**Admin Core** is a Laravel package that provides a ready-to-use admin dashboard with authentication, role and permission management, and user management foundation.  
Installable via Composer, it allows developers to quickly integrate a powerful admin panel into any Laravel 12+ project.

---

##  Features (v1.0)
- Laravel 12 compatible
- Admin authentication (login page + dashboard)
- Package auto-discovery with Service Provider
- Config publish (`config/admin-core.php`)
- Routes, Views, and Migrations included
- Prepares foundation for Role & Permission management

---

## Installation

### 1. Require the package via Composer (local or GitHub)
```bash
composer require parthokar/admin-core
```

### Artisan Commands

Install Admin-Core and create default admin:

Creates default admin user

Creates default roles & permissions

Runs package migrations

```bash
php artisan admin-core:install
```

## Publish config (optional)

1: Config Publish

```bash
php artisan vendor:publish --tag=admin-core-config
```

2: views Publish

```bash
php artisan vendor:publish --tag=admin-core-views
```

3: Routes Publish

```bash
php artisan vendor:publish --tag=admin-core-routes
```

4: Migrations Publish

```bash
php artisan vendor:publish --tag=admin-core-migrations
```

### Configuration
1. Auth Guard

Open config/auth.php in your Laravel project and add:

```bash
'guards' => [
    'admin' => [
        'driver' => 'session',
        'provider' => 'admins',
    ],
],

'providers' => [
    'admins' => [
        'driver' => 'eloquent',
        'model' => ParthoKar\AdminCore\Models\Admin::class,
    ],
],
```

---

Routes

/admin/login → Admin login page

/admin/dashboard → Admin dashboard (protected by auth:admin)

/admin/logout → Logout

## Run the project
```bash
php artisan serve
```
## Visit Url
```bash
http://localhost:8000/admin/login
http://localhost:8000/admin/dashboard
```

---
Default admin credentials
email: admin@email.com
password: password123
