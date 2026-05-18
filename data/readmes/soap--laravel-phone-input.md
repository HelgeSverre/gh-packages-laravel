# Laravel Phone Input

[![Latest Version on Packagist](https://img.shields.io/packagist/v/soap/laravel-phone-input.svg?style=flat-square)](https://packagist.org/packages/soap/laravel-phone-input)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/soap/laravel-phone-input/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/soap/laravel-phone-input/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/soap/laravel-phone-input/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/soap/laravel-phone-input/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/soap/laravel-phone-input.svg?style=flat-square)](https://packagist.org/packages/soap/laravel-phone-input)

A powerful Laravel Blade component for international phone number input with validation and formatting. Built with [intl-tel-input](https://github.com/jackocnr/intl-tel-input) library, featuring both field and inline editing modes with full customization support.

**Key Features:**
- 🌍 International phone number support with country selection
- 📱 Field mode for forms and inline mode for editing interfaces
- ✅ Real-time validation and formatting
- 🎨 Fully customizable with Tailwind CSS classes
- 🔧 Configurable via config file
- 🌐 Localized in Thai and easily extensible

## Support Us

Your support helps us maintain and improve this package. There are several ways you can contribute:

### 🐛 Report Issues & Request Features

Found a bug or have an idea for improvement? We'd love to hear from you!

- **[Report Issues](https://github.com/soap/laravel-phone-input/issues)** - Submit bug reports with detailed information
- **[Feature Requests](https://github.com/soap/laravel-phone-input/issues/new?template=feature_request.md)** - Suggest new features or improvements
- **[Discussions](https://github.com/soap/laravel-phone-input/discussions)** - Ask questions or share usage examples

### 💻 Contribute Code

We welcome contributions from the community! Here's how you can help:

- **Fork & Pull Request** - Submit code improvements, bug fixes, or new features
- **Review PRs** - Help review and test pull requests from other contributors
- **Documentation** - Improve docs, examples, or add translations
- **Tests** - Write tests to improve code coverage

Please see our [Contributing Guide](CONTRIBUTING.md) for detailed information.

### 💝 Financial Support

If this package saves you time or helps your business, consider supporting its development:

- **[GitHub Sponsors](https://github.com/sponsors/soap)** - Monthly recurring sponsorship
- **[PayPal](https://paypal.me/prasitgebsaap)** - One-time donations
- **[Buy Me a Coffee](https://buymeacoffee.com/soap)** - Support with a coffee ☕

### 🌟 Other Ways to Support

- **Star the Repository** - Show your appreciation with a GitHub star ⭐
- **Share the Package** - Tell others about it on social media or blogs
- **Use in Projects** - The more it's used, the more it gets improved!

Every contribution, no matter how small, is greatly appreciated and helps keep this package alive and growing! 🙏

## Installation

You can install the package via composer:

```bash
composer require soap/laravel-phone-input
```

Optionally, run the install command:

```bash
php artisan laravel-phone-input:install
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-phone-input-config"
```

This will publish a comprehensive configuration file with settings for:
- International telephone input library options
- CSS classes for styling
- Inline mode behavior
- Validation settings
- Localization text
- CDN settings

Optionally, you can publish the views for customization:

```bash
php artisan vendor:publish --tag="laravel-phone-input-views"
```

## Usage

### Basic Field Mode

Use the component in your Blade templates as a form field:

```blade
<x-phone-input 
    name="phone" 
    label="Phone Number" 
    placeholder="กรอกหมายเลขโทรศัพท์"
    required
/>
```

### Inline Editing Mode

For inline editing interfaces:

```blade
<x-phone-input 
    name="mobile"
    mode="inline"
    value="+66812345678"
    display-format="pretty"
    :inline-save-on-blur="true"
/>
```

### Advanced Configuration

```blade
<x-phone-input 
    name="contact_phone"
    label="Contact Number"
    value="{{ old('contact_phone', $user->phone) }}"
    :required="true"
    mode="field"
    placeholder="Enter your phone number"
    help="We'll use this to contact you"
    
    {{-- Override config values --}}
    initial-country="us"
    :preferred-countries="['us', 'ca', 'gb']"
    :separate-dial-code="true"
    :national-mode="false"
/>
```

### Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | string | `'phone'` | Input field name |
| `label` | string | `null` | Field label (field mode only) |
| `value` | string | `null` | Initial value in E.164 format |
| `placeholder` | string | `'Enter phone number'` | Input placeholder |
| `required` | boolean | `false` | Whether field is required |
| `mode` | string | `'field'` | Mode: 'field' or 'inline' |
| `display-format` | string | `'pretty'` | Display format: 'pretty', 'national', or 'e164' |
| `inline-save-on-blur` | boolean | `true` | Auto-save on blur in inline mode |
| `inline-show-actions` | boolean | `true` | Show edit/save/cancel buttons |

### Form Handling

The component outputs the phone number in E.164 format (e.g., `+66812345678`) which is perfect for database storage:

```php
// In your controller
public function store(Request $request)
{
    $request->validate([
        'phone' => 'required|string', // Will receive E.164 format
    ]);
    
    User::create([
        'phone' => $request->phone, // e.g., "+66812345678"
    ]);
}
```

### Handling Validation Errors

The component automatically displays Laravel validation errors:

```php
// Controller validation
$request->validate([
    'phone' => 'required|regex:/^\+[1-9]\d{1,14}$/',
]);

// The component will show the error message automatically
```

## Configuration

The package comes with a comprehensive configuration file. Here are some key options:

```php
// config/phone-input.php
return [
    // Default country for initial selection
    'initial_country' => 'th',
    
    // Countries to show at the top of the dropdown
    'preferred_countries' => ['th', 'us', 'gb'],
    
    // Display options
    'separate_dial_code' => true,
    'national_mode' => false,
    
    // CSS classes (fully customizable)
    'classes' => [
        'wrapper' => 'space-y-2',
        'input' => 'block w-full rounded-md border-gray-300...',
        'label' => 'block text-sm font-medium text-gray-700',
        // ... more classes
    ],
    
    // Inline mode settings
    'inline' => [
        'save_on_blur' => true,
        'show_actions' => true,
    ],
    
    // Localization
    'text' => [
        'edit_button' => 'แก้ไข',
        'save_button' => 'บันทึก',
        'cancel_button' => 'ยกเลิก',
    ],
];
```

## Requirements

- PHP ^8.3
- Laravel ^11.0 || ^12.0
- Alpine.js (for JavaScript functionality)
- intl-tel-input library (loaded via CDN by default)

## Testing

```bash
composer test
composer test-coverage
composer analyse
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Prasit Gebsaap](https://github.com/soap)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
