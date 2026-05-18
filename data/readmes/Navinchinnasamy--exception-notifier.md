# Exception Notifier

A Laravel/Lumen package for sending email notifications when exceptions occur in your application.

## Features

- 📧 Email notifications for exceptions
- 🔄 Exception grouping to prevent spam
- ⏱️ Rate limiting
- 🎨 Beautiful HTML email templates
- 🔧 Configurable for different environments
- 📱 Mobile-friendly email design

## Installation

```bash
composer require navin/exception-notifier
```

## Configuration

Add to your `.env` file:

```env
EXCEPTION_NOTIFIER_ENABLED=true
EXCEPTION_NOTIFIER_TO=admin@example.com
EXCEPTION_NOTIFIER_FROM=no-reply@example.com
EXCEPTION_NOTIFIER_FROM_NAME="Exception Notifier"
EXCEPTION_NOTIFIER_GROUPING=true
APP_NAME=YourAppName
```

## Usage

### Register Exception Handler

In your `app/Exceptions/Handler.php`:

```php
public function report(Exception $exception)
{
    if (app()->bound('exception.notifier')) {
        app('exception.notifier')->send($exception, request());
    }
    
    parent::report($exception);
}
```

### Test Configuration

```bash
php artisan exception-notifier:test
```

## License

MIT License
