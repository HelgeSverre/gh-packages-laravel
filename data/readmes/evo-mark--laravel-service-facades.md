<p align="center">
    <a href="https://evomark.co.uk" target="_blank" alt="Link to evoMark's website">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="https://evomark.co.uk/wp-content/uploads/static/evomark-logo--dark.svg">
          <source media="(prefers-color-scheme: light)" srcset="https://evomark.co.uk/wp-content/uploads/static/evomark-logo--light.svg">
          <img alt="evoMark company logo" src="https://evomark.co.uk/wp-content/uploads/static/evomark-logo--light.svg" width="500">
        </picture>
    </a>
</p>

<p align="center">
    <a href="https://packagist.org/packages/evo-mark/evo-laravel-service-facades"><img src="https://img.shields.io/packagist/v/evo-mark/evo-laravel-service-facades?logo=packagist&logoColor=white" alt="Build status" /></a>
    <a href="https://packagist.org/packages/evo-mark/evo-laravel-service-facades"><img src="https://img.shields.io/packagist/dt/evo-mark/evo-laravel-service-facades" alt="Total Downloads"></a>
    <a href="https://packagist.org/packages/evo-mark/evo-laravel-service-facadess"><img src="https://img.shields.io/packagist/l/evo-mark/evo-laravel-service-facades" alt="License"></a>
</p>

# Evo Laravel Service Facades

Create services with a backing facade in multiple pre-defined locations, then automatically load them into your application.

Generate PHP Doc annotations for your facades to enable type-hinting in your IDE.

## Installation

```sh
composer require evo-mark/evo-laravel-service-facades
```

## Usage

```php
php artisan make:service
php artisan facades:annotate
```

To keep your annotations up-to-date, you should add the following to your application's `composer.json` file:

```json
 "post-autoload-dump": [
    "@php artisan facades:annotate --no-interaction"
],
```

By default, your app's Service and Facades folders will be used as the default "location". You can change this by publishing the package's config file.

```sh
php artisan v:p --provider="EvoMark\EvoLaravelServiceFacades\Provider"
```

If you'd prefer, you can instead add to the available locations during application boot by calling:

```php
use EvoMark\EvoLaravelServiceFacades\Facades\ServiceFacades;

public function boot()
{
    ServiceFacades::registerLocation(
        name: "Custom Location",
        serviceNamespace: "App\\CustomServices",
        facadeNamespace: "App\\CustomFacades",
        servicePath: app_path('CustomServices'),
        facadePath: app_path('CustomFacades'),
        exclude = ["SomeExcludedService"]
    );
}
```
