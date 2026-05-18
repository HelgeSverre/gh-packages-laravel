# Laravel Error Notifier

Automatically sends a beautifully formatted email whenever an unhandled exception occurs in your Laravel application.

Compatible with **Laravel 9, 10, 11, and 12**.

---

## Features

- Zero-config setup — works out of the box
- Add multiple recipient email addresses via config or `.env`
- Throttle duplicate error emails (configurable cool-down period)
- Ignore specific exception classes (404s, validation errors, etc.)
- Includes full context: exception details, request URL/method/input, authenticated user, stack trace
- Sensitive fields (passwords, tokens) are automatically masked
- Never crashes your application — all notifier errors are silently caught

---

## Installation

```bash
composer require saif/laravel-error-notifier
```

The service provider is auto-discovered via Laravel's package discovery. No manual registration needed.

### Publish the config file

```bash
php artisan vendor:publish --tag=error-notifier-config
```

This creates `config/error-notifier.php` in your application.

---

## Configuration

### Option 1 — via `.env` (quickest)

```env
ERROR_NOTIFIER_ENABLED=true
ERROR_NOTIFIER_RECIPIENTS=admin@example.com,dev@example.com
ERROR_NOTIFIER_FROM_ADDRESS=noreply@example.com
ERROR_NOTIFIER_FROM_NAME="My App Errors"
ERROR_NOTIFIER_SUBJECT_PREFIX=[ERROR]
ERROR_NOTIFIER_THROTTLE=5
```

### Option 2 — via `config/error-notifier.php`

```php
return [
    'enabled' => true,

    'recipients' => [
        'admin@example.com',
        'dev@example.com',
    ],

    'from' => [
        'address' => 'noreply@example.com',
        'name'    => 'Error Notifier',
    ],

    'subject_prefix' => '[ERROR]',

    // Exception classes that will NOT send an email
    'ignore' => [
        Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
        Illuminate\Validation\ValidationException::class,
    ],

    // Minutes before the same error can trigger another email (0 = disabled)
    'throttle_minutes' => 5,

    // Include sanitized request input in the email
    'include_input' => true,

    // Fields to mask in request input
    'hidden_fields' => ['password', 'token', 'secret'],
];
```

---

## Email Contents

Each notification email includes:

| Section | Details |
|---|---|
| **Exception** | Class, message, file, line number, code |
| **Application** | Environment, app URL, running context, PHP version |
| **Request** | Full URL, HTTP method, IP address, user agent, referer |
| **User** | Authenticated user ID, name, and email |
| **Input** | Sanitized request input (sensitive fields masked) |
| **Stack Trace** | Full exception stack trace |

---

## Customising the Email Template

Publish the views to customise the HTML email template:

```bash
php artisan vendor:publish --tag=error-notifier-views
```

The template will be copied to `resources/views/vendor/error-notifier/emails/error.blade.php`.

---

## Ignoring Exceptions

Add exception classes to the `ignore` array in the config. These will never send an email:

```php
'ignore' => [
    Illuminate\Auth\AuthenticationException::class,
    Illuminate\Validation\ValidationException::class,
    Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
    App\Exceptions\MyCustomException::class,
],
```

---

## Throttling

To prevent your inbox from being flooded during an outage, identical errors (same class + message) are throttled. The default is 5 minutes — set `throttle_minutes` to `0` to disable.

> Throttling uses Laravel's cache. Make sure your cache driver is not `array` in production.

---

## License

MIT — [Muhammad Saif Ullah](mailto:muhammadsaif.dev@gmail.com)
