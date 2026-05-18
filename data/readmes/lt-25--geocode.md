# Geocode

A powerful and elegant Laravel package for geocoding and reverse geocoding using the location iq API.

## Features

✨ **Easy to Use** - Simple and intuitive API
🌍 **Global Coverage** - Works worldwide
🔄 **Reverse Geocoding** - Convert coordinates to addresses
🏙️ **Location Search** - Find cities, states, and addresses
⚡ **Caching Support** - Cache results to reduce API calls
📝 **Comprehensive Logging** - Built-in logging for debugging
🔒 **Type Safe** - Full PHP 7.4+ and 8.0+ support
✅ **Laravel 7-11** - Works with all modern Laravel versions

## Installation

Install via Composer:

```bash
composer require lt-25/geocode
```

## Setup

After installation you'll want to publish the configuration and set a couple of environment variables.

```bash
php artisan vendor:publish --provider="Lalit\Geocode\Providers\GeocodeServiceProvider" --tag="geocode-config"
```

This will copy `config/geocode.php` to your application's config directory. The package reads the following env values (you can add them to your `.env` file):

```dotenv
# Choose provider (default: location-iq)
GEOCODE_PROVIDER=location-iq

# API credentials for the Maps.co/LocationIQ service
GEOCODE_MAPS_CO_KEY=your_api_key_here
GEOCODE_MAPS_CO_URL=https://api.locationiq.com/v1/autocomplete

# Optional tuning
GEOCODE_TIMEOUT=15
GEOCODE_CACHE_ENABLED=false
GEOCODE_CACHE_TTL=3600
GEOCODE_CACHE_STORE=default
GEOCODE_RATE_LIMIT=false
GEOCODE_RATE_LIMIT_REQUESTS=60
GEOCODE_RATE_LIMIT_PERIOD=60
GEOCODE_DEFAULT_LIMIT=50

# Logging (enabled by default)
GEOCODE_LOGGING=true
GEOCODE_LOG_CHANNEL=single
```

You can adjust these values to suit your application.
