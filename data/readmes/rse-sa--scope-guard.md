# Scope Guard

A universal Laravel package for managing granular, multi-dimensional scoped permissions. Supports both **Spatie Permission integration** and **standalone custom permission** modes.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Quick Start](#quick-start)
6. [Usage Modes](#usage-modes)
   - [Spatie Integration](#mode-1-spatie-integration)
   - [Custom Gate](#mode-2-custom-gate)
   - [Standalone](#mode-3-standalone)
7. [Permission Checking](#permission-checking)
8. [Creating Scoped Permissions](#creating-scoped-permissions)
   - [Using PermissionBuilder](#using-permissionbuilder)
   - [Direct Model Creation](#direct-model-creation)
9. [Hierarchical Inheritance](#hierarchical-inheritance)
10. [Allow/Deny System](#allowdeny-system)
11. [Eloquent Query Scopes](#eloquent-query-scopes)
12. [Blade Directives](#blade-directives)
13. [Caching](#caching)
14. [Console Commands](#console-commands)
15. [Events](#events)
16. [Custom Models](#custom-models)
17. [API Reference](#api-reference)

---

## Overview

Scope Guard provides a flexible permission system that allows you to define permissions scoped to specific dimensions (e.g., folder_id, project_id, region) while optionally falling back to global permissions managed by Spatie or your custom authorization system.

### The Problem This Solves

```
┌─────────────────────────────────────────────────────────────────┐
│ Traditional Permissions                                         │
├─────────────────────────────────────────────────────────────────┤
│ User has "documents.view" → Can view ALL documents             │
│                                                                  │
│ But you want:                                                   │
│ - View documents only in "Folder A"                            │
│ - Edit documents only in "Project X"                           │
│ - View secret documents only in "HR Folder"                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Scope Guard Permissions                                         │
├─────────────────────────────────────────────────────────────────┤
│ User has "documents.view" (global)                             │
│   ↓                                                            │
│ PLUS scoped permissions:                                       │
│ - documents.view + folder_id = "Folder A"  ✓                   │
│ - documents.edit + folder_id = "Project X" + project_id = "Y" ✓│
└─────────────────────────────────────────────────────────────────┘
```

---

## Features

- **Universal**: Not limited to specific models or dimension count
- **Developer-Friendly**: Fluent configuration with full IDE autocomplete
- **Flexible**: Supports Spatie Permission integration OR standalone mode
- **Hierarchical**: Optional inheritance (parent→children propagation)
- **Multi-Dimensional**: Unlimited permission dimensions via JSON
- **Allow/Deny**: Supports explicit deny permissions overriding allow
- **Caching**: Built-in caching with registry system (works with all cache drivers)
- **Eloquent Scopes**: Query scope for filtering accessible records
- **Blade Directives**: `@scopedCan`, `@scopedCannot` with `@else` support
- **Events**: Dispatched on permission create/update/delete
- **Custom Models**: Override models for auditing, custom methods, etc.
- **Observer**: Automatic cache clearing and audit trail
- **Permission Builder**: Fluent interface for creating permissions
- **Type-Safe Config**: Code-based configuration with full IDE support

---

## Installation

```bash
composer require rse-sa/scope-guard
```

Publish the configuration and migrations:

```bash
php artisan vendor:publish --provider="RSE\ScopeGuard\Providers\ScopeGuardServiceProvider"
```

Run migrations:

```bash
php artisan migrate
```

---

## Configuration

### Using ScopeGuardConfigurator (Recommended)

ScopeGuard uses a code-based configurator for type-safe, IDE-friendly configuration. Define your dimensions and scopes in `AppServiceProvider::boot()`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use RSE\ScopeGuard\Config\ScopeGuardConfigurator;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Define dimensions
        app(ScopeGuardConfigurator::class)
            ->defineDimension('folder_id')
            ->type('ulid')
            ->inheritable()
            ->resolveParentUsing(fn ($id) => \App\Models\Folder::find($id)?->parent_id);

        app(ScopeGuardConfigurator::class)
            ->defineDimension('project_id')
            ->type('ulid')
            ->inheritable();

        app(ScopeGuardConfigurator::class)
            ->defineDimension('region')
            ->type('string');

        // Define scopes
        app(ScopeGuardConfigurator::class)
            ->defineScope('documents')
            ->forModel(\App\Models\Document::class)
            ->mapDimensions([
                'folder_id' => 'folder_id',
                'project_id' => 'project_id',
            ]);

        app(ScopeGuardConfigurator::class)
            ->defineScope('contracts')
            ->forModel(\App\Models\Contract::class)
            ->mapDimensions([
                'folder_id' => 'folder_id',
                'client_id' => 'client_id',
            ]);
    }
}
```

#### DimensionBuilder Methods

| Method | Description |
|--------|-------------|
| `type(string $type)` | Set dimension type: `string`, `integer`, `uuid`, `ulid`, `array` |
| `inheritable()` | Mark dimension as supporting hierarchical inheritance |
| `resolveParentUsing(callable)` | Set custom parent resolver for inheritance |

#### ScopeBuilder Methods

| Method | Description |
|--------|-------------|
| `forModel(string $class)` | Set the model class this scope applies to |
| `mapDimensions(array $map)` | Map dimension names to database column names |

### Config File Options

The `config/scope-guard.php` file contains other package settings:

```php
return [
    // Enable/disable the package
    'enabled' => true,

    // Global permission authorizer
    'authorizer' => [
        'type' => env('SCOPE_GUARD_AUTHORIZER', 'spatie'), // 'spatie', 'custom', or 'none'
        'guard' => 'web',
        'custom_callback' => null,
    ],

    // Default scope
    'default_scope' => 'default',

    // Default dimensions for all models
    'default_dimensions' => [],

    // Caching
    'cache' => [
        'enabled' => true,
        'ttl' => 300, // 5 minutes
        'prefix' => 'scope_guard',
    ],

    // Wildcard support
    'wildcard_support' => true,

    // User model
    'user_model' => \App\Models\User::class,

    // Role model (optional, for Spatie)
    'role_model' => null,

    // Additional entities (teams, organizations, etc.)
    'additional_entities' => [
        // 'teams' => \App\Models\Team::class,
    ],

    // Custom model overrides
    'models' => [
        'permission' => \RSE\ScopeGuard\Models\ScopedPermission::class,
    ],
];
```

---

## Quick Start

### 1. Configure Dimensions and Scopes

In `AppServiceProvider::boot()`:

```php
use RSE\ScopeGuard\Config\ScopeGuardConfigurator;

app(ScopeGuardConfigurator::class)
    ->defineDimension('folder_id')
    ->type('ulid')
    ->inheritable();

app(ScopeGuardConfigurator::class)
    ->defineScope('documents')
    ->forModel(Document::class)
    ->mapDimensions([
        'folder_id' => 'folder_id',
        'project_id' => 'project_id',
    ]);
```

### 2. Add Trait to User Model

```php
<?php

namespace App\Models;

use RSE\ScopeGuard\Models\Traits\HasScopedPermissions;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasScopedPermissions;
    // ... rest of the model
}
```

### 3. Add Query Scope to Resource Models

For models like `Document` that you want to filter by permissions:

```php
<?php

namespace App\Models;

use RSE\ScopeGuard\Models\Traits\HasScopedAccess;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasScopedAccess;

    // The scopeAccessibleBy scope is now available
    // Document::accessibleBy($user, 'view')->get();
}
```

### 4. Check Permissions

```php
// Check specific permission
$user->hasScopedPermission(
    action: 'view',
    dimensions: ['folder_id' => $folderId],
    scope: 'documents'
);

// Check if user has any access for this action
$user->hasAnyScopedPermission('view', 'documents');

// Get accessible dimension values
$folders = $user->getAccessibleDimensionValues('view', 'folder_id', 'documents');
// Returns: ['folder-1', 'folder-2', ...]
```

---

## Usage Modes

### Mode 1: Spatie Integration (Optional)

> **Note:** Spatie Laravel Permission is an optional dependency. Install it separately:
> ```bash
> composer require spatie/laravel-permission
> ```

Global permissions supersede scoped permissions. If a user has `documents.view`, they can view all documents regardless of scoped permissions.

```php
// config/scope-guard.php
return [
    'authorizer' => [
        'type' => env('SCOPE_GUARD_AUTHORIZER', 'spatie'),
        'guard' => 'web',
    ],
];
```

Set the role model in config:
```php
'role_model' => env('SCOPE_GUARD_ROLE_MODEL', \Spatie\Permission\Models\Role::class),
```

### Mode 2: Custom Gate Authorizer

For custom permission systems outside of Spatie.

```php
// config/scope-guard.php
return [
    'authorizer' => [
        'type' => 'custom',
        'custom_callback' => function (string $action, ?string $scope) {
            return auth()->user()->can("{$scope}.{$action}");
        },
    ],
];
```

### Mode 3: Standalone (Default)

For applications that only use scoped permissions.

```php
// config/scope-guard.php
return [
    'authorizer' => [
        'type' => 'none',
    ],
];
```

---

## Permission Checking

### Basic Permission Check

```php
$canView = $user->hasScopedPermission(
    action: 'view',
    dimensions: ['folder_id' => $folderId],
    scope: 'documents'
);
```

### Check Any Scope Permission

```php
$hasAnyView = $user->hasAnyScopedPermission(
    action: 'view',
    scope: 'documents'
);
```

### Get Accessible Dimension Values

```php
$folders = $user->getAccessibleDimensionValues(
    action: 'view',
    dimension: 'folder_id',
    scope: 'documents'
);
// Returns: ['folder_1', 'folder_2', ...]
```

---

## Creating Scoped Permissions

### Using PermissionBuilder

```php
use RSE\ScopeGuard\Support\PermissionBuilder;

// Create a simple allow permission
PermissionBuilder::make()
    ->for($user)
    ->scope('documents')
    ->action('view')
    ->allow()
    ->dimensions(['folder_id' => $folderId])
    ->create();

// Create a deny permission with priority
PermissionBuilder::make()
    ->for($user)
    ->scope('documents')
    ->action('edit')
    ->deny()
    ->withDimension('folder_id', $sensitiveFolderId)
    ->withDimension('project_id', $projectId)
    ->priority(100)
    ->create();
```

### Direct Model Creation

```php
RSE\ScopeGuard\Models\ScopedPermission::create([
    'scope' => 'documents',
    'action' => 'view',
    'entity_type' => 'App\Models\User',
    'entity_id' => $user->id,
    'type' => 'allow',
    'dimensions' => [
        'folder_id' => '01ABC123DEF456',
        'project_id' => null,
    ],
    'priority' => 0,
]);
```

---

## Hierarchical Inheritance

Configure dimensions to support parent→child permission propagation:

```php
app(ScopeGuardConfigurator::class)
    ->defineDimension('folder_id')
    ->type('ulid')
    ->inheritable()
    ->resolveParentUsing(fn ($id) => \App\Models\Folder::find($id)?->parent_id);
```

### How It Works

```
Parent Folder (ID: parent-123)
    ├── Child Folder A (ID: child-a-456)
    │       └── Grandchild A1 (ID: grand-a-789)
    └── Child Folder B (ID: child-b-321)

User has permission: documents.view + folder_id = "parent-123"
    ↓
User can ALSO view documents in:
    ✓ Child Folder A
    ✓ Grandchild A1
    ✓ Child Folder B
```

---

## Allow/Deny System

Explicit DENY permissions override ALLOW permissions with higher priority.

```php
// Admin has global "documents.view" permission
// But we want to deny access to "HR Confidential" folder

RSE\ScopeGuard\Models\ScopedPermission::create([
    'scope' => 'documents',
    'action' => 'view',
    'entity_type' => 'App\Models\User',
    'entity_id' => $admin->id,
    'type' => 'deny',
    'dimensions' => [
        'folder_id' => 'hr-confidential-folder-id',
    ],
    'priority' => 100, // Higher priority wins
]);
```

### Permission Resolution Order

```
1. SCOPED DENY (Explicit deny always wins)
2. GLOBAL ALLOW (Spatie/Authorizer)
3. SCOPED ALLOW
4. NO ACCESS (Default deny)
```

---

## Eloquent Query Scopes

```php
// Get all documents user can view
$documents = Document::accessibleBy(auth()->user(), 'view')
    ->where('status', 'active')
    ->paginate();

// With custom scope
$contracts = Contract::accessibleBy(auth()->user(), 'view', 'contracts')
    ->get();
```

---

## Blade Directives

```blade
@scopedCan('edit', ['folder_id' => $document->folder_id], 'documents')
    <button>Edit</button>
@elseScopedCan
    <span>No permission</span>
@endScopedCan
```

---

## Caching

Permissions are cached by default. Cache keys are tracked in a registry for efficient clearing.

```php
// Manual cache clearing
app('scope-guard')->clearUserCache($user);
app('scope-guard')->clearRoleCache($roleId);
```

---

## Console Commands

```bash
# Warm permission cache
php artisan scope-guard:cache-warm --all
php artisan scope-guard:cache-warm {userId}

# Migrate legacy permissions
php artisan scope-guard:migrate-legacy --dry-run
php artisan scope-guard:migrate-legacy
```

---

## Events

- `PermissionCreated`
- `PermissionUpdated`
- `PermissionDeleted`

All events include a public readonly `$permission` property.

---

## API Reference

### HasScopedPermissions Trait

| Method | Returns | Description |
|--------|---------|-------------|
| `hasScopedPermission($action, $dimensions, $scope)` | `bool` | Check specific permission |
| `hasAnyScopedPermission($action, $scope)` | `bool` | Check if any permission exists |
| `getAccessibleDimensionValues($action, $dimension, $scope)` | `array` | Get allowed values |
| `getScopedPermissions()` | `array` | Get all permissions (raw) |
| `getCachedScopedPermissions()` | `array` | Get all permissions (cached) |

### ScopeGuardService

| Method | Returns | Description |
|--------|---------|-------------|
| `checkPermission($user, $action, $dimensions, $scope)` | `bool` | Check permission |
| `checkAnyPermission($user, $action, $scope)` | `bool` | Check any matching permission |
| `getAccessibleDimensionValues($user, $action, $dimension, $scope)` | `array` | Get allowed values |
| `applyAccessibleScope($query, $user, $action, $scope)` | `QueryBuilder` | Add scope to query |
| `createPermission($data)` | `ScopedPermission` | Create new permission |
| `clearUserCache($user)` | `void` | Clear user cache |
| `clearRoleCache($roleId)` | `void` | Clear role cache |
| `permissionModel()` | `Builder` | Get permission query builder |

### PermissionBuilder

| Method | Returns | Description |
|--------|---------|-------------|
| `make()` | `PermissionBuilder` | Create new builder |
| `for($entity)` | `self` | Set entity |
| `forRole($role)` | `self` | Set role entity |
| `forEntity($type, $id)` | `self` | Set entity by type/ID |
| `scope($scope)` | `self` | Set permission scope |
| `action($action)` | `self` | Set action |
| `allow()` | `self` | Set as allow |
| `deny()` | `self` | Set as deny |
| `dimensions($array)` | `self` | Set all dimensions |
| `withDimension($name, $value)` | `self` | Set single dimension |
| `priority($int)` | `self` | Set priority |
| `wildcard($bool)` | `self` | Set as wildcard |
| `create()` | `ScopedPermission` | Create and save |
| `update($permission)` | `bool` | Update existing |

---

## Database Schema

### Table: `scope_guard_permissions`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `scope` | VARCHAR(100) | Permission scope |
| `action` | VARCHAR(100) | Action |
| `entity_type` | VARCHAR(255) | Entity type (polymorphic) |
| `entity_id` | UUID | Entity ID |
| `type` | ENUM('allow', 'deny') | Permission type |
| `priority` | INTEGER | Priority for conflicts |
| `dimensions` | JSON | Multi-dimensional data |
| `is_wildcard` | BOOLEAN | Wildcard indicator |
| `created_by` | UUID | Creator user ID |
| `updated_by` | UUID | Updater user ID |
| `deleted_by` | UUID | Deleter user ID |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Update timestamp |
| `deleted_at` | TIMESTAMP | Soft delete timestamp |

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Support

For issues and feature requests, please open an issue on the [GitHub repository](https://github.com/rse-sa/scope-guard).
