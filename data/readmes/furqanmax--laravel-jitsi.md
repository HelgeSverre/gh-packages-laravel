# Laravel Jitsi Package

A Laravel package for managing Jitsi meetings with participants, scheduling, and real-time status tracking. Extracted from a production Laravel application for easy integration into any Laravel project.

## Requirements

- PHP 8.1+
- Laravel 10.0+ or 11.0+
- MySQL/PostgreSQL/SQLite database

## Installation

### Via Composer (Recommended)

```bash
composer require vcmeet/laravel-jitsi
```

### Local Development

Add this to your host app's `composer.json`:

```json
"repositories": [
    {
        "type": "path", 
        "url": "./packages/vcmeet/laravel-jitsi", 
        "options": { "symlink": true }
    }
]
```

Then run:
```bash
composer require vcmeet/laravel-jitsi:@dev
```

## Configuration

### 1. Publish the configuration file:

```bash
php artisan vendor:publish --tag=laravel-jitsi-config
```

This creates `config/meeting.php` where you can customize:
- Default meeting duration
- Meeting code length
- Participant statuses
- Model references

### 2. Publish the migration files:

```bash
php artisan vendor:publish --tag=laravel-jitsi-migrations
```

### 3. Run the migrations:

```bash
php artisan migrate
```

### 4. (Optional) Publish views for customization:

```bash
php artisan vendor:publish --tag=laravel-jitsi-views
```

## Usage

### Creating a Meeting

```php
use VcMeet\Jitsi\Models\Meeting;
use Illuminate\Support\Str;

// Create a new meeting
$meeting = Meeting::create([
    'code' => Str::random(10),
    'host_id' => auth()->id(),
    'start_time' => now()->addMinutes(15), // Optional: schedule for future
    'duration_minutes' => 60
]);

// Access meeting properties
echo $meeting->code; // Random 10-character code
echo $meeting->host_id; // Host user ID
echo $meeting->participants; // Related participants
```

### Managing Participants

```php
use VcMeet\Jitsi\Models\MeetingParticipant;

// Add a participant to a meeting
$participant = MeetingParticipant::create([
    'meeting_id' => $meeting->id,
    'user_id' => $userId,
    'status' => 'waiting' // waiting, approved, or kicked
]);

// Update participant status
$participant->status = 'approved';
$participant->save();

// Check participant status
if ($participant->status === 'approved') {
    // User can join the meeting
}
```

### Available Routes

The package provides the following routes (all require authentication):

| Method | URI | Name | Description |
|--------|-----|------|-------------|
| GET/POST | `/meeting/create` | `meeting.create` | Create a new meeting |
| GET | `/meeting/{code}` | `meeting.join` | Join a meeting by code |
| POST | `/meeting/{code}/approve` | `meeting.approve` | Approve a participant |
| POST | `/meeting/{code}/kick` | `meeting.kick` | Kick a participant |
| GET | `/meeting/{id}/ended` | `meeting.ended` | Meeting ended page |
| GET | `/meeting/{code}/time-remaining` | - | Get remaining time (JSON API) |
| GET | `/meetings` | `meetings.index` | List all meetings |

### Using the Facade

```php
use VcMeet\Jitsi\Facades\Jitsi;

// Access configuration
$defaultDuration = config('meeting.default_duration_minutes'); // 60
$codeLength = config('meeting.code_length'); // 10
```

### Real-time Time Tracking

The package includes a JavaScript-based timer that syncs with the server:

```javascript
// The join.blade.php view includes a timer that:
// 1. Fetches remaining time from `/meeting/{code}/time-remaining`
// 2. Updates every second with server time
// 3. Shows warnings when time is running out
// 4. Automatically redirects when meeting ends
```

## Testing

### Running Tests

```bash
# From the package directory
./vendor/bin/phpunit

# With coverage
./vendor/bin/phpunit --coverage-html build/coverage
```

### Test Structure

- `tests/Feature/MeetingTest.php` - Feature tests for routes and functionality
- `tests/Unit/MeetingModelTest.php` - Unit tests for models
- `tests/TestCase.php` - Base test case with Testbench setup

## Available Artisan Commands

The package doesn't include custom commands yet, but you can use standard Laravel commands:

```bash
# Run migrations
php artisan migrate

# Publish package files
php artisan vendor:publish --tag=laravel-jitsi-config
php artisan vendor:publish --tag=laravel-jitsi-migrations
php artisan vendor:publish --tag=laravel-jitsi-views
```

## Configuration Options

Edit `config/meeting.php` after publishing:

```php
return [
    'default_duration_minutes' => 60,  // Default meeting duration
    'code_length' => 10,               // Length of meeting codes
    'participant_statuses' => [
        'waiting',
        'approved', 
        'kicked'
    ],
    'meeting_model' => \VcMeet\Jitsi\Models\Meeting::class,
    'participant_model' => \VcMeet\Jitsi\Models\MeetingParticipant::class,
];
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Changelog

### 1.0.0
- Initial release
- Meeting management functionality
- Participant approval system
- Real-time time tracking
- Full test coverage
- Laravel auto-discovery support
