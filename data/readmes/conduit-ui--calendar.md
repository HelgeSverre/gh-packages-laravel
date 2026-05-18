# Calendar

Provider-agnostic calendar client for Laravel. Google Calendar first, extensible to Outlook, iCal, and more.

[![CI](https://github.com/conduit-ui/calendar/actions/workflows/ci.yml/badge.svg)](https://github.com/conduit-ui/calendar/actions/workflows/ci.yml)

## Installation

```bash
composer require conduit-ui/calendar
```

## Configuration

Publish the config:

```bash
php artisan vendor:publish --tag=calendar-config
```

Set your Google Calendar access token:

```env
CALENDAR_DRIVER=google
GOOGLE_CALENDAR_ACCESS_TOKEN=your-token
```

## Usage

```php
use ConduitUI\Calendar\CalendarManager;

$calendar = app(CalendarManager::class);

// List today's events
$events = $calendar->driver()->listEvents(
    'primary',
    now()->startOfDay(),
    now()->endOfDay(),
);

// Each event is a CalendarEvent DTO
foreach ($events as $event) {
    echo "{$event->start->format('g:ia')}: {$event->title}";
    echo $event->location ? " ({$event->location})" : '';
    echo PHP_EOL;
}

// Get a specific event
$event = $calendar->driver()->getEvent('primary', 'event-id');

// List available calendars
$calendars = $calendar->driver()->listCalendars();
```

## CalendarEvent DTO

```php
ConduitUI\Calendar\Contracts\CalendarEvent {
    string $id
    string $title
    ?string $description
    Carbon $start
    Carbon $end
    bool $allDay
    ?string $location
    array $attendees    // [{email, name, status}]
    string $status      // confirmed, tentative, cancelled
    ?string $htmlLink
}
```

## Adding Drivers

Implement `CalendarProvider`:

```php
use ConduitUI\Calendar\Contracts\CalendarProvider;

class OutlookDriver implements CalendarProvider
{
    public function listCalendars(): Collection { ... }
    public function listEvents(string $calendarId, Carbon $start, Carbon $end, int $maxResults = 20): Collection { ... }
    public function getEvent(string $calendarId, string $eventId): CalendarEvent { ... }
    public function createEvent(string $calendarId, array $data): CalendarEvent { ... }
}
```

Register in the `CalendarManager` or extend via config.

## Requirements

- PHP 8.2+
- Laravel 12 or 13
- Saloon 4.x
- Spatie Laravel Data 4.x

## License

MIT
