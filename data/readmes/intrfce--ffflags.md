# FFFlags

An opinionated feature flag package for Laravel - heavily inspired by Laravel Pennant, but with the ability to conditionally allow access using a database-based list of conditions, providing some of the features a product like LaunchDarkly or Growthhub allows.


### "Opinionated" ?

- All feature flags must be classes with a `slug` provided via a `#[Slug]` attribute.
- Arguments it currently allows as **scope** are restricted to Eloquent models, mostly for ease of storage, evaluation, and implementation.
- Currently it only provides a database driver for feature and condition storage.

## Progress

- [ ] Unscoped (global) feature flags that are evaluated in code, with the result cached in memory (during the same request) and in the database (new requests).
- [ ] 'Scoped' feature flags that can be passed any Eloquent model as an argument and use the `resolve()` function.
- [ ] 'Managed' feature flags that allow access based on Eloquent models either whitelisted or blacklisted using a conditional structure.
- [ ] A CLI artisan command to manage the eloquent models that either have, or don't have, access to a particular feature.
- [ ] A built-in admin panel (Nuxt 3 + NuxtUI) for managing and displaying feature flags, served as static assets via Laravel.

## Acknowledgements

This package was heavily inspired by [Laravel Pennant](https://github.com/laravel/pennant). Thank you to the Laravel team for building such a well-designed feature flag system that served as the foundation and inspiration for this package.

## Installation

```bash
composer require intrfce/ffflags
```

Publish the config file and run the migrations:

```bash
php artisan vendor:publish --tag="ffflags-config"
php artisan vendor:publish --provider="Intrfce\FFFlags\FFFlagsServiceProvider"
php artisan migrate
```

## Defining Feature Flags

There are two types of feature flag: **code-resolved** and **managed**.

### Code-Resolved Feature Flags

Code-resolved features extend `FeatureFlag` and are resolved entirely via a `resolve()` method. Generate one with:

```bash
php artisan make:feature MyFeature
```

This creates a class in `app/Features/MyFeature.php`.

### Managed Feature Flags

Managed features extend `ManagedFeatureFlag` and are resolved via database-stored conditions (which model IDs have access). Generate one with:

```bash
php artisan make:feature MyManagedFeature --managed
php artisan make:feature MyManagedFeature --managed --model=App\Models\User
```

A managed feature must have a `#[Model]` attribute declaring the Eloquent model it expects as scope:

```php
use Intrfce\FFFlags\Attributes\Model;
use Intrfce\FFFlags\Attributes\Slug;
use Intrfce\FFFlags\ManagedFeatureFlag;
use App\Models\User;

#[Slug('beta-access')]
#[Model(User::class)]
class BetaAccess extends ManagedFeatureFlag
{
    //
}
```

If no database rule exists for a managed feature, the `fallback()` method is called (returns `false` by default). You can override it:

```php
#[Slug('beta-access')]
#[Model(User::class)]
class BetaAccess extends ManagedFeatureFlag
{
    public function fallback(): bool
    {
        return true; // active for everyone by default
    }
}
```

Managed features are controlled via the `feature:activate` and `feature:deactivate` artisan commands or the `ActivateFeature` and `DeactivateFeature` action classes (see below).

### Slug (Required)

Every feature flag **must** have a `#[Slug]` attribute.

Slugs are _required_ - to prevent the need to store a fully qualified classname (i.e. `\App\Features\MyFeature`), or provide a `morphMap()` separately. This keeps them nice and co-located.

```php
use Intrfce\FFFlags\Attributes\Slug;
use Intrfce\FFFlags\FeatureFlag;

#[Slug('my-feature')]
class MyFeature extends FeatureFlag
{
    //
}
```

If no `#[Slug]` attribute is set, a `MissingFeatureFlagSlugException` will be thrown.

When generating a feature with `php artisan make:feature MyFeature`, the slug is automatically kebab-cased from the class name (e.g. `MyFeature` becomes `my-feature`).

### Name (Optional)

You can optionally add a `#[Name]` attribute for a human-readable display name. If not provided, the slug is used as the display name:

```php
use Intrfce\FFFlags\Attributes\Name;
use Intrfce\FFFlags\Attributes\Slug;
use Intrfce\FFFlags\FeatureFlag;

#[Slug('my-feature')]
#[Name('My Feature')]
class MyFeature extends FeatureFlag
{
    //
}
```

### Description (Optional)

Descriptions can be set using the `#[Description]` attribute:

```php
use Intrfce\FFFlags\Attributes\Description;
use Intrfce\FFFlags\Attributes\Slug;
use Intrfce\FFFlags\FeatureFlag;

#[Slug('my-feature')]
#[Description('Controls the display of a certain feature')]
class MyFeature extends FeatureFlag
{
    //
}
```


If no description is set, it defaults to an empty string.

## Resolving Feature Flags

To determine if a feature flag is active, implement a `resolve` method on your feature class. The `resolve` method must return a boolean.

### Scopeless Features

Features that don't depend on a user or model can define `resolve` with no parameters:

```php
class GlobalFeature extends FeatureFlag
{
    public function resolve(): bool
    {
        return config('features.global_enabled');
    }
}
```

### Scoped Features

Type-hint a scope parameter to make the feature depend on a specific model:

```php
class MyFeature extends FeatureFlag
{
    public function resolve(User $user): bool
    {
        return in_array($user->email, ['me@mymail.com']);
    }
}
```

If no `resolve` method is defined, the feature defaults to inactive.

## Checking Feature Flags

### Direct Class Usage

Call `for()` on the feature class directly, passing your scope, then call `isActive()`:

```php
MyFeature::for($user)->isActive(); // true or false
```

### Facade Usage

Use the `FeatureFlag` facade to check one or more features:

```php
use Intrfce\FFFlags\Facades\FeatureFlag;

// Check a single feature.
FeatureFlag::for($user)->isActive(MyFeature::class);

// Check if any of the given features are active.
FeatureFlag::for($user)->anyActive([
    MyFeature::class,
    MySecondFeature::class,
]);

// Check if all of the given features are active.
FeatureFlag::for($user)->allActive([
    MyFeature::class,
    MySecondFeature::class,
]);
```

### Scopeless Facade Usage

For features that don't require a scope, you can call `isActive()` directly on the facade without `for()`:

```php
FeatureFlag::isActive(GlobalFeature::class);
```

If you call `isActive()` on a feature that requires a scope, a `ScopeRequiredException` will be thrown.

## Middleware

Use the `FeatureFlagMiddleware` class to protect routes behind feature flags. The middleware provides three static methods that return middleware strings compatible with Laravel's routing:

```php
use Intrfce\FFFlags\Http\Middleware\FeatureFlagMiddleware;

// Require a single feature to be active.
Route::get('/dashboard', DashboardController::class)
    ->middleware(FeatureFlagMiddleware::isActive(MyFeature::class));

// Require all features to be active.
Route::get('/new-dashboard', NewDashboardController::class)
    ->middleware(FeatureFlagMiddleware::allActive([
        MyFeature::class,
        AnotherFeature::class,
    ]));

// Require at least one feature to be active.
Route::get('/beta', BetaController::class)
    ->middleware(FeatureFlagMiddleware::anyActive([
        BetaAccessFeature::class,
        StaffFeature::class,
    ]));
```

By default, the middleware throws a 403 HTTP exception when features are inactive.

### Route Feature Flagging

For a more fluent syntax, you can use the `featureFlagged()` method directly on routes:

```php
// Single feature flag on a route.
Route::get('/new-dashboard', DashboardController::class)
    ->featureFlagged(NewDashboardFeature::class);

// Require all features to be active.
Route::get('/beta', BetaController::class)
    ->featureFlagged([FeatureA::class, FeatureB::class]);

// Require at least one feature to be active.
Route::get('/experimental', ExperimentalController::class)
    ->featureFlagged([FeatureA::class, FeatureB::class], 'any');
```

You can also feature-flag a group of routes:

```php
Route::featureFlagged(NewDashboardFeature::class)->group(function () {
    Route::get('/new-dashboard', DashboardController::class);
    Route::get('/new-settings', SettingsController::class);
});

// With multiple flags and a mode.
Route::featureFlagged([FeatureA::class, FeatureB::class], 'any')->group(function () {
    Route::get('/beta-a', BetaAController::class);
    Route::get('/beta-b', BetaBController::class);
});
```

The group variant returns a fluent route registrar, so you can chain `->prefix()`, `->name()`, `->middleware()`, and any other route group method as usual.

Under the hood, `featureFlagged()` applies the `FeatureFlagMiddleware` — so all existing behaviour (scoped features via `ResolvingFromMiddleware`, custom `whenInactive` responses, etc.) works automatically.

### Scoped Features in Middleware

If a feature requires a scope, it must implement the `ResolvingFromMiddleware` interface to tell the middleware how to derive the scope from the request:

```php
use Intrfce\FFFlags\Contracts\ResolvingFromMiddleware;
use Intrfce\FFFlags\FeatureFlag;
use Illuminate\Http\Request;

class MyFeature extends FeatureFlag implements ResolvingFromMiddleware
{
    public function getScopeFromRequest(Request $request): mixed
    {
        return $request->user();
    }

    public function resolve(User $user): bool
    {
        return $user->is_beta_tester;
    }
}
```

### Custom Inactive Responses

You can customise the response when feature flags deny access using `whenInactive`. This is typically called in a service provider's `boot` method:

```php
use Intrfce\FFFlags\Http\Middleware\FeatureFlagMiddleware;

FeatureFlagMiddleware::whenInactive(
    function (Request $request, array $features) {
        return response('Feature not available', 403);
    }
);
```

The callback receives the current request and an array of the feature class names that were inactive. Pass `null` to reset back to the default 403 exception behaviour.

## Bypassing Storage

By default, feature flag results are cached in-memory and persisted to the database. If you want a feature to skip database storage while still using the in-memory cache within a single request, add the `#[BypassStorage]` attribute:

```php
use Intrfce\FFFlags\Attributes\BypassStorage;
use Intrfce\FFFlags\FeatureFlag;

#[BypassStorage]
class VolatileFeature extends FeatureFlag
{
    public function resolve(): bool
    {
        return config('features.volatile');
    }
}
```

This is useful for features that rely on configuration or external state that may change between requests and shouldn't be cached in the database.

## Scope Type Safety

If the type of the object passed to `for()` does not match the type-hint on the `resolve` method, a `ScopeTypeMismatchException` is thrown:

```php
class MyFeature extends FeatureFlag
{
    public function resolve(User $user): bool
    {
        return true;
    }
}

// Throws ScopeTypeMismatchException - expects User, got Team.
MyFeature::for($team)->isActive();
```

## Purging Cached Results

To clear all cached feature flag results from the database, use the artisan command:

```bash
php artisan ffflags:purge
```

Or programmatically via the facade:

```php
use Intrfce\FFFlags\Facades\FeatureFlag;

FeatureFlag::purgeAll();
```

This clears both the database and the in-memory cache.

## Managing Feature Access via CLI

For managed feature flags, use the `feature:activate` and `feature:deactivate` artisan commands to control which model IDs have access.

### Activating

```bash
# Activate for specific model IDs (additive — existing IDs are kept)
php artisan feature:activate beta-access --any=1,2,3,4

# Replace the entire active list with the given IDs
php artisan feature:activate beta-access --any=5,6 --replace
```

### Deactivating

```bash
# Remove specific model IDs from the active list
php artisan feature:deactivate beta-access --any=2,3

# Deactivate for ALL models (with confirmation prompt)
php artisan feature:deactivate beta-access --all
```

The feature can be referenced by its slug, class basename, or fully qualified class name.

### Using Action Classes Directly

The commands delegate to action classes that can be used directly in your own code (e.g. from an API controller):

```php
use Intrfce\FFFlags\Actions\ActivateFeature;
use Intrfce\FFFlags\Actions\DeactivateFeature;

// Activate for model IDs 1, 2, 3 (additive)
app(ActivateFeature::class)->handle(new BetaAccess(), [1, 2, 3]);

// Replace the active list entirely
app(ActivateFeature::class)->handle(new BetaAccess(), [5, 6], replace: true);

// Remove specific IDs
app(DeactivateFeature::class)->handle(new BetaAccess(), [2, 3]);

// Deactivate for all
app(DeactivateFeature::class)->handle(new BetaAccess(), all: true);
```

## Validating Feature Flags

Use the `ffflags:validate` command to scan all discovered feature flags and report issues:

```bash
php artisan ffflags:validate
```

The command checks for:

- **Feature count summary** — total features split into code-resolved and managed
- **Duplicate slugs** — two or more feature classes sharing the same slug
- **Missing `resolve()` methods** — code-resolved features that have no `resolve()` method
- **Missing `#[Model]` attributes** — managed features without a `#[Model]` attribute

The command exits with code `0` when all checks pass, or `1` when any issue is found.

### Slug Uniqueness

Slugs must be unique across all feature flags. Duplicate slugs are caught at multiple levels:

- `make:feature` refuses to generate a feature if the slug already exists
- `feature:activate` and `feature:deactivate` check for duplicates before proceeding
- `ffflags:validate` reports all duplicate slugs in a single scan

## Dashboard

FFFlags includes a dashboard route at `/ffflags`. Access is controlled by a Laravel gate called `view-ffflags-dashboard`. By default, all access is denied. To grant access, define the gate in one of your service providers:

```php
use Illuminate\Support\Facades\Gate;

Gate::define('view-ffflags-dashboard', function (User $user) {
    return in_array($user->email, [
        'admin@example.com',
    ]);
});
```

You can customise the dashboard path in the config file:

```php
// config/ffflags.php
return [
    'path' => 'admin/ffflags',
];
```

## Admin Panel

FFFlags ships with a modern admin panel built with Nuxt 3 and NuxtUI. To use it, publish the pre-built assets:

```bash
php artisan vendor:publish --tag=ffflags-admin-assets
```

This publishes the static admin panel to `public/ffflags/admin/`. Once published, the admin panel is available at `/ffflags/admin`.

The admin panel uses the same middleware and gate as the Blade dashboard, so the `view-ffflags-dashboard` gate controls access to both.

### Admin Panel API

The admin panel communicates with your application via a JSON API at `/{path}-api/` (e.g. `/ffflags-api/`). The API uses the same authentication and authorisation middleware as the dashboard. The following endpoints are available:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ffflags-api/features` | List all discovered feature flags |
| `GET` | `/ffflags-api/features/{slug}` | Get feature detail with rules and available models |
| `POST` | `/ffflags-api/features/{slug}` | Update a managed feature's model scope rule |
| `POST` | `/ffflags-api/features/{slug}/check` | Test a rule against a specific model ID |

### Rebuilding the Admin Panel

If you need to customise the admin panel, the source is in the `nuxt/` directory. To rebuild:

```bash
cd nuxt
npm install
npm run build
```

Then re-publish the assets:

```bash
php artisan vendor:publish --tag=ffflags-admin-assets --force
```

## Exceptions

FFFlags throws descriptive exceptions to help you catch configuration issues early. All exceptions are in the `Intrfce\FFFlags\Exceptions` namespace.

| Exception | When it's thrown |
|---|---|
| `MissingFeatureFlagSlugException` | A feature flag class has no slug set. Add the `#[Slug]` attribute. |
| `InvalidScopeException` | A non-null scope was passed that is not an Eloquent model. Only `null` or `Model` instances are supported as scopes. |
| `ScopeTypeMismatchException` | The scope passed to `for()` does not match the type-hint on the feature's `resolve()` method (e.g. passed a `Team` when `resolve(User $user)` was expected). |
| `ScopeRequiredException` | `FeatureFlag::isActive()` was called directly on the facade for a feature that requires a scope. Use `FeatureFlag::for($scope)->isActive()` instead. |
| `ScopeDoesNotHaveKeyException` | A model scope was passed that has not been persisted to the database (its primary key is `null`). Save the model before checking feature flags to avoid cache collisions. |
| `ScopeProvidedButResolveHandlerMissingException` | A scope was provided when checking a feature, but the feature class does not have a `resolve()` method. |
| `FeatureFlagNotResolvableFromMiddlewareException` | A scoped feature was used in middleware but does not implement the `ResolvingFromMiddleware` interface. Implement the interface or remove the scope parameter from `resolve()`. |
| `InvalidModelAttributeException` | A non-Eloquent class was passed to the `#[Model]` attribute. Only `Model` subclasses are accepted. |
| `MissingModelAttributeException` | A `ManagedFeatureFlag` subclass is missing the required `#[Model]` attribute. |

## Test Scenarios

A plain-English reference for every major scenario covered by the test suite, and what each resolves to.

### Code-Resolved Feature Flags (`FeatureFlag`)

#### Basic Resolution

| Scenario | Result |
|---|---|
| Feature's `resolve()` returns `true`, no scope | **Active** |
| Feature's `resolve()` returns `false`, no scope | **Inactive** |
| Feature has no `resolve()` method and no scope is given | **Inactive** |
| Feature's `resolve(User $user)` returns `true` for the given user | **Active** |
| Feature's `resolve(User $user)` returns `false` for the given user | **Inactive** |

#### Scope Validation Errors

| Scenario | Result |
|---|---|
| Scope is not an Eloquent model (e.g. a string or `stdClass`) | `InvalidScopeException` |
| Scope model has not been persisted (primary key is `null`) | `ScopeDoesNotHaveKeyException` |
| Scope is provided but the feature has no `resolve()` method | `ScopeProvidedButResolveHandlerMissingException` |
| Scope model type doesn't match the type-hint on `resolve()` (e.g. `Team` when `User` expected) | `ScopeTypeMismatchException` |
| Feature has no `#[Slug]` attribute | `MissingFeatureFlagSlugException` |

#### Manager-Level Checks

| Scenario | Result |
|---|---|
| `isActive()` on a scopeless feature that resolves `true` | **Active** |
| `isActive()` on a scopeless feature that resolves `false` | **Inactive** |
| `isActive()` on a feature whose `resolve()` requires a scope parameter | `ScopeRequiredException` |
| `anyActive([...])` — at least one feature is active | **`true`** |
| `anyActive([...])` — no features are active | **`false`** |
| `anyActive([])` — empty array | **`false`** |
| `allActive([...])` — all features are active | **`true`** |
| `allActive([...])` — at least one feature is inactive | **`false`** |
| `allActive([])` — empty array | **`true`** |
| `purgeAll()` called | All database rows and in-memory cache entries are cleared |

### Managed Feature Flags (`ManagedFeatureFlag`)

#### Condition Types

The database stores a `condition` and `value` (array of model IDs) for each feature/scope-type pair:

| Condition | Scope ID **in** the value list | Scope ID **not in** the value list |
|---|---|---|
| `Equals` | **Active** | **Inactive** |
| `DoesNotEqual` | **Inactive** | **Active** |
| `IsOneOf` | **Active** | **Inactive** |
| `IsNoneOf` | **Inactive** | **Active** |

#### Fallback Behaviour

| Scenario | Result |
|---|---|
| No database rule exists for this feature/scope type | Returns `fallback()` (defaults to `false`) |
| Database rule exists and condition matches | **Active** — database rule takes priority |
| Database rule exists and condition does not match | **Inactive** — database rule takes priority |

#### Scope Validation Errors (Managed)

| Scenario | Result |
|---|---|
| No scope provided (`null`) | `ScopeRequiredException` |
| Scope is not an Eloquent model | `InvalidScopeException` |
| Scope model has no primary key (not persisted) | `ScopeDoesNotHaveKeyException` |
| Scope model type doesn't match the class declared in `#[Model]` | `ScopeTypeMismatchException` |
| `ManagedFeatureFlag` subclass is missing `#[Model]` attribute | `MissingModelAttributeException` |

#### `#[Model]` Attribute Validation

| Scenario | Result |
|---|---|
| `#[Model(User::class)]` where `User` extends Eloquent `Model` | Accepted |
| `#[Model(stdClass::class)]` where the class is not an Eloquent model | `InvalidModelAttributeException` |

### Activate / Deactivate Actions

#### `ActivateFeature`

| Scenario | Result |
|---|---|
| No existing rule — activate for IDs `[1, 2, 3]` | Creates `IsOneOf` rule with value `[1, 2, 3]` |
| Existing rule with `[1, 2]` — activate `[2, 3, 4]` (default, additive) | Value becomes `[1, 2, 3, 4]` |
| Existing rule with `[1, 2, 3]` — activate `[5, 6]` with `replace: true` | Value becomes `[5, 6]` |
| Activate with duplicate IDs `[1, 1, 2, 2, 3]` | Deduplicated to `[1, 2, 3]` |

#### `DeactivateFeature`

| Scenario | Result |
|---|---|
| Existing rule with `[1, 2, 3, 4]` — deactivate `[2, 3]` | Value becomes `[1, 4]` |
| Existing rule with `[1, 2, 3, 4, 5]` — deactivate `[1]` | Value becomes `[2, 3, 4, 5]` |
| Existing rule with `[1, 2, 3]` — deactivate with `all: true` | Value becomes `[]` |
| No existing rule — deactivate `[1, 2]` | No-op, nothing happens |

### Result Caching

| Scenario | Result |
|---|---|
| First evaluation of a feature+scope | `resolve()` is called; result stored in database and memory |
| Same feature+scope again in the same request | In-memory cache hit; `resolve()` is **not** called again |
| Same feature+scope on a fresh request (new manager) | Database cache hit; `resolve()` is **not** called again |
| `#[BypassStorage]` — same request, same feature+scope | In-memory cache hit; `resolve()` is **not** called again |
| `#[BypassStorage]` — fresh request, same feature+scope | `resolve()` **is** called again (no database cache) |
| `#[BypassStorage]` — after evaluation | No row is written to the database |
| Scopeless feature evaluated | Cached with `null` scope type and scope ID |
| Two different scopes for the same feature | Each gets its own independent cached result |

### Middleware

#### Single Feature (`is` mode)

| Scenario | Result |
|---|---|
| Feature is active, no scope needed | Request proceeds |
| Feature is inactive, no scope needed | **403 abort** |
| Scoped feature implements `ResolvingFromMiddleware`, scope resolves active | Request proceeds |
| Scoped feature implements `ResolvingFromMiddleware`, scope resolves inactive | **403 abort** |
| Scoped feature does **not** implement `ResolvingFromMiddleware` | `FeatureFlagNotResolvableFromMiddlewareException` |

#### Multiple Features (`all` mode)

| Scenario | Result |
|---|---|
| All features are active | Request proceeds |
| At least one feature is inactive | **403 abort** |

#### Multiple Features (`any` mode)

| Scenario | Result |
|---|---|
| At least one feature is active | Request proceeds |
| No features are active | **403 abort** |

#### Route `featureFlagged()` Macro

| Scenario | Result |
|---|---|
| `->featureFlagged(ActiveFeature::class)` on a single route | Request proceeds |
| `->featureFlagged(InactiveFeature::class)` on a single route | **403 abort** |
| `->featureFlagged([ActiveFeature, InactiveFeature])` (default `all` mode) | **403 abort** |
| `->featureFlagged([InactiveFeature, ActiveFeature], 'any')` | Request proceeds |
| `Route::featureFlagged(ActiveFeature::class)->group(...)` | All grouped routes proceed |
| `Route::featureFlagged(InactiveFeature::class)->group(...)` | All grouped routes get **403 abort** |

#### Custom `whenInactive` Callback

| Scenario | Result |
|---|---|
| Callback registered, feature is inactive | Callback invoked; its response is returned |
| Callback registered, feature is active | Callback is **not** invoked; request proceeds |

### Artisan Commands

#### `make:feature`

| Scenario | Result |
|---|---|
| `make:feature TestFeature` | Creates class extending `FeatureFlag` with `resolve()` stub |
| `make:feature ManagedTest --managed` | Creates class extending `ManagedFeatureFlag` with `#[Model]` attribute |
| `make:feature ManagedTest --managed --model=App\Models\User` | Same, with `#[Model(User::class)]` pre-filled |

#### `feature:activate`

| Scenario | Result |
|---|---|
| `feature:activate my-feature --any=1,2,3` | Activates IDs 1, 2, 3 (additive with existing list) |
| `feature:activate my-feature --any=5,6 --replace` | Replaces the entire active list with IDs 5, 6 |

#### `feature:deactivate`

| Scenario | Result |
|---|---|
| `feature:deactivate my-feature --any=2,3` | Removes IDs 2, 3 from the active list |
| `feature:deactivate my-feature --all` | Clears the entire active list (with confirmation) |

#### `ffflags:validate`

| Scenario | Result |
|---|---|
| All features are valid (no duplicates, no missing methods) | Exit code `0`, "All checks passed" |
| No features discovered | Exit code `0`, warning "No feature flags discovered" |
| Two features share the same slug | Exit code `1`, reports the duplicate slug and conflicting classes |
| Code-resolved feature is missing `resolve()` method | Exit code `1`, reports "missing resolve() method" |
| Shows feature count summary | Outputs total, code-resolved, and managed counts |

#### `make:feature` (slug validation)

| Scenario | Result |
|---|---|
| Slug does not clash with any existing feature | Feature class is created |
| Slug clashes with an existing feature | Error, feature is **not** created |

### Discovery

| Scenario | Result |
|---|---|
| Feature classes registered via config `classes` array | Discovered as `DiscoveredFeatureFlag` DTOs |
| Feature classes found in configured directories | Discovered via filesystem scanning |
| Non-existent directory in config | Silently ignored |
| Same class registered twice | Deduplicated to one entry |
| Discovery called multiple times | Cached after first call |
| `flush()` then `discover()` | Cache cleared, features re-scanned |

### Database Result Store

| Scenario | Result |
|---|---|
| Store a result, then retrieve it | Returns the stored boolean |
| Retrieve a result that was never stored | Returns `null` |
| Store with `null` scope type and scope ID | Stored and retrievable with `null` scope |
| Store twice for the same key | Second value overwrites the first; one row |
| Delete a single result | That result returns `null`; others unaffected |
| Purge all results | All rows removed |

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
