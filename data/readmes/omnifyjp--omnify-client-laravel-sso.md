# Omnify SSO Client

Laravel package for Single Sign-On (SSO) integration with Omnify Console, featuring Role-Based Access Control (RBAC), team permissions, and comprehensive security features.

## Features

- **SSO Authentication** - JWT-based authentication with Omnify Console
- **UUID Support** - All models use UUID primary keys (compatible with Console)
- **Role-Based Access Control (RBAC)** - Flexible role and permission management
- **Team Permissions** - Organization-level permission management via Console
- **Minimal Schema Design** - Only stores Console references, data is fetched from Console API
- **Security** - Open redirect protection, input validation, rate limiting ready
- **Logging** - Dedicated log channel for audit trails
- **Multi-language** - i18n support (ja, en, vi)
- **Omnify Schema-Driven** - Auto-generated models with Omnify

## Architecture

This package integrates with Omnify Console's **ServiceInstance** architecture:

```
Console (SSO Provider)                    Your Service (SSO Client)
┌─────────────────────────────┐          ┌─────────────────────────┐
│ Users (UUID)                │          │ users                   │
│ Organizations (UUID)        │◀────────▶│   console_user_id (UUID)│
│ Teams (UUID)                │          │                         │
│ Branches (UUID)             │          │ teams                   │
│                             │          │   console_team_id (UUID)│
│ Service: "your-service"     │          │   console_org_id (UUID) │
│                             │          │                         │
│ ServiceInstance (per-org):  │          │ branches                │
│   - client_id               │          │   console_branch_id     │
│   - client_secret           │          │   console_org_id (UUID) │
└─────────────────────────────┘          └─────────────────────────┘
```

> **Design Philosophy:** This package only stores Console reference IDs. Full user/team/branch data is fetched from Console API when needed, ensuring data consistency.

## Requirements

- PHP 8.2+
- Laravel 11.0+ or 12.0+
- MySQL 8.0+ / PostgreSQL 13+ / SQLite 3.35+

## Quick Start

### 1. Install

```bash
composer require omnifyjp/omnify-client-laravel-sso
```

### 2. Configure Environment

```env
# Required
SSO_CONSOLE_URL=https://console.omnify.jp
SSO_SERVICE_SLUG=your-service-slug

# Optional
SSO_LOG_CHANNEL=sso
SSO_LOGGING_ENABLED=true
```

### 3. Run Migrations

```bash
php artisan migrate
```

### 4. Install Command (Optional)

```bash
php artisan sso:install
```

## Models

All models use **UUID** primary keys for compatibility with Console.

| Model            | Description                       | Console Reference                            |
| ---------------- | --------------------------------- | -------------------------------------------- |
| `User`           | SSO user with Console integration | `console_user_id` (UUID)                     |
| `Branch`         | Branch reference from Console     | `console_branch_id`, `console_org_id` (UUID) |
| `Team`           | Team reference from Console       | `console_team_id`, `console_org_id` (UUID)   |
| `TeamPermission` | Team-level permissions            | `console_team_id`, `console_org_id` (UUID)   |
| `Role`           | Local role with level hierarchy   | -                                            |
| `Permission`     | Local permission                  | -                                            |
| `RolePermission` | Role-Permission pivot             | -                                            |

### User Model Fields

```php
// SSO fields only - basic auth fields come from your main User schema
$fillable = [
    'console_user_id',       // UUID - links to Console User
    'console_access_token',  // Encrypted access token
    'console_refresh_token', // Encrypted refresh token
    'console_token_expires_at',
    'role_id',              // UUID - local role assignment
];
```

### Branch/Team Model Fields

```php
// Only Console references - full data fetched from Console API
$fillable = [
    'console_branch_id',  // UUID - links to Console Branch
    'console_org_id',     // UUID - links to Console Organization
];
```

## Omnify Schema Integration

This package uses Omnify for schema-driven development. Schemas are designed as `kind: object` with minimal fields:

```yaml
# database/schemas/Sso/User.yaml
kind: object

options:
  timestamps: true
  idType: Uuid

properties:
  console_user_id:
    type: Uuid
    unique: true
    nullable: true
    
  console_access_token:
    type: Text
    nullable: true
    
  # ... other SSO fields
  
  role:
    type: Association
    relation: ManyToOne
    target: Role
```

### Generate Models

```bash
# In your project
npx omnify generate

# Output: Auto-discovered packages from .omnify-packages.json
```

## Usage Examples

### Authentication Flow

```php
// Frontend redirects to Console login
$loginUrl = "https://console.omnify.jp/sso/authorize?" . http_build_query([
    'service' => config('sso-client.service.slug'),
    'redirect_uri' => url('/sso/callback'),
]);

// After login, Console redirects back with code
// POST /api/sso/callback { "code": "authorization_code" }
```

### Check Permissions

```php
$user = auth()->user();

// Check single permission
if ($user->hasPermission('users.create')) {
    // ...
}

// Check any permission
if ($user->hasAnyPermission(['users.create', 'users.update'])) {
    // ...
}

// Via Gate
if (Gate::allows('users.create')) {
    // ...
}

// Via Blade
@can('users.create')
    <button>Create User</button>
@endcan
```

### Protect Routes

```php
Route::middleware(['sso.auth', 'sso.permission:users.create'])->group(function () {
    Route::post('/users', [UserController::class, 'store']);
});

// Role-based protection
Route::middleware(['sso.auth', 'sso.role:admin'])->group(function () {
    Route::resource('/admin/settings', SettingsController::class);
});
```

### Fetch Data from Console

```php
use Omnify\SsoClient\Services\ConsoleApiService;

$consoleApi = app(ConsoleApiService::class);

// Get user details from Console
$consoleUser = $consoleApi->getUser($user->console_user_id);

// Get organization teams
$teams = $consoleApi->getOrganizationTeams($orgId);

// Get branch details
$branch = $consoleApi->getBranch($branchId);
```

## Package Structure

```
omnify-client-laravel-sso/
├── config/
│   └── sso-client.php          # Configuration
├── database/
│   ├── factories/              # Model factories
│   ├── migrations/             # Database migrations  
│   └── schemas/Sso/            # Omnify schema definitions
│       ├── User.yaml           # SSO fields for User
│       ├── Branch.yaml         # Console branch reference
│       ├── Team.yaml           # Console team reference
│       ├── TeamPermission.yaml # Team permissions
│       ├── Role.yaml           # Local roles
│       ├── Permission.yaml     # Local permissions
│       └── RolePermission.yaml # Role-Permission pivot
├── src/
│   ├── Models/
│   │   ├── OmnifyBase/         # Auto-generated base models (UUID support)
│   │   ├── User.php            # User model
│   │   ├── Branch.php          # Branch model
│   │   ├── Team.php            # Team model
│   │   └── ...
│   ├── Services/
│   │   ├── ConsoleApiService.php    # Console API client
│   │   ├── ConsoleTokenService.php  # Token management
│   │   └── ...
│   └── Http/
│       ├── Controllers/        # API controllers
│       └── Middleware/         # Route middleware
└── tests/                      # Test suite
```

## Available Commands

```bash
# Install package
php artisan sso:install

# Sync permissions from config
php artisan sso:sync-permissions

# Cleanup orphaned teams
php artisan sso:cleanup-orphan-teams
```

## Database Seeders

The package includes reusable seeders for roles and permissions:

```php
// In your DatabaseSeeder.php
use Omnify\SsoClient\Database\Seeders\SsoRolesSeeder;

$this->call(SsoRolesSeeder::class);
```

This creates:
- **5 roles**: admin, manager, supervisor, member, viewer
- **21 permissions**: service-admin.*, dashboard.*

For app-specific permissions, use the provided traits:

```php
use Omnify\SsoClient\Database\Seeders\Concerns\AssignsRoles;
use Omnify\SsoClient\Database\Seeders\Concerns\FetchesConsoleData;

class PermissionSeeder extends Seeder
{
    use FetchesConsoleData, AssignsRoles;

    public function run(): void
    {
        // Fetch org data dynamically from Console
        $orgData = $this->fetchOrgDataFromConsole('your-org-slug');
        
        // Assign role to user
        $this->assignRoleToUserByEmail('admin@example.com', 'admin', $orgData['org_id']);
    }
}
```

See [Seeders Documentation](docs/seeders.md) for full details.

## Documentation

| Document                                 | Description                        |
| ---------------------------------------- | ---------------------------------- |
| [Installation](docs/installation.md)     | Detailed installation guide        |
| [Configuration](docs/configuration.md)   | All configuration options          |
| [Authentication](docs/authentication.md) | SSO flow and JWT verification      |
| [Authorization](docs/authorization.md)   | RBAC, roles, and permissions       |
| [Middleware](docs/middleware.md)         | Available middleware               |
| [API Reference](docs/api.md)             | Admin API endpoints                |
| [**Seeders**](docs/seeders.md)           | **Roles, permissions, and traits** |

## Testing

```bash
./vendor/bin/pest
```

## License

MIT License. See [LICENSE](LICENSE) for more information.

## Credits

- [Omnify Team](https://omnify.jp)
- Generated with [Omnify](https://github.com/famgia/omnify)
