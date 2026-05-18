# laravel-model-auditor

A smart audit trail package for Laravel Eloquent models — track who changed what, when, and why. With a fluent query API, one-line rollback, and a drop-in Blade UI component.

## Installation

```bash
composer require ashupithava/laravel-model-auditor
```

Publish and run the migration:

```bash
php artisan vendor:publish --tag=auditor-migrations
php artisan migrate
```

Optionally publish the config:

```bash
php artisan vendor:publish --tag=auditor-config
```

---

## Basic Usage

### 1. Add the trait to any model

```php
use ashupithava\ModelAuditor\Concerns\Auditable;

class User extends Model
{
    use Auditable;
}
```

That's it. Creates, updates, and deletes are now automatically recorded.

---

### 2. Query the audit history

```php
// All audits for a model instance
$user->audits()->get();

// Filter by field
$user->audits()->field('email')->get();

// Filter by event
$user->audits()->event('updated')->get();

// Filter by user
$user->audits()->byUser(1)->get();

// Filter by date range
$user->audits()->since('2024-01-01')->before('2024-06-01')->get();

// Chained
$user->audits()->field('name')->byUser(auth()->id())->since('-30 days')->get();

// Paginate
$user->audits()->paginate(15);
```

---

### 3. Rollback to a previous state

```php
// By audit ID
$user->rollbackTo($auditId);
```

---

### 4. Attach a reason to a change

```php
use ashupithava\ModelAuditor\Facades\Auditor;

Auditor::withReason('Admin correction made via support ticket #123');
$user->update(['email' => 'new@example.com']);
```

---

### 5. Disable auditing for a block

```php
Auditor::withoutAuditing(function () use ($user) {
    $user->update(['last_login_at' => now()]); // not recorded
});
```

---

### 6. Drop-in Blade UI component

```blade
<x-auditor::history :model="$user" />

{{-- With options --}}
<x-auditor::history :model="$user" :per-page="20" :show-ip="true" />
```

---

## Customising per model

```php
class Order extends Model
{
    use Auditable;

    // Only audit these fields
    public array $auditIncludeFields = ['status', 'total', 'notes'];

    // Or exclude specific fields (merged with global config)
    public array $auditExcludeFields = ['internal_notes'];
}
```

---

## Listening to audit events

```php
use ashupithava\ModelAuditor\Events\ModelAudited;

Event::listen(ModelAudited::class, function (ModelAudited $event) {
    // $event->audit  — the Audit model
    // $event->model  — the Eloquent model that changed
    Log::info('Change recorded', ['event' => $event->audit->event]);
});
```

---

## Testing

```bash
composer test
```

---

## License

MIT
