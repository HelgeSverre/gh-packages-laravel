# Omnify SSO Client

Laravel package for Role-based Access Control (RBAC) with Omnify schema-driven development.

## Installation

```bash
composer require famgia/omnify-sso-client
```

Laravel will auto-discover the service provider.

## Usage

### Models

```php
use Omnify\SsoClient\Models\Permission;
use Omnify\SsoClient\Models\Role;
use Omnify\SsoClient\Models\RolePermission;

// Create a permission
$permission = Permission::create([
    'name' => 'users.create',
    'slug' => 'users-create',
]);

// Create a role
$role = Role::create([
    'name' => 'Admin',
    'slug' => 'admin',
    'description' => 'Administrator role',
]);

// Assign permission to role
RolePermission::create([
    'role_id' => $role->id,
    'permission_id' => $permission->id,
]);
```

### Migrations

Migrations are automatically loaded from the package. Run:

```bash
php artisan migrate
```

## Schema-Driven Development

This package is generated using [Omnify](https://github.com/ecsol/omnify-ts). The source schemas are in `database/schemas/`:

- `Permission.yaml` - Permission model
- `Role.yaml` - Role model  
- `RolePermission.yaml` - Pivot table
- `UserSsoPartial.yaml` - Partial to extend User model with roles

### Regenerate Models

If you modify the schemas, regenerate using:

```bash
npx omnify generate
```

## Package Structure

```
omnify-sso-client/
├── composer.json
├── database/
│   ├── factories/           # Laravel factories
│   ├── migrations/          # Auto-loaded migrations
│   └── schemas/             # Omnify schema definitions
│       └── Sso/
│           ├── Permission.yaml
│           ├── Role.yaml
│           ├── RolePermission.yaml
│           └── UserSsoPartial.yaml
└── src/
    ├── Models/
    │   ├── Generated/       # Auto-generated base classes
    │   │   ├── BaseModel.php
    │   │   ├── Traits/
    │   │   └── Locales/
    │   ├── Permission.php   # User-editable model
    │   ├── Role.php
    │   └── RolePermission.php
    └── Providers/
        └── SsoClientServiceProvider.php
```

## License

MIT
