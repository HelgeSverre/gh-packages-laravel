# Laravel Pinterest SDK

A Laravel-native SDK for the Pinterest API v5. Provides a clean, expressive interface for interacting with Pinterest's boards, pins, ads, and user accounts using Laravel's HTTP client.

## Requirements

- PHP 8.2+
- Laravel 11.0+ or 12.0+

## Installation

Install the package via Composer:

```bash
composer require pinterest/laravel-sdk
```

The service provider and facade are auto-discovered by Laravel.

### Publish Configuration

```bash
php artisan vendor:publish --tag="pinterest-config"
```

This publishes `config/pinterest.php` to your application.

## Configuration

Add the following to your `.env` file:

```env
PINTEREST_CLIENT_ID=your-app-id
PINTEREST_CLIENT_SECRET=your-app-secret
PINTEREST_REDIRECT_URI=https://your-app.com/pinterest/callback
PINTEREST_ACCESS_TOKEN=your-access-token
PINTEREST_REFRESH_TOKEN=your-refresh-token
```

### Full Configuration Options

| Key | Env Variable | Default | Description |
|-----|-------------|---------|-------------|
| `client_id` | `PINTEREST_CLIENT_ID` | `''` | Pinterest App ID |
| `client_secret` | `PINTEREST_CLIENT_SECRET` | `''` | Pinterest App Secret |
| `redirect_uri` | `PINTEREST_REDIRECT_URI` | `''` | OAuth callback URL |
| `access_token` | `PINTEREST_ACCESS_TOKEN` | `''` | Bearer access token |
| `refresh_token` | `PINTEREST_REFRESH_TOKEN` | `''` | OAuth refresh token |
| `api_version` | `PINTEREST_API_VERSION` | `v5` | API version |
| `base_url` | `PINTEREST_BASE_URL` | `https://api.pinterest.com` | API base URL |
| `oauth_url` | `PINTEREST_OAUTH_URL` | `https://www.pinterest.com/oauth/` | OAuth URL |
| `scopes` | `PINTEREST_SCOPES` | `boards:read,pins:read,user_accounts:read` | OAuth scopes |
| `timeout` | `PINTEREST_TIMEOUT` | `30` | Request timeout (seconds) |
| `retry.times` | - | `3` | Max retry attempts |
| `retry.sleep` | - | `100` | Retry delay (milliseconds) |

## Usage

All API interactions are available through the `Pinterest` facade.

### Boards

```php
use Pinterest\Facades\Pinterest;

// List boards
$boards = Pinterest::boards()->list(['page_size' => 25]);
foreach ($boards->items() as $board) {
    echo $board['name'];
}

// Get a specific board
$board = Pinterest::boards()->get('board-id');

// Create a board
$board = Pinterest::boards()->create([
    'name' => 'My Recipes',
    'description' => 'Favorite recipes collection',
    'privacy' => 'PUBLIC',
]);

// Update a board
Pinterest::boards()->update('board-id', [
    'name' => 'Updated Name',
]);

// Delete a board
Pinterest::boards()->delete('board-id');

// Board sections
Pinterest::boards()->createSection('board-id', ['name' => 'Desserts']);
Pinterest::boards()->listSections('board-id');
Pinterest::boards()->updateSection('board-id', 'section-id', ['name' => 'New Name']);
Pinterest::boards()->deleteSection('board-id', 'section-id');

// List pins on a board
$pins = Pinterest::boards()->listPins('board-id');
```

### Pins

```php
// List pins
$pins = Pinterest::pins()->list(['page_size' => 10]);

// Get a pin
$pin = Pinterest::pins()->get('pin-id');

// Create a pin
$pin = Pinterest::pins()->create([
    'board_id' => 'board-id',
    'title' => 'Amazing Sunset',
    'description' => 'Beautiful sunset at the beach',
    'link' => 'https://example.com/sunset',
    'media_source' => [
        'source_type' => 'image_url',
        'url' => 'https://example.com/sunset.jpg',
    ],
]);

// Update a pin
Pinterest::pins()->update('pin-id', [
    'title' => 'Updated Title',
]);

// Delete a pin
Pinterest::pins()->delete('pin-id');

// Save a pin to a different board
Pinterest::pins()->save('pin-id', [
    'board_id' => 'other-board-id',
]);
```

### User Account

```php
// Get authenticated user info
$user = Pinterest::user()->getAccount();
echo $user->get('username');

// Get user analytics
$analytics = Pinterest::user()->getAnalytics([
    'start_date' => '2024-01-01',
    'end_date' => '2024-01-31',
    'metric_types' => 'IMPRESSION,PIN_CLICK',
]);

// Top pins analytics
$topPins = Pinterest::user()->getTopPinsAnalytics([
    'start_date' => '2024-01-01',
    'end_date' => '2024-01-31',
    'sort_by' => 'IMPRESSION',
    'num_of_pins' => 10,
]);
```

### Pagination

Pinterest uses cursor-based pagination with bookmark tokens. The SDK handles this transparently:

```php
$response = Pinterest::boards()->list(['page_size' => 25]);

// Iterate through all pages
while (true) {
    foreach ($response->items() as $board) {
        echo $board['name'] . "\n";
    }

    if (!$response->hasMorePages()) {
        break;
    }

    $response = $response->getNextPage();
}
```

### OAuth Flow

The SDK provides a complete OAuth2 authorization code flow:

```php
// 1. Generate authorization URL and redirect user
$state = bin2hex(random_bytes(16));
session(['pinterest_oauth_state' => $state]);

$url = Pinterest::oauth()->getAuthorizationUrl($state);
return redirect($url);

// 2. Handle the callback - exchange code for token
$code = request('code');
$token = Pinterest::oauth()->exchangeCodeForToken($code);

// Store tokens securely
$token->getAccessToken();   // Access token string
$token->getRefreshToken();  // Refresh token string
$token->getExpiresIn();     // Lifetime in seconds

// 3. Use the new token
Pinterest::setAccessToken($token->getAccessToken());

// 4. Refresh an expired token
$newToken = Pinterest::oauth()->refreshToken($token->getRefreshToken());
```

### Ads API

All ads endpoints require an ad account ID:

```php
// List ad accounts
$accounts = Pinterest::adAccounts()->list();

// Campaigns
$campaigns = Pinterest::campaigns()->list('ad-account-id');
Pinterest::campaigns()->create('ad-account-id', [
    ['name' => 'Spring Sale', 'objective_type' => 'AWARENESS', 'status' => 'ACTIVE'],
]);
Pinterest::campaigns()->get('ad-account-id', 'campaign-id');

// Ad Groups
$adGroups = Pinterest::adGroups()->list('ad-account-id');
Pinterest::adGroups()->create('ad-account-id', $data);

// Ads
$ads = Pinterest::ads()->list('ad-account-id');
Pinterest::ads()->create('ad-account-id', $data);

// Audiences
$audiences = Pinterest::audiences()->list('ad-account-id');
Pinterest::audiences()->create('ad-account-id', [
    'name' => 'My Audience',
    'rule' => ['visitor_source_id' => 'tag-id'],
    'audience_type' => 'VISITOR',
]);

// Conversion events
Pinterest::conversions()->sendEvents('ad-account-id', [
    'data' => [
        [
            'event_name' => 'checkout',
            'action_source' => 'web',
            'event_time' => time(),
            'user_data' => ['em' => [hash('sha256', 'user@example.com')]],
        ],
    ],
]);

// Conversion tags
Pinterest::conversions()->listTags('ad-account-id');
Pinterest::conversions()->createTag('ad-account-id', ['name' => 'My Tag']);

// Keywords
Pinterest::keywords()->list('ad-account-id', ['ad_group_id' => 'group-id']);
Pinterest::keywords()->create('ad-account-id', $keywordsData);

// Customer Lists
Pinterest::customerLists()->list('ad-account-id');
Pinterest::customerLists()->create('ad-account-id', $listData);
```

### Media Upload

```php
// Register a media upload
$media = Pinterest::media()->register(['media_type' => 'video']);

// Check upload status
$status = Pinterest::media()->getStatus($media->get('media_id'));
```

### Error Handling

The SDK throws typed exceptions for different error scenarios:

```php
use Pinterest\Exceptions\PinterestApiException;
use Pinterest\Exceptions\PinterestAuthException;
use Pinterest\Exceptions\PinterestRateLimitException;
use Pinterest\Exceptions\PinterestValidationException;

try {
    $boards = Pinterest::boards()->list();
} catch (PinterestAuthException $e) {
    // 401/403 - Invalid or expired credentials
    // Refresh token and retry
} catch (PinterestRateLimitException $e) {
    // 429 - Rate limited
    $retryAfter = $e->getRetryAfter();   // Seconds to wait
    $remaining = $e->getRateLimitRemaining();
} catch (PinterestValidationException $e) {
    // 400/422 - Invalid request data
    $errors = $e->getValidationErrors();
} catch (PinterestApiException $e) {
    // Any other API error
    $status = $e->getCode();
    $body = $e->getErrorBody();
    $response = $e->getResponse();
}
```

### Working with Responses

All API calls return an `ApiResponse` (or `PaginatedResponse` for list endpoints):

```php
$response = Pinterest::boards()->get('board-id');

// Access data
$response->json();              // Full decoded JSON body
$response->get('name');         // Dot-notation access
$response->get('owner.id');     // Nested dot-notation
$response->status();            // HTTP status code
$response->successful();        // Boolean: 2xx status
$response->toArray();           // Convert to array
$response->toJson();            // Convert to JSON string
$response['name'];              // Array access

// Headers
$response->headers();           // All headers
$response->header('X-Custom');  // Specific header
```

### Dynamic Token Switching

```php
// Change token at runtime
Pinterest::setAccessToken('different-token');

// Access the underlying client
$client = Pinterest::getClient();
$client->setAccessToken('another-token');
```

## Available Services

| Method | Service | Description |
|--------|---------|-------------|
| `boards()` | `BoardsService` | Boards + sections CRUD, list pins |
| `pins()` | `PinsService` | Pins CRUD, save pins |
| `user()` | `UserService` | Account info, analytics |
| `media()` | `MediaService` | Media upload registration |
| `adAccounts()` | `AdAccountsService` | Ad accounts list/get/analytics |
| `campaigns()` | `CampaignsService` | Campaigns CRUD, analytics |
| `adGroups()` | `AdGroupsService` | Ad groups CRUD, analytics |
| `ads()` | `AdsService` | Ads CRUD, analytics |
| `audiences()` | `AudiencesService` | Audiences CRUD |
| `conversions()` | `ConversionsService` | Conversion events + tags |
| `customerLists()` | `CustomerListsService` | Customer lists CRUD |
| `keywords()` | `KeywordsService` | Keywords CRUD, metrics |
| `oauth()` | `OAuthService` | Authorization + token management |

## Testing

```bash
composer test
```

## Static Analysis

```bash
composer analyse
```

## Code Formatting

```bash
composer format
```

## Architecture

The package follows a layered architecture:

- **Facade** (`Pinterest\Facades\Pinterest`) - Static access point
- **Manager** (`Pinterest\Pinterest`) - Lazy-loads service instances
- **Services** (`Pinterest\Services\*`) - Domain-specific API wrappers
- **Client** (`Pinterest\Client\PinterestClient`) - HTTP abstraction with auth, retries, error mapping
- **Auth** (`Pinterest\Auth\OAuthService`) - OAuth2 flow management
- **Support** (`Pinterest\Support\*`) - Response wrappers, pagination
- **Exceptions** (`Pinterest\Exceptions\*`) - Typed exception hierarchy

## License

The MIT License (MIT). See [LICENSE.md](LICENSE.md) for more information.
