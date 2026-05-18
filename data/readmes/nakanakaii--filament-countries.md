# filament-countries

This package is a wrapper around [`nakanakaii/countries`](https://github.com/nakanakaii/countries) tailored for Filament PHP. It provides ready-to-use Form components, Table columns, and Table filters for dealing with countries and phone numbers seamlessly.

## Installation

You can install the package via composer:

```bash
composer require nakanakaii/filament-countries
```

If you wish to use the provided Image-based flags (instead of Unicode emojis), you must also publish the flags assets from the base `countries` package:

```bash
php artisan vendor:publish --tag=countries-flags
```

Next, conditionally publish and configure this plugin's settings:

```bash
php artisan vendor:publish --tag="filament-countries-config"
```

This will create a `config/filament-countries.php` file in your application where you can specify the global default flags provider:

```php
return [
    'flags_provider' => 'emoji', // Options: 'emoji', 'image'
];
```

## Form Components

### Country Select

Provides a searchable select dropdown populated with countries.

```php
use Nakanakaii\FilamentCountries\Forms\Components\CountrySelect;

CountrySelect::make('country_id')
    ->displayFlags(true) // Whether to prefix the country name with its flag (default: true)
    ->imageFlags()       // Force this specific field to use Image flags instead of Emojis
    ->emojiFlags()       // Force this specific field to use Emoji flags instead of Images
```

**Customization:**

If you wish to hide the flags from the options, you can use `displayFlags(false)`.

```php
CountrySelect::make('country_code')
    ->displayFlags(false)
```

### Phone Input

Provides a text input configured for telephone numbers (`type="tel"`). By default, it is configured with `live(onBlur: true)` which allows it to react to the phone number and automatically fetch the Country Flag to use as a prefix, and automatically apply exact regex validation rules based on the user's entered dial code!

```php
use Nakanakaii\FilamentCountries\Forms\Components\PhoneInput;

PhoneInput::make('phone_number')
```

**Customization:**

You can disable the automatic flag prefix or the automatic phone validation, or specifically enforce a flag rendering type:

```php
PhoneInput::make('phone_number')
    ->displayFlags(false)
    ->applyValidation(false)
    ->imageFlags() // Explicitly return image-based flags for this field
```

If you are not using a country dial-code selector, or if you expect your users to primarily enter local phone numbers without their international `+` prefixes, you should configure the phone input to use a specific country for evaluation. This allows the package to understand the context and validate the local number properly by checking it against the right country format.

```php
PhoneInput::make('phone_number')
    ->country('AE') // Validate the local number specifically for United Arab Emirates
```

You can also dynamically link the validation directly to another country form field by providing the field name!

```php
CountrySelect::make('country')
    ->live(), // Important: ensure the country field is reactive if used dynamically!
PhoneInput::make('phone_number')
    ->countryField('country') // Dynamic validation based on the select above
```

## Table Columns

### Country Column

A text column that displays the country flag and name based on the country code.

```php
use Nakanakaii\FilamentCountries\Tables\Columns\CountryColumn;

CountryColumn::make('country_code')
    ->displayFlags(true) // Show or hide the flag (default: true)
    ->hideName(false)    // Show or hide the country name (default: false)
    ->imageFlags()       // Force this specific column to use Image flags instead of Emojis
```

### Phone Column

A basic text column pre-configured for phone numbers (monospaced).

```php
use Nakanakaii\FilamentCountries\Tables\Columns\PhoneColumn;

PhoneColumn::make('phone_number')
```

## Filters

### Country Filter

A select filter to filter table data by country.

````php
use Nakanakaii\FilamentCountries\Tables\Filters\CountryFilter;

CountryFilter::make('country_code')
    ->displayFlags(true) // Show or hide the flag in the dropdown options (default: true)
    ->emojiFlags()       // Force this specific filter to use Emoji flags instead of Images
```php
CountryFilter::make('country_code')
    ->displayFlags(false)
````
