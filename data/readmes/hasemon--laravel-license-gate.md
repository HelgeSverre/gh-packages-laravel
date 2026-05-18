# Laravel License Gate

`hasemon/laravel-license-gate` is a Laravel 12 package to validate and enforce license access through middleware.

## Requirements

- PHP 8.2+
- Laravel 12
- A table to store license values (default: `settings`)

Default storage columns:

- `license_key` (string)
- `license_expires_at` (timestamp nullable)
- `id` (used for updates)
- `created_at` and `updated_at` (written by the default repository)

## Installation

```bash
composer require hasemon/laravel-license-gate
```

The service provider is auto-discovered.

Publish config:

```bash
php artisan vendor:publish --tag=license-gate-config
```

## Configuration

Create or update your env values:

```env
LICENSE_SECRET=hasemon
```

The default config file is `config/license-gate.php`:

- `secret`: encryption/decryption secret for license keys
- `cipher`: default `aes-256-cbc`
- `iv_length`: default `16`
- `storage.*`: table and column mapping
- `redirect_route`: web redirect route when license is invalid
- `json_error_message`: message for JSON 403 responses

## Usage

### 1. Register middleware alias

In Laravel 12, add alias in `bootstrap/app.php`:

```php
use Hasemon\LaravelLicenseGate\Middleware\CheckLicense;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'license' => CheckLicense::class,
    ]);
})
```

### 2. Protect routes

```php
Route::middleware(['auth', 'verified', 'license'])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');
});
```

Behavior:

- Unauthenticated requests pass through middleware
- Authenticated + valid license passes through
- Authenticated + invalid/expired license:
  - Web: redirects to `route(config('license-gate.redirect_route'))`
  - JSON: returns `403` with `json_error_message`

### 3. Store a submitted license key

Use `StoreLicenseAction` in your controller:

```php
use Hasemon\LaravelLicenseGate\Actions\StoreLicenseAction;

public function storeLicense(Request $request, StoreLicenseAction $storeLicenseAction): RedirectResponse
{
    $request->validate([
        'license_key' => ['required', 'string', 'max:500'],
    ]);

    $storeLicenseAction($request->string('license_key')->toString());

    return redirect()->route('dashboard');
}
```

### 4. Validate license manually (optional)

```php
use Hasemon\LaravelLicenseGate\Actions\ValidateLicenseAction;

$isValid = app(ValidateLicenseAction::class)();
```

## Using with external key generator

If you generate keys outside the app, make sure it uses the same:

- `LICENSE_SECRET`
- cipher (`aes-256-cbc`)
- key format (`base64(iv + ciphertext)`)

## Standalone license portal URL

If your team uses a standalone licensing app (where users log in and generate keys), expose that URL in your main app and show it on the license-expired page.

Example env:

```env
LICENSE_PORTAL_URL=https://license.example.com/login
```

Pass it to your Inertia page:

```php
Route::get('license-expired', function () {
    return Inertia::render('auth/license-expired', [
        'licenseStoreUrl' => route('license.store'),
        'licensePortalUrl' => config('services.license.portal_url'),
    ]);
})->name('license.expired');
```

`config/services.php`:

```php
'license' => [
    'portal_url' => env('LICENSE_PORTAL_URL'),
],
```

In your `license-expired` UI, render a link/button to that portal:

```tsx
<a href={licensePortalUrl} target="_blank" rel="noreferrer">
    Get license key
</a>
```

Recommended user flow:

- User opens license portal URL
- User logs in to standalone licensing app
- User generates/copies license key
- User returns to your app and submits key

## Custom storage mapping

If your table/columns differ, change `config/license-gate.php`:

```php
'storage' => [
    'table' => 'settings',
    'license_key_column' => 'license_key',
    'license_expires_at_column' => 'license_expires_at',
],
```

## Notes

- `license_expires_at` in storage is for convenience.
- Validation trusts decrypted `license_key` payload, not stored expiry value.
