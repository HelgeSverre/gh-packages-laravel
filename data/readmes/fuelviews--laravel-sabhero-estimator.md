# Laravel SAB Hero Estimator

[![Latest Version on Packagist](https://img.shields.io/packagist/v/fuelviews/laravel-sabhero-estimator.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-sabhero-estimator)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/fuelviews/laravel-sabhero-estimator/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/fuelviews/laravel-sabhero-estimator/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/fuelviews/laravel-sabhero-estimator/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/fuelviews/laravel-sabhero-estimator/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/fuelviews/laravel-sabhero-estimator.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-sabhero-estimator)

A comprehensive painting project estimator package for Laravel applications. This package provides a complete solution for collecting project details, calculating estimates, and managing painting project quotes with support for both interior and exterior projects.

## Installation

### 1. Install via Composer

```bash
composer require fuelviews/laravel-sabhero-estimator
```

### 2. Run Installation Command

```bash
php artisan sabhero-estimator:install
```

This command will:
- Publish configuration file
- Publish and run migrations (including default data)
- Publish assets (house style images)
- Optionally publish views for customization

### 3. Configure Tailwind CSS

Add the package views to your `tailwind.config.js`:

```javascript
export default {
    content: [
        // ... your existing paths
        './vendor/fuelviews/laravel-sabhero-estimator/resources/**/*.blade.php',
    ],
    // ... rest of your config
}
```

### 4. Setup FilamentPHP Integration

Register the plugin in your FilamentPHP panel provider:

```php
use Fuelviews\SabHeroEstimator\Filament\EstimatorPlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        // ... other configuration
        ->plugins([
            EstimatorPlugin::make(),
        ]);
}
```

### 5. Add the Estimator Component

Add the Livewire component to any Blade template:

```blade
@livewire('estimator::project-estimator')
```

## Installation Options

### Clean Installation
Remove old migrations before installing:
```bash
php artisan sabhero-estimator:install --fresh
```

### Force Overwrite
Overwrite existing files:
```bash
php artisan sabhero-estimator:install --force
```

### Silent Installation
For automated deployments:
```bash
php artisan sabhero-estimator:install --fresh --force --no-interaction
```

### Manual Installation
For complete control over the installation process:

```bash
# 1. Publish config
php artisan vendor:publish --tag="sabhero-estimator-config"

# 2. Publish migrations
php artisan vendor:publish --tag="sabhero-estimator-migrations"

# 3. Publish assets (images)
php artisan vendor:publish --tag="sabhero-estimator-assets"

# 4. Run migrations
php artisan migrate

# 5. (Optional) Publish views for customization
php artisan vendor:publish --tag="sabhero-estimator-views"
```

## Configuration

The configuration file is published to `config/sabhero-estimator.php`:

### Database Tables
```php
'table' => [
    'prefix' => 'estimator_', // Customize table prefix
],
```

### Form Endpoints
```php
'form_endpoints' => [
    'production_url' => config('forms.forms.free_estimate.production_url'),
    'development_url' => config('forms.forms.free_estimate.development_url'),
],
```

### Media Storage
```php
'media' => [
    'disk' => 'public', // Use any Laravel filesystem disk (public, s3, etc.)
],
```

## Usage

### Basic Implementation

The package provides a complete multi-step estimation wizard:

1. **Welcome** - Introduction and project type selection
2. **Contact Info** - Customer details collection
3. **Measurements** - Project-specific measurements and options
4. **Review** - Final estimate display and submission

### FilamentPHP Admin Resources

Access these resources in your admin panel:

- **Projects** - View and manage submitted estimates
- **Rates** - Configure pricing for different surface types
- **Multipliers** - Manage house styles, floors, conditions, coverage
- **Settings** - Customize deviation percentages and labels

### API Usage

```php
use Fuelviews\SabHeroEstimator\SabHeroEstimator;

$estimator = app(SabHeroEstimator::class);

// Get surface types for a project
$surfaces = $estimator->getSurfaceTypes('interior', 'partial');

// Get house styles with images
$houseStyles = $estimator->getHouseStyles();

// Get configuration options
$floorOptions = $estimator->getFloorOptions();
$paintConditions = $estimator->getPaintConditionOptions();
$coverageOptions = $estimator->getCoverageOptions();

// Manage settings
$deviationPercentage = $estimator->getDeviationPercentage();
$estimator->setSetting('key', 'value');

// Work with images
$imageUrl = $estimator->getImageUrl('pbg-ranch-1.jpg');
```

### Model Usage

```php
use Fuelviews\SabHeroEstimator\Models\Project;
use Fuelviews\SabHeroEstimator\Models\Rate;
use Fuelviews\SabHeroEstimator\Models\Multiplier;

// Query projects
$projects = Project::with(['areas.surfaces'])->latest()->get();
$interiorProjects = Project::where('project_type', 'interior')->get();
$premiumProjects = Project::where('estimated_high', '>', 5000)->get();

// Work with rates and multipliers
$rates = Rate::where('project_type', 'interior')->get();
$houseStyles = Multiplier::houseStyle()->get();
```

## Troubleshooting

### Images Not Loading

If images are showing duplicate paths:
1. Re-run migrations to fix image paths
2. Ensure images are published to the correct location
3. Check your media disk configuration

```bash
php artisan migrate:fresh
php artisan vendor:publish --tag="sabhero-estimator-assets" --force
```

### Migration Issues

```bash
# Check migration status
php artisan migrate:status | grep estimator

# Clean reinstall
php artisan sabhero-estimator:install --fresh --force
```

### Table Not Found

```bash
# Verify tables exist
php artisan tinker --execute="DB::table('estimator_rates')->count()"

# If not found, reinstall
php artisan sabhero-estimator:install --fresh
```

## Advanced Topics

### Calculation Logic

#### Interior Projects

**Full Interior:**
```
Base Cost = Total Square Footage × Interior Rate
Extras = Sum of selected extras (as multipliers)
Final Cost = Base Cost × (1 + Extras)
```

**Partial Interior:**
```
Cost = Sum of (Surface Area × Surface Rate) for each surface
```

#### Exterior Projects

```
Base Cost = Total Square Footage × Exterior Rate
Style/Floor/Condition = Applied additively
Coverage = Applied multiplicatively
Final Cost = ((Base Cost + Additive Multipliers) × Coverage)
```

#### Estimate Ranges

```
Low Estimate = Final Cost × (1 - Deviation %)
High Estimate = Final Cost × (1 + Deviation %)
```

### Database Schema

The package creates these tables:

- `estimator_projects` - Main project records
- `estimator_areas` - Project areas (partial interior)
- `estimator_surfaces` - Surface details within areas
- `estimator_rates` - Pricing rates with default data
- `estimator_multipliers` - Calculation multipliers with defaults
- `estimator_settings` - Configuration with default settings

### Package Structure

```
src/
├── Commands/           # Installation commands
├── Contracts/          # Interface definitions
├── Filament/          # Admin panel resources
├── Livewire/          # Livewire components
├── Models/            # Eloquent models
└── Services/          # Business logic

database/
├── migrations/        # Schema migrations
└── factories/         # Model factories

resources/
├── views/            # Blade templates
└── images/           # House style images
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Sweatybreeze](https://github.com/sweatybreeze)
- [Thejmitchener](https://github.com/thejmitchener)
- [Fuelviews](https://fuelviews.com)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.