# 🚀 Laravel 12 Starter – Breeze + Livewire + Spatie Permissions

A modern Laravel 12 starter project using:

- Laravel Breeze (authentication scaffolding)
- Livewire (dynamic UI)
- Spatie Laravel Permission (roles & permissions)
- Example feature: **Machine Management System (CRUD + Soft Deletes)**

This project is designed for **aspiring Laravel developers** who want to learn a production-grade setup that mirrors real-world systems.

---

## 📦 Tech Stack

- PHP 8.2+
- Laravel 12
- Laravel Breeze
- Livewire
- Spatie Laravel Permission
- MySQL / MariaDB
- Node.js 18+

---

## 🎯 Features

- Login & Registration
- Role & Permission System
- Machine Management
  - Create
  - Edit
  - View
  - Soft Delete
- Permission-protected routes
- Livewire page components

---

## 🛠 Installation

### 1️⃣ Create Project

```bash
composer create-project laravel/laravel machine-system
cd machine-system
```

### 2️⃣ Environment Setup

```bash
cp .env.example .env
php artisan key:generate
```

Edit
```bash
.env
```

```bash
DB_DATABASE=machine_system
DB_USERNAME=root
DB_PASSWORD=
```

```bash
php artisan migrate
```

### 🔐 Install Breeze + Livewire

```bash
composer require laravel/breeze --dev
php artisan breeze:install livewire
npm install
npm run build
php artisan migrate
```

Run app
```bash
php artisan serve
```

### 🛡 Install Spatie Permissions

```bash
composer require spatie/laravel-permission
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan migrate
```

### Add Trait to User Model

```bash
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles;
}
```

### 🧱 Register Spatie Middleware (Laravel 12)

Open

```bash
bootstrap/app.php
```

Inside

```bash
->withMiddleware(function (Middleware $middleware) {
```

Add:

```bash
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

$middleware->alias([
    'role' => RoleMiddleware::class,
    'permission' => PermissionMiddleware::class,
    'role_or_permission' => RoleOrPermissionMiddleware::class,
]);
```
