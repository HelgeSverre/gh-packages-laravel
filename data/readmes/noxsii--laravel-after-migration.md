# noxsii/laravel-after-migration

Run **one-time** post-migration hooks **after** a migration has been executed — without putting data updates, job dispatching, or “one-off scripts” inside your migrations.

> **Goal:** Keep migrations *schema-only* and move any non-schema work into dedicated, testable classes.

---

## Why this package exists

Laravel migrations are great for **schema changes**.  
But in real projects you often see migrations doing things like:

- Updating existing rows (backfills)
- Dispatching jobs
- Calling external services
- Rebuilding caches / search indexes
- Moving data between columns

That’s a problem:

- **Migrations should be deterministic** and safe to run in any environment.
- **Data mutations inside migrations** are hard to test, hard to retry, and often slow.
- “One-time” logic becomes scattered across migration files and is easy to re-run by accident.

This package gives you a clean alternative:

✅ Write schema migrations normally  
✅ Define a post-migration hook class  
✅ Laravel runs the hook **exactly once** after the migration is executed  
✅ Hook runs **after** the migration was recorded as executed  
✅ Hook is a normal class: testable, DI-friendly, and readable

---

## How it works

- The package listens to Laravel’s `MigrationEnded` event.
- If the migration implements `AfterMigrationHook`, the package will:
    1. Resolve the **migration file name** via reflection (e.g. `2026_01_01_000001_create_widgets_table`)
    2. Run your hook
    3. Persist the run in `after_migration_runs`
- A unique constraint ensures the hook is executed **once per migration file + hook class**.

---

## Installation

```bash
composer require noxsii/laravel-after-migration
```

Publish the package migration:

```bash
php artisan vendor:publish --tag=after-migration-migrations
php artisan migrate
```

(Optional) publish config:

```bash
php artisan vendor:publish --tag=after-migration-config
```

---

## Usage

### 1) Create a hook class

A hook is a simple class implementing `AfterMigrationJob`.

```php
<?php

declare(strict_types=1);

namespace App\AfterMigrations;

use Noxsi\AfterMigration\Contracts\AfterMigrationJob;

final class BackfillWidgets implements AfterMigrationJob
{
    public function handle(): void
    {
        // ✅ Put your one-time backfill / indexing / job dispatching here.
        // Example:
        // Widget::query()->whereNull('slug')->each(...);
    }
}
```

### 2) Reference the hook from the migration

Your migration stays schema-only, but it implements `AfterMigrationHook`
and returns the hook class.

```php
<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Noxsi\AfterMigration\Contracts\AfterMigrationHook;

return new class extends Migration implements AfterMigrationHook {
    public function up(): void
    {
        Schema::create('widgets', static function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('widgets');
    }

    public function afterMigrationHook(): string
    {
        return \App\AfterMigrations\BackfillWidgets::class;
    }
};
```

That’s it.

Now:

```bash
php artisan migrate
```

Laravel runs the migration, records it in the migrations table, and then this package runs your hook **once**.

---

## The "runs once" guarantee

The package stores executed hooks in:

- `after_migration_runs` (`migration`, `hook`, `ran_at`)

A unique index on (`migration`, `hook`) prevents the same hook from running twice.

**What is `migration`?**  
It is the **migration file name** (without `.php`), resolved automatically from the actual file where the migration class lives.

Examples:
- `2026_01_01_000001_create_widgets_table`
- `2026_01_12_090000_backfill_widget_slugs`

---

## Configuration

`config/after-migration.php`:

```php
return [
    // If true, hook exceptions fail the migrate command.
    // If false, exceptions are logged and migrate continues.
    'fail_on_error' => true,
];
```

---

## Recommended use cases

Use hooks for:

- Backfilling new columns (slugs, timestamps, UUIDs, denormalized data)
- Migrating data between tables/columns
- Dispatching one-time jobs after a schema change
- Rebuilding caches/search indexes after adding new indexes/columns
- Repairing inconsistent data after a schema migration

**Do not** use hooks for:
- Schema changes (keep those in migrations)
- Logic that should run repeatedly or on every deploy (use jobs/commands)

---

## Notes / Behavior

### What about `migrate:fresh`, rollbacks, re-runs?
- Hooks run when a migration is executed and `MigrationEnded` fires.
- The “once” constraint is enforced by your database table `after_migration_runs`.
- If you drop your database or truncate `after_migration_runs`, hooks can run again — which is expected.

### Idempotency
Even though the package prevents double execution, it’s still a good practice to make hooks **safe** and **idempotent** where possible.

---

## Testing

This package uses Pest.

```bash
composer test
```

Coverage (requires Xdebug/PCOV/phpdbg):

```bash
XDEBUG_MODE=coverage composer test:coverage
# or
phpdbg -qrr vendor/bin/pest --coverage
```

---

## Development scripts

```bash
composer lint:test
composer stan
composer test
```

---

## FAQ

### “Isn’t it okay to update data inside migrations?”
It *works*, but it’s a long-term maintenance trap:

- Harder to test and reason about
- Risky on large datasets (timeouts/locks)
- Easy to accidentally run again
- Not clearly separated from schema concerns

This package gives you a consistent, explicit workflow.

### “Can I dependency-inject services into hooks?”
Yes. Hooks are resolved via Laravel’s container:

```php
$hook = app($hookClass);
```

So constructor injection works normally.

---

## License
MIT
