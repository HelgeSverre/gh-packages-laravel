# Laravel Weather

A robust Laravel package to fetch, cache, and format weather data using the [Open-Meteo API](https://open-meteo.com/). It supports multi-language suggestions (English & Arabic), unit conversion, and flexible configuration.

## 🌟 Features

- **Current, Hourly & Daily Weather**: Fetch comprehensive weather data.
- **Localization**: Built-in support for English (`en`) and Arabic (`ar`).
- **Smart Suggestions**: Get human-readable advice based on weather conditions (e.g., "Take an umbrella").
- **Caching**: Automatic caching of API responses to improve performance.
- **Units**: Supports Metric (°C, km/h) and Imperial (°F, mph) systems.
- **Resilient**: Handles API timeouts and retries automatically.

## 📦 Installation

### 1. Install via Composer

```bash
composer require mhaggag/laravel-weather
```

### 2. Publish Configuration & Translations

Publish the configuration file and translation resources to your application:

```bash
php artisan vendor:publish --provider="MHaggag\LaravelWeather\WeatherServiceProvider"

# Or publish specific resources:
php artisan vendor:publish --tag="weather-config"

php artisan vendor:publish --tag="weather-translations"

php artisan vendor:publish --tag="weather-views"
```

This will publish:
- `config/weather.php`
- `lang/vendor/weather` (for customizing translations)
- `resources/views/vendor/weather` (for customizing the demo view)

### 3. Environment Configuration

Add the following to your `.env` file to customize defaults:

```env
OPEN_METEO_URL=https://api.open-meteo.com/v1
WEATHER_CACHE_TTL=300
WEATHER_UNITS=metric
WEATHER_TIMEZONE=auto
WEATHER_HTTP_TIMEOUT=8
WEATHER_ENABLE_DEMO=false
```

## 🚀 Usage

You can use the `Weather` facade (the alias is automatically registered) or inject the `MHaggag\LaravelWeather\Services\WeatherService` into your controllers and classes.

### Get Current Weather

Returns a simplified array with current weather conditions, formatted according to your locale and units.

```php
use MHaggag\LaravelWeather\Facades\Weather;

public function index()
{
    // Get current weather for Cairo (Lat: 30.0444, Lon: 31.2357)
    $current = Weather::current(30.0444, 31.2357);
    
    // With options (e.g., Arabic output)
    $currentAr = Weather::current(30.0444, 31.2357, ['locale' => 'ar']);
    
    return $current;
}
```

**Output Example:**
```json
{
    "temperature": "25.0 °C",
    "windspeed": "15.0 km/h",
    "condition": "Clear",
    "icon": "sun",
    "time": "2023-10-05T12:00"
}
```

### Get Raw Data

Fetch the raw response from Open-Meteo if you need to process it manually.

```php
$rawData = Weather::get(30.0444, 31.2357, [
    'hourly' => ['temperature_2m', 'rain'],
    'daily' => ['temperature_2m_max']
]);
```

And format data according to your needs.

```php
$data = Weather::format($rawData, [
    'units' => 'imperial',
    'locale' => 'en'
]);
```

### Or Do both in One Step

Get Formatted Data (Current + Hourly + Daily):

```php
$data = Weather::getAsFormatted(30.0444, 31.2357, [
    'units' => 'imperial',
    'locale' => 'en'
]);
```

### Weather Suggestions

Get a helpful message based on the weather data.

```php
$suggestion = Weather::getSuggestion($rawData, ['locale' => 'en']);
// Output: "Clear skies and high temperature — stay hydrated if heading out."
```

## ⚙️ Configuration

Check `config/weather.php` for advanced settings.

### Custom Suggestions
You can define custom rules for suggestions in the config file. The service evaluates rules in order and returns the message of the first match.

```php
'suggestions' => [
    [
        'condition' => 'Rain',
        'message' => 'Don\'t forget your umbrella!',
    ],
    [
        'min_temp' => 35,
        'message' => 'It\'s scorching hot outside!',
    ],
],
```

## Sample View Screenshots

You can enable the demo view in `config/weather.php` to see the sample view.

| English | Arabic |
| :---: | :---: |
| ![Sample view as English](resources/images/mhaggag-laravel-weather-en.png) | ![Sample view as Arabic](resources/images/mhaggag-laravel-weather-ar.png) |

## 🧪 Testing

Run the package tests:

```bash
composer test
```

## 📄 License

The MIT License (MIT).