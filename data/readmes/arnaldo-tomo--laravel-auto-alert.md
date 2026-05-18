# Laravel Auto Alert

A powerful, zero-configuration notification package for Laravel. Automatically detect and elegantly display session flashes, validation errors, HTTP errors, and DELETE form confirmation prompts.

## Features

- **Zero Configuration:** Install it, and it just works. No traits, no model manipulation, no Blade manipulation.
- **Environment Driven:** Completely customizable from the `.env` file.
- **Auto-Detection:** Detects `$errors`, `session('success')`, `session('error')`, `session('warning')`, `session('info')`, HTTP status >= 400, and general Exceptions.
- **Confirm DELETE Form:** Automatically intercepts `POST` forms with `_method="DELETE"` and stops execution for a stylish confirmation dialog.
- **Beautiful Architecture:** Contains built-in Drivers for `Toast`, `SweetAlert`, `Alert`, and `Modal`.
- **Framework Native:** Respects your CSS framework (Tailwind CSS or Bootstrap 5), eliminating CSS conflicts without requiring compiled builds.

## Setup

Require the package using composer:
```bash
composer require arnaldo-tomo/laravel-auto-alert
```

Run the interactive installer prompt:
```bash
php artisan auto-alert:install
```

You will be asked: `Are you using Bootstrap or Tailwind CSS?`. The command will automatically publish the configuration and update `.env` file accordingly.

## Configuration (.env)

Customize your alerts globally through `.env`:

```env
AUTO_ALERT_DRIVER=toast       # toast, sweetalert, modal, alert
AUTO_ALERT_LAYOUT=tailwind    # tailwind, bootstrap
AUTO_ALERT_POSITION=top-right # top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
AUTO_ALERT_TIMEOUT=4000       # Display duration in ms
AUTO_ALERT_CONFIRM_DELETE=true
```

## How It Works

With Laravel Auto Alert installed, anywhere in your application you can trigger:

```php
// Success Toast/SweetAlert
request()->session()->flash('success', 'User saved successfully');

// Warning
return redirect()->back()->with('warning', 'Action is irreversible!');
```

HTTP Exceptions are also caught on the fly:
```php
abort(403, 'You do not have permission to view this resource.');
```

### Deleting Records
Your default Laravel form helper will automatically trigger the SweetAlert/Toast confirmation natively without extra javascript.
```html
<form action="/users/1" method="POST">
    @csrf
    @method('DELETE')
    <button type="submit">Delete User</button>
</form>
```
