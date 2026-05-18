# FastComments for Laravel

A Laravel package that wraps the [FastComments PHP SDK](https://github.com/FastComments/fastcomments-php) and [SSO library](https://github.com/FastComments/fastcomments-php-sso), providing Blade components, SSO integration, and full API access.

## Requirements

- PHP 8.1+
- Laravel 10, 11, or 12

## Installation

```bash
composer require fastcomments/laravel
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=fastcomments-config
```

Add your credentials to `.env`:

```env
FASTCOMMENTS_TENANT_ID=your-tenant-id
FASTCOMMENTS_API_KEY=your-api-key
```

For EU region:

```env
FASTCOMMENTS_REGION=eu
```

## Blade Components

### Comment Widget

```blade
<x-fastcomments />

{{-- With options --}}
<x-fastcomments
    url-id="my-page-id"
    url="https://example.com/my-page"
    locale="en_us"
    :has-dark-background="true"
    default-sort-direction="MR"
/>
```

### Live Chat

```blade
<x-fastcomments-live-chat url-id="chat-room-1" />
```

### Comment Count

```blade
<x-fastcomments-comment-count url-id="my-page-id" />
<x-fastcomments-comment-count url-id="my-page-id" :number-only="true" />
```

## SSO

Enable SSO in your `.env`:

```env
FASTCOMMENTS_API_KEY=your-api-key
FASTCOMMENTS_SSO_ENABLED=true
FASTCOMMENTS_SSO_MODE=secure
```

The API key is required for secure SSO — it is used to sign the SSO payload.

### Config-Based Mapping

In `config/fastcomments.php`, map FastComments fields to your User model attributes:

```php
'sso' => [
    'enabled' => true,
    'mode' => 'secure',
    'user_map' => [
        'id' => 'id',
        'email' => 'email',
        'username' => 'name',
        'avatar' => 'profile.avatar_url', // dot notation supported
    ],
    'is_admin' => fn ($user) => $user->hasRole('admin'),
    'is_moderator' => fn ($user) => $user->hasRole('moderator'),
],
```

### Interface-Based Mapping

For more control, implement the `MapsToFastCommentsUser` interface on your User model:

```php
use FastComments\Laravel\SSO\Contracts\MapsToFastCommentsUser;

class User extends Authenticatable implements MapsToFastCommentsUser
{
    public function toFastCommentsUserData(): array
    {
        return [
            'id' => (string) $this->id,
            'email' => $this->email,
            'username' => $this->display_name,
            'avatar' => $this->avatar_url,
            'is_admin' => $this->hasRole('admin'),
        ];
    }
}
```

When the interface is implemented, it takes precedence over config-based mapping.

### SSO in Blade

When SSO is enabled, the `<x-fastcomments />` component automatically injects SSO data for the authenticated user.

## API Access

### Via Facade

```php
use FastComments\Laravel\Facades\FastComments;

// Admin API (requires API key)
$comments = FastComments::admin()->getComments('tenant-id');

// Public API
$comments = FastComments::publicApi()->getCommentsPublic('tenant-id', 'url-id');

// SSO
$ssoPayload = FastComments::sso()->forWidget();
$token = FastComments::sso()->tokenFor($user);
```

### Via Dependency Injection

```php
use FastComments\Laravel\FastCommentsManager;

class CommentController extends Controller
{
    public function index(FastCommentsManager $fc)
    {
        $comments = $fc->admin()->getComments($fc->tenantId());
        // ...
    }
}
```

### Direct SDK Access

```php
use FastComments\Client\Api\DefaultApi;

class CommentController extends Controller
{
    public function index(DefaultApi $api)
    {
        $comments = $api->getComments('tenant-id');
        // ...
    }
}
```

## Configuration Reference

| Key | Env Variable | Default | Description |
|-----|-------------|---------|-------------|
| `tenant_id` | `FASTCOMMENTS_TENANT_ID` | `''` | Your FastComments tenant ID |
| `api_key` | `FASTCOMMENTS_API_KEY` | `''` | API key for server-side calls |
| `region` | `FASTCOMMENTS_REGION` | `null` | `null` (US) or `'eu'` |
| `sso.enabled` | `FASTCOMMENTS_SSO_ENABLED` | `false` | Enable SSO |
| `sso.mode` | `FASTCOMMENTS_SSO_MODE` | `'secure'` | `'secure'` or `'simple'` |
| `sso.login_url` | `FASTCOMMENTS_SSO_LOGIN_URL` | `null` | Login URL (falls back to Laravel route) |
| `sso.logout_url` | `FASTCOMMENTS_SSO_LOGOUT_URL` | `null` | Logout URL (falls back to Laravel route) |
| `widget_defaults` | — | `[]` | Default widget config options |

## Customizing Views

To customize the Blade template:

```bash
php artisan vendor:publish --tag=fastcomments-views
```

Templates will be published to `resources/views/vendor/fastcomments/`.

## License

MIT
