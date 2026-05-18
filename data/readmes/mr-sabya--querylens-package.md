# 🔍 QueryLens

**QueryLens** is a modern, lightweight, and high-performance API debugging and SQL profiling tool for Laravel. It provides a real-time dashboard to monitor your application's database activity and API performance without unnecessary complexity.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/querylens/querylens.svg?style=flat-square)](https://packagist.org/packages/querylens/querylens)
[![Total Downloads](https://img.shields.io/packagist/dt/querylens/querylens.svg?style=flat-square)](https://packagist.org/packages/querylens/querylens)

---

## ✨ Features

- ⚡ Zero-Configuration Setup
- 🛠 Deep SQL Query Profiling
- 📊 Real-Time Request Monitoring
- 🧠 Query Execution Time Analysis
- 🎨 Modern Dark UI Dashboard
- 📦 Dedicated SQLite Storage
- 🚀 Lightweight & Fast
- 🔥 Slow Query Detection
- 📱 Mobile Responsive Interface
- 🔍 Request & Response Inspection

---

## 💻 Requirements

| Requirement | Version |
|-------------|---------|
| PHP | ^8.2 |
| Laravel | ^10.0 \| ^11.0 \| ^12.0 |

---

## 📦 Installation

Install the package via Composer:

```bash
composer require mr-sabya/querylens
```

Run the installation command:

```bash
php artisan querylens:install
```

This command will:

- Publish configuration files
- Create QueryLens storage
- Prepare SQLite logging database
- Register required assets

---

## ⚙️ Configuration

After installation, configure QueryLens from:

```text
config/querylens.php
```

Example configuration:

```php
<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Enable QueryLens
    |--------------------------------------------------------------------------
    */

    'enabled' => env('QUERYLENS_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Dashboard URI
    |--------------------------------------------------------------------------
    */

    'uri' => 'querylens',

    /*
    |--------------------------------------------------------------------------
    | Slow Query Threshold (milliseconds)
    |--------------------------------------------------------------------------
    */

    'slow_query_threshold' => 500,

    /*
    |--------------------------------------------------------------------------
    | Middleware
    |--------------------------------------------------------------------------
    */

    'middleware' => [
        'web',
        // 'auth',
    ],

    /*
    |--------------------------------------------------------------------------
    | Maximum Stored Logs
    |--------------------------------------------------------------------------
    */

    'max_logs' => 5000,

];
```

---

## 🚀 Usage

Start your Laravel application:

```bash
php artisan serve
```

Open the dashboard in your browser:

```text
http://127.0.0.1:8000/querylens
```

QueryLens will automatically record:

- HTTP Requests
- API Calls
- SQL Queries
- Query Bindings
- Response Time
- Memory Usage
- Slow Queries
- Request Timeline

---

## 📊 Dashboard Preview

The dashboard includes:

### Request Monitoring
- HTTP Method
- Route Path
- Response Status
- Request Duration

### SQL Query Insights
- Raw SQL Query
- Query Bindings
- Execution Time
- Source File & Line

### Performance Analysis
- Memory Consumption
- Slow Query Alerts
- Duplicate Query Detection

---

## 🔥 Slow Query Detection

Queries slower than the configured threshold will automatically be highlighted.

Example:

```text
⚠ Slow Query Detected (842ms)
```

---

## 🗂 Storage

QueryLens uses a dedicated SQLite database for storing logs.

This keeps your primary application database clean and optimized.

---

## 🔐 Security

QueryLens is intended for local and development environments.

Disable it in production:

```env
QUERYLENS_ENABLED=false
```

You may also protect the dashboard using authentication middleware:

```php
'middleware' => [
    'web',
    'auth',
],
```

---

## 🧪 Example Query Log

```sql
select * from users where email = ?
```

Execution details:

```text
Duration: 12ms
Connection: mysql
Memory: 4MB
```

---

## 📁 Package Structure

```text
src/
├── Commands/
├── Facades/
├── Http/
│   ├── Controllers/
│   └── Middleware/
├── Listeners/
├── Models/
├── Providers/
├── Services/
├── Support/
├── resources/
│   ├── views/
│   ├── js/
│   └── css/
└── config/
```

---

## 🛠 Roadmap

- Live AJAX Auto Refresh
- Real-Time WebSocket Monitoring
- Redis Monitoring
- Queue Monitoring
- Exception Tracking
- Export Logs
- Multi-Project Support

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new feature branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

---

## 📄 License

This package is open-sourced software licensed under the MIT license.

---

## ⭐ Support

If you find QueryLens useful, consider starring the repository on GitHub.