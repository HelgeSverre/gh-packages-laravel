# 📦 Laravel Go Reports (The Eloquent Tunnel)

[![Latest Version on Packagist](https://img.shields.io/packagist/v/pingslayer/laravel-go-reports.svg?style=flat-square)](https://packagist.org/packages/pingslayer/laravel-go-reports)
[![Total Downloads](https://img.shields.io/packagist/dt/pingslayer/laravel-go-reports.svg?style=flat-square)](https://packagist.org/packages/pingslayer/laravel-go-reports)
[![License](https://img.shields.io/packagist/l/pingslayer/laravel-go-reports.svg?style=flat-square)](https://packagist.org/packages/pingslayer/laravel-go-reports)

A professional-grade reporting package for Laravel that "Tunnels" complex Eloquent queries to an embedded Go service for high-speed JSON streaming.


---

## 🚀 Installation

1. **Require the package**:
```bash
composer require pingslayer/laravel-go-reports
```

2. **Publish the configuration**:
```bash
php artisan vendor:publish --provider="LaravelGoReports\LaravelGoReportsServiceProvider" --tag="config"
```

---

## 🏗 Requirements
- **PHP**: ^8.1
- **Laravel**: ^10.0 \| ^11.0 \| ^12.0 \| ^13.0
- **Database**: **MySQL ONLY** (MariaDB supported)

---
1. **Auto-Start**: When Laravel boots, it detects your OS and launches the bundled Go binary in the background.
2. **Auto-Init**: It sends your database credentials to the Go engine once to establish a connection pool.
3. **Tunneling**: When you call `JSONReport::fromEloquent($query)`, the package extracts the raw SQL and Bindings and sends them to Go for execution and streaming.

---

## 📖 Usage

### Using the Eloquent Tunnel
You can directly pipe either a **Laravel Model** or the **DB Facade** (Query Builder) into the engine. The Tunnel automatically extracts the underlying SQL and Bindings.

#### Option A: Using an Eloquent Model
```php
use LaravelGoReports\JSONReport;
use App\Models\User;

return JSONReport::fromEloquent(
    User::join('orders', 'users.id', '=', 'orders.user_id')
        ->where('orders.status', 'paid')
);
```

#### Option B: Using the DB Facade
```php
use LaravelGoReports\JSONReport;
use Illuminate\Support\Facades\DB;

return JSONReport::fromEloquent(
    DB::table('reports')->where('amount', '>', 500)
);
```

### Advanced: Passing Raw SQL & Bindings
```php
use LaravelGoReports\JSONReport;

return JSONReport::generate([
    'sql' => 'SELECT * FROM reports WHERE amount > ?',
    'bindings' => [500]
]);
```

---

## 🛠 Configuration (`config/report.php`)
```php
return [
    'auto_start' => env('REPORT_ENGINE_AUTO_START', true),
    'port'       => env('REPORT_ENGINE_PORT', 8081),
    'secret_key' => env('REPORT_ENGINE_SECRET', 'laravel-go-sync'),
];
```

---

## 🛡 Security
- The Go engine only permits `SELECT` statements.
- Any destructive SQL (DELETE, DROP, UPDATE) is strictly blocked by a regex validator.
- Database credentials are kept secure and shared with Go only during core initialization.

---

## 📄 License
MIT
