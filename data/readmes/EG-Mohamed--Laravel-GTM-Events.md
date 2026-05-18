# Laravel GTM Events

[![Latest Version on Packagist](https://img.shields.io/packagist/v/eg-mohamed/laravel-ga4-events.svg?style=flat-square)](https://packagist.org/packages/eg-mohamed/laravel-ga4-events)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/eg-mohamed/laravel-ga4-events/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/eg-mohamed/laravel-ga4-events/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/eg-mohamed/laravel-ga4-events/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/eg-mohamed/laravel-ga4-events/actions?query=workflow%3A%22Fix+PHP+code+style+issues%22+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/eg-mohamed/laravel-ga4-events.svg?style=flat-square)](https://packagist.org/packages/eg-mohamed/laravel-ga4-events)

Push events to Google Tag Manager's `dataLayer` and Meta Pixel from Laravel, Livewire, and plain JavaScript through one unified bridge. The package injects the tracking snippets, validates payloads, and provides browser-side debug output through `console.log`.

## Features

- Push events to `window.dataLayer` for GTM to handle
- Auto-injects the GTM container snippet
- Auto-injects the Meta Pixel base snippet
- Client-side payload validation before pushing
- Works from JavaScript, DOM custom events, and Livewire
- Blade component and directive for easy layout injection
- Console debug output

## Compatibility

- PHP: `^8.3`
- Laravel: `12.x`, `13.x`

## Installation

```bash
composer require eg-mohamed/laravel-ga4-events
```

Publish the config:

```bash
php artisan vendor:publish --tag="ga4-events-config"
```

## Quick Start

1) Set your GTM container ID in `.env`:

```dotenv
GTM_CONTAINER_ID=GTM-XXXXXXX
GTM_EVENTS_ENABLED=true
```

Optional Meta Pixel support:

```dotenv
META_PIXEL_ID=123456789012345
META_PIXEL_INJECT_SCRIPT=true
```

2) Inject the bridge once in your layout (before `</body>`):

```blade
<x-ga4-events />
```

Legacy directive also works:

```blade
@ga4Events
```

3) Push events from JavaScript:

```js
window.GTMEvents.track('purchase_started', {
    currency: 'USD',
    value: 99.95,
    item_count: 2,
})
```

GTM receives `{event: 'purchase_started', currency: 'USD', value: 99.95, item_count: 2}` in `dataLayer`. If Meta Pixel is configured, the same payload is also sent through `fbq`, using `track` for standard Meta events and `trackCustom` for custom ones.

## Livewire Usage

```php
$this->dispatch('gtm-event', name: 'profile_updated', params: ['section' => 'security']);
```

The bridge normalizes wrapped Livewire payload shapes automatically.

## JavaScript API

### `track(name, params = {})`

```js
window.GTMEvents.track('add_to_cart', { product_id: 15, value: 150 })
```

### `dispatch(payload, source = 'manual')`

```js
window.GTMEvents.dispatch({ name: 'search', params: { term: 'sneakers' } })
```

### DOM custom event

```js
window.dispatchEvent(new CustomEvent('gtm:event', {
    detail: { name: 'checkout_step', params: { step: 2 } },
}))
```

### `config`

```js
console.log(window.GTMEvents.config)
```

## Payload Structure

```json
{
    "name": "event_name",
    "params": {
        "key": "value"
    }
}
```

Validation rules:

- `name` must be a non-empty string matching `allowed_name_pattern`
- `name` must not exceed `max_event_name_length`
- `params` must be an object
- param keys validated for length
- param values support `string`, `number`, `boolean`, `null`, or nested objects
- string values truncated to `max_param_value_length`

## Configuration

Published at `config/ga4-events.php`:

```php
return [
    'enabled' => (bool) env('GTM_EVENTS_ENABLED', true),
    'container_id' => env('GTM_CONTAINER_ID'),
    'inject_gtm_script' => (bool) env('GTM_EVENTS_INJECT_SCRIPT', true),
    'meta_pixel_id' => env('META_PIXEL_ID'),
    'inject_meta_pixel_script' => (bool) env('META_PIXEL_INJECT_SCRIPT', true),
    'meta_pixel_event_map' => [],
    'meta_pixel_standard_events' => [
        'AddPaymentInfo',
        'AddToCart',
        'AddToWishlist',
        'CompleteRegistration',
        'Contact',
        'CustomizeProduct',
        'Donate',
        'FindLocation',
        'InitiateCheckout',
        'Lead',
        'Purchase',
        'Schedule',
        'Search',
        'StartTrial',
        'SubmitApplication',
        'Subscribe',
        'ViewContent',
    ],
    'event_bus_name' => env('GTM_EVENTS_EVENT_BUS_NAME', 'gtm:event'),
    'livewire_event_name' => env('GTM_EVENTS_LIVEWIRE_EVENT_NAME', 'gtm-event'),
    'global_js_object' => env('GTM_EVENTS_GLOBAL_JS_OBJECT', 'GTMEvents'),
    'debug' => (bool) env('GTM_EVENTS_DEBUG', false),
    'strict_validation' => (bool) env('GTM_EVENTS_STRICT_VALIDATION', false),
    'drop_invalid_events' => (bool) env('GTM_EVENTS_DROP_INVALID_EVENTS', true),
    'max_event_name_length' => (int) env('GTM_EVENTS_MAX_EVENT_NAME_LENGTH', 40),
    'max_params' => (int) env('GTM_EVENTS_MAX_PARAMS', 25),
    'max_param_key_length' => (int) env('GTM_EVENTS_MAX_PARAM_KEY_LENGTH', 40),
    'max_param_value_length' => (int) env('GTM_EVENTS_MAX_PARAM_VALUE_LENGTH', 100),
    'max_param_nesting' => (int) env('GTM_EVENTS_MAX_PARAM_NESTING', 4),
    'allowed_name_pattern' => env('GTM_EVENTS_ALLOWED_NAME_PATTERN', '/^[a-zA-Z][a-zA-Z0-9_]*$/'),
    'console_prefix' => env('GTM_EVENTS_CONSOLE_PREFIX', '[GTM Events]'),
];
```

### Meta Pixel event mapping

Map your existing event names to Meta standard events when needed:

```php
'meta_pixel_event_map' => [
    'purchase_completed' => 'Purchase',
    'checkout_started' => 'InitiateCheckout',
    'product_viewed' => 'ViewContent',
],
```

When the mapped event name matches one of `meta_pixel_standard_events`, the package sends it with `fbq('track', ...)`; otherwise it falls back to `fbq('trackCustom', ...)`.

## Debug Mode

```dotenv
GTM_EVENTS_DEBUG=true
```

Example console output:

```
[GTM Events] [INFO] GTM bridge initialized.
[GTM Events] [INFO] Event pushed to dataLayer from api.
[GTM Events] [ERROR] Invalid GTM payload from livewire.
```

## Artisan Command

```bash
php artisan gtm-events:check
```

Validates that the package is enabled and shows the current GTM and Meta Pixel identifiers.

## Skip Auto Injection

If you load the GTM snippet yourself:

```dotenv
GTM_EVENTS_INJECT_SCRIPT=false
```

The bridge still pushes events to `window.dataLayer`.

## PHP-side Validation

```php
use MohamedSaid\LaravelGa4Events\Facades\LaravelGa4Events;

$result = LaravelGa4Events::track('purchase_completed', ['value' => 120]);

// $result['valid']  — bool
// $result['errors'] — array of strings
// $result['name']   — sanitized name
// $result['params'] — sanitized params
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for information about changes.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for contribution details.

## Security

Please review [our security policy](../../security/policy) for reporting vulnerabilities.

## Credits

- [Mohamed Said](https://github.com/EG-Mohamed)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
