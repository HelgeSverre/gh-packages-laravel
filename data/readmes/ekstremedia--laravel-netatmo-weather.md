# Laravel Netatmo Weather

[![Latest Version](https://img.shields.io/packagist/v/ekstremedia/laravel-netatmo-weather)](https://packagist.org/packages/ekstremedia/laravel-netatmo-weather)
[![Total Downloads](https://img.shields.io/packagist/dt/ekstremedia/laravel-netatmo-weather)](https://packagist.org/packages/ekstremedia/laravel-netatmo-weather)
[![Tests](https://github.com/ekstremedia/laravel-netatmo-weather/workflows/Tests/badge.svg)](https://github.com/ekstremedia/laravel-netatmo-weather/actions)
[![codecov](https://codecov.io/gh/ekstremedia/laravel-netatmo-weather/branch/main/graph/badge.svg)](https://codecov.io/gh/ekstremedia/laravel-netatmo-weather)
[![PHP Version](https://img.shields.io/packagist/php-v/ekstremedia/laravel-netatmo-weather)](https://packagist.org/packages/ekstremedia/laravel-netatmo-weather)
[![Laravel Version](https://img.shields.io/badge/Laravel-11.x%20%7C%2012.x-orange)](https://laravel.com)
[![License](https://img.shields.io/packagist/l/ekstremedia/laravel-netatmo-weather)](https://github.com/ekstremedia/laravel-netatmo-weather/blob/main/LICENSE)

A Laravel package for integrating Netatmo Weather Station API with your Laravel application. This package provides an easy-to-use interface for authenticating with Netatmo, fetching weather data, and storing it in your database.

## Features

- OAuth2 authentication with Netatmo API
- Automatic token refresh
- Fetch and store weather station data
- Support for multiple weather stations per user
- **Device selection** - Manage multiple Netatmo devices with manual device selection for each configuration
- **Module lifecycle management** - Automatic archiving of disconnected/removed modules with manual deletion
- **Public sharing** - Share weather data publicly with customizable per-station access
- Built-in database models and migrations
- Encrypted storage of sensitive credentials
- Configurable caching of weather data
- Full UI scaffolding (optional)

## Requirements

- PHP 8.2 or higher
- Laravel 11.0 or 12.0
- A Netatmo Weather Station
- Netatmo API credentials (Client ID and Client Secret)

## Installation

### 1. Install the package via Composer

```bash
composer require ekstremedia/laravel-netatmo-weather
```

### 2. Publish the configuration file

```bash
php artisan vendor:publish --tag=config --provider="Ekstremedia\NetatmoWeather\NetatmoWeatherServiceProvider"
```

### 3. Publish the public assets (optional, if using the included UI)

```bash
php artisan vendor:publish --tag=public --provider="Ekstremedia\NetatmoWeather\NetatmoWeatherServiceProvider"
```

### 4. Run the migrations

```bash
php artisan migrate
```

## Configuration

### 1. Get Netatmo API Credentials

1. Go to [Netatmo Developer Portal](https://dev.netatmo.com/)
2. Create an app or use an existing one
3. Copy your Client ID and Client Secret

### 2. Configure your environment

Add the following to your `.env` file:

```env
NETATMO_AUTH_URL=https://api.netatmo.com/oauth2/authorize
NETATMO_TOKEN_URL=https://api.netatmo.com/oauth2/token
NETATMO_API_URL=https://api.netatmo.com/api

# Optional: Customize the User model
# NETATMO_USER_MODEL=App\Models\User
```

### 3. Configure the package

The configuration file `config/netatmo-weather.php` contains:

```php
return [
    'name' => 'Laravel Netatmo Weather',

    // The User model that will be used to associate with Netatmo stations
    'user_model' => env('NETATMO_USER_MODEL', 'App\Models\User'),

    // Netatmo API URLs
    'netatmo_auth_url' => env('NETATMO_AUTH_URL', 'https://api.netatmo.com/oauth2/authorize'),
    'netatmo_token_url' => env('NETATMO_TOKEN_URL', 'https://api.netatmo.com/oauth2/token'),
    'netatmo_api_url' => env('NETATMO_API_URL', 'https://api.netatmo.com/api'),
];
```

## Usage

### Using the Service

```php
use Ekstremedia\NetatmoWeather\Services\NetatmoService;
use Ekstremedia\NetatmoWeather\Models\NetatmoStation;

// Get the service instance
$netatmoService = app(NetatmoService::class);

// Find a weather station
$weatherStation = NetatmoStation::first();

// Fetch data from Netatmo API
// This will automatically cache data for 10 minutes
$data = $netatmoService->getStationData($weatherStation);
```

### Using the Models

```php
use Ekstremedia\NetatmoWeather\Models\NetatmoStation;
use Ekstremedia\NetatmoWeather\Models\NetatmoModule;
use Ekstremedia\NetatmoWeather\Models\NetatmoToken;

// Get all weather stations
$stations = NetatmoStation::all();

// Get a station with its modules
$station = NetatmoStation::with('modules')->first();

// Check if token is valid
if ($station->token->hasValidToken()) {
    echo "Token is valid!";
}

// Manually refresh token
$station->token->refreshToken();

// Access module data
foreach ($station->modules as $module) {
    echo "Module: {$module->module_name}\n";
    echo "Type: {$module->type}\n";
    echo "Battery: {$module->battery_percent}%\n";
}
```

### Using the UI (Optional)

If you want to use the included UI scaffolding, the package provides routes and controllers:

```php
// In your routes/web.php or through the package routes
// The following routes are automatically registered:

Route::get('/netatmo', [NetatmoStationController::class, 'index'])->name('netatmo.index');
Route::get('/netatmo/create', [NetatmoStationController::class, 'create'])->name('netatmo.create');
Route::post('/netatmo', [NetatmoStationController::class, 'store'])->name('netatmo.store');
Route::get('/netatmo/{weatherstation}', [NetatmoStationController::class, 'show'])->name('netatmo.show');
Route::get('/netatmo/{weatherstation}/edit', [NetatmoStationController::class, 'edit'])->name('netatmo.edit');
Route::put('/netatmo/{weatherstation}', [NetatmoStationController::class, 'update'])->name('netatmo.update');
Route::delete('/netatmo/{weatherstation}', [NetatmoStationController::class, 'destroy'])->name('netatmo.destroy');
```

Visit `/netatmo` in your browser to manage your weather stations.

## Public Sharing

The package supports public sharing of weather station data. Each station can be individually configured for public access:

### Enabling Public Access

**Via the UI:**
1. Navigate to your weather station detail page
2. Use the toggle switch in the "Public Access" section
3. Copy the generated public URL to share

**Or in the edit form:**
1. Check the "Make this station publicly accessible" checkbox when creating or editing a station

**Programmatically:**
```php
$station = NetatmoStation::find($id);
$station->update(['is_public' => true]);
```

### Public Route

Once enabled, your weather station data will be accessible at:
```
/netatmo/public/{station-uuid}
```

This route:
- Does not require authentication
- Shows a clean, minimal view with only weather widgets
- Returns 404 if the station is not marked as public
- Returns 503 if data is temporarily unavailable

### Security

- Only stations explicitly marked as `is_public = true` are accessible
- OAuth tokens and credentials are never exposed
- Station owners maintain full control over public access
- Public URLs use UUIDs for non-sequential identification

## Device Selection

If your Netatmo account has access to multiple weather stations, the package will prompt you to select which physical device each configuration should display data from.

### Multiple Weather Stations: Two Approaches

**Option 1: Shared Access (Recommended)**
- Have others share their weather stations with your Netatmo account
- Use your single account credentials for all configurations
- Use device selection to choose which physical station each configuration displays
- Simpler management, single authentication

**Option 2: Separate Credentials (Fully Independent)**
- Each station configuration uses **completely different** Netatmo account credentials
- Each station authenticates separately with its own account
- Each station fetches data using its own OAuth token
- Each station is 100% isolated - no shared state
- Useful when:
  - Sharing is not possible or desired
  - You want complete independence between stations
  - Different people manage different weather stations
  - You need to display weather from multiple Netatmo accounts

### Setting Up Shared Access (Option 1)

To display weather stations owned by others (family, friends, other locations):

1. **Have the station owner share access:**
   - They log into the Netatmo mobile app
   - Go to Settings → Manage my Home
   - Add you as a guest/user with access to their weather station

2. **Your account now sees multiple devices:**
   - After sharing, your Netatmo account has access to both stations
   - When you authenticate a configuration, you'll see all available devices
   - Select which physical device each configuration should display

3. **Example Setup:**
   - Configuration "My Home" → Select your weather station
   - Configuration "Parents' House" → Select parents' weather station
   - Both use your credentials, different device_id values

### Setting Up Separate Credentials (Option 2)

To use completely independent Netatmo accounts for different stations:

1. **Get API credentials for each Netatmo account:**
   - Account A (yours): Go to https://dev.netatmo.com/ → Create App → Get Client ID + Secret
   - Account B (parents'): They do the same → Get their Client ID + Secret

2. **Create station configurations with different credentials:**
   - Create Station 1: Use Account A credentials
   - Create Station 2: Use Account B credentials
   - Each station stores its credentials separately (encrypted)

3. **Authenticate each station independently:**
   - Visit `/netatmo/authenticate/{station-1}` → Login with Account A
   - Visit `/netatmo/authenticate/{station-2}` → Login with Account B
   - Each gets its own OAuth token

4. **Each station operates independently:**
   - Station 1 fetches data using Account A's token
   - Station 2 fetches data using Account B's token
   - No shared state, complete isolation

**Visual Indicators:**
- The UI shows masked Client ID for each station (e.g., `66c3d88a••••`)
- Different Client IDs confirm different accounts are being used
- Token status is tracked separately per station

### How It Works

1. **Single Device**: If you only have one weather station, the device is automatically selected
2. **Multiple Devices**: When you have multiple weather stations (owned or shared), you'll be redirected to a device selection page after authentication
3. **Manual Selection**: Choose which Netatmo device this configuration should use from a list showing:
   - Station name
   - Number of modules
   - Device ID (MAC address)

### Changing Device Selection

You can change which device a configuration uses at any time by visiting:
```
/netatmo/{station}/select-device
```

This is useful if you want to:
- Reassign a configuration to a different physical device
- Fix incorrect device assignments
- Manage multiple locations with similar setups

### Technical Details

- Device IDs are Netatmo MAC addresses (e.g., `70:ee:50:5e:db:30`)
- The same physical device can be used by multiple configurations
- Different configurations can display data from different devices
- Device selection is stored in the `device_id` column

## Module Lifecycle Management

The package automatically tracks which modules are active and archives modules that are no longer detected by the Netatmo API.

### How It Works

1. **Active Modules**: Modules currently detected in the Netatmo API response are marked as active and displayed normally
2. **Automatic Archiving**: When a module is no longer in the API response (removed, dead battery, lost connection), it's automatically marked as inactive
3. **Archived Section**: Inactive modules appear in a collapsible "Archived Modules" section on the station detail page
4. **Manual Deletion**: You can permanently delete archived modules if they're no longer needed

### Common Scenarios

**Lost Module:**
- Battery dies on outdoor module
- Next data refresh marks it as inactive
- Module appears in Archived Modules section
- Replace battery → module automatically reactivates on next refresh

**Removed Module:**
- You remove a rain gauge from your station
- Module is automatically archived
- You can delete it permanently from the archived section

**Different Station Configurations:**
- Your home has outdoor + wind modules
- Your cabin has only the main module
- Each configuration only shows its own active modules

### Benefits

- No stale data displayed from disconnected modules
- Historical data preserved for inactive modules
- Clean interface showing only current setup
- Easy cleanup of permanently removed modules

## Authentication Flow

1. Create a weather station record with your Client ID, Client Secret, and Redirect URI
2. Navigate to the authentication route: `/netatmo/{station}/authenticate`
3. You'll be redirected to Netatmo to authorize the app
4. After authorization, you'll be redirected back with access tokens
5. If your Netatmo account has multiple weather stations, you'll be prompted to select which device this configuration should use
6. The package automatically stores and refreshes tokens as needed

## Data Structure

### NetatmoStation

- `id` - Primary key
- `uuid` - UUID for public routing
- `user_id` - Associated user
- `station_name` - Name of the station
- `device_id` - Netatmo device MAC address (selected during setup if multiple devices exist, or auto-populated if only one device)
- `is_public` - Boolean flag for public access (default: false)
- `client_id` - Encrypted Netatmo Client ID
- `client_secret` - Encrypted Netatmo Client Secret
- `redirect_uri` - OAuth redirect URI
- `webhook_uri` - Webhook URI (optional)

### NetatmoModule

Stores data for each module (base station and add-on modules):

- Module identification (module_id, module_name, type)
- Battery status
- Connection status (wifi_status, rf_status, reachable)
- Dashboard data (stored as JSON)
- `is_active` - Boolean flag indicating if module is currently detected (default: true)

### NetatmoToken

- `access_token` - Current access token
- `refresh_token` - Refresh token
- `expires_at` - Token expiration timestamp

## Supported Module Types

- `NAMain` - Main indoor module
- `NAModule1` - Outdoor module
- `NAModule2` - Wind gauge
- `NAModule3` - Rain gauge
- `NAModule4` - Additional indoor module

## Caching

The package automatically caches weather data for 10 minutes to reduce API calls. You can modify this behavior in the `NetatmoService` class.

## Security

- Client ID and Client Secret are automatically encrypted in the database
- Tokens are securely stored and automatically refreshed
- All API communications use HTTPS

## Testing

The package includes comprehensive test coverage using **Pest PHP**:

```bash
# Run all tests
composer test

# Run tests with coverage report
composer test-coverage

# Run specific test suite
vendor/bin/pest --testsuite Unit
vendor/bin/pest --testsuite Feature

# Run tests in parallel
vendor/bin/pest --parallel

# Check code style
composer format
vendor/bin/pint --test
```

### Test Coverage

**Unit Tests (14 tests):**
- Model functionality (NetatmoStation, NetatmoToken, NetatmoModule)
- Encryption and UUID generation
- Relationships and cascade deletes
- Token validation and expiration
- JSON field casting

**Feature Tests (13 tests):**
- CRUD operations for weather stations
- Authentication flow and redirects
- API integration with HTTP mocking
- Data caching (10-minute strategy)
- Module updates without duplication

### Why Pest?

Pest provides a more elegant and expressive testing syntax:

```php
it('can create a netatmo station', function () {
    $station = NetatmoStation::create([...]);
    expect($station->uuid)->not->toBeNull();
});
```

### CI/CD

The package uses GitHub Actions for continuous integration:
- Tests against PHP 8.2 & 8.3
- Tests against Laravel 11.x & 12.x
- Uses Pest for elegant test execution
- Code style checks with Laravel Pint
- Runs on every push and pull request

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This package is open-sourced software licensed under the MIT license.

## Credits

- [Terje Nesthus](https://github.com/ekstremedia)
- [All Contributors](../../contributors)

## Support

If you discover any security-related issues, please email terje@nesthus.no instead of using the issue tracker.

## Links

- [Netatmo API Documentation](https://dev.netatmo.com/apidocumentation/weather)
- [Netatmo Developer Portal](https://dev.netatmo.com/)
