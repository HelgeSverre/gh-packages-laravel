# laravel-settings

[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)
[![Travis](https://img.shields.io/travis/osoobe/laravel-settings.svg?style=flat-square)]()
[![Total Downloads](https://img.shields.io/packagist/dt/osoobe/laravel-settings.svg?style=flat-square)](https://packagist.org/packages/osoobe/laravel-settings)

A Laravel package for dynamically storing, overriding, and retrieving Laravel system configs and per-model settings at runtime — without touching `.env` or config files.

Values are persisted to the database, automatically type-cast on read, and can be cached or encrypted. The package ships two independent storage systems:

- **`AppMeta`** — global, application-wide key/value settings.
- **`ModelMeta`** — per-Eloquent-model key/value settings, attached via a polymorphic relation.

## Install

```bash
composer require osoobe/laravel-settings
```

The service provider is auto-discovered. Run the migrations to create the `app_metas` and `model_metas` tables:

```bash
php artisan migrate
```

---

## Use Cases

- **Override Laravel config at runtime** — store a value in `AppMeta` and retrieve it with `AppMeta::config('mail.from.address')`. The DB value takes precedence over `config()`, so you can change settings without a deploy.
- **Encrypted credentials** — store third-party API keys or passwords encrypted in the DB with `AppMeta::setSecret()` and retrieve them decrypted with `AppMeta::secret()`.
- **Per-user or per-model settings** — attach arbitrary key/value pairs to any Eloquent model (e.g. user preferences, per-tenant config) using the `HasMetas` trait.
- **Feature flags** — store boolean flags in `AppMeta` and read them anywhere in the application.
- **Versioned or grouped settings** — subclass `AppMeta` with a custom `CATEGORY` constant to namespace settings for a specific domain (e.g. `PaymentSettings`, `MailSettings`).
- **Audit / change history** — use the `History` trait on any `HasMetas` model to record a diff log of field changes automatically.

---

## AppMeta — Global Application Settings

`AppMeta` stores application-wide key/value pairs in the `app_metas` table.

### Dynamic Laravel Config Override

`AppMeta::config()` checks the database first and falls back to Laravel's `config()`. This means you can override any config value at runtime without changing files or redeploying.

```php
use Osoobe\Laravel\Settings\Models\AppMeta;

// Read: DB value takes precedence over config files
$name = AppMeta::config('app.name', 'My App');

// Write: persists to DB and updates the runtime config() value
AppMeta::setConfig('app.name', 'My New App');

// Later in the same request, config('app.name') also returns 'My New App'
```

### Encrypted Secrets

Use `secret` / `setSecret` for values that should be stored encrypted (API keys, passwords, tokens). The value is encrypted with Laravel's `encrypt()` before being written and decrypted transparently on read.

```php
// Store an API key encrypted
AppMeta::setSecret('services.stripe.secret', 'sk_live_...');

// Retrieve decrypted; falls back to config('services.stripe.secret') if not in DB
$key = AppMeta::secret('services.stripe.secret');
```

### Basic CRUD

```php
// Read a value (returns the typed PHP value, not the raw string)
AppMeta::getMeta('site.maintenance', false);

// Write (upsert)
AppMeta::updateMeta('site.maintenance', true);

// Read or seed if missing
AppMeta::getOrCreateMeta('site.launch_date', '2024-01-01');

// Check existence
AppMeta::keyExists('site.maintenance'); // bool

// Read with permanent cache (auto-creates record if missing)
AppMeta::getMetaOrCached('site.maintenance', false);

// Write and update cache atomically
AppMeta::updateOrCreateWithCache('site.maintenance', false);

// All settings grouped by category
AppMeta::getAppSettingsByCategory();
```

### Category Scoping via Subclassing

Subclass `AppMeta` and set a `CATEGORY` constant to namespace a group of settings. All queries on the subclass are automatically scoped to that category.

```php
class MailSettings extends AppMeta {
    const CATEGORY = 'mail';

    public static function getKeyPrefix(): string {
        return 'mail_meta_';
    }
}

MailSettings::setConfig('mail.from.address', 'hello@example.com');
MailSettings::config('mail.from.address'); // only searches the 'mail' category
```

---

## ModelMeta — Per-Model Settings

`ModelMeta` stores key/value pairs scoped to an individual Eloquent model instance in the `model_metas` table. Uniqueness is composite on `(model_id, model_type, meta_key)`.

Add the `HasMetas` trait to any Eloquent model:

```php
use Osoobe\Laravel\Settings\Traits\HasMetas;

class User extends Model {
    use HasMetas;
}
```

### Usage

```php
$user = User::find(1);

// Read a typed value directly
$theme = $user->getMetaValue('theme'); // e.g. 'dark'

// Read the ModelMeta record
$meta = $user->getMeta('theme');

// Write (upsert)
$user->updateMeta('theme', 'dark');

// All settings grouped by category
$user->getSettingsByCategory();

// Query scope: find users with a specific meta key/value
User::hasMetas('role', 'admin')->get();
User::hasMetas('newsletter')->get(); // key exists, any value
```

---

## EnumConfig — Enum-Driven Config Keys

Apply `EnumConfig` to a PHP backed enum whose `value` is a config/meta key. This gives you a type-safe API for all your application settings.

```php
use Osoobe\Laravel\Settings\Traits\EnumConfig;

enum AppSettings: string {
    use EnumConfig;

    case SiteName    = 'app.name';
    case MaintenanceMode = 'app.maintenance';
    case StripeKey   = 'services.stripe.secret';
}

// Read (DB overrides config file)
AppSettings::SiteName->config('Default Name');

// Write (persists to DB + updates runtime config)
AppSettings::SiteName->setConfig('My App');

// Encrypted secret
AppSettings::StripeKey->setSecret('sk_live_...');
AppSettings::StripeKey->secret();
```

---

## History — Automatic Change Tracking

Add the `History` trait to any model that already uses `HasMetas`. It hooks into `created` and `updated` Eloquent events and appends a diff to a `history` meta entry. Implement `metaTrack()` to declare which fields to watch.

```php
use Osoobe\Laravel\Settings\Traits\HasMetas;
use Osoobe\Laravel\Settings\Traits\History;

class Order extends Model {
    use HasMetas, History;

    public function metaTrack(): array {
        return ['status', 'total'];
    }
}

// Retrieve the full history array
$order->getMetaHistory();
```

Each history entry contains the tracked field values at the time of the event, a `history_status` (`"created"` or `"updated"`), the `updated_at` timestamp, and a Unix `timestamp`.

---

## Type Handling

Values are always stored as strings in the database. The `meta_type` column records the PHP type (`string`, `integer`, `boolean`, `array`, etc.) and is set automatically on every write. Reading a record via the `value` accessor or any helper method returns the correctly typed PHP value — arrays are JSON-encoded on write and decoded on read.

**Never read `meta_value` directly.** Always use the `value` accessor or the provided helper methods.

---

## Caching

`getMetaOrCached()` stores values in `Cache::forever()` and auto-creates the DB record if it doesn't exist. The cache key is `{prefix}{meta_key}` — `app_meta_` for `AppMeta` and `model_meta_` for `ModelMeta`. Override `getKeyPrefix()` on a subclass to avoid collisions.

```php
// Reads from cache; writes to cache + DB on first call
AppMeta::getMetaOrCached('site.name', 'My App');

// Write and refresh cache
AppMeta::updateOrCreateWithCache('site.name', 'New Name');
```

---

## Examples

### 1. Maintenance Mode Middleware

Toggle maintenance mode from the database without touching `.env` or redeploying.

```php
// app/Http/Middleware/CheckMaintenance.php
use Osoobe\Laravel\Settings\Models\AppMeta;

class CheckMaintenance
{
    public function handle(Request $request, Closure $next)
    {
        if (AppMeta::getMetaOrCached('site.maintenance', false)) {
            abort(503, 'We are currently down for maintenance.');
        }

        return $next($request);
    }
}
```

```php
// Turn maintenance on/off from anywhere (e.g. an admin panel)
AppMeta::updateOrCreateWithCache('site.maintenance', true);
AppMeta::updateOrCreateWithCache('site.maintenance', false);
```

---

### 2. Admin Panel: Override Mail Settings at Runtime

Allow an admin to change the application's mail config through a form. The new values take effect immediately in the same process — no redeploy needed.

```php
// app/Http/Controllers/Admin/MailSettingsController.php
use Osoobe\Laravel\Settings\Models\AppMeta;

class MailSettingsController extends Controller
{
    public function show()
    {
        return view('admin.mail', [
            'from_address' => AppMeta::config('mail.from.address', config('mail.from.address')),
            'from_name'    => AppMeta::config('mail.from.name', config('mail.from.name')),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'from_address' => 'required|email',
            'from_name'    => 'required|string',
        ]);

        AppMeta::setConfig('mail.from.address', $request->from_address);
        AppMeta::setConfig('mail.from.name', $request->from_name);

        return back()->with('success', 'Mail settings updated.');
    }
}
```

---

### 3. Storing an Encrypted Third-Party API Key

Store sensitive credentials encrypted in the database and retrieve them anywhere.

```php
// Store once (e.g. from an admin form)
AppMeta::setSecret('services.stripe.secret', $request->stripe_secret_key);
AppMeta::setSecret('services.sendgrid.key', $request->sendgrid_api_key);

// Retrieve decrypted in a service class
class StripePaymentService
{
    public function client(): \Stripe\StripeClient
    {
        return new \Stripe\StripeClient(AppMeta::secret('services.stripe.secret'));
    }
}
```

---

### 4. Enum-Backed Settings for a Payment Service

Use `EnumConfig` to define all config keys in one place with full IDE autocompletion.

```php
// app/Enums/PaymentConfig.php
use Osoobe\Laravel\Settings\Traits\EnumConfig;

enum PaymentConfig: string
{
    use EnumConfig;

    case StripeKey       = 'services.stripe.secret';
    case Currency        = 'payment.currency';
    case MaxRetries      = 'payment.max_retries';
    case WebhookEnabled  = 'payment.webhook_enabled';
}
```

```php
// Seed defaults on first boot (e.g. in a seeder or AppServiceProvider)
PaymentConfig::Currency->setConfig('USD');
PaymentConfig::MaxRetries->setConfig(3);
PaymentConfig::WebhookEnabled->setConfig(true);
PaymentConfig::StripeKey->setSecret(env('STRIPE_SECRET'));

// Read anywhere — DB overrides config file
$currency = PaymentConfig::Currency->config('USD');       // 'USD'
$retries  = PaymentConfig::MaxRetries->config(3);         // 3 (int)
$enabled  = PaymentConfig::WebhookEnabled->config(false); // true (bool)
$key      = PaymentConfig::StripeKey->secret();           // decrypted key
```

---

### 5. Per-User Preferences with HasMetas

Store arbitrary per-user settings without adding columns to the `users` table.

```php
// app/Models/User.php
use Osoobe\Laravel\Settings\Traits\HasMetas;

class User extends Authenticatable
{
    use HasMetas;
}
```

```php
// app/Http/Controllers/UserPreferencesController.php
class UserPreferencesController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $user->updateMeta('theme', $request->input('theme', 'light'));
        $user->updateMeta('locale', $request->input('locale', 'en'));
        $user->updateMeta('notifications_enabled', $request->boolean('notifications_enabled'));

        return back()->with('success', 'Preferences saved.');
    }

    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'theme'                  => $user->getMetaValue('theme'),
            'locale'                 => $user->getMetaValue('locale'),
            'notifications_enabled'  => $user->getMetaValue('notifications_enabled'),
        ]);
    }
}
```

```php
// Query all admin users by a meta value
$admins = User::hasMetas('role', 'admin')->get();

// Query users who have opted into a newsletter (key exists, any value)
$subscribers = User::hasMetas('newsletter')->get();
```

---

### 6. Audit Trail with History

Track field changes on any model automatically using the `History` trait.

```php
// app/Models/Order.php
use Osoobe\Laravel\Settings\Traits\HasMetas;
use Osoobe\Laravel\Settings\Traits\History;

class Order extends Model
{
    use HasMetas, History;

    public function metaTrack(): array
    {
        return ['status', 'total', 'payment_method'];
    }
}
```

```php
// Every save automatically appends a diff to the 'history' meta key.
$order = Order::create(['status' => 'pending', 'total' => 99.99]);
// history: [['status' => 'pending', 'total' => 99.99, 'history_status' => 'created', ...]]

$order->update(['status' => 'paid']);
// history: [..., ['status' => 'paid', 'history_status' => 'updated', 'timestamp' => ...]]

// Read the full audit log
$history = $order->getMetaHistory();

foreach ($history as $entry) {
    echo "{$entry['history_status']} at {$entry['updated_at']}: status → {$entry['status']}";
}
```

---

### 7. Grouped Settings via AppMeta Subclass

Subclass `AppMeta` with a `CATEGORY` constant to keep domain-specific settings isolated.

```php
// app/Models/Settings/SeoSettings.php
use Osoobe\Laravel\Settings\Models\AppMeta;

class SeoSettings extends AppMeta
{
    const CATEGORY = 'seo';

    public static function getKeyPrefix(): string
    {
        return 'seo_meta_';
    }
}
```

```php
// All reads and writes are automatically scoped to category = 'seo'
SeoSettings::setConfig('seo.meta_title', 'My Site — Home');
SeoSettings::setConfig('seo.meta_description', 'Welcome to my site.');
SeoSettings::updateMeta('seo.robots', 'index, follow');

$title       = SeoSettings::config('seo.meta_title');
$description = SeoSettings::getMeta('seo.meta_description');

// Retrieve all SEO settings grouped by category
$grouped = SeoSettings::getAppSettingsByCategory();
```

---

## Testing

```bash
composer test
# or
vendor/bin/phpunit
```

---

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Credits

- [Oshane Bailey](https://github.com/osoobe)
- [All Contributors](https://github.com/osoobe/laravel-settings/contributors)

## Security

If you discover any security-related issues, please email b4.oshany@gmail.com instead of using the issue tracker.

## License

The MIT License (MIT). Please see [License File](/LICENSE.md) for more information.
