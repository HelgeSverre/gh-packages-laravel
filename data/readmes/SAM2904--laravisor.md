# Laravisor

Laravisor is a Laravel-native error monitoring package that captures exceptions and sends instant email notifications directly from your application — with zero impact on application stability.

It works **out-of-the-box**, does **not require an API key**, and optionally integrates with the Laravisor Console for centralized error dashboards.

---

## ✨ Features

- Automatic exception capturing
- Instant email notifications
- Environment-based reporting
- Exception ignore list
- Safe, non-blocking execution
- Optional local database storage
- Optional Laravisor Console integration
- Laravel-first architecture

---

## 📋 Requirements

- PHP 8.1+
- Laravel 9.x / 10.x / 11.x
- Mail configuration (SMTP / Mailer)

---

## 📦 Installation

Install via Composer:

```bash
composer require laravisor/laravisor
````

---

## ⚙️ Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=laravisor-config
```

This will create:

```bash
config/laravisor.php
```

---

## 🧠 IMPORTANT: Register the Exception Handler

Laravisor requires you to **explicitly report exceptions** using its handler.

### Step 1️⃣ Open Laravel Exception Handler

```php
app/Exceptions/Handler.php
```

### Step 2️⃣ Add Laravisor reporting inside `register()` method

```php
use Sam\Laravisor\Exception\LaravisorExceptionHandler;

public function register(Throwable $e): void
{
    $this->reportable(function (Throwable $e) {
        LaravisorExceptionHandler::report($e);
    });

    parent::report($e);
}
```

⚠️ **This step is mandatory**.
Without this, Laravisor will NOT capture exceptions.

## 🔐 Required `.env` Variables

Laravisor requires the following environment variables to be defined in your application’s `.env` file.

```env
LV_ENABLED=true
LV_ENVIRONMENTS=local
LV_NOTIFY_EMAILS="test_one@org.in,test_two@org.in,test_three@org.in"
```

### Description

| Variable           | Required | Description                                                                                                  |
| ------------------ | -------- | ------------------------------------------------------------------------------------------------------------ |
| `LV_ENABLED`       | ✅ Yes    | Enables or disables Laravisor globally                                                                       |
| `LV_ENVIRONMENTS`  | ✅ Yes    | Comma-separated list of environments where Laravisor should capture errors (e.g. `production,staging,local`) |
| `LV_NOTIFY_EMAILS` | ✅ Yes    | Comma-separated list of email addresses to receive error notifications                                       |

⚠️ **Notes**

* If `LV_ENABLED=false`, Laravisor will not capture or notify errors.
* Errors are reported **only** when the current `APP_ENV` matches `LV_ENVIRONMENTS`.
* Email notifications depend entirely on `LV_NOTIFY_EMAILS`.

---

## ⚡ Quick Start (Email Notifications)

Once installed and handler is registered:

* Exceptions are captured automatically
* Emails are sent instantly
* No API key or dashboard setup required

Nothing else is required ✅

---

## 🛠 Configuration Example

```php
return [

    /*
    |--------------------------------------------------------------------------
    | Enable / Disable Laravisor
    |--------------------------------------------------------------------------
    */
    'enabled' => true,

    /*
    |--------------------------------------------------------------------------
    | Environments to Capture Errors
    |--------------------------------------------------------------------------
    */
    'environments' => ['production', 'staging', 'local'],

    /*
    |--------------------------------------------------------------------------
    | Notification Emails
    |--------------------------------------------------------------------------
    */
    'notify_emails' => [
        'dev@example.com',
    ],

    /*
    |--------------------------------------------------------------------------
    | Ignore Specific Exceptions
    |--------------------------------------------------------------------------
    */
    'ignore_exceptions' => [
        Illuminate\Auth\AuthenticationException::class,
        Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
    ],

];
```

---

## 🌐 Laravisor Console (Optional)

Laravisor Console is an **optional centralized dashboard** that allows you to:

* View grouped errors
* Inspect stack traces
* Track occurrences
* Resolve or ignore errors

🔑 **API key is required only for Console integration**
📧 **Email notifications work without any key**

> If Console is not configured, Laravisor continues to work normally.

---

## 🛡 Safety & Stability Guarantees

Laravisor is designed to **never break your application**:

* All internal operations are wrapped in `try/catch`
* Network failures are silently ignored
* Email failures never affect requests
* Safe for queues, cron jobs, and schedulers

---

## 👨‍💻 Author

**Developed by Sudhanshu Mittal**

* GitHub: [https://github.com/sam2904](https://github.com/sam2904)
* LinkedIn: [https://www.linkedin.com/in/sudhanshu-mittal](https://www.linkedin.com/in/sudhanshu-mittal)

---

## 📄 License

MIT License © Laravisor


