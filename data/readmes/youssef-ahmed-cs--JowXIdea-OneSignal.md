# JowXIdea OneSignal

A Laravel package for sending OneSignal push notifications with a minimal client API, service provider, facade, and helper function.

## Features

- Laravel auto-discovery service provider
- Config publishing (`onesignal-config`)
- Container binding (`onesignal`)
- Facade (`OneSignal`) and helper (`onesignal()`)
- Send to all users, one user, many users, or named segments
- Custom payload support and legacy-compatible notification helpers
- Consistent HTTP response metadata for easier debugging
- Built with Orchestra Testbench for package testing

## Requirements

- PHP 8.1+
- Laravel 10/11/12

## Installation

```bash
composer require jowxidea/onesignal
```

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=onesignal-config
```

Set your environment variables:

```env
ONESIGNAL_APP_ID=your_app_id
ONESIGNAL_REST_API_KEY=your_rest_api_key
ONESIGNAL_USER_AUTH_KEY=optional_user_auth_key
ONESIGNAL_API_URL=https://onesignal.com/api/v1
ONESIGNAL_TIMEOUT=10
```

## Usage

### Send to all users

```php
onesignal()->sendToAll(
    ['en' => 'Hello everyone'],
    ['en' => 'Announcement'],
    ['source' => 'app']
);
```

### Send to one user

```php
onesignal()->sendToUser(
    'player-id-123',
    ['en' => 'Hello user']
);
```

### Send to many users

```php
onesignal()->sendToUsers(
    ['player-id-1', 'player-id-2'],
    ['en' => 'Hello group'],
    ['en' => 'Greeting'],
    ['source' => 'app']
);
```

### Send to a segment

```php
onesignal()->sendToSegments(
    ['Subscribed Users'],
    ['en' => 'New update is available'],
    ['en' => 'Update']
);
```

### Sending a custom payload

```php
onesignal()->send([
    'included_segments' => ['All'],
    'contents' => ['en' => 'Custom payload message'],
    'headings' => ['en' => 'Custom title'],
    'data' => ['source' => 'app'],
]);
```

### Legacy compatible methods

The client keeps compatibility with legacy OneSignal helpers while using Laravel HTTP internally:

- `sendNotificationToAll`
- `sendNotificationToUser`
- `sendNotificationToExternalUser`
- `sendNotificationUsingTags`

### Using the facade

```php
use Jowxidea\Onesignal\Facades\OneSignal;

OneSignal::sendToSegments(
    ['Subscribed Users'],
    ['en' => 'New update is available'],
    ['en' => 'Update']
);
```

## Response format

All API methods return an array. When OneSignal responds with JSON, the decoded response is returned directly and enriched with `_response` metadata:

- `status` — HTTP status code
- `ok` — whether the response status is 200–299
- `successful` — whether the response was successful
- `redirect` — whether the response was a redirect
- `headers` — returned response headers

For non-JSON responses, the package returns:

```php
[
    'body' => 'raw response body',
    '_response' => [
        'status' => 200,
        'ok' => true,
        'successful' => true,
        'redirect' => false,
        'headers' => [ ... ],
    ],
]
```

## Helper function

Use the global helper anywhere in your application:

```php
$client = onesignal();
```

## Testing

```bash
composer test
```

## License

MIT
