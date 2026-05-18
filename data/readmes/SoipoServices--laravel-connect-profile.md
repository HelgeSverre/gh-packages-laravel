# Laravel Connect Profile

A Laravel package that exposes:

- an authenticated `/me`-style endpoint with configurable profile fields,
- user-to-user connection endpoints,
- QR-based connect session generation,
- signed public preview URLs for scanning flows,
- connection migration and model scaffolding.

## Features

- Configurable authenticated profile endpoint.
- Field allowlist and default field selection with `?fields=`.
- Connection request lifecycle: create, accept, reject, delete.
- QR session endpoint returning a short-lived signed connect URL.
- QR SVG endpoint powered by `simple-qrcode`.
- Auto-loaded package migrations through `loadMigrationsFrom()`.

## Install

```bash
composer require soiposervices/laravel-connect-profile
php artisan vendor:publish --tag=connect-profile-config
php artisan migrate
```

## Default routes

### Protected routes

```text
GET    /api/connect-profile/me
POST   /api/connect-profile/sessions
GET    /api/connect-profile/qr?url={signed_url}
POST   /api/connect-profile/claim/{user}
POST   /api/connect-profile/connections/{connection}/accept
POST   /api/connect-profile/connections/{connection}/reject
DELETE /api/connect-profile/connections/{connection}
```

### Public signed route

```text
GET /api/connect-profile/preview/{user}?expires=...&signature=...
```

## Example flow

1. Mobile app calls `POST /api/connect-profile/sessions`.
2. Package returns a signed preview URL.
3. App renders the signed URL as a QR code, either locally or through `/api/connect-profile/qr?url=...`.
4. Another device scans the QR and can open the signed preview endpoint.
5. Authenticated user calls `POST /api/connect-profile/claim/{user}` to create the connection.
6. Recipient accepts or rejects the connection.

## Config

```php
return [
    'route_prefix' => 'api/connect-profile',
    'route_middleware' => ['api', 'auth:sanctum'],
    'public_route_middleware' => ['api', 'signed'],
    'me_endpoint' => 'me',
    'allowed_attributes' => ['id', 'name', 'email', 'profile_photo_url', 'avatar_url', 'phone', 'bio'],
    'default_attributes' => ['id', 'name', 'email', 'profile_photo_url'],
    'attribute_map' => [
        'profile_photo_url' => 'profile_photo_url',
        'avatar_url' => 'avatar_url',
        'phone' => 'phone',
        'bio' => 'bio',
    ],
    'query_parameter' => 'fields',
    'max_attributes' => 10,
    'user_model' => App\Models\User::class,
    'qr_size' => 300,
    'connect_link_expiration_minutes' => 5,
    'auto_accept_mutual_connections' => false,
    'channels' => ['qr', 'bump', 'manual'],
];
```

## /me examples

```text
GET /api/connect-profile/me
GET /api/connect-profile/me?fields=name,email,profile_photo_url
```

## Connection examples

### Create session

```http
POST /api/connect-profile/sessions
Authorization: Bearer {token}
```

### Create QR remotely

```http
GET /api/connect-profile/qr?url=https://example.com/api/connect-profile/preview/5?expires=...&signature=...
Authorization: Bearer {token}
```

### Claim connection

```http
POST /api/connect-profile/claim/5
Authorization: Bearer {token}
Content-Type: application/json

{
  "channel": "qr"
}
```

### Accept connection

```http
POST /api/connect-profile/connections/10/accept
Authorization: Bearer {token}
```

## Notes

- The package assumes the host application already authenticates API requests, usually with Sanctum.
- `preview/{user}` is signed and public so QR scans can inspect the target profile before authenticated claiming.
- The migration assumes your user table is `users` and primary keys are standard Laravel IDs.
- If you want richer public preview fields, add a dedicated preview resource and configuration block.
- For field-level authorization, add a policy-aware resolver in the host app or package extension.
