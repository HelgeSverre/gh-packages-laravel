# Laravel Model ACL

A powerful, flexible, and database-driven access control package for Laravel that works with **any model**. Create dynamic, rule-based permissions with support for priorities, deny rules, user attributes, and seamless integration with Laravel Gates, Policies, and Spatie Permission package.

## Features

- **Database-Driven Rules** - Configure access rules in your database
- **Flexible Resolution Logic** - Choose between ANY, ALL, or PRIORITY rule matching
- **Priority/Weight System** - Control rule execution order
- **Deny Rules** - Explicitly deny access even when other rules would grant it
- **User Attribute Matching** - Rules can depend on user properties (e.g., department, role)
- **Smart Query Filtering** - Automatically filter collections based on access rules
- **Laravel Integration** - Works with Gates and Policies
- **Spatie Permission Integration** - Works with roles and permissions
- **Fluent API** - Easy rule creation

## Installation

### 1. Require the package

Since this is a local package, it's already added to your `composer.json`:

```bash
composer update othmanhaba/laravel-model-acl
```

### 2. Publish configuration and migrations

```bash
php artisan vendor:publish --tag=access-control-config
php artisan vendor:publish --tag=access-control-migrations
```

### 3. Run migrations

```bash
php artisan migrate
```

## Quick Start

### 1. Add Traits to Your Models

**For models that need access control (e.g., Ticket, Post):**

```php
use othmanhaba\LaravelModelAcl\Traits\HasAccessRules;

class Ticket extends Model
{
    use HasAccessRules;

    // Your model code...
}
```

**For users/roles that access models:**

```php
use othmanhaba\LaravelModelAcl\Traits\CanBeRestricted;

class Employee extends Authenticatable
{
    use CanBeRestricted;

    // Your model code...
}
```

### 2. Create Access Rules

#### Option A: Using Built-in Rules

```php
use othmanhaba\LaravelModelAcl\Models\AccessRule;
use othmanhaba\LaravelModelAcl\Rules\StatusRule;

$rule = AccessRule::create([
    'name' => 'View Pending Tickets',
    'key' => 'view_ticket',
    'rule_class' => StatusRule::class,
    'ruleable_type' => \App\Models\Ticket::class,
    'settings' => [
        'statuses' => ['pending', 'in_progress'],
    ],
    'priority' => 10,
    'is_deny_rule' => false,
    'active' => true,
]);

// Assign to user
$employee->assignAccessRule($rule);
```

#### Option B: Create Custom Rule

```bash
php artisan make:access-rule TicketDepartmentRule --model=Ticket
```

This creates `app/Rules/Access/TicketDepartmentRule.php`:

```php
<?php

namespace App\Rules\Access;

use othmanhaba\LaravelModelAcl\Rules\BaseAccessRule;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Contracts\Auth\Authenticatable;

class TicketDepartmentRule extends BaseAccessRule
{
    public function __construct(
        ?Authenticatable $_user = null,
        ?int $_priority = null,
        ?bool $_is_deny_rule = null
    ) {
        parent::__construct($_user, $_priority, $_is_deny_rule);
    }

    public function passes(Authenticatable $user, Model $model): bool
    {
        // Only allow access to tickets in user's department
        return $user->department_id === $model->department_id;
    }

    public function scope($query, Authenticatable $user)
    {
        return $query->where('department_id', $user->department_id);
    }
}
```

Then register it:

```php
$rule = AccessRule::create([
    'name' => 'Department Access',
    'key' => 'view_ticket',
    'rule_class' => \App\Rules\Access\TicketDepartmentRule::class,
    'ruleable_type' => \App\Models\Ticket::class,
    'priority' => 5,
    'active' => true,
]);
```

### 3. Check Access

#### Option A: Using the Service

```php
use othmanhaba\LaravelModelAcl\Services\AccessControlService;

$service = app(AccessControlService::class);

// Check single model
if ($service->can($user, 'view', $ticket)) {
    // User can view this ticket
}

// Filter query
$tickets = $service->filterQuery($user, 'view', Ticket::query())->get();
```

#### Option B: Using Traits

```php
// Check access
if ($user->canAccess('view', $ticket)) {
    // Access granted
}

// Filter query using scope
$tickets = Ticket::accessibleBy($user, 'view')->get();
```

#### Option C: Using Laravel Gates (automatic)

```php
if (auth()->user()->can('view', $ticket)) {
    // Works automatically!
}

// In Blade
@can('view', $ticket)
    // Show content
@endcan
```

## Built-in Rules

### StatusRule

Restrict access based on model status:

```php
AccessRule::create([
    'rule_class' => \othmanhaba\LaravelModelAcl\Rules\StatusRule::class,
    'settings' => [
        'statuses' => ['pending', 'approved'],
        'status_column' => 'status', // optional, defaults to 'status'
    ],
]);
```

### DateRangeRule

Restrict access based on date range:

```php
AccessRule::create([
    'rule_class' => \othmanhaba\LaravelModelAcl\Rules\DateRangeRule::class,
    'settings' => [
        'from' => '2024-01-01',
        'to' => '2024-12-31',
        'date_column' => 'created_at', // optional
    ],
]);
```

### OwnershipRule

Restrict to owned records only:

```php
AccessRule::create([
    'rule_class' => \othmanhaba\LaravelModelAcl\Rules\OwnershipRule::class,
    'settings' => [
        'owner_column' => 'user_id', // Model column
        'user_id_column' => 'id',    // User column
    ],
]);
```

### AttributeRule

Match model attributes with user attributes or static values:

```php
// Match user's department
AccessRule::create([
    'rule_class' => \othmanhaba\LaravelModelAcl\Rules\AttributeRule::class,
    'settings' => [
        'model_attribute' => 'department_id',
        'user_attribute' => 'department_id',
        'operator' => '=',
    ],
]);

// Static value
AccessRule::create([
    'rule_class' => \othmanhaba\LaravelModelAcl\Rules\AttributeRule::class,
    'settings' => [
        'model_attribute' => 'priority',
        'static_value' => 'high',
        'operator' => '=',
    ],
]);

// Supported operators: =, !=, >, >=, <, <=, in, not_in
```

## Configuration

### Resolution Logic

Choose how multiple rules are evaluated:

```php
// config/access-control.php

'default_resolution' => 'any', // 'any', 'all', or 'priority'

'models' => [
    \App\Models\Ticket::class => [
        'resolution_logic' => 'any',
    ],
],
```

- **any** - Grant access if ANY rule passes (OR logic)
- **all** - Grant access only if ALL rules pass (AND logic)
- **priority** - First matching rule wins (based on priority)

### Scope Grouping

Control how query scopes are combined:

```php
'default_scope_grouping' => 'and', // 'and' or 'or'

'models' => [
    \App\Models\Ticket::class => [
        'scope_grouping' => 'and', // Restrictive
    ],
],
```

- **and** - All rule conditions must be met (restrictive)
- **or** - Any rule condition grants access (additive)

### Fallback Behavior

When no rules are assigned:

```php
'fallback' => [
    \App\Models\Ticket::class => [
        'column' => 'assignee_id', // Filter by this column
    ],
],
```

## Advanced Usage

### Priority System

Higher priority rules are evaluated first:

```php
// High priority deny rule
AccessRule::create([
    'priority' => 100,
    'is_deny_rule' => true,
    'rule_class' => BlockedUsersRule::class,
]);

// Lower priority allow rule
AccessRule::create([
    'priority' => 10,
    'is_deny_rule' => false,
    'rule_class' => DepartmentRule::class,
]);
```

### Deny Rules

Explicitly deny access:

```php
AccessRule::create([
    'name' => 'Block Archived Tickets',
    'is_deny_rule' => true, // This is a deny rule
    'rule_class' => StatusRule::class,
    'settings' => [
        'statuses' => ['archived'],
    ],
    'priority' => 100, // High priority
]);
```

### Assigning to Roles (Spatie Permission)

```php
$role = Role::findByName('manager');
$role->assignAccessRule($rule);

// Users with this role automatically get the rule
```

### Per-Model Configuration

```php
// config/access-control.php

'models' => [
    \App\Models\Ticket::class => [
        'resolution_logic' => 'any',
        'scope_grouping' => 'and',
        'action_prefix' => 'ticket',
        'integrate_with_policies' => true,
    ],
    \App\Models\Post::class => [
        'resolution_logic' => 'priority',
        'scope_grouping' => 'or',
        'action_prefix' => 'post',
        'integrate_with_policies' => false,
    ],
],
```

### Implementing Authorizable Interface

For complete control, implement the `Authorizable` interface:

```php
use othmanhaba\LaravelModelAcl\Contracts\Authorizable;

class Ticket extends Model implements Authorizable
{
    use HasAccessRules;

    public function getAccessResolutionLogic(): string
    {
        return 'any';
    }

    public function getScopeGroupingStrategy(): string
    {
        return 'and';
    }

    public function getActionPrefix(): string
    {
        return 'ticket';
    }

    public function shouldIntegrateWithPolicies(): bool
    {
        return true;
    }
}
```

## API Reference

### AccessControlService

```php
$service = app(\othmanhaba\LaravelModelAcl\Services\AccessControlService::class);

// Check if user can perform action on model
$service->can($user, 'view', $ticket): bool

// Filter query by user's access
$service->filterQuery($user, 'view', $query): Builder
```

### CanBeRestricted Trait Methods

```php
// Assign rule to user
$user->assignAccessRule($rule);

// Remove rule from user
$user->removeAccessRule($rule);

// Sync rules
$user->syncAccessRules([1, 2, 3]);

// Check if user has rule
$user->hasAccessRule($rule): bool

// Check access
$user->canAccess('view', $ticket): bool

// Get assigned rules
$user->assignedAccessRules;
```

### HasAccessRules Trait Methods

```php
// Get model's access rules
$model->accessRules;

// Scope for filtering
Model::accessibleBy($user, 'view')->get();
```

## Migration Guide (From Your Current System)

### 1. Update Models

```php
// Old
class Ticket extends Model
{
    // ...
}

// New
use othmanhaba\LaravelModelAcl\Traits\HasAccessRules;

class Ticket extends Model
{
    use HasAccessRules;
}
```

### 2. Migrate Rules

```php
// Old TicketAccessRule
$oldRule = \App\Models\TicketAccessRule::find(1);

// New AccessRule
$newRule = AccessRule::create([
    'name' => $oldRule->name,
    'key' => $oldRule->key,
    'rule_class' => $oldRule->rule_class,
    'ruleable_type' => \App\Models\Ticket::class,
    'settings' => $oldRule->settings,
    'active' => $oldRule->active,
]);

// Assign to employees
foreach ($oldRule->employees as $employee) {
    $employee->assignAccessRule($newRule);
}
```

### 3. Update Service Usage

```php
// Old
use App\Services\TicketAccessService;
TicketAccessService::can($user, 'view', $ticket);

// New
use othmanhaba\LaravelModelAcl\Services\AccessControlService;
app(AccessControlService::class)->can($user, 'view', $ticket);

// Or use trait
$user->canAccess('view', $ticket);
```

## Testing

```bash
composer test
```

## License

MIT License

## Support

For issues, questions, or contributions, please open an issue on GitHub.
