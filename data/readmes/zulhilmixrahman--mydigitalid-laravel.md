# MyDigitalID Laravel

Laravel package for integrating Malaysia's **MyDigitalID** (Keycloak-based OIDC) authentication into any Laravel application.

---

## Requirements

- PHP 8.1+
- Laravel 10, 11, 12, or 13

---

## Installation

```bash
composer require zulhilmirahman/mydigitalid-laravel
```

Publish the config file:

```bash
php artisan vendor:publish --tag=mydigitalid-config
```

---

## Configuration

### 1. Environment variables

```env
# Required — the package throws a RuntimeException on boot if any of these are missing
OIDC_ENABLED=true
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
OIDC_REALM=your-realm

# Optional — defaults shown
OIDC_BASE_URL=https://sso.digital-id.my
OIDC_REDIRECT_URI="${APP_URL}/mydid/login/callback"

# Optional — override individual endpoints only if the auto-built defaults are incorrect
# Auto-built pattern: {OIDC_BASE_URL}/realms/{OIDC_REALM}/protocol/openid-connect/{endpoint}
# OIDC_URL_AUTHORIZE=
# OIDC_URL_ACCESS_TOKEN=
# OIDC_URL_USERINFO=
# OIDC_URL_LOGOUT=

# Optional — defaults shown
OIDC_USER_FIELD=nokp
OIDC_REDIRECT_AFTER_LOGIN=/dashboard
OIDC_LOGIN_URL=/login
OIDC_POST_LOGOUT_REDIRECT=/
```

### 2. Config file

After publishing, edit `config/mydigitalid.php` to match your application:

```php
// Eloquent model used to look up the local user
'user_model' => \App\Models\User::class,

// DB column matched against the NRIC returned by MyDigitalID
'user_field' => env('OIDC_USER_FIELD', 'nokp'),

// Keys returned by the userinfo endpoint
'nric_field' => 'nric',
'name_field' => 'nama',

// Optional: set a specific auth guard (null uses the default guard)
'auth_guard' => null,
```

---

## Routes registered

When `OIDC_ENABLED=true`, these routes are automatically registered:

| Method | URI | Name | Description |
|--------|-----|------|-------------|
| GET | `/mydid/login/redirect` | `mydigitalid.login` | Redirects user to MyDigitalID SSO |
| GET | `/mydid/login/callback` | `mydigitalid.callback` | Handles the OIDC callback |
| POST | `/mydid/logout` | `mydigitalid.logout` | Logs out locally and from MyDigitalID |

---

## Usage in Blade

```blade
{{-- Login button --}}
<a href="{{ route('mydigitalid.login') }}">Log Masuk dengan MyDigitalID</a>

{{-- Logout form --}}
<form method="POST" action="{{ route('mydigitalid.logout') }}">
    @csrf
    <button type="submit">Log Keluar</button>
</form>
```

---

## How It Works

1. User clicks the login link → redirected to MyDigitalID with a CSRF `state` token.
2. MyDigitalID redirects back to `/mydid/login/callback` with an authorization `code`.
3. The package exchanges the code for `access_token` + `id_token`, then fetches user info.
4. The user's NRIC is matched against the local database using `user_field`.
5. If a matching user is found, they are logged in via `Auth::login()`.
6. If no match is found, the user is silently logged out of MyDigitalID and denied access.

---

## Using the Service Directly

```php
use ZulhilmiRahman\MyDigitalID\OIDCService;

class MyController extends Controller
{
    public function __construct(protected OIDCService $oidc) {}

    public function customFlow()
    {
        $url = $this->oidc->getAuthUrl('my-state-token');
        // ...
    }
}
```

---

## License

MIT
