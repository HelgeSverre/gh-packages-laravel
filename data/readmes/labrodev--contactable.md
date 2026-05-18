# Labrodev Contactable

A configurable Livewire contact form for Laravel with optional model persistence and pluggable notify channels (mail, log, webhook).

## Requirements

- PHP 8.2+
- Laravel 12+
- Livewire 4+

## Installation

Install via Composer:

```bash
composer require labrodev/contactable
```

Then run `composer update labrodev/contactable`.

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=contactable-config
```

Edit `config/contactable.php`:

| Key | Description |
|-----|-------------|
| **fields** | Array of field definitions: `key`, `type`, `label`, `placeholder`, `rules`, `messages`. Use translation keys (e.g. `contactable::fields.name.label`) or your own keys; the view passes them through `__()` at render time. |
| **model** | Optional Eloquent model FQCN to store submissions (e.g. `App\Models\ContactRequest`). Set to `null` to skip persistence. |
| **notify** | Channel (`mail`, `log`, or `webhook`) and channel-specific options (mail to address, webhook URL, log path). |
| **success_message** | Flash message after a successful submit (translation key or literal string). |
| **submit_button_text** / **submit_loading_text** | Button labels (translation key or literal string). |
| **redirect_route** | Named route to redirect to after submit (e.g. `'contact'`). Omit or `null` to stay on the current page. |

## Usage

In your layout, include Livewire scripts and styles (`@livewireScripts`, `@livewireStyles`, or the Livewire stack). Then drop in the form with the Blade component:

```blade
<x-contactable />
```

Or use the Livewire component directly:

```blade
<livewire:contactable::contactable />
```

## View customization

Publish the views to match your design system:

```bash
php artisan vendor:publish --tag=contactable-views
```

Edit:

- `resources/views/vendor/contactable/livewire/contactable.blade.php` – Form markup and styling.
- `resources/views/vendor/contactable/components/contactable.blade.php` – Wrapper (e.g. card, grid).

Published views override the package defaults.

## Translations

All user-facing text (labels, placeholders, validation messages, success message, button text) is translated via Laravel’s `__()` helper at render time. Config holds **translation keys** (or literal strings); the view and component pass them through `__()` so the current locale is used.

### Package lang (default)

The package ships with English in `resources/lang/en.php` under the `contactable::` namespace. The default config uses keys such as:

- `contactable::fields.name.label`, `contactable::fields.name.placeholder`, `contactable::fields.name.required`, `contactable::fields.name.max`
- `contactable::fields.email.*`, `contactable::fields.message.*`
- `contactable::success_message`, `contactable::submit_button_text`, `contactable::submit_loading_text`

### Adding or overriding translations

**Option 1 – Publish and edit package lang**

```bash
php artisan vendor:publish --tag=contactable-lang
```

This copies the package lang to `lang/vendor/contactable/`. Edit `en.php` or add a new locale (e.g. `ua.php`, `de.php`) with the same structure. Laravel will use the correct file based on `config('app.locale')` (and fallback locale).

**Option 2 – Use your own keys**

In `config/contactable.php` (after publishing config), set labels, messages, and button text to your own translation keys (e.g. `'label' => 'contact.form.name'`, `'success_message' => 'contact.form.success_message'`). The view and component still call `__()` on these values, so your app’s lang files (e.g. `lang/en.json`, `lang/ua.json`) are used. No need to publish the package lang if you rely entirely on your own keys.

## Optional model persistence

If you set `contactable.model` to an Eloquent model class, the package will create a record on each submission. Your model should have fillable (or guarded) attributes matching the field keys (e.g. `name`, `email`, `message`). Create your own migration for the table; the package does not ship one.

## Notify channels

Built-in channels:

- **mail** – Sends an email to `contactable.notify.mail.to` (env: `CONTACTABLE_MAIL_TO` or falls back to `MAIL_FROM_ADDRESS`).
- **log** – Appends a line to a log file (default `storage/logs/contact-submissions.log`; path configurable).
- **webhook** – POSTs the submission JSON to `contactable.notify.webhook.url` (env: `CONTACTABLE_WEBHOOK_URL`). Timeout is configurable.

### Custom channels

Implement `Labrodev\Contactable\Contracts\NotifierChannel` (single method: `send(ContactableData $data): void`), then register it in config:

```php
// config/contactable.php
'notify' => [
    'channel' => 'postmark',
    'channels' => [
        'postmark' => \App\ContactChannels\PostmarkChannel::class,
    ],
    // ... mail, log, webhook options as needed
],
```

Your class is resolved from the container (you can inject dependencies). The package merges your `channels` with the built-in ones, so you can override or add channels (e.g. `postmark`, `telegram`).

## Development

From the package root (e.g. after cloning or in a path repo):

```bash
composer install
composer test
composer pint
composer stan
```

## License

MIT. See [LICENSE.md](LICENSE.md).
