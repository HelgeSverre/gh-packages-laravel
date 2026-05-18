# zairakai/laravel-twitch

[![Main][pipeline-main-badge]][pipeline-main-link]
[![Develop][pipeline-develop-badge]][pipeline-develop-link]
[![Coverage][coverage-badge]][coverage-link]

[![GitLab Release][gitlab-release-badge]][gitlab-release]
[![Packagist][packagist-badge]][packagist]
[![Downloads][downloads-badge]][packagist]
[![License][license-badge]][license]

[![PHP][php-badge]][php]
[![Laravel][laravel-badge]][laravel]
[![Static Analysis][phpstan-badge]][phpstan]
[![Code Style][pint-badge]][pint]

Complete Twitch API integration for Laravel: OAuth, Helix API, EventSub webhooks, and a badges system.

---

## Features

- **Helix API** — games, streams, users, clips, channels, search, and more via `Twitch` facade
- **OAuth 2.0** — authorization code flow, token refresh, and PKCE support via `TwitchOAuth` facade
- **EventSub** — subscribe to and handle Twitch webhook events with signature verification
- **Badges system** — fetch, cache, and display global and channel emote/badge sets
- **Event-driven** — Laravel events dispatched for every received EventSub notification
- **Token management** — automatic token refresh and storage

---

## Install

```bash
composer require zairakai/laravel-twitch
```

Publish the config:

```bash
php artisan vendor:publish --tag=config
```

Add your credentials to `.env`:

```env
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret
TWITCH_REDIRECT_URI=https://your-app.com/auth/twitch/callback
TWITCH_WEBHOOK_SECRET=your_webhook_secret
```

---

## Usage

### Helix API

```php
use Zairakai\LaravelTwitch\Facades\Twitch;

// Get top games
$games = Twitch::getTopGames();

// Get streams by user ID(s)
$streams = Twitch::getStreams(userIds: ['12345', '67890']);

// Get users by login(s) or ID(s)
$users = Twitch::getUsers(logins: 'username');

// Get the currently authenticated user (after setAccessToken)
$me = Twitch::getAuthenticatedUser();

// Search channels
$results = Twitch::searchChannels('gaming');
```

### OAuth

```php
use Zairakai\LaravelTwitch\Facades\TwitchOAuth;

// Redirect to Twitch authorization
$authUrl = TwitchOAuth::getAuthorizationUrl(['user:read:email', 'channel:read:subscriptions']);
return redirect($authUrl);

// Exchange code for token (in callback controller)
$token = TwitchOAuth::getAccessToken(request('code'));

// Refresh token
$newToken = TwitchOAuth::refreshToken($refreshToken);
```

### EventSub

```php
// Subscribe to events (webhook transport)
Twitch::createEventSubSubscription(
    type: 'stream.online',
    condition: ['broadcaster_user_id' => $broadcasterId],
    callbackUrl: route('twitch.webhook'),
    secret: config('twitch.eventsub.webhook_secret'),
);

// Handle webhooks — in routes/web.php
Route::post('/twitch/webhook', [TwitchAuthController::class, 'webhook']);

// Listen to dispatched Laravel events (string-based)
Event::listen('twitch.stream.online', function (array $eventData) {
    // handle the stream.online payload
});

Event::listen('twitch.channel.follow', function (array $eventData) {
    // handle the channel.follow payload
});
```

---

## Configuration

Key options in `config/twitch.php`:

| Key | Description |
| --- | --- |
| `client_id` | Twitch application client ID |
| `client_secret` | Twitch application client secret |
| `redirect_uri` | OAuth callback URL |
| `webhook_secret` | Secret for EventSub signature verification |
| `cache_ttl` | TTL in seconds for API response caching |

---

## Development

```bash
make quality        # pint + phpstan + rector + insights + markdownlint + shellcheck
make quality-fast   # pint + phpstan + markdownlint
make test           # phpunit / pest
```

---

## Getting Help

[![License][license-badge]][license]
[![Security Policy][security-badge]][security]
[![Issues][issues-badge]][issues]

**Made with ❤️ by [Zairakai][ecosystem]**

<!-- Reference Links -->
[pipeline-main-badge]: https://gitlab.com/zairakai/php-packages/laravel-twitch/badges/main/pipeline.svg?ignore_skipped=true&key_text=Main
[pipeline-main-link]: https://gitlab.com/zairakai/php-packages/laravel-twitch/commits/main
[pipeline-develop-badge]: https://gitlab.com/zairakai/php-packages/laravel-twitch/badges/develop/pipeline.svg?ignore_skipped=true&key_text=Develop
[pipeline-develop-link]: https://gitlab.com/zairakai/php-packages/laravel-twitch/commits/develop
[coverage-badge]: https://gitlab.com/zairakai/php-packages/laravel-twitch/badges/main/coverage.svg
[coverage-link]: https://gitlab.com/zairakai/php-packages/laravel-twitch/-/commits/main
[gitlab-release-badge]: https://img.shields.io/gitlab/v/release/zairakai/php-packages/laravel-twitch?logo=gitlab
[gitlab-release]: https://gitlab.com/zairakai/php-packages/laravel-twitch/-/releases
[packagist-badge]: https://img.shields.io/packagist/v/zairakai/laravel-twitch
[packagist]: https://packagist.org/packages/zairakai/laravel-twitch
[downloads-badge]: https://img.shields.io/packagist/dt/zairakai/laravel-twitch
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license]: ./LICENSE
[security-badge]: https://img.shields.io/badge/security-scanned-green.svg
[security]: ./SECURITY.md
[issues-badge]: https://img.shields.io/gitlab/issues/open-raw/zairakai%2Fphp-packages%2Flaravel-twitch?logo=gitlab&label=Issues
[issues]: https://gitlab.com/zairakai/php-packages/laravel-twitch/-/issues
[php-badge]: https://img.shields.io/badge/php-8.4-blue?logo=php
[php]: https://www.php.net
[laravel-badge]: https://img.shields.io/badge/Laravel-12%20%7C%2013-red?logo=laravel
[laravel]: https://laravel.com
[phpstan-badge]: https://img.shields.io/badge/static%20analysis-phpstan-5B2C6F.svg?logo=php
[phpstan]: https://phpstan.org
[pint-badge]: https://img.shields.io/badge/code%20style-pint-22C55E.svg
[pint]: https://laravel.com/docs/pint
[ecosystem]: https://gitlab.com/zairakai
