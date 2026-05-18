# Laravel Facebook Data Deletion

<div align="center" class="filament-hidden">

[![Downloads](https://img.shields.io/packagist/dt/lartisan/laravel-facebook-data-deletion.svg?style=flat-square)](https://packagist.org/packages/lartisan/laravel-facebook-data-deletion/stats)
[![Tests](https://img.shields.io/github/actions/workflow/status/lartisan/laravel-facebook-data-deletion/facebook-data-deletion-package-tests.yml?branch=main&style=flat-square&label=tests)](https://github.com/lartisan/laravel-facebook-data-deletion/actions)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/lartisan/laravel-facebook-data-deletion.svg?style=flat-square)](https://packagist.org/packages/lartisan/laravel-facebook-data-deletion)
[![License](https://img.shields.io/packagist/l/lartisan/laravel-facebook-data-deletion.svg?style=flat-square)](https://github.com/lartisan/laravel-facebook-data-deletion/blob/main/LICENSE)

</div>

A Laravel package that automates Meta / Facebook **Data Deletion Request** callbacks through a secure webhook.

It validates and decodes the incoming `signed_request`, stores a deletion tracking record, dispatches the deletion workflow asynchronously, and exposes a public status page or JSON status endpoint for the confirmation code returned to Meta.

> The package is intentionally generic. It does not assume a specific `User` model, a fixed Facebook ID column, or a hardcoded deletion strategy. Those details are provided by your application through resolver and deletion handler classes.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Webhook Setup in Meta Dashboard](#webhook-setup-in-meta-dashboard)
- [The Status Page](#the-status-page)
- [Testing](#testing)
- [Postman / Insomnia Guide](#postman--insomnia-guide)
- [Security](#security)
- [Package Architecture](#package-architecture)

## Requirements

- PHP 8.2+
- Laravel 11+

The package is designed to work with Laravel 11 and Laravel 12.

## Installation

### 1. Install the package

```bash
composer require lartisan/laravel-facebook-data-deletion
```

### 2. Publish the configuration file

```bash
php artisan vendor:publish --tag=facebook-data-deletion-config
```

### 3. Run the migration

The package stores deletion tracking records in the `facebook_data_deletion_requests` table.

```bash
php artisan migrate
```

### 4. Optionally publish the status page view

```bash
php artisan vendor:publish --tag=facebook-data-deletion-views
```

## Configuration

The package ships with `config/facebook-data-deletion.php`.

### Environment variables

Add your Meta app secret to `.env`:

```dotenv
FACEBOOK_APP_SECRET=your_meta_app_secret
```

You may also optionally configure a dedicated queue connection or queue name:

```dotenv
FACEBOOK_DATA_DELETION_QUEUE_CONNECTION=redis
FACEBOOK_DATA_DELETION_QUEUE=facebook-data-deletion
```

### Default configuration

After publishing the config, open `config/facebook-data-deletion.php` and point `resolver` and `deletion_handler` to the two classes you will create in the next steps:

```php
return [
    'app_secret' => env('FACEBOOK_APP_SECRET', env('FACEBOOK_SECRET')),

    'model' => Lartisan\FacebookDataDeletion\Models\FacebookDataDeletionRequest::class,

    // 👇 Replace with your own resolver class (see "Configuring the User model" below)
    'resolver' => App\Facebook\FacebookDeletionSubjectResolver::class,

    // 👇 Replace with your own deletion handler class (see "Configuring the deletion strategy" below)
    'deletion_handler' => App\Facebook\DeleteFacebookSubjectData::class,

    'queue' => [
        'connection' => env('FACEBOOK_DATA_DELETION_QUEUE_CONNECTION'),
        'name' => env('FACEBOOK_DATA_DELETION_QUEUE'),
    ],

    'route' => [
        'enabled' => true,
        'prefix' => 'api/facebook',
        'name_prefix' => 'facebook-data-deletion',
        'middleware' => ['api'],
        'callback_path' => 'data-deletion',
        'status_path' => 'data-deletion/{confirmationCode}',
    ],

    'view' => 'facebook-data-deletion::status',
];
```

> **How the config wires everything together**
>
> The package reads these two class names at runtime and binds them to their contracts via Laravel's service container. You never call these classes directly — they are automatically injected by the framework:
>
> - `resolver` → injected into the package's controller to look up the subject model from the Meta App-Scoped ID.
> - `deletion_handler` → injected into the `ProcessFacebookDataDeletionRequest` job to carry out the actual deletion or anonymization.
>
> All you need to do is create the two classes described below and set their fully-qualified class names in this config file.

### Configuring the User model and Facebook ID field

The package does not hardcode a user model or a `facebook_id` column. Instead, you configure a resolver class that knows how to map the Meta App-Scoped ID to the model you want to delete or anonymize.

#### Step 1 — Create the resolver class

#### Example: direct `facebook_id` column on `users`

```php
namespace App\Facebook;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Lartisan\FacebookDataDeletion\Contracts\ResolvesFacebookDeletionSubject;

class FacebookDeletionSubjectResolver implements ResolvesFacebookDeletionSubject
{
    public function resolve(string $facebookUserId): ?Model
    {
        return User::query()
            ->where('facebook_id', $facebookUserId)
            ->first();
    }
}
```

#### Example: `social_users.provider` + `social_users.provider_id`

```php
namespace App\Facebook;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Lartisan\FacebookDataDeletion\Contracts\ResolvesFacebookDeletionSubject;

class FacebookDeletionSubjectResolver implements ResolvesFacebookDeletionSubject
{
    public function resolve(string $facebookUserId): ?Model
    {
        return User::query()
            ->whereHas('socialUsers', function ($query) use ($facebookUserId) {
                $query
                    ->where('provider', 'facebook')
                    ->where('provider_id', $facebookUserId);
            })
            ->first();
    }
}
```

#### Step 2 — Register it in the config

```php
// config/facebook-data-deletion.php
'resolver' => App\Facebook\FacebookDeletionSubjectResolver::class,
```

### Configuring the deletion strategy

Your application controls how data is deleted or anonymized by implementing the deletion handler contract.

#### Step 1 — Create the deletion handler class

```php
namespace App\Facebook;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Lartisan\FacebookDataDeletion\Contracts\DeletesFacebookDeletionSubjectData;
use Lartisan\FacebookDataDeletion\Models\FacebookDataDeletionRequest;

class DeleteFacebookSubjectData implements DeletesFacebookDeletionSubjectData
{
    public function delete(FacebookDataDeletionRequest $request, ?Model $subject): void
    {
        if (! $subject instanceof User) {
            return;
        }

        DB::transaction(function () use ($subject) {
            $subject->socialUsers()->delete();

            $subject->forceFill([
                'email' => 'deleted-'.now()->timestamp.'-'.$subject->email,
            ])->save();

            $subject->delete();
        });
    }
}
```

#### Step 2 — Register it in the config

```php
// config/facebook-data-deletion.php
'deletion_handler' => App\Facebook\DeleteFacebookSubjectData::class,
```

## Usage

Once installed, the package registers the callback route by default at:

```text
POST /api/facebook/data-deletion
```

and the public status route at:

```text
GET /api/facebook/data-deletion/{confirmationCode}
```

If you prefer a different route structure, update the `route` section in `config/facebook-data-deletion.php`.

### What Meta sends

Meta submits a POST request containing a `signed_request` field.

The package:
- validates the signature
- decodes the payload
- extracts `user_id`
- resolves the target subject through your resolver
- creates a deletion tracking record
- dispatches an async deletion job
- returns the required JSON response:

```json
{
  "url": "https://your-app.test/api/facebook/data-deletion/ABCDEFG123456789ABCDEFG123456789",
  "confirmation_code": "ABCDEFG123456789ABCDEFG123456789"
}
```

## Webhook Setup in Meta Dashboard

In the Meta App Dashboard, configure the **Data Deletion Callback URL** to point to your package route.

### Step-by-step

1. Open your Meta app.
2. Go to **App Dashboard**.
3. Open the **Data Deletion Request** or **Data Deletion Callback** section.
4. Set the callback URL to your public HTTPS endpoint.
5. Save the changes.

### Example callback URL

```text
https://your-domain.com/api/facebook/data-deletion
```

### Local testing with a tunnel

Meta cannot call a local `.test` domain directly. For local integration testing, expose your app through a public tunnel such as `ngrok` or `cloudflared`.

Example:

```text
https://your-ngrok-subdomain.ngrok-free.app/api/facebook/data-deletion
```

## The Status Page

The URL returned to Meta includes a confirmation code and points to the status route.

Example:

```text
https://your-domain.com/api/facebook/data-deletion/ABCDEFG123456789ABCDEFG123456789
```

By default:
- browser requests render an HTML confirmation page
- requests with `Accept: application/json` receive structured JSON

Example JSON status response:

```json
{
  "confirmation_code": "ABCDEFG123456789ABCDEFG123456789",
  "status": "completed",
  "user_found": true,
  "requested_at": "2026-03-26T15:00:00+00:00",
  "completed_at": "2026-03-26T15:00:01+00:00"
}
```

## Testing

### Generate a valid `signed_request` in Tinker / Tinkerwell

Use the following PHP snippet to generate a Meta-compatible `signed_request` for Postman, Insomnia, or cURL testing:

```php
$payload = [
    'algorithm' => 'HMAC-SHA256',
    'issued_at' => time(),
    'user_id' => 'app-scoped-id-123',
];

$appSecret = config('facebook-data-deletion.app_secret');

if (! is_string($appSecret) || $appSecret === '') {
    throw new RuntimeException('facebook-data-deletion.app_secret is not configured.');
}

$encodedPayload = rtrim(
    strtr(base64_encode(json_encode($payload, JSON_THROW_ON_ERROR)), '+/', '-_'),
    '='
);

$signature = hash_hmac('sha256', $encodedPayload, $appSecret, true);

$encodedSignature = rtrim(
    strtr(base64_encode($signature), '+/', '-_'),
    '='
);

$signedRequest = $encodedSignature.'.'.$encodedPayload;

[
    'payload' => $payload,
    'signed_request' => $signedRequest,
];
```

### Test with cURL

```bash
curl -X POST "https://your-app.test/api/facebook/data-deletion" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"signed_request":"PASTE_SIGNED_REQUEST_HERE"}'
```

### Run the package test suite

From the package directory:

```bash
composer install
composer test
```

## Postman / Insomnia Guide

### 1. Create a POST request

Use:

```text
https://your-domain.com/api/facebook/data-deletion
```

### 2. Set headers

```text
Accept: application/json
Content-Type: application/json
```

### 3. Set the JSON body

```json
{
  "signed_request": "PASTE_SIGNED_REQUEST_HERE"
}
```

### 4. Expected response

```json
{
  "url": "https://your-domain.com/api/facebook/data-deletion/ABCDEFG123456789ABCDEFG123456789",
  "confirmation_code": "ABCDEFG123456789ABCDEFG123456789"
}
```

### 5. Check the status endpoint

Use the returned `url` directly in Postman, Insomnia, or a browser.

If you want JSON instead of HTML, send:

```text
Accept: application/json
```

## Security

The package validates the incoming Meta signature using HMAC-SHA256 before any deletion logic is executed.

Security notes:
- the webhook request is rejected if `signed_request` is malformed
- the payload is rejected if the algorithm is not `HMAC-SHA256`
- the callback is rejected if the computed signature does not match
- the route should **not** be protected by CSRF middleware

By default the package uses the `api` middleware group, which is the recommended setup for webhook endpoints in Laravel applications.

If you move the route under `web` middleware, make sure to exclude it from CSRF protection.

## Package Architecture

The package exposes two extension points:

- `Lartisan\FacebookDataDeletion\Contracts\ResolvesFacebookDeletionSubject`
- `Lartisan\FacebookDataDeletion\Contracts\DeletesFacebookDeletionSubjectData`

This lets the host application decide:
- which model is associated with the Meta App-Scoped ID
- where the Facebook identifier is stored
- whether deletion means hard delete, soft delete, anonymization, or a broader cleanup process

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).
