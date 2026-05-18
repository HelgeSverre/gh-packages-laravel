<p align="center">
    <img src="assets/laravel_worldable_thumbnail.png" alt="Laravel Worldable Thumbnail" width="100%">
</p>

# Laravel Worldable

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ritechoice23/laravel-worldable.svg?style=flat-square)](https://packagist.org/packages/ritechoice23/laravel-worldable)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/ritechoice23/laravel-worldable/run-tests.yml?branch=master&label=tests&style=flat-square)](https://github.com/ritechoice23/laravel-worldable/actions?query=workflow%3Arun-tests+branch%3Amaster)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/ritechoice23/laravel-worldable/fix-php-code-style-issues.yml?branch=master&label=code%20style&style=flat-square)](https://github.com/ritechoice23/laravel-worldable/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amaster)
[![Total Downloads](https://img.shields.io/packagist/dt/ritechoice23/laravel-worldable.svg?style=flat-square)](https://packagist.org/packages/ritechoice23/laravel-worldable)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow.svg?style=flat-square)](https://buymeacoffee.com/ritechoice23)

**Make your Laravel application location-aware in seconds.** Worldable is a package that provides a simple and efficient way to add Country, State, City, Currency, Language, and Timezone relationships to your laravel application.

## Quick Start

```bash
composer require ritechoice23/laravel-worldable
```

**That's it!** You now have access to 8 world entities: Continents, Subregions, Countries, States, Cities, Currencies, Languages, and Timezones.

## Installation Options

```bash
# Install everything (all world data + polymorphic support)
php artisan world:install --all

# Install specific components only
php artisan world:install --countries --currencies

# Add polymorphic support later
php artisan world:install --worldables

# Uninstall any component you don't need again
php artisan world:uninstall
```

### Optional: Publish Configuration

If you need to customize table names, publish the config file:

```bash
php artisan vendor:publish --tag=worldable-config
```

This creates `config/worldable.php` where you can customize table names to match your naming convention.

## Usage Modes

### 1. Direct Model Usage (Traditional Approach)

Use world data models directly with standard Eloquent relationships:

```php
use Ritechoice23\Worldable\Models\Country;
use Ritechoice23\Worldable\Models\Currency;

// Add foreign keys to your model
Schema::table('users', function (Blueprint $table) {
    $table->foreignId('country_id')->nullable()->constrained('world_countries');
    $table->foreignId('currency_id')->nullable()->constrained('world_currencies');
});

// Use standard relationships
class User extends Model {
    public function country() {
        return $this->belongsTo(Country::class);
    }
}

$user->country_id = Country::where('name', 'Nigeria')->first()->id;
$user->save();
```

### 2. Polymorphic Relationships (Zero-Migration Approach)

**Too lazy to add foreign keys?** We got you covered! Use the `Worldable` trait for instant location awareness without touching your database schema:

```php
use Ritechoice23\Worldable\Traits\Worldable;

class User extends Model {
    use Worldable;  // That's it!
}

// Attach world data on the fly
$user->attachCountry('Nigeria');
$user->attachCity('Lagos', 'billing');
$user->attachCurrency('NGN');
$user->formatMoney(5000);  // "₦5,000.00"

// Query naturally
User::whereFrom('Nigeria')->get();
User::wherePricedIn('USD')->get();
```

**Why use polymorphic relationships?**

-   **Zero migrations** - No need to modify your existing tables
-   **Multiple contexts** - Separate billing/shipping, citizenship/residence
-   **Flexible** - Attach multiple countries, cities, or currencies to one model
-   **Metadata support** - Store extra data on relationships
-   **Clean codebase** - No foreign key clutter in your models

## Key Features

| Feature              | Description                                                                         |
| -------------------- | ----------------------------------------------------------------------------------- |
| **8 World Entities** | Continents, Subregions, Countries, States, Cities, Currencies, Languages, Timezones |
| **Modular Install**  | Install only what you need, add more later                                          |
| **Two Usage Modes**  | Traditional foreign keys OR polymorphic relationships                               |
| **Context Groups**   | Separate billing/shipping, citizenship/residence                                    |
| **Smart Resolution** | Accepts IDs, names, ISO codes automatically                                         |
| **Query Scopes**     | `whereFrom()`, `whereLocatedInCity()`, `wherePricedIn()`, `whereSpeaks()`           |
| **Money Formatting** | `$product->formatMoney(100)` → "$100.00" with locale support                        |
| **Bulk Operations**  | `$user->attachCountries(['NG', 'GH', 'KE'])`                                        |
| **Custom Metadata**  | Store extra data: `$user->attachCountry('NG', 'billing', ['tax_id' => '...'])`      |
| **Health Checks**    | `php artisan world:health --detailed` monitors data integrity                       |

## Real-World Example

```php
class Order extends Model {
    use Worldable;
}

// E-commerce checkout with multiple contexts
$order
    ->attachCountry('United States', 'billing')
    ->attachState('California', 'billing')
    ->attachCountry('Canada', 'shipping')
    ->attachCity('Toronto', 'shipping')
    ->attachCurrency('USD', 'display')
    ->attachCurrency('CAD', 'settlement');

// Analytics
$usOrders = Order::whereFrom('United States')->count();
$canadaShipping = Order::whereHas('countries', fn($q) =>
    $q->where('name', 'Canada')->wherePivot('group', 'shipping')
)->count();

// Conditional logic
if ($order->hasCountry('United States', 'billing')) {
    // Apply US tax rules
}
```

## Documentation

**[Full Documentation](docs/)** - Deep dive into all features

-   [Installation](docs/installation.md) - Advanced installation options
-   [Commands](docs/commands.md) - Complete commands reference
-   [Basic Usage](docs/basic-usage.md) - Common operations
-   [API Reference](docs/api-reference.md) - Complete API documentation
-   [Countries](docs/countries.md), [States](docs/states.md), [Cities](docs/cities.md) - Location data
-   [Currencies](docs/currencies.md), [Languages](docs/languages.md), [Timezones](docs/timezones.md) - Localization
-   [Groups](docs/groups.md) - Context-aware relationships
-   [Meta Data](docs/meta-data.md) - Custom metadata storage
-   [Validation Rules](docs/validation-rules.md) - Input validation
-   [Scopes](docs/scopes.md) - Query scopes reference

## Testing

```bash
composer test
```

## Credits

-   [Daramola Babatunde Ebenezer](https://github.com/ritechoice23)
-   [All Contributors](../../contributors)

## License

The MIT License (MIT). See [License File](LICENSE.md).
