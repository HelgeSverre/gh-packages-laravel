# Custom Fields Test App

Experimental Laravel application for testing the [Laravel Custom Fields](https://github.com/salaheldeen911/laravel-custom-fields) package.

## 🚀 Quick Start

### 1. Project Setup
```bash
git clone <repository-url>
cd custom-fields-app
composer install
```

### 2. Environment & Database
1. Copy `.env.example` to `.env`.
2. Create a MySQL database named `custom_fields_app` (as defined in `.env.example`).
3. Run migrations and generate key:
```bash
php artisan key:generate
php artisan migrate
```

### 3. Run Application
```bash
php artisan serve
```

---

## 📖 Documentation
The **Laravel Custom Fields** package is already installed. For full documentation on how to use it, field types, and API reference, please visit the official repository:

👉 **[salaheldeen911/laravel-custom-fields](https://github.com/salaheldeen911/laravel-custom-fields)**
