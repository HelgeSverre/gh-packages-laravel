# laravel-world

A Laravel package which provides a list of the countries, states and cities based on nnjeim/world.

## Installation

1. Install the package
```bash
composer require jszd2022/laravel-world
```

2. Publish assets
```bash
php artisan vendor:publish --provider="JSzD\World\WorldServiceProvider"
```

3. Migrate
```
php artisan migrate
```

4. Seed the database
```
php -d memory_limit=512M artisan db:seed --class=WorldSeeder
```

## Configuration

The package comes with a default configuration file. You can customize the table names, API route prefix, and filter which countries to seed.

```php
// config/laravel-world.php

return [
    'countries' => [
        'only' => null,   // Array of ISO2 codes to include (e.g., ['US', 'GB'])
        'except' => null, // Array of ISO2 codes to exclude
    ],

    'routes' => [
        'enabled' => true,
        'prefix' => 'api',
    ],

    'migrations' => [
        'countries' => [
            'table_name' => 'laravel-world-countries',
        ],
        'states' => [
            'table_name' => 'laravel-world-states',
        ],
        'cities' => [
            'table_name' => 'laravel-world-cities',
        ],
    ],
    
    'cache_ttl' => 604800, // 1 week
];
```

## Usage

### PHP API

You can use the `World` facade to retrieve countries, states, and cities.

#### Retrieve Countries

```php
use JSzD\World\Facades\World;

// Get all countries (default fields: id, name, iso2)
$countries = World::countries([])->data;

// Get countries with specific fields and search
$countries = World::countries([
    'fields' => 'id,name,iso2,phone_code',
    'search' => 'United',
])->data;

// Filter countries
$countries = World::countries([
    'filters' => [
        'iso2' => 'US'
    ]
])->data;
```

#### Retrieve States

```php
// Get states for a country
$states = World::states([
    'filters' => [
        'country_code' => 'US'
    ]
])->data;
```

#### Retrieve Cities

```php
// Get cities for a state
$cities = World::cities([
    'filters' => [
        'state_id' => 123
    ]
])->data;

// Get cities for a country
$cities = World::cities([
    'filters' => [
        'country_code' => 'US'
    ]
])->data;
```

#### Caching

You can chain the `withCaching()` method to cache the result of the query.

```php
$countries = World::withCaching()->countries([])->data;
```

### API Endpoints

If enabled in the configuration, the following API endpoints are available:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/countries` | List all countries |
| `GET` | `/api/countries/{country_code}/states` | List states for a country |
| `GET` | `/api/countries/{country_code}/cities` | List cities for a country |

#### Query Parameters

All endpoints support the following query parameters:

- `fields`: Comma-separated string of fields to return (e.g., `id,name`).
- `filters[field]`: Filter by a specific field.
- `search`: Search by name (using `LIKE %search%`).

**Example:**
`GET /api/countries?fields=name,phone_code&search=Hung`

## Models

The package provides the following Eloquent models:

- `JSzD\World\Models\Country`
- `JSzD\World\Models\State`
- `JSzD\World\Models\City`

You can use these models to define relationships in your own models:

```php
public function country()
{
    return $this->belongsTo(\JSzD\World\Models\Country::class);
}
```

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
