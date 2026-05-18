# Laravel Steam Apps DB

A Laravel package for managing Steam application data in your database. This package provides functionality to import Steam apps, fetch detailed information, and retrieve news for Steam games.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/artryazanov/laravel-steam-apps-db.svg?style=flat-square)](https://packagist.org/packages/artryazanov/laravel-steam-apps-db)
[![Total Downloads](https://img.shields.io/packagist/dt/artryazanov/laravel-steam-apps-db.svg?style=flat-square)](https://packagist.org/packages/artryazanov/laravel-steam-apps-db)
![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/artryazanov/laravel-steam-apps-db/run-tests.yml?branch=main&label=tests)
![GitHub Pint Action Status](https://img.shields.io/github/actions/workflow/status/artryazanov/laravel-steam-apps-db/run-pint.yml?branch=main&label=pint)
[![codecov](https://codecov.io/gh/artryazanov/laravel-steam-apps-db/graph/badge.svg)](https://codecov.io/gh/artryazanov/laravel-steam-apps-db)
[![PHP Version](https://img.shields.io/badge/php-%3E%3D8.2-8892BF.svg)](https://www.php.net/)
[![Laravel Version](https://img.shields.io/badge/laravel-11.x%7C12.x-red.svg)](https://laravel.com/)

## Introduction

Laravel Steam Apps DB provides a set of tools to work with Steam application data in your Laravel application. It allows you to:

- Import basic information about all Steam applications
- Fetch detailed information about specific Steam games
- Retrieve and store news articles for Steam games
- Access Steam app data through Eloquent models

The package handles all the database schema creation and provides a console command to import apps and queued jobs to fetch details and news from the Steam API.

## Installation

### Requirements

- PHP 8.2 or higher
- Laravel 11.x or 12.x

### Installation Steps

1. Install the package via Composer:

```bash
composer require artryazanov/laravel-steam-apps-db
```

2. The package will automatically register its service provider if you're using Laravel's package auto-discovery.

3. Publish and run the migrations:

```bash
php artisan migrate
```

## Usage

### Console Commands

The package provides one main console command:

#### Import Steam Apps

This command imports basic information about all Steam applications from the Steam API.

```bash
php artisan steam:import-apps
```

This will fetch a list of all Steam applications and store them in the `steam_apps` table.

After saving each app, this command dispatches queued jobs to fetch the app's details and news asynchronously via Laravel's queue.

### Configuration

- `laravel-steam-apps-db.enable_news_scanning`: Controls whether the package dispatches jobs to fetch Steam news. Default is `false` (disabled). Set via env `LSADB_ENABLE_NEWS_SCANNING=true` or publish and edit the config.
- `laravel-steam-apps-db.enable_workshop_scanning`: Controls whether the package dispatches jobs to fetch Steam Workshop items. Default is `false` (disabled). Set via env `LSADB_ENABLE_WORKSHOP_SCANNING=true` or publish and edit the config.
- `laravel-steam-apps-db.queue`: Queue name for dispatched jobs (e.g., `high`, `default`, `low`). Default is `default`. Set via env `LSADB_QUEUE=default` or publish and edit the config.
- `laravel-steam-apps-db.decay_seconds`: Global rate limit interval (in seconds) enforced via Redis throttle for FetchSteamApp* jobs. When > 0, jobs across all workers will run at most once per interval; when 0 or less, throttling is disabled. Default is `1`. Set via env `LSADB_DECAY_SECONDS=1`.

Note: Throttling requires Redis to be configured in your application (used by Laravel's `Redis::throttle`). If you don't use Redis, set `decay_seconds` to `0` to disable throttling.

Publish the config if needed:

```bash
php artisan vendor:publish --tag=laravel-steam-apps-db-config
```

### Queue and Jobs

Starting from the current version, fetching details and news is performed by queued jobs that are dispatched per app during import:

- `Artryazanov\LaravelSteamAppsDb\Jobs\FetchSteamAppDetailsJob`
- `Artryazanov\LaravelSteamAppsDb\Jobs\FetchSteamAppNewsJob`
- `Artryazanov\LaravelSteamAppsDb\Jobs\FetchSteamAppWorkshopItemsJob`

Additional notes:
- Details job is always dispatched for every app during import.
- News job is dispatched only when `laravel-steam-apps-db.enable_news_scanning` is enabled (disabled by default).
- Workshop job is dispatched only when `laravel-steam-apps-db.enable_workshop_scanning` is enabled (disabled by default).
- Jobs are unique per appid and implement Laravel's ShouldBeUnique, so duplicate jobs for the same appid won't be queued.
- API call pacing is handled via a global Redis throttle controlled by `laravel-steam-apps-db.decay_seconds`. When enabled, only one FetchSteamApp job is allowed to run per interval across all workers; excess jobs are released back to the queue to retry shortly.

To process the jobs, make sure you run a queue worker in your application environment:

```bash
php artisan queue:work
```

You can configure the queue connection (sync, database, redis, etc.) via your `.env` and `config/queue.php`. For production, use a supervisor or a process manager to keep the worker running.

Manual dispatch examples (optional):

```php
use Artryazanov\LaravelSteamAppsDb\Jobs\FetchSteamAppDetailsJob;
use Artryazanov\LaravelSteamAppsDb\Jobs\FetchSteamAppNewsJob;

// Dispatch jobs for a specific appid (e.g., 570 - DOTA 2)
FetchSteamAppDetailsJob::dispatch(570);
// Note: News scanning is optional. Ensure it's enabled in config
// or dispatch the job explicitly as needed.
FetchSteamAppNewsJob::dispatch(570);
// Workshop items (optional)
use Artryazanov\LaravelSteamAppsDb\Jobs\FetchSteamAppWorkshopItemsJob;
FetchSteamAppWorkshopItemsJob::dispatch(570);
```

Note: Previous console commands `steam:fetch-app-details` and `steam:fetch-app-news` have been replaced by the queued jobs and are no longer required.

### Models

The package provides several Eloquent models to interact with the stored data:

#### Main Models

- **SteamApp**: The core model representing a Steam application
- **SteamAppDetail**: Detailed information about a Steam app
- **SteamAppNews**: News articles for a Steam app
- **SteamAppWorkshopItem**: Workshop items for a Steam app

#### Related Models

- **SteamAppCategory**: Categories for Steam apps
- **SteamAppGenre**: Genres for Steam apps
- **SteamAppDeveloper**: Developers of Steam apps
- **SteamAppPublisher**: Publishers of Steam apps
- **SteamAppRequirement**: System requirements for different platforms
- **SteamAppScreenshot**: Screenshots for Steam apps
- **SteamAppMovie**: Videos/trailers for Steam apps
- **SteamAppPriceInfo**: Price information for Steam apps
- **SteamAppDlc**: DLC appids linked to a base app
- **SteamAppDemo**: Demos (appid + description)
- **SteamAppPackage**: Store package ids
- **SteamAppPackageGroup**: Package groups with display metadata
- **SteamAppPackageGroupSub**: Individual package options inside groups
- **SteamAppAchievementHighlighted**: Highlighted achievements
- **SteamAppContentDescriptorId**: Content descriptor ids (e.g. violence)
- **SteamAppRating**: Ratings from boards (ESRB, PEGI, etc.)

### Example Usage

```php
use Artryazanov\LaravelSteamAppsDb\Models\SteamApp;

// Get all Steam apps
$apps = SteamApp::all();

// Get a specific app by Steam appid
$app = SteamApp::where('appid', 570)->first(); // DOTA 2

// Get detailed information
$details = $app->detail;

// Get system requirements
$requirements = $app->requirements;

// Get screenshots
$screenshots = $app->screenshots;

// Get categories
$categories = $app->categories;

// Get genres
$genres = $app->genres;

// Get developers
$developers = $app->developers;

// Get publishers
$publishers = $app->publishers;

// Get price information
$priceInfo = $app->priceInfo;

// Get news articles
$news = $app->news;
```

## Database Schema

The package creates the following tables:

1. `steam_apps` - Main table with basic app info
2. `steam_app_details` - Detailed information about each app
3. `steam_app_requirements` - System requirements for different platforms
4. `steam_app_screenshots` - Screenshots for each app
5. `steam_app_movies` - Videos/trailers for each app
6. `steam_app_categories` - Categories reference table
7. `steam_app_category` - Pivot table for app-category relationship
8. `steam_app_genres` - Genres reference table
9. `steam_app_genre` - Pivot table for app-genre relationship
10. `steam_app_developers` - Developers reference table
11. `steam_app_developer` - Pivot table for app-developer relationship
12. `steam_app_publishers` - Publishers reference table
13. `steam_app_publisher` - Pivot table for app-publisher relationship
14. `steam_app_price_info` - Price information for each app
15. `steam_app_news` - News items for each app
16. `steam_app_dlcs` - DLC appids for each app
17. `steam_app_demos` - Demos for each app
18. `steam_app_packages` - Package ids for each app
19. `steam_app_package_groups` - Package groups per app
20. `steam_app_package_group_subs` - Group options (subs)
21. `steam_app_achievements_highlighted` - Highlighted achievements
22. `steam_app_content_descriptor_ids` - Content descriptor ids
23. `steam_app_ratings` - Ratings by boards
24. `steam_app_workshop_items` - Workshop items for each app

## Architecture

This package uses a modular architecture with **Actions** and **Services** to separate concerns:

- **Services**: `SteamApiClient` handles all direct interactions with the Steam API, including rate limiting and error handling.
- **Actions**: Contain the core business logic (e.g., `FetchSteamAppDetailsAction`, `ImportSteamAppsAction`).
- **Jobs**: Thin wrappers around Actions that handle queuing and uniqueness logic.

If you need to fetch dataprogrammatically without using the queue, you can resolve the Actions from the container:

```php
use Artryazanov\LaravelSteamAppsDb\Actions\FetchSteamAppDetailsAction;

// Fetch and store details for a specific app immediately
$action = app(FetchSteamAppDetailsAction::class);
$action->execute(570);
```

## Testing

The package includes tests for all its functionality. To run the tests, you can use either of the following methods:

```bash
# Using Composer script
composer test
```

```bash
# Using PHPUnit directly
vendor/bin/phpunit
```

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).
