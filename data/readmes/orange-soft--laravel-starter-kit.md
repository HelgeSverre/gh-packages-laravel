# OrangeSoft Laravel Starter Kit

A Laravel starter kit installer that scaffolds a complete admin application with authentication, user management, and role-based access control.

## Requirements

- PHP 8.2+
- Laravel 11 or 12
- Node.js 18+
- PostgreSQL / MySQL / SQLite

## Installation

```bash
composer require orange-soft/laravel-starter-kit --dev
php artisan os:starter:install
```

After installation, follow the manual configuration steps shown in the output, then run the post-installation commands.

### Installation Behavior

| File Type | First Install | Re-install | With `--force` |
|-----------|---------------|------------|----------------|
| **New files** (don't exist in fresh Laravel) | Created | Skipped | Replaced |
| **Protected files** (exist in fresh Laravel) | Instructions shown | Instructions shown | Instructions shown |
| **Customizable files** (e.g., RoleName.php, routes) | Created | Skipped | Skipped |

**Protected files are never overwritten** - you must manually add the required code. Use `php artisan os:starter:check` to verify your configuration.

**Customizable files** are never overwritten to preserve your changes. When skipped, a `.stub` file is created with the fresh version for comparison. You can add `*.stub` to your `.gitignore` if desired.

### Optional Features

```bash
php artisan os:starter:install --with=media --with=backup --with=activitylog
```

---

## Manual Configuration

These files exist in a fresh Laravel project and require manual amendments. The installer shows these instructions automatically.

### 1. `app/Models/User.php`

Add imports:
```php
use App\Models\Traits\HasTemporaryPassword;
use App\Models\Traits\HasUuidRouteKey;
use App\Notifications\Auth\ResetPasswordNotification;
use App\Notifications\Auth\VerifyEmailNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Permission\Traits\HasRoles;
```

Update class declaration and add traits:
```php
class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, HasRoles, HasTemporaryPassword, HasUuidRouteKey, SoftDeletes;
```

Add notification methods:
```php
public function sendPasswordResetNotification($token): void
{
    $this->notify(new ResetPasswordNotification($token));
}

public function sendEmailVerificationNotification(): void
{
    $this->notify(new VerifyEmailNotification);
}
```

### 2. `bootstrap/app.php`

Add to `withMiddleware()`:
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        \App\Http\Middleware\HandleInertiaRequests::class,
        \App\Http\Middleware\HandleNavigationContext::class,
    ]);

    $middleware->alias([
        'password.not_temporary' => \App\Http\Middleware\EnsurePasswordIsNotTemporary::class,
        'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
        'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
        'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
    ]);
})
```

### 3. `tests/Pest.php`

Add RefreshDatabase configuration:
```php
pest()->extend(Tests\TestCase::class)
    ->use(Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->in('Feature');

pest()->extend(Tests\TestCase::class)
    ->use(Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->group('browser')
    ->in('Browser');
```

### 4. `phpunit.xml`

Add Browser testsuite in `<testsuites>`:
```xml
<testsuite name="Browser">
    <directory>tests/Browser</directory>
</testsuite>
```

### 5. `vite.config.js`

Add imports and plugins:
```js
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import {wayfinder} from '@laravel/vite-plugin-wayfinder';
import {resolve} from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        tailwindcss(),
        wayfinder({ formVariants: true }),
        vue({
            template: {
                transformAssetUrls: { base: null, includeAbsolute: false },
            },
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'resources/js'),
            '@fonts': resolve(__dirname, 'public/fonts'),
        },
    },
});
```

### 6. `.env`

```
DEFAULT_USER_PASSWORD=your-secure-password
```

---

## Post-Installation

After completing manual configuration:

```bash
npm install && npm run build
php artisan migrate && php artisan db:seed --class=RoleSeeder && php artisan db:seed --class=AdminUserSeeder
composer test
```

Verify your configuration:
```bash
php artisan os:starter:check
```

Default admin credentials:
- Email: `admin@example.com`
- Password: Value of `DEFAULT_USER_PASSWORD` in `.env`

## What's Included

### Stack
- **Inertia.js v2** - Server-side routing with Vue frontend
- **Vue 3** - Composition API with `<script setup>`
- **Tailwind CSS v4** - CSS-first configuration (14px compact admin UI)
- **PrimeVue** - UI component library with Aura preset
- **Laravel Wayfinder** - Type-safe routing
- **Spatie Permission** - Role-based access control

### Features

#### Authentication
- Login with email/password
- "Remember me" functionality
- Forgot password (email link)
- Reset password
- Email verification
- **Temporary password flow**: New users must change password on first login

#### User Management
- List users with search and pagination
- Create user with role assignment
- Edit user with role assignment
- Delete user (with self-delete protection)

#### Navigation Context
- **Automatic pagination preservation**: Users return to the same page after CRUD operations
- Session-based URL storage for index pages
- Works automatically with all resource controllers

#### Admin UI
- **14px base font** for compact, professional appearance
- **Breadcrumbs** with automatic title fallback
- Sidebar navigation
- Topbar with user menu
- Toast notifications
- Confirmation dialogs

### Files Structure

```
app/
├── Enums/
│   └── RoleName.php                    # Role enum (customize per app)
├── Http/
│   ├── Controllers/
│   │   ├── Auth/
│   │   │   ├── ChangePasswordController.php
│   │   │   ├── ForgotPasswordController.php
│   │   │   ├── LoginController.php
│   │   │   ├── LogoutController.php
│   │   │   ├── ResetPasswordController.php
│   │   │   └── VerifyEmailController.php
│   │   ├── Traits/
│   │   │   └── RedirectsToStoredIndex.php  # Navigation context trait
│   │   ├── ProfileController.php
│   │   └── UserController.php
│   ├── Middleware/
│   │   ├── EnsurePasswordIsNotTemporary.php
│   │   ├── HandleInertiaRequests.php
│   │   └── HandleNavigationContext.php     # Pagination preservation
│   └── Requests/
│       ├── Auth/
│       │   ├── ChangePasswordRequest.php
│       │   ├── ForgotPasswordRequest.php
│       │   ├── LoginRequest.php
│       │   └── ResetPasswordRequest.php
│       ├── ProfileUpdateRequest.php
│       ├── UserStoreRequest.php
│       └── UserUpdateRequest.php
├── Mail/
│   └── AppMailable.php                 # Base mailable class
├── Models/
│   ├── Traits/
│   │   └── HasUuidRouteKey.php
│   └── User.php                        # With HasRoles, temp password support
└── Notifications/
    ├── Auth/
    │   ├── ResetPasswordNotification.php
    │   └── VerifyEmailNotification.php
    └── AppNotification.php             # Base notification class

bootstrap/
└── app.php                             # Middleware registration

config/
└── os.php                              # Kit configuration

database/
├── migrations/
│   └── 0001_01_01_000010_add_uuid_and_temp_password_to_users_table.php
└── seeders/
    ├── AdminUserSeeder.php
    ├── DatabaseSeeder.php
    └── RoleSeeder.php

resources/
├── css/
│   ├── app.css                         # Tailwind + PrimeUI + Typography
│   └── fonts.css                       # Custom fonts
├── js/
│   ├── layouts/
│   │   ├── AdminLayout.vue             # With breadcrumbs, Head component
│   │   └── AuthLayout.vue
│   ├── components/
│   │   ├── AppShell.vue
│   │   ├── ConfirmDialog.vue
│   │   ├── FormError.vue
│   │   ├── Sidebar.vue
│   │   ├── Toast.vue
│   │   └── Topbar.vue
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── ChangePassword.vue
│   │   │   ├── ForgotPassword.vue
│   │   │   ├── Login.vue
│   │   │   ├── ResetPassword.vue
│   │   │   └── VerifyEmail.vue
│   │   ├── dev/
│   │   │   └── Typography.vue          # Typography preview page
│   │   ├── profile/
│   │   │   └── Edit.vue
│   │   ├── users/
│   │   │   ├── Create.vue
│   │   │   ├── Edit.vue
│   │   │   └── Index.vue
│   │   └── Dashboard.vue
│   ├── app.js
│   └── bootstrap.js
└── views/
    ├── app.blade.php
    └── vendor/
        ├── mail/                       # Custom mail templates
        └── notifications/

routes/
├── admin.php                           # User management routes
├── auth.php                            # Authentication routes
└── web.php                             # Modified to include above

tests/
├── Browser/
│   ├── AuthTest.php
│   ├── ProfileTest.php
│   └── UserManagementTest.php
└── Feature/
    ├── Auth/
    │   ├── ChangePasswordTest.php
    │   ├── EmailVerificationTest.php
    │   ├── ForgotPasswordTest.php
    │   ├── LoginTest.php
    │   ├── LogoutTest.php
    │   └── ResetPasswordTest.php
    ├── Profile/
    │   └── ProfileTest.php
    ├── MiddlewareTest.php
    ├── NotificationsTest.php
    ├── RolesTest.php
    └── UserManagementTest.php
```

## Customization

### Roles

Edit `app/Enums/RoleName.php` to define your application's roles:

```php
enum RoleName: string
{
    case Admin = 'admin';
    case Manager = 'manager';
    case Staff = 'staff';
}
```

Then re-run the seeder:

```bash
php artisan db:seed --class=RoleSeeder
```

### Navigation Context

The `HandleNavigationContext` middleware runs globally and preserves pagination/filter state. In controllers, use the `RedirectsToStoredIndex` trait:

```php
use App\Http\Controllers\Traits\RedirectsToStoredIndex;

class ProductController extends Controller
{
    use RedirectsToStoredIndex;

    public function store(ProductStoreRequest $request)
    {
        $request->persist();

        // Redirects to stored URL (e.g., /products?page=3&search=widget)
        return $this->redirectToIndex('products.index', 'Product created.');
    }
}
```

### Breadcrumbs

Pass breadcrumbs to `AdminLayout`:

```vue
<AdminLayout
    title="Edit Product"
    :breadcrumbs="[
        { label: 'Products', href: '/products' },
        { label: product.name }
    ]"
>
```

If no breadcrumbs provided, the title is used as fallback.

## Optional Features

### Media Library (`--with=media`)
- Installs `spatie/laravel-medialibrary`
- Publishes config and migrations

### Backup (`--with=backup`)
- Installs `spatie/laravel-backup`
- Publishes config

### Activity Log (`--with=activitylog`)
- Installs `spatie/laravel-activitylog`
- Publishes config and migrations
- Includes `LogsActivity` trait

## Testing

```bash
# Run all tests (excluding browser tests)
composer test

# Run browser tests only
composer test:browser

# Run specific test file
php artisan test tests/Feature/UserManagementTest.php
```

### Browser Test Cleanup

Browser tests download "Chrome for Testing" binaries. Over time, these accumulate and clutter your macOS "Open With" menu with multiple Chrome versions.

To clean up old versions:

```bash
# Remove cached browser binaries
rm -rf ~/.cache/puppeteer
rm -rf ~/.cache/ms-playwright

# Reset macOS Launch Services database
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain user

# Restart Finder
killall Finder
```

## Development Scripts

```bash
# Start all services (server, queue, logs, vite)
composer dev

# Initial setup
composer setup
```

## License

Proprietary - Orange Soft
