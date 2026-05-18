# graystackit/laravel-dymo-printer

A Laravel package for DYMO LabelWriter printer integration with Alpine.js and Livewire support. Provides printer selection persistence, REST API endpoints, and an event-driven JavaScript bridge to the official DYMO JavaScript Framework SDK.

## Requirements

- PHP 8.3+
- Laravel 11, 12, or 13
- [DYMO Connect](https://www.dymo.com/support/dymo-connect-for-desktop-download.html) installed on client machines
- Livewire 3.x *(optional — only needed for the Livewire printer-select component)*

## Installation

### 1. Install via Composer

```bash
composer require graystackit/laravel-dymo-printer
```

The package auto-registers via Laravel's service provider discovery — no manual registration needed.

### 2. Publish Configuration *(optional)*

```bash
php artisan vendor:publish --tag=dymo-printer-config
```

### 3. Migrate *(database driver only)*

Only required if you plan to use the `database` state driver:

```bash
php artisan vendor:publish --tag=dymo-printer-migrations
php artisan migrate
```

---

## Configuration

| Key | Default | Description |
|-----|---------|-------------|
| `state_driver` | `session` | How printer selection is persisted: `session`, `cache`, or `database` |
| `session_key` | `dymo_printer_name` | Session array key (session driver only) |
| `cache_prefix` | `dymo_printer` | Cache key prefix (cache driver only) |
| `cache_ttl` | `7776000` | Cache TTL in seconds — 90 days (cache driver only) |
| `device_cookie_name` | `dymo_device_uuid` | Cookie name used to identify a device/browser |
| `templates_path` | `resource_path('labels')` | Base directory for `.dymo` template files |
| `sdk_url` | DYMO CDN | URL to the DYMO JavaScript Framework SDK |
| `auto_load_scripts` | `false` | Auto-include scripts inside the Livewire component |
| `route_prefix` | `dymo-printer` | URL prefix for all package routes |
| `route_middleware` | `['web']` | Middleware applied to all package routes |

---

## State Drivers

### Session *(default)*

No setup required. Selections are tied to the user's PHP session.

```env
DYMO_STATE_DRIVER=session
```

### Cache

Selections survive session expiry. Good for browser-specific persistence across sessions.

```env
DYMO_STATE_DRIVER=cache
```

### Database

Selections are stored in the `dymo_printers` table, keyed by device UUID. Best for multi-device environments where you want a permanent record per device.

```env
DYMO_STATE_DRIVER=database
```

Publish and run the migration before using this driver (see Installation step 3).

---

## Usage

### 1. Include the DYMO Scripts

Add the scripts component in your layout, before the closing `</body>` tag:

```blade
<x-dymo-printer::scripts />
```

Or use the Blade directive shorthand:

```blade
@dymoscripts
```

To self-host the SDK instead of loading it from DYMO's CDN, set `sdk_url` in your config.

### 2. Printer Selection UI

#### Standalone Alpine.js *(no Livewire required)*

```blade
<x-dymo-printer::scripts />
<x-dymo-printer::printer-select />
```

The component uses the REST API (`/dymo-printer/printer`) and stores the selection via the configured state driver. It lazy-loads the printer list on first focus.

#### Livewire Component

```blade
<livewire:dymo-printer::printer-select />
```

If `auto_load_scripts` is `false` (the default), include scripts manually in your layout:

```blade
<x-dymo-printer::scripts />
<livewire:dymo-printer::printer-select />
```

Both components dispatch a `dymo-printer-saved` browser event when the user saves their selection.

### 3. Printing Labels

#### Single Label *(from a Livewire component)*

```php
use GraystackIT\DymoPrinter\Facades\DymoPrinter;

public function printLabel(): void
{
    $this->dispatch(...DymoPrinter::forPrint(
        templateUrl: DymoPrinter::templateUrl('shipping-label.dymo'),
        data: ['RecipientName' => 'John Doe', 'Address' => '123 Main St'],
    ));
}
```

Convenience method equivalent:

```php
DymoPrinter::printViaLivewire($this, DymoPrinter::templateUrl('shipping-label.dymo'), [
    'RecipientName' => 'John Doe',
    'Address'       => '123 Main St',
]);
```

#### Batch Print *(from a Livewire component)*

```php
DymoPrinter::batchViaLivewire($this, DymoPrinter::templateUrl('shipping-label.dymo'), [
    ['RecipientName' => 'John Doe',   'Address' => '123 Main St'],
    ['RecipientName' => 'Jane Smith', 'Address' => '456 Oak Ave'],
]);
```

#### Using a Specific Printer

Pass a printer name as the last argument to override the stored selection:

```php
DymoPrinter::printViaLivewire($this, $url, $data, printerName: 'DYMO LabelWriter 450');
```

### 4. Label Templates

Place `.dymo` template files in `resources/labels/` (or the path set in `templates_path`). Templates are created with the free [DYMO Connect](https://www.dymo.com/support/dymo-connect-for-desktop-download.html) desktop app.

Generate a secure URL to serve a template:

```php
DymoPrinter::templateUrl('shipping-label.dymo');
// → https://your-app.test/dymo-printer/templates/shipping-label.dymo
```

The template endpoint is protected against path traversal — only `.dymo` files within the configured `templates_path` are served.

### 5. Programmatic State Management

```php
use GraystackIT\DymoPrinter\Facades\DymoPrinter;

DymoPrinter::set('DYMO LabelWriter 450');  // Save printer selection
DymoPrinter::get();                         // Get selected printer (or null)
DymoPrinter::has();                         // true if a printer is selected
DymoPrinter::clear();                       // Remove printer selection
```

All methods accept an optional `$deviceId` parameter to target a specific device explicitly.

### 6. Helper Functions

```php
dymo_printer();               // Get the currently selected printer name (or null)
dymo_has_printer();           // Whether a printer has been selected (bool)
dymo_template_url($filename); // Generate the URL for a .dymo template file
```

---

## Browser Events

### Events the Package Listens For

Dispatch these from Livewire or anywhere in your JavaScript to trigger a print:

| Event | Payload | Description |
|-------|---------|-------------|
| `dymo:print` | `{ printer, template, data }` | Print a single label |
| `dymo:print-batch` | `{ printer, template, labels }` | Print multiple labels in one batch |

### Events the Package Dispatches

| Event | Payload | Description |
|-------|---------|-------------|
| `dymo:print-success` | `{ printer, count? }` | Fired after a successful print |
| `dymo:print-error` | `{ error: string }` | Fired after a print failure (check DYMO Connect is running) |
| `dymo-printer-saved` | — | Fired when the user saves their printer selection |

#### Listening in Alpine.js

```html
<div x-on:dymo:print-success.window="console.log('Printed!', $event.detail)"></div>
```

#### Listening in Livewire 3

```php
#[On('dymo-printer-saved')]
public function onPrinterSaved(): void
{
    // Refresh any printer-dependent state
}
```

---

## Multi-Device Support

The package identifies devices via a UUID cookie (`dymo_device_uuid` by default). Set this cookie in your frontend once per browser so each device maintains its own printer selection:

```javascript
if (!document.cookie.includes('dymo_device_uuid')) {
    const uuid = crypto.randomUUID();
    document.cookie = `dymo_device_uuid=${uuid}; path=/; max-age=${60 * 60 * 24 * 365}`;
}
```

The `cache` and `database` drivers are recommended for multi-device environments.

---

## Publishing Assets

```bash
# Configuration file
php artisan vendor:publish --tag=dymo-printer-config

# Blade views (to customise the printer-select component)
php artisan vendor:publish --tag=dymo-printer-views

# JavaScript (to self-host dymo-system.js)
php artisan vendor:publish --tag=dymo-printer-assets

# Database migration
php artisan vendor:publish --tag=dymo-printer-migrations
```

---

## Testing

Install dev dependencies and run the test suite:

```bash
composer install
./vendor/bin/pest
```

Run a specific test file:

```bash
./vendor/bin/pest tests/Unit/Drivers/SessionDriverTest.php
```

---

## License

MIT
