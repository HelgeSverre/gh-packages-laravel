# Laravel SAB Hero Wrapper

[![Latest Version on Packagist](https://img.shields.io/packagist/v/fuelviews/laravel-sabhero-wrapper.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-sabhero-wrapper)
[![Total Downloads](https://img.shields.io/packagist/dt/fuelviews/laravel-sabhero-wrapper.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-sabhero-wrapper)
[![Tests](https://img.shields.io/github/actions/workflow/status/fuelviews/laravel-sabhero-wrapper/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/fuelviews/laravel-sabhero-wrapper/actions/workflows/run-tests.yml)

A comprehensive Laravel package that provides a unified wrapper layout for integrating multiple Fuelviews components and third-party packages. This package serves as the foundation for building consistent, feature-rich web applications with integrated navigation, forms, SEO optimization, analytics, and more.

## Requirements

- PHP 8.3+
- Laravel 10.0+, 11.0+, or 12.0+
- Livewire 3.5+

## Installation

Install the package via Composer:

```bash
composer require fuelviews/laravel-sabhero-wrapper
```

### Quick Installation

The package will automatically register via Laravel's package discovery. To publish the configuration and migrations:

```bash
# Publish configuration and migrations
php artisan vendor:publish --tag="sabhero-wrapper-config"
php artisan vendor:publish --tag="sabhero-wrapper-migrations"

# Run migrations
php artisan migrate
```

### Additional Publishing Options

You can publish additional components as needed:

```bash
# Publish views for customization
php artisan vendor:publish --tag="sabhero-wrapper-views"

# Publish seeders for sample data
php artisan vendor:publish --tag="sabhero-wrapper-seeders"

# Publish factories for testing
php artisan vendor:publish --tag="sabhero-wrapper-factories"

# Publish service provider for advanced customization
php artisan vendor:publish --tag="sabhero-wrapper-provider"
```

## Basic Usage

### Using the Layout Component

The primary way to use this package is through the layout component:

```blade
<x-sabhero-wrapper::layouts.app>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold">Welcome to Your App</h1>
        <p class="text-gray-600 mt-4">This content is wrapped in the SAB Hero layout.</p>
    </div>
</x-sabhero-wrapper::layouts.app>
```

### Page Model Integration

The package includes a `Page` model for managing SEO data:

```php
use Fuelviews\SabHeroWrapper\Models\Page;

// Create a new page
$page = Page::create([
    'title' => 'About Us',
    'slug' => 'about',
    'description' => 'Learn more about our company and mission.',
    'page_feature_image' => 'path/to/image.jpg'
]);

// Add feature image via media library
$page->addMediaFromUrl('https://example.com/image.jpg')
      ->toMediaCollection('page_feature_image');

// The page automatically provides SEO data
$seoData = $page->getDynamicSEOData();
```

## Configuration

The package configuration file provides granular control over included features:

```php
// config/sabhero-wrapper.php
return [
    'livewire_enabled' => env('SABHERO_LIVEWIRE_ENABLED', true),
    'navigation_enabled' => env('SABHERO_NAVIGATION_ENABLED', true),
    'footer_enabled' => env('SABHERO_FOOTER_ENABLED', true),
    'forms_modal_enabled' => env('SABHERO_FORMS_MODAL_ENABLED', true),
    'gtm_enabled' => env('SABHERO_GTM_ENABLED', false),
];
```

### Environment Variables

Add these variables to your `.env` file to control features:

```env
# Livewire Integration (default: true)
SABHERO_LIVEWIRE_ENABLED=true

# Navigation Integration (default: true)
SABHERO_NAVIGATION_ENABLED=true

# Footer Integration (default: true)
SABHERO_FOOTER_ENABLED=true

# Forms Modal Integration (default: true)
SABHERO_FORMS_MODAL_ENABLED=true

# Google Tag Manager Integration (default: false)
SABHERO_GTM_ENABLED=false
```

## Integrated Packages

The wrapper conditionally integrates with the following packages:

### Navigation (fuelviews/laravel-navigation)
When installed and enabled, provides:
- Responsive navigation header
- Footer component
- Mobile-friendly hamburger menu

### Forms (fuelviews/laravel-forms)
When installed and enabled, provides:
- Modal-based contact forms
- Lead capture functionality
- UTM parameter tracking

### SEO (ralphjsmit/laravel-seo)
When installed, provides:
- Dynamic meta tags
- Open Graph integration
- Twitter Card support
- JSON-LD structured data

### Media Library (spatie/laravel-medialibrary)
Integrated for:
- Feature image management
- Responsive image conversions
- Media collection organization

### Google Fonts (spatie/laravel-google-fonts)
When installed:
- Automatic font optimization
- GDPR-compliant font loading

## Advanced Usage

### Using the Facade

Access package functionality programmatically:

```php
use Fuelviews\SabHeroWrapper\Facades\SabHeroWrapper;

// Check if a feature is enabled
if (SabHeroWrapper::isFeatureEnabled('navigation_enabled')) {
    // Navigation is enabled
}

// Get all enabled features
$enabledFeatures = SabHeroWrapper::getEnabledFeatures();

// Get package version
$version = SabHeroWrapper::version();
```

### Custom View Composer

The package automatically provides SEO page data to views through a view composer that matches route names to page slugs:

```php
// In your routes/web.php
Route::get('/', function () {
    return view('home');
})->name('home');

// The view composer will automatically look for a Page with slug 'home'
// and make it available as $seoPage in your views
```

### Service Provider Customization

For advanced customization, you can publish the service provider:

```bash
php artisan vendor:publish --tag="sabhero-wrapper-provider"
```

This creates `app/Providers/SabHeroWrapperServiceProvider.php` where you can:

- Customize view composers and SEO data logic
- Add custom service bindings
- Register additional event listeners
- Publish custom assets
- Override package behavior

After publishing, remember to register it in `config/app.php`:

```php
'providers' => [
    // ...
    App\Providers\SabHeroWrapperServiceProvider::class,
],
```

### Database Seeding

Run the included seeder to create sample pages:

```bash
php artisan db:seed --class=PageTableSeeder
```

This creates a sample home page with:
- Title: "Title one"
- Slug: "home"
- Description: "Description here."
- Feature image from Unsplash

### Media Collections

The Page model supports media collections for feature images:

```php
$page = Page::find(1);

// Add feature image
$page->addMediaFromUrl('https://example.com/hero.jpg')
     ->toMediaCollection('page_feature_image');

// Get feature image URL
$imageUrl = $page->getFirstMediaUrl('page_feature_image');

// Get responsive images
$responsiveImages = $page->getFirstMedia('page_feature_image');
```

## Tailwind CSS Integration

Add the package views to your Tailwind CSS content configuration:

```javascript
// tailwind.config.js
module.exports = {
    content: [        
        './resources/**/*.{js,vue,blade.php}',
        './vendor/fuelviews/laravel-sabhero-wrapper/resources/**/*.{blade.php,js,vue}',
    ],
    // ... rest of your configuration
}
```

## Testing

Run the package tests:

```bash
composer test
```

Run code style checks:

```bash
composer format
```

## Troubleshooting

### Navigation Not Showing
Ensure the `fuelviews/laravel-navigation` package is installed and the feature is enabled:

```bash
composer require fuelviews/laravel-navigation
```

```env
SABHERO_NAVIGATION_ENABLED=true
```

### Forms Modal Not Working
Ensure the `fuelviews/laravel-forms` package is installed and Livewire is enabled:

```bash
composer require fuelviews/laravel-forms
```

```env
SABHERO_FORMS_MODAL_ENABLED=true
SABHERO_LIVEWIRE_ENABLED=true
```

### SEO Tags Not Appearing
Ensure the `ralphjsmit/laravel-seo` package is installed:

```bash
composer require ralphjsmit/laravel-seo
```

### Google Fonts Not Loading
Install the required package:

```bash
composer require spatie/laravel-google-fonts
```

### Media Library Issues
Ensure the Spatie Media Library is properly configured:

```bash
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider" --tag="medialibrary-migrations"
php artisan migrate
```

## Package Dependencies

This package integrates with several optional packages:

**Required:**
- `php: ^8.3`
- `illuminate/contracts: ^10.0||^11.0||^12.0`
- `livewire/livewire: >=3.5`
- `ralphjsmit/laravel-seo: >=1.6.7`
- `spatie/laravel-google-fonts: >=1.4.1`
- `spatie/laravel-medialibrary: ^11||^10`
- `spatie/laravel-package-tools: ^1.92`

**Optional Integrations:**
- `fuelviews/laravel-navigation` - For header/footer navigation
- `fuelviews/laravel-forms` - For contact forms and modals
- `spatie/laravel-googletagmanager` - For Google Tag Manager integration

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Thejmitchener](https://github.com/thejmitchener)
- [Sweatybreeze](https://github.com/sweatybreeze)
- [Fuelviews](https://github.com/fuelviews)
- [All Contributors](../../contributors)

## 📜 License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

---

<div align="center">
    <p>Built with ❤️ by the <a href="https://fuelviews.com">Fuelviews</a> team</p>
    <p>
        <a href="https://github.com/fuelviews/laravel-navigation">⭐ Star us on GitHub</a> •
        <a href="https://packagist.org/packages/fuelviews/laravel-navigation">📦 View on Packagist</a>
    </p>
</div>
