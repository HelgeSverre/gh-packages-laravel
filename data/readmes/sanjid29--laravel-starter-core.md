# laravel-starter-core

Core infrastructure package for the Laravel Starter Kit. Provides base controllers, traits, middleware, and the CRUD scaffolding engine used by all application modules.

## What This Package Provides

| Component | Location | Purpose |
|-----------|----------|---------|
| `BaseController` | `src/Http/Controllers/BaseController.php` | Abstract CRUD engine |
| `BaseDataTableController` | `src/Http/Controllers/BaseDataTableController.php` | Yajra DataTables base |
| `BaseReportController` | `src/Http/Controllers/BaseReportController.php` | HTML/PDF/Excel/CSV/Print export engine |
| `BaseService` | `src/Services/BaseService.php` | Optional service layer with lifecycle hooks |
| `BaseFormRequest` | `src/Http/Requests/BaseFormRequest.php` | Form request with `recordId()` / `isUpdating()` |
| `BaseObserver` | `src/Observers/BaseObserver.php` | Auto-sets audit fields on all model events |
| `BasePolicy` | `src/Policies/BasePolicy.php` | Policy base class |
| `HasActivityLog` | `src/Traits/HasActivityLog.php` | Spatie activity log integration |
| `HasAuditFields` | `src/Traits/HasAuditFields.php` | `created_by`, `updated_by`, `deleted_by` columns |
| `HasUuid` | `src/Traits/HasUuid.php` | Auto-generates UUID on model creation |
| `HasTags` | `src/Traits/HasTags.php` | Polymorphic many-to-many tags via `associables` table |
| `HasAssociations` | `src/Traits/HasAssociations.php` | Polymorphic many-to-many engine used by `HasTags` and custom association traits |
| `FeatureEnabled` | `src/Http/Middleware/FeatureEnabled.php` | Gate routes on `features.{name}` settings |
| `HandleImpersonation` | `src/Http/Middleware/HandleImpersonation.php` | User impersonation (auto-pushed to `web` group) |
| `HasPermission` | `src/Http/Middleware/HasPermission.php` | `permission:` middleware alias |
| `HasRole` | `src/Http/Middleware/HasRole.php` | `role:` middleware alias |
| `MakeCrudModule` | `src/Console/Commands/MakeCrudModule.php` | `make:crud-module` Artisan command |
| `RemoveCrudModule` | `src/Console/Commands/RemoveCrudModule.php` | `remove:crud-module` Artisan command |
| `MakeService` | `src/Console/Commands/MakeService.php` | `make:service` Artisan command |

## Installation

```bash
composer require sanjid29/laravel-starter-core
```

The `StarterKitServiceProvider` is auto-discovered — no manual registration needed.

### Publish config

```bash
php artisan vendor:publish --tag=starter-core-config
```

This creates `config/starter-core.php` where you can set the superuser role name, tag model, and standalone feature flags.

### Publish and run migrations

Required if you use the `HasTags` / `HasAssociations` traits:

```bash
php artisan vendor:publish --tag=starter-core-migrations
php artisan migrate
```

### Publish stubs (optional)

To customise the CRUD scaffold templates:

```bash
php artisan vendor:publish --tag=starter-core-stubs
```

Once published to `stubs/crud-module/`, `make:crud-module` will use your local copies instead of the package defaults.

---

## Configuration

After publishing, `config/starter-core.php` exposes:

```php
return [
    'superuser_role' => 'Superuser',        // role name that bypasses all gates
    'tag_model'      => 'App\\Models\\Tag', // model used by HasTags trait
    'features'       => [                   // fallback when setting() helper is absent
        // 'notifications' => false,
        // 'registration'  => true,
    ],
];
```

The `features` array is only used when the host app does not provide a `setting()` helper. If a `setting()` helper exists (as in the [Laravel Starter Kit](https://github.com/sanjid29/stater-kit)), it takes precedence and features are controlled from the database.

---

## Components

### `StarterKitServiceProvider`

Registers everything on boot:

- Middleware aliases: `permission:`, `role:`, `feature:`
- `HandleImpersonation` pushed to the `web` middleware group
- `Route::crudModule()` macro
- `Gate::before` Superuser bypass
- `make:crud-module`, `remove:crud-module`, and `make:service` Artisan commands

---

### `Route::crudModule()` Macro

```php
Route::crudModule(
    string $prefix,
    string $controller,
    ?string $dtController = null,
    ?\Closure $extras = null
): void
```

Registers a full set of routes under `$prefix`, each guarded by the matching `{prefix}.{action}` Spatie permission:

| Route | Permission |
|-------|-----------|
| `GET /` (index) | `{prefix}.view-grid` |
| `GET /datatable` | `{prefix}.view-grid` |
| `GET /create` | `{prefix}.create` |
| `POST /` (store) | `{prefix}.create` |
| `GET /{record}` (show) | `{prefix}.view` |
| `GET /{record}/edit` | `{prefix}.update` |
| `PUT /{record}` (update) | `{prefix}.update` |
| `DELETE /{record}` (destroy) | `{prefix}.delete` |
| `GET /select` (Ajax options) | *(none)* |
| `GET /recycle-bin` | `{prefix}.restore` |
| `GET /recycle-bin/datatable` | `{prefix}.restore` |
| `POST /{record}/restore` | `{prefix}.restore` |
| `DELETE /{record}/force-delete` | `{prefix}.force-delete` |

Extra static routes passed via `$extras` are registered **before** the `/{record}` wildcard.

**Example:**

```php
Route::crudModule('posts', PostController::class, PostDataTableController::class, function () {
    Route::get('/report', PostReportController::class)
        ->name('report')
        ->middleware('permission:posts.report');
});
```

---

### `BaseController`

All CRUD module controllers extend `BaseController`. Configure it with class properties:

```php
protected string $model = Post::class;
protected string $routePrefix = 'posts';
protected string $viewPrefix = 'posts';
protected ?string $service = PostService::class; // optional
```

**Override points** (all optional):

```php
// Return extra data to merge into the create/edit view
protected function createViewData(): array {}
protected function editViewData(Model $record): array {}

// Reshape or denormalize validated data before saving (no service wired)
protected function transformStoreData(array $data): array {}
protected function transformUpdateData(array $data, Model $record): array {}

// Post-save hooks — sync associations, dispatch jobs, etc. (no service wired)
protected function afterStore(Model $record, array $data): void {}
protected function afterUpdate(Model $record, array $data): void {}

// Pre/post delete hooks (also called on force-delete)
protected function beforeDestroy(Model $record): void {}
protected function afterDestroy(Model $record): void {} // auto-cleans file/media fields
```

When a `$service` is wired, `transformStoreData/transformUpdateData` and `afterStore/afterUpdate` are **not** called — the service owns those responsibilities via its own hooks.

**File uploads** — handled automatically when `$request->hasFile(...)`. Integrates with Spatie MediaLibrary and `Storage`.

---

### `BaseDataTableController`

Configure with class properties in the constructor:

```php
protected string $model = Post::class;
protected string $routePrefix = 'posts';
protected array $withRelations = ['author', 'category'];
protected array $rawColumns = ['action', 'status'];
```

**Override points:**

```php
protected function indexQuery(): Builder {}          // base query
protected function dataTableColumns(): array {}      // DataTables column definitions
protected function applyFilters(Builder $query): Builder {}
protected function actionColumn(): string {}         // action button HTML
protected function tableColumns(): array {}          // visible column list for the view
```

---

### `BaseReportController`

Handles multi-format export (HTML, PDF, Excel, CSV, Print) from a single controller action. Extend and implement:

```php
protected function query(): Builder {}
protected function columns(): array {}              // column definitions with headings
protected string $title = 'Report Title';
protected string $filename = 'report';
```

---

### `BaseService`

Optional service layer for modules that have business logic beyond simple CRUD. Only create one when needed — use `php artisan make:service {Name}` to scaffold it, then wire it into the controller:

```php
// in the controller constructor
$this->service = app(PostService::class);
```

**Hook execution order for `create($data)`:**

```
transformForCreate($data)  → reshape/denormalize data
beforeCreate($data)        → side-effects before insert
Model::create($data)
afterCreate($record, $data) → sync relations, dispatch jobs
```

**Hook execution order for `update($record, $data)`:**

```
transformForUpdate($data, $record) → reshape/denormalize data
stripImmutable($data)              → remove protected fields
beforeUpdate($record, $data)       → side-effects before update
$record->update($data)
afterUpdate($record, $data)        → sync relations, dispatch jobs
```

**Override points:**

```php
// Data shaping and denormalization — runs before before* hooks
protected function transformForCreate(array $data): array {}
protected function transformForUpdate(array $data, Model $record): array {}

// Side-effects — external calls, relation syncing, job dispatching
protected function beforeCreate(array &$data): void {}
protected function afterCreate(Model $record, array $data): void {}
protected function beforeUpdate(Model $record, array &$data): void {}
protected function afterUpdate(Model $record, array $data): void {}
protected function beforeDelete(Model $record): void {}
protected function afterDelete(Model $record): void {}
```

Declare `$immutable` to prevent specific fields from ever being updated:

```php
protected array $immutable = ['email', 'username'];
```

---

### `BaseFormRequest`

All Form Requests extend this. Key methods:

```php
$this->recordId()    // returns the {record} route parameter (UUID/ID)
$this->isUpdating()  // true when the route has a {record} parameter
```

`authorize()` always returns `true` — authorization is handled by route middleware.

---

### `BaseObserver`

Auto-sets `created_by`, `updated_by`, and `deleted_by` on every model event using the authenticated user's ID. All module observers extend this:

```php
class PostObserver extends BaseObserver
{
    public function deleting(Post $post): void
    {
        parent::deleting($post); // sets deleted_by
        // cascade logic here
    }
}
```

---

### Model Traits

| Trait | What it does |
|-------|-------------|
| `HasUuid` | Generates `uuid` on `creating`; sets `$primaryKey` and disables auto-increment |
| `HasAuditFields` | Adds `created_by`, `updated_by`, `deleted_by` to `$appends`; provides `createdBy()`, `updatedBy()`, `deletedBy()` BelongsTo relations |
| `HasActivityLog` | Configures Spatie Activity Log with `logOnlyDirty()` and `dontSubmitEmptyLogs()` |
| `HasTags` | Tagify-compatible tag storage and retrieval via `associables` |
| `HasAssociations` | Polymorphic many-to-many engine — one `associables` table for all relationships |

#### `HasAssociations` — custom relationship traits

`HasAssociations` is the engine. You never use it directly on a model — instead you write a thin trait per related model that wraps `associates()`. This keeps one `associables` table serving all your polymorphic many-to-many relationships with no extra migrations.

```php
// create once per related model:
trait HasSkills
{
    use HasAssociations;

    public function skills(): BelongsToMany
    {
        return $this->associates(Skill::class);
    }
}

// use on any model:
class Employee extends Model
{
    use HasSkills, HasTags; // both work independently via the same table
}

$employee->skills()->sync([1, 3, 5]);
$employee->tags;
```

> **When not to use this:** if your pivot needs extra columns specific to the relationship (e.g. `proficiency_level` on `employee_skill`), a dedicated pivot table is cleaner.

---

### Middleware

**`feature:name`** — Aborts with 404 if `setting('features.name')` is falsy.

**`permission:module.action`** — Checks Spatie permission; redirects with flash error on failure.

**`role:RoleName`** — Checks Spatie role; redirects with flash error on failure.

**`HandleImpersonation`** — Auto-pushed to `web` group. Reads `session('impersonating')` and swaps the auth user. Prevents impersonating Superusers without Superuser privilege.

---

### CRUD Scaffold Commands

#### `make:crud-module {Name}`

Generates a complete module from stubs in `stubs/crud-module/`:

| Generated file | Destination |
|----------------|-------------|
| Migration | `database/migrations/` |
| Model | `app/Models/` |
| Observer | `app/Observers/` |
| Policy | `app/Policies/` |
| Form Request | `app/Http/Requests/` |
| CRUD Controller | `app/Http/Controllers/CrudController/` |
| DataTable Controller | `app/Http/Controllers/DataTableController/` |
| Report Controller | `app/Http/Controllers/ReportController/` |
| Views (index, form, show, report/index, report/print) | `resources/views/{kebab-name}/` |

Use `--force` to overwrite existing files.

After generating, the developer must:
1. Run the migration
2. Add `$fillable` and casts to the model
3. Add validation rules to the Form Request
4. Register routes with `Route::crudModule()` in `routes/web.php`
5. Add sidebar links (both sidebar files)

#### `remove:crud-module {Name} --force`

Deletes all files generated by `make:crud-module`. Does not roll back the migration — run `php artisan migrate:rollback` manually if needed.

#### `make:service {Name}`

Generates a service class for a model at `app/Services/{Name}Service.php`. Only run this when the module has business logic that goes beyond simple CRUD — data transformation, denormalization, or orchestration across multiple models.

```bash
php artisan make:service LeaveRequest
# → app/Services/LeaveRequestService.php
```

Use `--force` to overwrite an existing file. The stub can be customized by publishing stubs and editing `stubs/service.stub`.

---

## Stubs

Stubs live in `stubs/` and can be published to the host application for customization:

```bash
php artisan vendor:publish --tag=starter-core-stubs
```

| Stub | Used by |
|------|---------|
| `stubs/crud-module/*.stub` | `make:crud-module` |
| `stubs/service.stub` | `make:service` |

Once published, the commands will use your local copies in `stubs/` instead of the package defaults.

---

## License

MIT
