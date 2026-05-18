# Laravel FHIR Client

A Laravel package for integrating with Epic's FHIR API, supporting both **system-level OAuth client credentials flow** (JWT assertion) and **SMART on FHIR patient launch** (authorization code + PKCE).

Features:
- Client credentials token management with JWT assertion
- JWKS endpoint for public key distribution
- FHIR List searching (system & user lists)
- Patient $summary endpoint
- Basic Patient resource creation
- SMART on FHIR authorization code flow with PKCE
- Session & token persistence in database

## Requirements

- PHP >= 8.2
- Laravel 11 or 12
- OpenSSL extension (for JWT signing)
- Valid Epic FHIR application credentials & RSA key pair

## Installation
```bash
composer require teleminergmbh/laravel-epic-fhir
```

If you are developing locally without publishing the package, see `DEVELOPMENT.md` for a Composer `path` repository setup.

Create keys on server
```bash
openssl genpkey -algorithm RSA -out private.key -pkeyopt rsa_keygen_bits:2048
openssl rsa -in private.key -pubout -out public.key
```

Set `.env` parameters
```bash
EPIC_FHIR_TOKEN_URL=https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token
EPIC_FHIR_AUTH_URL=https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize
EPIC_FHIR_FHIR_BASE=https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4

EPIC_FHIR_PRIVATE_KEY_PATH=/home/admin/domains/telemedicall.com/etc/private.key
EPIC_FHIR_PUBLIC_KEY_PATH=/home/admin/domains/telemedicall.com/etc/public.key

EPIC_FHIR_COOKIE_DOMAIN=.telemedicall.com
EPIC_FHIR_ALLOWED_ROOT=telemedicall.com

EPIC_FHIR_TOKEN_STORE_DRIVER=cache

EPIC_FHIR_DB_CONNECTION=mysql
EPIC_FHIR_DB_TABLE=epic_fhir_tokens


```

## Publish assets
Publish the configuration file and migration:

```bash
# Publish config
php artisan vendor:publish --tag=laravel-epic-fhir-config

# Publish migration (epic_fhir_tokens table)
php artisan vendor:publish --tag=epic-fhir-migrations
```

# Run the migration:
```bash
php artisan migrate
```
This creates the `epic_fhir_tokens` table used for token persistence when using the `database` TokenStore driver.

# Basic Usage
Via Service Class / Facade

```php
$epic = app('EpicFhir');

$clientId = 'your-client-id';

return $epic->fhir()->patientSummarySystem($clientId, 'patient-id');
```

Dynamic connection (per-user overrides)
```php
$userId = (string) $user->id; // from your app DB

$epic = app('EpicFhir')->connection([
    'connection_key' => $userId, // used to isolate token storage
    'token_url' => $user->token_url,
    'fhir_base' => $user->fhir_base,
    'oauth_scope' => $user->oauth_scope,
    'private_key_path' => $user->private_key_path,
    'public_key_path' => $user->public_key_path,
]);

return $epic->fhir()->patientSummarySystem($user->client_id, 'patient-id');
```

You can also access tokens directly:

```php
$accessToken = $epic->systemAccessToken($clientId);
$smartAccessToken = $epic->smartAccessToken($clientId, 'owner1');
```

Direct Controller Usage
```php
use Teleminergmbh\EpicFhir\Controllers\UserController;
$overrides = [
        "auth_url" => "https://fhir.com",
    ];
$controller = app()->make(UserController::class, ['overrides' => $overrides]);

return $controller->smartLaunch("4383e929-5eb1-4aca-817c-4cd2769a917f");
```

Request config resolver (SMART/JWKS)
```php
use Illuminate\Http\Request;
use Teleminergmbh\EpicFhir\Contracts\EpicFhirRequestConfigResolverInterface;

app()->bind(EpicFhirRequestConfigResolverInterface::class, function () {
    return new class implements EpicFhirRequestConfigResolverInterface
    {
        public function resolveForRequest(Request $request, ?string $clientId = null): array
        {
            $connectionId = $request->query('connectionId');
            if (! is_string($connectionId) || $connectionId === '') {
                return [];
            }

            // Load your provider connection here (from your app DB) and return overrides.
            return [
                'connection_key' => $connectionId,
                // 'token_url' => ...,
                // 'auth_url' => ...,
                // 'fhir_base' => ...,
                // 'private_key_path' => ...,
                // 'public_key_path' => ...,
            ];
        }
    };
});
```

Defined routes:
```php
Route::prefix(config('laravel-epic-fhir.routes.prefix', 'fhir/R4'))
    ->middleware(config('laravel-epic-fhir.routes.middleware', 'web'))
    ->group(function () {
        Route::get('/jwks/{clientId}', [UserController::class, 'jwks'])->name('EpicFhir.jwks');
        Route::get('/smart/launch/{clientId}', [UserController::class, 'smartLaunch'])->name('EpicFhir.smart.launch');
        Route::get('/smart/callback', [UserController::class, 'smartCallback'])->name('EpicFhir.smart.callback');
    });
```

Then link to `/{prefix}/jwks/{clientId}` (by default: `/fhir/R4/jwks/your-client-id`).

## Important Notes

Tokens are stored via the configured TokenStore driver (`cache` or `database`).
If you use the `database` driver, publish and run the migration to create the `epic_fhir_tokens` table.
If you use the `database` driver, database host/port/credentials are taken from your application’s normal Laravel database configuration; the package only needs `EPIC_FHIR_DB_CONNECTION` (and optionally `EPIC_FHIR_DB_TABLE`).
Backwards compatibility: if you do not use `connection([...])` or a request resolver, the package continues to use the published Laravel config values as before.
For production, always use HTTPS.
Epic sandbox: https://fhir.epic.com/interconnect-fhir-oauth
Full Epic FHIR documentation: https://open.epic.com/Interface/FHIR
