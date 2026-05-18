# 📘 Alif Activity Log

A simple, customizable Laravel package to log and store user activity across your application. Perfect for auditing, tracking changes, and monitoring actions within modules.

---

## ✨ Features

- Logs authenticated user actions and request details
- Stores activity in a dedicated `activity_logs` table
- Supports parent-child log relationships
- Customizable logging behavior
- Easily extendable and minimalistic

---

## 📦 Requirements

- **PHP** `>=8.2`
- **Laravel** `^11.0 || ^12.0 || ^13.0`

---

## 🚀 Installation

```bash
composer require alifcoder/activity-log
```

---

## ⚙️ Configuration & Migration

Publish the configuration and migration with:

```bash
php artisan vendor:publish --tag=activity-log
```

This will publish:
- `config/activity-log.php`
- `database/migrations/xxxx_xx_xx_xxxxxx_create_activity_logs_table.php`

Then run the migration:

```bash
php artisan migrate
```

---

## 🧑‍💻 Usage

### Logging a manual activity

```php


ActivityLogger::log(new ActivityLogCreateDTO(
                log_type: 'custom',         // optional: log type
                user_id: 1,                 // optional: user_id
                url: 'http://example.com',  // optional: URL
                method: 'GET',              // optional: HTTP method
                request_body: '{}',         // optional: request body
                response_body: '{}',        // optional: response body
                ...                         // other parameters
        ));
```

## 🔀 Logging for Specific Routes

If you want the activity logger to run **only for selected routes**, you may attach the middleware manually:

```php
Route::post('/example', ExampleController::class)->middleware('activity_log');
```

---

## 🔐 Encrypted Request & Response Storage

All logged request and response bodies are stored as **encrypted files** for maximum data protection.

To read an encrypted stored file:

```php
use Alif\ActivityLog\Facades\FileStorage;

$content = FileStorage::readEncrypted($this->request_body);
```
---
## 🔑 Generating an Encryption Secret Key

Since request/response data is encrypted, the package requires a secret key.

Generate it using:

```bash
php artisan activity-log:generate-key
```

---
## 🌍 IP Address Details Sync

The package supports collecting additional information about user IP addresses, such as:

- Country
- City
- Coordinates
- ISP
- ASN
- and more

After installation, the package automatically registers a scheduled task:

```bash
php artisan activity-log:sync-ip-details
```
---

## 🧹 Pruning Old Logs

To automatically delete old or unnecessary logs, the package provides pruning support.

Add the following to your application's scheduler:

```php
$schedule->command('model:prune', [
    '--model' => [Alif\ActivityLog\Models\ActivityLog::class],
])->daily();
```

---

## 🧱 Table Structure: `activity_logs`

| Column       | Type    | Description                      |
|--------------|---------|----------------------------------|
| `id`         | UUID    | Primary key                      |
| `parent_id`  | UUID    | Link to parent log (optional)    |
| `log_type`   | String  | Type of action (e.g. create)     |
| `user_id`    | String  | Authenticated user ID            |
| `module`     | String  | App module or context            |
| `route`      | String  | Route name                       |
| `url`        | String  | Full URL accessed                |
| `model_id`   | String  | Related model ID (optional)      |
| `model_type` | String  | Related model class (optional)   |
| `user_agent` | Text    | Browser/user-agent string        |
| `created_at` | DateTime| When the log was created         |

---

## 🧹 Uninstall (Clean Up)

Run this command before removing the package:

```bash
php artisan activity-log:uninstall
```

It will:
- Roll back the migration (calls `down()`)
- Delete related migration files
- Remove the config file

Then remove the package:

```bash
composer remove alifcoder/activity-log
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 🪪 License

MIT License © [Shukhratjon Yuldashev](https://t.me/alif_coder)


---

## 📡 Automatic Logging for All Requests

To log **every request** made to your Laravel application, you can use the provided middleware and HTTP macro.

### ✅ 1. Register the Middleware

In your `app/Http/Kernel.php`, register the middleware globally or per group:

```php
protected $middleware = [
    // ...
    \Alif\ActivityLog\Http\Middleware\ActivityLogMiddleware::class,
];
```

This will automatically log incoming HTTP requests, including route, URL, method, and user info.

### ✅ 2. Log Outgoing HTTP Requests

The package extends Laravel’s `Http` client with a `loggable()` macro.

Example usage:

```php
use Illuminate\Support\Facades\Http;

$response = Http::loggable()->get('https://example.com/api/data');
```

This logs outgoing HTTP calls made by your application.

---

## 🧩 Customization

You can customize what gets logged, ignored routes/methods, and the database connection via:

```
config/activity-log.php
```

---

## 📫 Support

If you need help, feel free to contact [Shukhratjon Yuldashev on Telegram](https://t.me/alif_coder).
