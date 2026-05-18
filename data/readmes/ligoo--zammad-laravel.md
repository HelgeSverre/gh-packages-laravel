# Zammad Laravel

A Laravel package for integrating contact forms with the [Zammad](https://zammad.org/) ticketing system.

## Features

- **Easy Integration**: Drop-in contact form that creates tickets in Zammad
- **Flexible CAPTCHA**: Support for Google reCAPTCHA v3, Cloudflare Turnstile, or disabled
- **8-Layer Spam Protection**: Rate limiting, honeypot, form timer, keyword detection, and more
- **Multiple Frameworks**: Blade, React, and Vue.js components included
- **Customizable Views**: Framework-agnostic styling with CSS variables
- **Full Configuration**: All options via config file with env variable support

## Requirements

- PHP 8.1+
- Laravel 10.x, 11.x, or 12.x
- Zammad instance with API access

## Installation

```bash
composer require ligoo/zammad-laravel
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=zammad-config
```

Add the following to your `.env` file:

```env
# Required
ZAMMAD_URL=https://your-zammad-instance.com
ZAMMAD_TOKEN=your-api-token-here
ZAMMAD_DEFAULT_GROUP=1

# Optional - CAPTCHA (choose one)
ZAMMAD_CAPTCHA_DRIVER=none  # or: recaptcha_v3, turnstile

# For reCAPTCHA v3
RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key

# For Cloudflare Turnstile
TURNSTILE_SITE_KEY=your-site-key
TURNSTILE_SECRET_KEY=your-secret-key
```

### Getting a Zammad API Token

1. Log into Zammad as admin
2. Go to **Admin → API → Personal Access Tokens**
3. Create a new token with permissions:
   - `ticket.agent` (to create/update tickets)
   - `admin` (recommended for full API access)

### Setting Up the API User

The user who owns the API token must have **group access** to create tickets:

1. Go to **Admin → Manage → Users**
2. Find the user who created the API token
3. Edit the user and go to **Group permissions**
4. Add your target group with **full** access
5. Save

> **Important:** Token permissions alone are not enough. The user must also have explicit group access in their user profile.

### Finding Your Group ID

1. Go to **Admin → Manage → Groups**
2. Click on the group you want to use
3. The ID is in the URL: `/manage/groups/38` → ID is `38`

### Testing Your Configuration

After setup, verify everything works:

```bash
php artisan zammad:test
```

This command tests:
- API connectivity
- Token validity
- User permissions
- Group access
- Ticket creation

If any test fails, the output will explain what's wrong.

## Usage

### Blade (Default)

The package automatically registers routes at `/contact`. Visit `/contact` to see the form.

Include in your own layout:

```blade
@extends('layouts.app')

@section('content')
    <div class="container">
        <h1>Get in Touch</h1>
        @include('zammad::contact')
    </div>
@endsection
```

Add the stylesheet to your layout's `<head>`:

```html
<link rel="stylesheet" href="{{ asset('vendor/zammad/css/zammad-contact.css') }}">
```

Publish assets:

```bash
php artisan vendor:publish --tag=zammad-assets
```

### React

Publish the React component:

```bash
php artisan vendor:publish --tag=zammad-react
```

This copies `ZammadContactForm.tsx` to `resources/js/vendor/zammad/react/`.

**Step 1:** Disable the package's GET route (so you can use your own Inertia page):

```env
ZAMMAD_ROUTES_GET=false
```

**Step 2:** Create your Inertia route and controller:

```php
// routes/web.php
Route::get('/contact', [ContactController::class, 'contact'])->name('contact.form');

// In your controller
use Ligoo\ZammadLaravel\Http\Controllers\ContactController as ZammadController;

public function contact()
{
    return Inertia::render('Contact', [
        'contactConfig' => ZammadController::getFormConfig(),
    ]);
}
```

**Step 3:** Ensure your layout has the CSRF meta tag (required for form submission):

```html
<meta name="csrf-token" content="{{ csrf_token() }}">
```

> **Note:** Inertia.js apps typically include this by default. Check your `app.blade.php`.

Use in your React component:

```tsx
import ZammadContactForm from './vendor/zammad/react/ZammadContactForm';

function ContactPage({ contactConfig }) {
    return (
        <ZammadContactForm
            config={contactConfig}
            onSuccess={(response) => console.log('Success:', response.message)}
        />
    );
}
```

#### React Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `ContactFormConfig` | Yes | Form configuration from `ContactController::getFormConfig()` |
| `submitUrl` | `string` | No | Submit URL (default: `/contact`) |
| `url` | `string` | No | Optional URL to attach to the ticket |
| `onSuccess` | `function` | No | Callback on successful submission |
| `onError` | `function` | No | Callback on validation errors |
| `className` | `string` | No | Additional CSS classes |

### Vue.js

Publish the Vue component:

```bash
php artisan vendor:publish --tag=zammad-vue
```

This copies `ZammadContactForm.vue` to `resources/js/vendor/zammad/vue/`.

Follow the same setup as React (disable GET route, create your Inertia route).

Use in your Vue component:

```vue
<script setup>
import ZammadContactForm from './vendor/zammad/vue/ZammadContactForm.vue';

// Config from your backend (Inertia props, etc.)
const props = defineProps(['contactConfig']);
</script>

<template>
    <ZammadContactForm
        :config="contactConfig"
        @success="(response) => console.log('Success:', response.message)"
    />
</template>
```

#### Vue Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `ContactFormConfig` | Yes | Form configuration from `ContactController::getFormConfig()` |
| `submitUrl` | `string` | No | Submit URL (default: `/contact`) |
| `url` | `string` | No | Optional URL to attach to the ticket |
| `className` | `string` | No | Additional CSS classes |

#### Vue Events

| Event | Payload | Description |
|-------|---------|-------------|
| `success` | `{ message }` | Emitted on successful submission |
| `error` | `{ [field]: string[] }` | Emitted on validation errors |

## Route Configuration

Routes use generic names to keep your backend technology hidden:

- **URL**: `/contact`
- **Route names**: `support.contact.form`, `support.contact.submit`

Customize in your `.env`:

```env
# Change route name prefix (default: support.)
ZAMMAD_ROUTE_NAME_PREFIX=myapp.

# Change URL prefix (default: contact)
ZAMMAD_ROUTES_PREFIX=help
```

### Inertia / SPA Setup

For Inertia, React, or Vue.js apps, disable only the GET route so you can define your own page while keeping the package's POST handler:

```env
ZAMMAD_ROUTES_GET=false
```

Then in your routes file:

```php
use Ligoo\ZammadLaravel\Http\Controllers\ContactController;

// Your Inertia page
Route::get('/contact', function () {
    return Inertia::render('Contact', [
        'contactConfig' => ContactController::getFormConfig(),
    ]);
})->name('contact.form');

// The package's POST route is still registered automatically at /contact
```

### Manual Route Registration

To fully control all routes, disable auto-routes:

```env
ZAMMAD_ROUTES_ENABLED=false
```

Register manually:

```php
use Ligoo\ZammadLaravel\Http\Controllers\ContactController;

Route::get('/contact', [ContactController::class, 'create'])->name('contact.form');
Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('zammad.throttle')
    ->name('contact.submit');
```

## Configuration Options

### CAPTCHA Drivers

| Driver | Description |
|--------|-------------|
| `none` | Disabled (default) |
| `recaptcha_v3` | Google reCAPTCHA v3 (invisible, score-based) |
| `turnstile` | Cloudflare Turnstile (privacy-focused) |

### Spam Protection

The package includes 8 layers of spam protection:

1. **Rate Limiting (Middleware)** - 5 attempts per 60 seconds
2. **Rate Limiting (Cache)** - 2 minute cooldown after submission
3. **CAPTCHA** - Configurable provider
4. **Honeypot Field** - Hidden field that must remain empty
5. **Form Timer** - Minimum 3 seconds before submission
6. **Spam Keywords** - Blocks messages with blacklisted words
7. **URL Count** - Blocks messages with too many URLs
8. **Confirmation Checkbox** - User must confirm

### Customizing Subject Options

Edit `config/zammad.php`:

```php
'form' => [
    'subjects' => [
        'sales' => 'Sales Inquiry',
        'support' => 'Technical Support',
        'billing' => 'Billing Question',
    ],
],
```

## CSS Customization

The CSS uses CSS variables for easy theming. Override in your own stylesheet:

```css
:root {
    --zammad-primary: #your-brand-color;
    --zammad-primary-hover: #your-hover-color;
    --zammad-radius: 0.5rem;
}
```

Available variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `--zammad-primary` | `#2563eb` | Primary button/accent color |
| `--zammad-primary-hover` | `#1d4ed8` | Hover state |
| `--zammad-error` | `#dc2626` | Error messages |
| `--zammad-success` | `#16a34a` | Success messages |
| `--zammad-text` | `#1f2937` | Text color |
| `--zammad-border` | `#e5e7eb` | Border color |
| `--zammad-radius` | `0.375rem` | Border radius |

## Localization

The package includes translations for 13 languages:

| Code | Language |
|------|----------|
| `en` | English |
| `fr` | French |
| `de` | German |
| `it` | Italian |
| `es` | Spanish |
| `pt` | Portuguese |
| `nl` | Dutch |
| `no` | Norwegian |
| `sv` | Swedish |
| `da` | Danish |
| `fi` | Finnish |
| `hu` | Hungarian |
| `pl` | Polish |

The package automatically uses Laravel's current locale (`app()->getLocale()`).

### Customizing Translations

Publish the translation files to customize:

```bash
php artisan vendor:publish --tag=zammad-lang
```

This copies files to `lang/vendor/zammad/`. Edit the files in your preferred language.

### Adding New Languages

Create a new file at `lang/vendor/zammad/{locale}/zammad.php` following the structure of the English file.

## Publishing Assets

```bash
# Config only
php artisan vendor:publish --tag=zammad-config

# Blade views
php artisan vendor:publish --tag=zammad-views

# CSS assets
php artisan vendor:publish --tag=zammad-assets

# Translations
php artisan vendor:publish --tag=zammad-lang

# React component
php artisan vendor:publish --tag=zammad-react

# Vue component
php artisan vendor:publish --tag=zammad-vue

# All JS components (React + Vue)
php artisan vendor:publish --tag=zammad-components
```

## Facades

### Zammad Facade

```php
use Ligoo\ZammadLaravel\Facades\Zammad;

// Check if enabled
Zammad::isEnabled();

// Create a ticket programmatically
Zammad::createTicket([
    'email' => 'customer@example.com',
    'name' => 'John Doe',
    'subject' => 'Help needed',
    'message' => '<p>I need assistance...</p>',
]);

// Add a note to a ticket
Zammad::addTicketNote($ticketId, '<p>Internal note</p>', internal: true);
```

### Captcha Facade

```php
use Ligoo\ZammadLaravel\Facades\Captcha;

// Get current driver
$driver = Captcha::driver();

// Verify a token
$result = Captcha::driver()->verify($token, $ip);

if ($result->passed()) {
    // Valid
}
```

## Troubleshooting

### 403 Forbidden when creating tickets

**Symptom:** `php artisan zammad:test` passes connectivity tests but fails on ticket creation with 403.

**Cause:** The API user doesn't have access to the configured group.

**Fix:**
1. Run `php artisan zammad:test` to see which groups the user has access to
2. Go to **Admin → Manage → Users** in Zammad
3. Edit the API user and add the target group with **full** access

### 422 Unprocessable Entity

**Symptom:** Ticket creation fails with 422 error.

**Cause:** Invalid data being sent (wrong group ID, invalid customer, etc.)

**Fix:**
1. Verify `ZAMMAD_DEFAULT_GROUP` is a valid group ID
2. Run `php artisan zammad:test` to see available groups

### 419 Page Expired (CSRF token mismatch)

**Symptom:** React/Vue form submission fails with 419 error.

**Cause:** Missing CSRF meta tag in your layout.

**Fix:** Add to your layout's `<head>`:
```html
<meta name="csrf-token" content="{{ csrf_token() }}">
```

### Translations showing as keys

**Symptom:** Form shows `zammad::zammad.contact.title` instead of actual text.

**Cause:** Translation files not loaded or published incorrectly.

**Fix:**
```bash
php artisan vendor:publish --tag=zammad-lang --force
php artisan cache:clear
```

## Testing

```bash
composer test
```

## Disclaimer

This package is an **independent, community-developed project**. It is NOT affiliated with, endorsed by, or officially connected to Zammad GmbH, Laravel LLC, Google LLC, Cloudflare Inc., or any of their products.

**No Warranty:** The authors are not liable for any loss of messages, data, communications, security vulnerabilities, or any other issues that may occur through the use of this software. Users are responsible for:
- Verifying ticket creation and message delivery
- Conducting their own security audits
- Implementing appropriate backup and security measures

See [LICENSE](LICENSE) for full terms.

## License

MIT License. See [LICENSE](LICENSE) for details.
