# authn-sh/sdk-php

PHP backend SDK for [authn.sh](https://authn.sh) — call the Backend API (BAPI), verify session JWTs, and verify webhook signatures from server-side PHP. The Laravel integration lives in the separate [`authn-sh/sdk-php-laravel`](https://github.com/authn-sh/sdk-php-laravel) package.

> Status: **0.1.x pre-release.** APIs may change before `1.0`.

## Requirements

- PHP **8.2+**
- A PSR-18 HTTP client (Guzzle, Symfony HttpClient, etc.) and PSR-17 factories. The SDK auto-discovers them via [`php-http/discovery`](https://docs.php-http.org/en/latest/discovery.html), so installing `guzzlehttp/guzzle` (or any PSR-18 client) is enough.
- A PSR-16 cache (optional, for the JWT verifier). Without one the JWKS document is re-fetched on every verify.

## Install

```bash
composer require authn-sh/sdk-php
```

If you don't already have a PSR-18 client in your project:

```bash
composer require guzzlehttp/guzzle
```

## BAPI client

```php
use Authn\Sdk\Client;

$client = new Client(secretKey: $_ENV['AUTHN_SECRET_KEY']);

$user = $client->users()->get('user_2x4yT…');
$session = $client->sessions()->revoke('sess_…');
$invite = $client->invitations()->create(['email_address' => 'a@b.com']);
```

Resource managers: `users()`, `sessions()`, `invitations()`, `allowlistIdentifiers()`, `blocklistIdentifiers()`, `redirectUrls()`, `instance()`, `webhookEndpoints()`, `organizations()`, `roles()`, `permissions()`, `oauthProviders()`, `enterpriseConnections()`, `enterpriseAccounts()`, `smsTemplates()`, `phoneNumbers()`, `externalAccounts()`, `passkeys()`, `appearance()`, `localization()`.

Organization sub-managers are accessed via `$client->organizations()`:

```php
$orgs = $client->organizations();

// Org CRUD
$org  = $orgs->create(['name' => 'Acme', 'slug' => 'acme']);
$org  = $orgs->get('org_…');
$orgs->update('org_…', ['name' => 'Acme Corp']);
$orgs->delete('org_…');

// Memberships
$members = $orgs->members('org_…');
$members->list();
$members->create(['user_id' => 'user_…', 'role' => 'basic_member']);
$members->update('user_…', 'admin');
$members->delete('user_…');

// Invitations
$invites = $orgs->invitations('org_…');
$invites->create(['email_address' => 'a@b.com', 'role' => 'basic_member']);
$invites->bulkCreate([['email_address' => 'a@b.com'], ['email_address' => 'c@d.com']]);
$invites->revoke('orginv_…');

// Domains
$domains = $orgs->domains('org_…');
$domains->create('acme.com');
$domains->verify('orgdmn_…');
```

### Roles and permissions

```php
use Authn\Sdk\Resources\SystemPermissions;

// Custom roles
$role = $client->roles()->create(['name' => 'Billing Admin', 'key' => 'org:billing_admin']);
$client->roles()->setPermissions($role['id'], [
    SystemPermissions::ORG_SYS_ROLES_READ,
    SystemPermissions::ORG_SYS_ROLES_MANAGE,
]);
$client->roles()->delete($role['id']);

// Read the permissions catalog
$perms = $client->permissions()->list();
```

### Custom HTTP client / logger

```php
use Authn\Sdk\Client;
use GuzzleHttp\Client as Guzzle;

$client = new Client(
    secretKey: $_ENV['AUTHN_SECRET_KEY'],
    apiUrl: 'https://api.authn.sh',
    http: new Guzzle(['timeout' => 5]),
    logger: $psr3Logger,
);
```

### Errors

- `Authn\Sdk\Http\ApiException` — non-2xx responses; `getStatusCode()`, `getErrors()`, `getErrorCode()`, `getTraceId()`, `getRawBody()`.
- `Authn\Sdk\Http\AuthenticationException` (401), `Authn\Sdk\Http\ResourceNotFoundException` (404), `Authn\Sdk\Http\RateLimitExceededException` (429, with `getRetryAfter()`).
- `Authn\Sdk\Http\NetworkException` — connection-level failures.

## Verify a session JWT

```php
use Authn\Sdk\Tokens\TokenVerifier;
use Authn\Sdk\Tokens\TokenInvalidException;

$verifier = new TokenVerifier(
    publishableKey: $_ENV['AUTHN_PUBLISHABLE_KEY'], // pk_test_… / pk_live_…
    cache: $psr16Cache,                              // optional PSR-16 cache for JWKS
);

try {
    $claims = $verifier->verify($jwt);                 // throws TokenInvalidException
    // or: $claims = $verifier->tryVerify($jwt);       // returns null on failure

    $userId = $claims->sub;       // user_…
    $sessionId = $claims->sid;    // sess_…
} catch (TokenInvalidException $e) {
    // 401 the request
}

// Optional: enforce origin binding via the azp claim.
$claims = $verifier->verify($jwt, expectedAzp: ['https://app.acme.com']);
```

The verifier fetches the FAPI JWKS once and caches it (PSR-16). On an unknown `kid` it refreshes the JWKS once before failing.

### Organization claim

When the session JWT carries an `org` claim, `$claims->organization` is populated as a typed `Organization` object:

```php
use Authn\Sdk\Resources\SystemPermissions;

$claims = $verifier->verify($jwt);

if ($claims->organization !== null) {
    $org = $claims->organization;

    $org->id;          // 'org_…'
    $org->slug;        // 'acme' or null
    $org->role;        // 'org:admin' or null
    $org->permissions; // ['org:sys_profile:read', …]

    $org->hasRole('org:admin');
    $org->hasPermission(SystemPermissions::ORG_SYS_PROFILE_READ);
}

// Convenience shortcuts directly on VerifiedClaims:
$claims->hasRole('org:admin');
$claims->hasPermission(SystemPermissions::ORG_SYS_PROFILE_MANAGE);
```

### Passkey claims

`$claims->passkeyVerified` is `true` when the current session was authenticated by a passkey first-factor with `userVerification = required` (parsed from the `pkv` JWT claim). `$claims->passkeyCount` is the snapshot of the user's verified-passkey count at session creation (`pkc` claim).

```php
$claims = $verifier->verify($jwt);

// Gate sensitive operations to passkey-authenticated sessions.
if (! $claims->wasVerifiedByPasskey()) {
    abort(403, 'Sensitive operation requires a passkey session.');
}

// Nudge a user who has zero passkeys towards enrollment.
if (! $claims->hasPasskey()) {
    // render passkey-enrollment CTA
}
```

## Verify a webhook

```php
use Authn\Sdk\Webhooks\SignatureVerifier;
use Authn\Sdk\Webhooks\SignatureInvalidException;

// One signing secret, or many during a rotation overlap window.
$verifier = new SignatureVerifier($_ENV['AUTHN_WEBHOOK_SECRET']);

try {
    $event = $verifier->verify($rawBody, $request->getHeaders()); // throws SignatureInvalidException

    if ($event->type === 'user.created') {
        // $event->data carries the resource payload
    }
} catch (SignatureInvalidException $e) {
    // 401 the request
}
```

Replay protection is on by default with a 5-minute tolerance — pass `toleranceSeconds:` to widen or narrow it.

## Development

```bash
composer install
composer test       # Pest
composer phpstan    # PHPStan @ level 10
composer pint       # code style check
composer pint:fix   # apply fixes
```

CI runs the full suite on PHP 8.2, 8.3, 8.4, and 8.5.

## License

[AGPL-3.0-only](LICENSE).
