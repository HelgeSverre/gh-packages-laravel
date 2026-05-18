# Activity Tracker for Laravel

A powerful, standalone Laravel package to automatically track and log user activities, model changes, and authentication events. This package simplifies audit logging and activity tracking with minimal configuration.

## Features

- **Model Tracking**: Automatically log `created`, `updated`, `deleted`, `restored`, and `forceDeleted` events for any Eloquent model.
- **Authentication Logging**: Automated logging for user `login` and `logout` events.
- **Artisan Generator**: A robust `php artisan track:model <model_name>` command with automatic model inference and naming logic.
- **Tracker Discovery**: A `php artisan track:list` command to view all tracked models and their events.
- **Bulk Tracking**: A `php artisan track:all` command to automatically generate trackers for all untracked models.
- **Track Removal**: A `php artisan track:remove <model_name>` command to easily delete trackers and clean up models.
- **Auto-Tracking**: Automatically generates trackers when new models are created via `php artisan make:model`.
- **URL Visit Tracking**: Middleware to automatically log URLs visited by authenticated users.
- **Service Layer**: A ready-to-use `UserActivityService` for manual logging or custom implementations.
- **Activity Links**: Built-in support for model relationships and easy activity retrieval.
- **Developer Friendly**: Highly customizable stubs and easy registration via service providers.

## Installation

You can install the package via composer:

```bash
composer require tasmir/activity-tracker
```

The package will automatically register itself. To create the necessary database table, run the migrations:

```bash
php artisan migrate
```

### Configuration (Optional)
You can publish the configuration file to customize the package behavior (e.g., disabling auto-tracking):

```bash
php artisan vendor:publish --tag="activity-tracker-config"
```

## Basic Usage

### 1. Generating a Tracker
The easiest way to track a model (e.g., `User`) is to use the generator command:

```bash
php artisan track:model User
```

This command will:
- Create `app/ModelTracker/UserTracker.php`.
- Automatically add the `#[ObservedBy([UserTracker::class])]` attribute to your `User` model.
- Update your `User` model with necessary `use` statements and relationships.

### 2. Manual Logging
You can inject the `UserActivityService` into your controllers or jobs for manual logging:

```php
use Tasmir\ActivityTracker\Services\UserActivityService;

public function update(Request $request, Profile $profile, UserActivityService $service)
{
    $profile->update($request->all());

    $service->store(
        $profile,         // The model instance
        Profile::class,   // Model class name
        'profile_update', // Action name
        'User updated their profile information' // Description
    );
}
```

### 3. Authentication Events
The package automatically listens for Laravel's built-in authentication events. No extra setup is required to log:
- **Login**: `Illuminate\Auth\Events\Login`
- **Logout**: `Illuminate\Auth\Events\Logout`

## Management Commands

### List Tracked Models
To see all models currently being tracked and the events they handle:

```bash
php artisan track:list
```

### Bulk Track All Models
To automatically generate tracker classes for every model in your `app/Models` directory that isn't already tracked:

```bash
php artisan track:all
```

### Remove Tracking
To delete a tracker from a model:

```bash
php artisan track:remove User
```

## Auto-Tracking
By default, the package listens for the `make:model` command. When you create a new model, it will automatically trigger the generation of a corresponding tracker:

```bash
php artisan make:model Product
# Automatically triggers: php artisan track:model Product
```

You can disable this in the `config/activity-tracker.php` file by setting `auto_track_models` to `false`.

### 2. Authentication Events
User Login and Logout events are tracked by default. You can also toggle the tracking of login and logout events in the configuration:

```php
'track_login' => true,
'track_logout' => true,
```

### 3. URL Visit Tracking
To track pages visited by authenticated users, you can enable URL tracking and register the middleware in your application.

#### Configuration
In `config/activity-tracker.php`:
```php
'track_url_visits' => true,
```

#### Middleware Registration (Laravel 12+)
In `bootstrap/app.php`, register the middleware:

```php
use Tasmir\ActivityTracker\Http\Middleware\TrackUrlVisit;

->withMiddleware(function (Middleware $middleware) {
    $middleware->append(TrackUrlVisit::class);
})
```

### 4. Detailed URL Visit Tracking
For deep analytics, you can enable detailed tracking which captures location data (City, Country), IP, User Agent, Referer, Query Params, and request duration.

#### Configuration
In `config/activity-tracker.php`:
```php
'detailed_url_tracking' => [
    'enabled' => true,
],
```

#### Middleware Registration (Laravel 12+)
In `bootstrap/app.php`:

```php
use Tasmir\ActivityTracker\Http\Middleware\TrackDetailedUrlVisit;

->withMiddleware(function (Middleware $middleware) {
    $middleware->append(TrackDetailedUrlVisit::class);
})
```

#### Database Table
This feature uses the `url_visits` table. Make sure to run the migrations:
```bash
php artisan migrate
```

## Activity Log Cleanup
The package includes an automated scheduler to clean up old activity logs.

### Configuration
In `config/activity-tracker.php`:

```php
'log_cleanup' => [
    'enabled' => true,
    'retention_days' => 30,
    'schedule' => 'daily', // Options: daily, weekly, monthly
],
```

### Manual Cleanup
You can also manually cleanup logs using the command:

```bash
php artisan track:cleanup --days=15
```


## Activity Log Data

The `user_activities` table stores the following information:

| Key | Type | Description |
| :--- | :--- | :--- |
| `user_id` | `bigint` | The ID of the user performing the action. |
| `model_id` | `bigint` | The ID of the model being affected. |
| `model_type` | `string` | The class name of the model being affected. |
| `action` | `string` | The action performed (e.g., `created`, `login`). |
| `description` | `text` | A human-readable description of the activity. |
| `previous_data` | `json` | (Optional) Model state before the change. |
| `new_data` | `json` | (Optional) Model state after the change. |

## Relationships

If you want to access a user's activity logs, the `track:model` command automatically adds a relationship to the `User` model. You can access it like this:

```php
$user = User::find(1);
$logs = $user->activities; // Returns a collection of UserActivity models
```

## Contributing
Contributions are welcome! If you have any ideas, bug fixes, or improvements, feel free to open an issue or submit a pull request on [GitHub](https://github.com/tasmir/activity-tracker).

---
Developed by [Tasmir](https://github.com/tasmir)

## License
The MIT License (MIT). Please see [License File](LICENSE) for more information.
