# VersionVault (sthira-labs/version-vault)

VersionVault is a Laravel package for model versioning that is diff-first, snapshot-assisted, and relation-aware. It captures minimal diffs, supports nested relations (including pivot data), and can reconstruct or rollback historical state.

## Features
- Diff-first storage with periodic snapshots
- Nested relations (single, collection, pivot)
- Deterministic changed paths for audits and UI diffs
- Rollback support with persisted changes
- Optional created-by tracking and user relation
- Morph map friendly (stores morph alias when configured)

## Requirements
- PHP 8.1+
- Laravel 9+ (tested against Laravel 11 and 12 via orchestra/testbench)

## Installation
```bash
composer require sthira-labs/version-vault
```

## Publish & Migrate
Publish the config and migrations, then run migrations:
```bash
php artisan vendor:publish --provider="SthiraLabs\\VersionVault\\VersionVaultServiceProvider"
php artisan migrate
```

To publish only the config:
```bash
php artisan vendor:publish --provider="SthiraLabs\\VersionVault\\VersionVaultServiceProvider" --tag=config
```

To publish only the migrations:
```bash
php artisan vendor:publish --provider="SthiraLabs\\VersionVault\\VersionVaultServiceProvider" --tag=migrations
```

## Quick Start
```php
use SthiraLabs\VersionVault\Traits\HasVersioning;

class Project extends Model
{
    use HasVersioning;

    public function tasks() { return $this->hasMany(Task::class); }

    public function versioningConfig(): array
    {
        return [
            'name',
            'tasks:title' => [
                'users:name,pivot(role)'
            ],
        ];
    }
}

$project->recordVersion('created');
$project->recordVersionIfChanged('updated');

$result = $project->reconstructVersion(2);
$historic = $result->model;
$rollback = $project->rollbackToVersion(2);
```

### Reconstruction Basics
Reconstruction is non-destructive by default: existing loaded relations on the template model are preserved, and only attributes present in the snapshot are applied. Relations not present in the snapshot remain untouched unless you enable `attach_unloaded_relations` or `force_replace_relation`.

`reconstructVersion()` always returns a `ReconstructionResult` DTO with:
- `model` (Model): the reconstructed model instance
- `changedPaths` (array): populated only when diff paths are enabled
- `diff` (array): populated only when diff paths are enabled

When `with_diff_paths` is enabled, many-relation operations include id-scoped paths:
- `comments.added`, `comments.103.added`
- `comments.removed`, `comments.102.removed`
- `tags.attached`, `tags.7.attached`
- `tags.detached`, `tags.6.detached`

### Relation Tracking Modes
Each relation can be tracked in one of two modes:
- `reference` (default): only foreign keys are tracked; relation attributes are not snapshotted.
- `snapshot`: selected relation attributes (and nested relations/pivot data) are snapshotted.

Implicit rule (Option B):
- If a relation config includes `attributes`, `relations`, or `pivot`, it is treated as `snapshot`.
- Otherwise it defaults to `reference`.

To force snapshot explicitly, add `mode: snapshot` to the relation config.

#### Example: Reference Mode (FK-only)
```php
public function versioningConfig(): array
{
    return [
        'amount',
        // Reference mode: only FK tracked (no related attributes)
        'owner' => true,
        'manager' => true,
    ];
}
```

#### Example: Snapshot Mode (full relation)
```php
public function versioningConfig(): array
{
    return [
        'name',
        // Snapshot mode (implicit because fields are listed)
        'category:name',
        'profile:bio',
        'tasks:title',
        'tags:name,pivot(order)',
        // Or explicitly:
        'owner' => [
            'mode' => 'snapshot',
            'attributes' => ['name', 'email'],
        ],
    ];
}
```

### Reference Relations in Reconstruction
Reference relations are not hydrated from the snapshot. The foreign key is stored as a normal attribute, so you can eager load after reconstruction:
```php
$result = $project->reconstructVersion(2);
$result->model->load('owner', 'manager');
```

If you want FK-only tracking without listing the relation, you can track the FK attribute directly:
```php
public function versioningConfig(): array
{
    return [
        'name',
        'owner_id',
    ];
}
```

### Snapshot Relations in Reconstruction
Snapshot relations are hydrated from stored data (or explicitly allowed via `reconstruct_relations`):
```php
$result = $project->reconstructVersion(2, [
    'reconstruct_relations' => ['category', 'tasks', 'tags'],
    'attach_unloaded_relations' => true,
]);
```

## Configuration
Config file: `config/version-vault.php`

- `snapshot_interval` (int): store a full snapshot every N versions (default 10)
- `store_empty` (bool): allow storing a version even when no changes are detected (default false)
- `debug` (bool): enable structured debug logs (default false)
- `debug_channel` (string|null): log channel to use for debug logs (default null)
- `migrations` (bool): auto-load package migrations (default true)
- `table_name` (string): versions table name
- `model` (class-string): Version model class
- `user_model` (class-string|null): model used for `Version::user()` relation (defaults to `auth.providers.users.model`)
- `reconstruct` (array): default reconstruction options
- `reconstruct.hydrate_loaded_relations_only` (bool): only hydrate relations already loaded on the template model (default true)
- `reconstruct.preserve_missing_attributes` (bool): keep template attributes not present in the snapshot (default true)
- `reconstruct.attach_unloaded_relations` (bool): build relations even when not loaded (default false)
- `reconstruct.force_replace_relation` (bool): replace relation objects rather than update in-place (default false)
- `reconstruct.with_diff_paths` (bool): include diff + changed paths in reconstruction result (default false)
- `reconstruct.reconstruct_relations` (array|null): if set, only hydrate the listed relations
- `reconstruct.prune_missing_many_relations` (bool): for loaded `hasMany`/`morphMany`/`belongsToMany`, remove items not present in target version (default true). When false, missing items are kept; if explicit removed/detached ids exist, unrelated stale items are still dropped.
- `bindings` (array): override internal services (change detector, snapshot builder, resolver, manager, etc.)

### Migration Note
Default relation tracking is now `reference` mode to avoid creating versions when related model attributes change but the foreign key does not.
If you rely on deep relation snapshots, configure the relation with fields (implicit snapshot) or set `mode: snapshot`.

## Version Records (created_by)
If an authenticated user exists, `created_by` is recorded on each version. You can also pass an explicit user id as the third argument to `recordVersion`, `recordVersionIfChanged`, or `forceSnapshot` — useful from queue jobs or system actors where `Auth::id()` is not available.

```php
$project->recordVersion('updated', [], $actorId);
```

The `Version` model exposes a `createdBy()` relation that resolves via `version-vault.user_model` or falls back to `auth.providers.users.model`.

## Snapshot & Diff Format
See `docs/NEW_NODE_FORMAT.md` for the exact snapshot/diff schema and examples.

## Events
VersionVault dispatches lifecycle events you can listen to:
- `SthiraLabs\VersionVault\Events\VersionRecording`
- `SthiraLabs\VersionVault\Events\VersionRecorded`
- `SthiraLabs\VersionVault\Events\VersionReconstructed`
- `SthiraLabs\VersionVault\Events\VersionRollback`

Details and payloads are documented in `docs/EVENTS.md`.

## Testing
```bash
composer test
```

## Useful Commands
- Install package: `composer require sthira-labs/version-vault`
- Publish config: `php artisan vendor:publish --provider="SthiraLabs\\VersionVault\\VersionVaultServiceProvider" --tag=config`
- Publish migrations: `php artisan vendor:publish --provider="SthiraLabs\\VersionVault\\VersionVaultServiceProvider" --tag=migrations`
- Run migrations: `php artisan migrate`
- Run tests: `composer test`

## Development
Local dev option: use the provided docker-compose / Makefile or Laravel Sail.

## License
MIT
