# ⚡ Laravel PowerSync

A Laravel backend package for [PowerSync](https://www.powersync.com/) — the offline-first sync engine for mobile and web apps.

Handles JWT token issuance, JWKS key publishing, and client upload processing out of the box. Works for single-tenant apps with zero extra configuration, and adds multi-tenant support through a simple callback API.

---

## 📋 Requirements

| Dependency | Version |
|-----------|---------|
| PHP | ^8.1 |
| Laravel | 10, 11, or 12 |
| `firebase/php-jwt` | ^6.0 or ^7.0 |
| OpenSSL extension | enabled |

---

## 🚀 Installation

```bash
composer require saberaldda/laravel-powersync
```

Run the installer — it publishes the config, generates RSA keys, and prints your `.env` values:

```bash
php artisan powersync:install
```

Copy the printed `POWERSYNC_*` lines into your `.env` and set your PowerSync instance URL:

```env
POWERSYNC_PRIVATE_KEY=powersync/private.key
POWERSYNC_PUBLIC_KEY=powersync/public.key
POWERSYNC_KID=powersync-abc123def4
POWERSYNC_URL=https://<your-id>.powersync.journeyapps.com
```

Then point your PowerSync dashboard (or self-hosted YAML) at the JWKS endpoint:

```
https://your-backend.com/api/powersync/keys
```

---

## 🔌 Endpoints

Three routes are registered automatically:

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/powersync/keys` | 🌐 Public | JWKS — PowerSync service fetches this to verify client JWTs |
| `POST` | `/api/powersync/token` | 🔒 `auth:sanctum` | Issue a signed JWT to an authenticated mobile client |
| `POST` | `/api/powersync/upload` | 🔒 `auth:sanctum` | Receive and apply client CRUD operations |

The prefix and middleware are configurable — see [Configuration](#%EF%B8%8F-configuration-reference).

---

## 🟢 Single-Tenant Setup

Register your tables in `config/powersync.php` and you're done:

```php
'tables' => [
    'todos' => [
        'model'   => \App\Models\Todo::class,
        'sync_by' => 'tenant',
    ],

    'lists' => [
        'model'   => \App\Models\TodoList::class,
        'sync_by' => 'tenant',
    ],
],
```

The mobile client calls `POST /api/powersync/token` (with a valid Sanctum token) to get a PowerSync JWT, then connects and syncs. Uploads are processed automatically against the registered models.

---

## 🏢 Multi-Tenant Setup

Register two callbacks in your `AppServiceProvider::boot()`:

```php
use Saberaldda\LaravelPowerSync\Facades\PowerSync;

// 1. Add tenant claim to the JWT so Sync Rules can filter data per tenant
PowerSync::buildTokenWith(function ($user, $request) {
    return [
        'organization_id' => $request->input('organization_id'),
    ];
});

// 2. Authorize uploads and return the active tenant ID
PowerSync::authorizeUploadWith(function ($user, $request) {
    $orgId = $request->input('organization_id');

    abort_if(
        ! $user->organizations()->where('id', $orgId)->exists(),
        403,
        'Not a member of this organization.'
    );

    return $orgId;
});
```

Also set `tenant_column` in the config so the processor enforces tenant isolation on every write:

```php
'tenant_column' => 'organization_id',
```

With this in place the upload processor will:
- 🔒 Force `organization_id` to the authorized value on every row (client cannot change ownership)
- 🚫 Block writes and deletes that target a row belonging to a different tenant

---

## ⚙️ Table Options

Each entry in `tables` supports these options:

```php
'tables' => [
    'order_items' => [
        // Required — the Eloquent model to write into
        'model' => \App\Models\OrderItem::class,

        // Optional — controls sync_streams.yaml generation (see below)
        'sync_by'     => 'tenant',       // 'tenant' | 'user' | 'global'
        'sync_column' => 'order_org_id', // override the default tenant/user column

        // Optional — composite unique columns.
        // When an INSERT matches an existing row on all of these columns,
        // it is converted to an UPDATE instead of a PK collision.
        // Useful for junction tables that the client may insert twice.
        'conflict_keys' => ['order_id', 'product_id'],

        // Optional — fields forced on every write, regardless of client payload.
        // Use for server-controlled values like moderation status.
        'overrides' => ['status' => 'pending'],
    ],
],
```

---

## 🪝 Per-Table Data Hooks

Register a `beforeUpsert` hook to transform data before it hits the database. Useful for back-compat transforms, derived field computation, or data normalization:

```php
// Compute daily_amount from total + days when the client omits it
PowerSync::beforeUpsert('expenses', function (array $data, string $id, string $op): array {
    if (($data['total'] ?? 0) > 0 && empty($data['daily_amount'])) {
        $data['daily_amount'] = $data['total'] / max(1, $data['days'] ?? 1);
    }
    return $data;
});

// Map a legacy string field to a FK id
PowerSync::beforeUpsert('product_ingredients', function (array $data, string $id, string $op): array {
    if (empty($data['unit_id']) && ! empty($data['unit'])) {
        $data['unit_id'] = \App\Models\Unit::where('name', $data['unit'])->value('id');
        unset($data['unit']);
    }
    return $data;
});
```

---

## 🔗 Nullable Foreign Keys

When a client uploads a row whose FK points at a record that hasn't arrived server-side yet (sync ordering), setting the FK to null prevents a constraint violation without losing the row:

```php
'nullable_foreign_keys' => [
    'category_id' => 'categories',
    'owner_id'    => 'users',
],
```

The processor logs each nullification for audit purposes. The client can re-upload or the app can handle nulls gracefully.

---

## 🛡️ What the Upload Processor Handles

All of this is built in and requires no extra code:

| Behaviour | Detail |
|-----------|--------|
| ✅ Upsert | `updateOrCreate` by `id` |
| 🔀 Conflict resolution | `INSERT` → `UPDATE` on matching composite unique keys |
| 🚫 Cross-tenant guard | Blocks writes/deletes on rows owned by another tenant |
| 🗑️ Soft-delete awareness | Queries use `withTrashed()` so soft-deleted rows are found and updated |
| 🔁 UPDATE-on-missing | A row deleted server-side is re-created from the client payload |
| ⏭️ PATCH-on-missing | Skipped cleanly — nothing to partially update |
| 🧹 Column filtering | Only writes columns that exist in the table (client may send extras) |
| 📝 Audit fields | Auto-sets `created_by` / `updated_by` when the columns exist |
| 🔗 Nullable FK deferral | Nullifies unresolved FKs instead of throwing constraint errors |
| 🔄 JSON column decoding | Prevents double-encoding when Eloquent `array`/`json` casts are present |
| 🔂 Duplicate INSERT | Converts to UPDATE to avoid PK collisions (e.g. client retry) |
| ⚠️ Unique constraint collision | Caught and returned as `skipped_duplicate` — batch continues |

---

## 📤 Upload Response

Each operation in the batch returns a result object:

```json
{
    "status": "success",
    "processed": 3,
    "results": [
        { "table": "todos",  "id": "uuid-1", "op": "INSERT", "status": "success" },
        { "table": "todos",  "id": "uuid-2", "op": "PATCH",  "status": "skipped_missing_for_patch" },
        { "table": "lists",  "id": "uuid-3", "op": "DELETE", "status": "success" }
    ]
}
```

Possible `status` values:

| Status | Meaning |
|--------|---------|
| ✅ `success` | Written to the database |
| ⏭️ `skipped_unsupported_table` | Table not in `config/powersync.tables` |
| ⏭️ `skipped_missing_for_patch` | PATCH target doesn't exist server-side |
| 🚫 `skipped_cross_tenant` | Row belongs to a different tenant |
| ⏭️ `skipped_not_found` | DELETE target doesn't exist |
| ⚠️ `skipped_duplicate` | Unique constraint collision after all resolution attempts |

The endpoint always returns `2xx` for business-logic results. `5xx` is only returned on infrastructure failures (database down, etc.) — this matches PowerSync SDK retry behaviour: a `4xx` would permanently block the client upload queue.

---

## 📄 Generating sync_streams.yaml

`sync_streams.yaml` (PowerSync Sync Rules) defines what data syncs down to each client. The package can generate a valid starter file from your table configuration automatically.

### 1️⃣ Add `sync_by` to each table

```php
// config/powersync.php
'tables' => [

    // Rows scoped to a tenant — filtered by tenant_column
    'orders' => [
        'model'   => \App\Models\Order::class,
        'sync_by' => 'tenant',
    ],

    // Rows scoped to the authenticated user — filtered by user_id (or sync_column)
    'notifications' => [
        'model'       => \App\Models\Notification::class,
        'sync_by'     => 'user',
        'sync_column' => 'recipient_id',  // defaults to 'user_id' if omitted
    ],

    // Reference data — no filter, syncs to everyone
    'categories' => [
        'model'   => \App\Models\Category::class,
        'sync_by' => 'global',
    ],

    // No sync_by — written to DB on upload but omitted from the YAML
    'audit_logs' => [
        'model' => \App\Models\AuditLog::class,
    ],
],
```

| `sync_by` | Bucket type | Filter applied |
|-----------|------------|----------------|
| 🏢 `tenant`  | Per-tenant bucket | `WHERE tenant_column = bucket.tenant_column` |
| 👤 `user`    | Per-user bucket | `WHERE user_id = bucket.user_id` (via `sub` claim) |
| 🌐 `global`  | Shared bucket | No filter — all rows |
| _(not set)_ | — | ⚠️ Table skipped with a warning |

### 2️⃣ Generate the file

```bash
php artisan powersync:sync-streams
```

Example output in the terminal:

```
Buckets:
  global_data        — 2 tables  (public — no filter)
  by_organization_id — 5 tables  (SELECT request.jwt() ->> 'organization_id' AS organization_id)
  by_user            — 1 table   (SELECT request.jwt() ->> 'sub' AS user_id)

Generated: /your/project/sync_streams.yaml
```

Generated `sync_streams.yaml`:

```yaml
# Generated by: php artisan powersync:sync-streams
# Review before deploying to your PowerSync dashboard.
# Docs: https://docs.powersync.com/usage/sync-rules

bucket_definitions:

  global_data:
    data:
      - SELECT * FROM categories
      - SELECT * FROM countries

  by_organization_id:
    parameters:
      - SELECT request.jwt() ->> 'organization_id' AS organization_id
    data:
      - SELECT * FROM orders WHERE organization_id = bucket.organization_id
      - SELECT * FROM employees WHERE organization_id = bucket.organization_id

  by_user:
    parameters:
      - SELECT request.jwt() ->> 'sub' AS user_id
    data:
      - SELECT * FROM notifications WHERE recipient_id = bucket.user_id
```

### 3️⃣ Deploy

Copy the file contents into your **PowerSync dashboard → Sync Rules** tab, or reference it in your self-hosted PowerSync service YAML.

Re-run with `--force` any time your table config changes:

```bash
php artisan powersync:sync-streams --force
```

Preview without writing:

```bash
php artisan powersync:sync-streams --stdout
```

> **💡 Note**: The generated file is a starting point. For advanced use cases — priority tiers, cross-table joins, computed columns, or soft-delete filters — edit the YAML manually after generating.

---

## 🛠️ Artisan Commands

```bash
# 🔧 Full install: publish config + generate keys + print .env values
php artisan powersync:install

# 🔑 Generate RSA key pair only
php artisan powersync:generate-keys

# Options:
#   --force         Overwrite existing keys
#   --bits=4096     Use RSA-4096 instead of the default 2048
#   --dir=custom    Write keys to storage/custom/ instead of storage/powersync/
php artisan powersync:generate-keys --bits=4096 --force

# 📄 Generate sync_streams.yaml from table config
php artisan powersync:sync-streams

# Options:
#   --output=path   Write to a custom path (default: sync_streams.yaml in project root)
#   --stdout        Print to terminal instead of writing a file
#   --force         Overwrite if file already exists
php artisan powersync:sync-streams --stdout
php artisan powersync:sync-streams --output=config/powersync/sync_streams.yaml --force
```

---

## ⚙️ Configuration Reference

```php
// config/powersync.php

'private_key'    => env('POWERSYNC_PRIVATE_KEY', 'powersync/private.key'),
'public_key'     => env('POWERSYNC_PUBLIC_KEY',  'powersync/public.key'),
'kid'            => env('POWERSYNC_KID', 'default'),
'url'            => env('POWERSYNC_URL'),           // JWT aud claim
'token_ttl'      => env('POWERSYNC_TOKEN_TTL', 3600), // seconds

'route_prefix'    => 'api/powersync',
'route_middleware' => ['api', 'auth:sanctum'],
'keys_middleware'  => ['api'],                      // keep public
'register_routes'  => true,                        // false = manage routes yourself

'tenant_column'  => null,                          // e.g. 'organization_id'

'tables'         => [],                            // see ⚙️ Table Options above
'nullable_foreign_keys' => [],                     // see 🔗 Nullable Foreign Keys above
```

---

## 🛣️ Managing Routes Manually

Set `register_routes => false` in the config, then publish and edit the route file:

```bash
php artisan vendor:publish --tag=powersync-routes
```

This copies `routes/powersync.php` to your project's `routes/` folder where you can add custom middleware, rename paths, or nest the routes inside an existing group.

---

## 🖥️ Self-Hosted PowerSync Configuration

In your PowerSync service YAML, point `jwks_uri` at your keys endpoint:

```yaml
client_auth:
  jwks_uri: https://your-backend.com/api/powersync/keys
  audience:
    - https://your-backend.com
```

---

## 📜 License

MIT
