# Livewire Phone

`lianmaymesi/livewire-phone` is a Laravel and Livewire-oriented phone input package built on top of `intl-tel-input`.

## Goals

This package is meant to be a Flux-friendly, Livewire-first Laravel wrapper around the full `intl-tel-input` feature set, while also exposing Laravel validation and package publishing ergonomics.

## Install flow

```bash
composer require lianmaymesi/livewire-phone
php artisan livewire-phone:install
```

The install command:

- publishes package config and translations
- publishes Vite source assets into `resources/vendor/livewire-phone`
- runs `npm install intl-tel-input`
- adds the package Vite entries to `vite.config.js`

The generated Vite entry files are:

- `resources/vendor/livewire-phone/livewire-phone.js`
- `resources/vendor/livewire-phone/livewire-phone.css`

Your custom overrides load after the package base files:

- `resources/vendor/livewire-phone/phone.custom.js`
- `resources/vendor/livewire-phone/phone.custom.css`

The component injects its CSS and JavaScript automatically with Livewire / Blaze
`@assets`, so you do not need to place manual `<script>` or `<link>` tags in
your page when using the component.

## Source vs dist

The package keeps its editable frontend source in:

- `resources/stubs/vite/phone.js`
- `resources/stubs/vite/phone.css`

These files stay readable and are intended for maintenance.

The minified files used by `asset_driver = "public"` are generated into:

- `resources/dist/livewire-phone.js`
- `resources/dist/livewire-phone.css`

To rebuild the distributed assets from source:

```bash
npm install
npm run build:dist
```

The CSS build is PostCSS-based and Tailwind-ready, so you can introduce `@apply`
later without changing the dist workflow.

## Feature coverage

| Feature                                                   | Status              | Notes                                                                                          |
| --------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------- |
| Auto-select user's current country via IP lookup          | Supported           | Enable `geoip.enabled` and provide `geoip.endpoint` in config.                                 |
| Example placeholder for selected country                  | Supported           | Driven by upstream `autoPlaceholder`.                                                          |
| Type-ahead and keyboard dropdown navigation               | Supported           | Provided by `intl-tel-input` with `countrySearch`.                                             |
| Format as user types                                      | Supported           | Enabled by default and configurable.                                                           |
| Numeric-only input and max valid length cap               | Supported           | Enforced by package JS and upstream `strictMode`.                                              |
| National input converted to international standard number | Supported           | Package syncs formatted output and metadata.                                                   |
| Validation with specific error types                      | Supported           | Laravel rule plus hidden metadata inputs/events for client-side error codes.                   |
| High-resolution flag images                               | Supported           | Bundled through the npm package and Vite asset pipeline.                                       |
| Accessibility via ARIA                                    | Supported           | Upstream behavior preserved; package adds error `aria-describedby`.                            |
| TypeScript type definitions                               | Planned             | Best shipped through a companion npm package, not the PHP package alone.                       |
| CSS variable overrides and dark mode styling              | Supported           | Flux-compatible CSS and override-friendly selectors included.                                  |
| React, Vue, Angular, and Svelte components                | Planned             | These belong in companion JS packages/adapters.                                                |
| 40+ translations, RTL, alternative numerals               | Partially supported | Upstream supports this; Laravel translations are included now, deeper JS i18n is a next phase. |
| Rich init options, methods, events                        | Supported           | Component passes init options and emits `livewire-phone:change`.                               |

## Current package foundation

- Blade component for Livewire forms: `<x-livewire-phone::phone />`
- Package-managed frontend assets
- Single-property payload submission for both plain forms and Livewire
- Laravel validation rule: `new \Lianmaymesi\LivewirePhone\Rules\PhoneNumber()`
- Optional Eloquent casts for normalized string and object storage
- Validator extension: `phone_number`
- Publishable config, language files, and public assets
- Multi-language-ready translation structure
- Flux-compatible field rendering and styles
- Optional geo-IP country lookup
- Client event: `livewire-phone:change`

## Example usage

```blade
<x-livewire-phone::phone
    wire:model.live="phone"
    name="phone"
    label="{{ __('Phone') }}"
    initial-country="in"
    only-countries="in"
    format="e164"
    :geo-ip-lookup="true"
/>
```

```php
use Lianmaymesi\LivewirePhone\Rules\PhoneNumber;

Validator::make($data, [
    'phone' => ['required', new PhoneNumber('IN', ['IN'])],
]);
```

## Flux usage

When Flux is installed, the component renders through `flux:with-field` so it behaves like the rest of your Flux and Flux Pro form fields.

Typical Flux usage:

```blade
<x-livewire-phone::phone
    wire:model.live="phone"
    label="Phone"
    name="phone"
    format="e164"
/>
```

Supported field-style props:

- `label` shows the Flux field label
- `invalid` forces the error state
- `variant="borderless"` uses the borderless input treatment
- `placeholder` overrides the automatic example placeholder
- `disabled`, `required`, `autofocus`, and `autocomplete` are forwarded to the input

If Flux is not installed, the component falls back to the package field wrapper and still works the same way.

## Format and output modes

Use the `format` prop to control both the displayed phone format and the value pushed back into Livewire or submitted through a normal form. `format` is preferred over `value` so it does not clash with the native HTML `value` attribute.

String output modes:

- `format="e164"` returns one normalized string such as `+14155552671`
- `format="national"` returns one normalized string with the national digits only
- `format="significant"` returns one normalized string with the local mobile digits only
- `format="string:e164"`, `format="string:national"`, and `format="string:significant"` are explicit aliases for string output

Object output modes:

- `format="object"` returns one JSON string object and defaults `number` to `e164`
- `format="object:e164"` returns the object with `number` as normalized international format
- `format="object:national"` returns the object with `number` as normalized national digits
- `format="object:significant"` returns the object with `number` as normalized local digits

For backward compatibility, `value` is still accepted as a fallback alias.

The package submits only one field for the phone value. It does not create extra `phone_country`, `phone_valid`, `phone_error`, or `phone_type` form properties.

If you do not pass a custom `placeholder`, the component updates the example placeholder based on the selected `format`:

- `e164` shows an international-style example
- `national` shows a national example
- `significant` shows the core local mobile number example

Example object payload:

```json
{
  "number": "+919944712499",
  "phone_number": "9944712499",
  "dial_code": "+91",
  "country_code": "IN"
}
```

This object format is designed to stay under one property while still giving you the normalized pieces you usually want to store:

- `number` is the normalized value for the selected mode
- `phone_number` is always the plain local number without spaces or special characters
- `dial_code` is the country calling code such as `+91`
- `country_code` is the ISO country code such as `IN`

The server-side normalizer also accepts mixed existing values such as:

- `+91 99447 12499`
- `99447-12499`
- `{"number":"+919944712499","country_code":"IN"}`
- `{"phone_number":"9944712499","dial_code":"+91"}`

So you can store or hydrate values whether the input came with spaces, punctuation, `IN`, or `+91`.

## Single-property behavior

String mode example:

```blade
<x-livewire-phone::phone
    name="phone"
    format="significant"
    :only-countries="['in']"
/>
```

Submitted value:

```php
'phone' => '9944712499'
```

Object mode example:

```blade
<x-livewire-phone::phone
    name="phone"
    format="object:e164"
    :only-countries="['in']"
/>
```

Submitted value:

```php
'phone' => '{"number":"+919944712499","phone_number":"9944712499","dial_code":"+91","country_code":"IN"}'
```

## Casting helpers

If you want the same normalization on save and retrieve in Eloquent, the package provides two casts:

- `Lianmaymesi\LivewirePhone\Casts\AsPhoneString`
- `Lianmaymesi\LivewirePhone\Casts\AsPhoneObject`

Example:

```php
use Lianmaymesi\LivewirePhone\Casts\AsPhoneObject;
use Lianmaymesi\LivewirePhone\Casts\AsPhoneString;

protected function casts(): array
{
    return [
        'phone' => AsPhoneString::class . ':significant,IN',
        'phone_meta' => AsPhoneObject::class . ':e164,IN',
    ];
}
```

This lets the model accept values like `99447 12499`, `+91 99447 12499`, or a JSON object payload and keep them normalized consistently.

## Common prop reference

The main component props are:

- `initial-country="us"` sets the default selected country
- `country-order="us,ca,mx"` controls dropdown ordering
- `only-countries="us,ca,mx"` restricts the selectable countries
- `format="e164|national|significant|object[:...]"` controls the output shape
- `:geo-ip-lookup="true"` enables country auto-detection when configured
- `:options="[]"` overrides plugin options directly

Common plugin-related props:

- `allow-dropdown`
- `country-search`
- `fix-dropdown-width`
- `format-as-you-type`
- `format-on-display`
- `show-flags`
- `strict-mode`
- `use-fullscreen-popup`
- `national-mode`
- `separate-dial-code`
- `allow-phonewords`
- `allow-number-extensions`

## Single vs multiple countries

The `only-countries` and `country-order` props accept either:

- a single ISO2 country code string
- a comma-separated string of ISO2 country codes
- a PHP array of ISO2 country codes

Use a single value when the field should stay locked to one country:

```blade
<x-livewire-phone::phone
    wire:model.live="phone"
    name="phone"
    initial-country="in"
    only-countries="in"
/>
```

You can also pass the single country as an array:

```blade
<x-livewire-phone::phone
    wire:model.live="phone"
    name="phone"
    :only-countries="['in']"
    :country-order="['in']"
/>
```

For multiple allowed countries, pass an array:

```blade
<x-livewire-phone::phone
    wire:model.live="phone"
    name="phone"
    initial-country="us"
    :only-countries="['us', 'ca', 'mx']"
    :country-order="['us', 'ca', 'mx']"
/>
```

If your Livewire or controller data starts as objects, map them to ISO2 strings before passing them in:

```php
$onlyCountries = collect($countries)
    ->pluck('iso2')
    ->map(fn ($country) => strtolower($country))
    ->values()
    ->all();
```

```blade
<x-livewire-phone::phone
    wire:model.live="phone"
    name="phone"
    :only-countries="$onlyCountries"
/>
```

The component expects country codes like `us`, `in`, `gb`, not full country objects.

## Validator extension

```php
'phone' => ['required', 'phone_number:IN,IN']
```

The first parameter is the default parse region. The remaining parameters restrict allowed regions.

## Config highlights

```php
return [
    'initial_country' => 'auto',
    'default_value' => 'e164',
    'options' => [
        'format_as_you_type' => true,
        'strict_mode' => true,
        'country_search' => true,
        'auto_placeholder' => 'polite',
    ],
    'geoip' => [
        'enabled' => true,
        'endpoint' => 'https://ipapi.co/json',
        'country_key' => 'country_code',
    ],
];
```

## Runtime metadata

It also dispatches a browser event:

```js
window.addEventListener("livewire-phone:change", (event) => {
    console.log(event.detail);
});
```
