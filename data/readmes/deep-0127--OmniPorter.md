# 🚀 Unlocking Data Mastery with **OmniPorter**
### *The Ultimate Laravel Import/Export Framework*

Tired of manual data entry nightmares and clunky import/export processes?  
Dream of a world where your application effortlessly ingests and disgorges vast datasets with bulletproof validation and intelligent relationship management?

**Your quest ends here—with OmniPorter.**

OmniPorter is a **meticulously engineered, battle-tested solution** that injects your Eloquent models with unparalleled import and export superpowers.  
Prepare to catapult your application's data fluency into the stratosphere.

This isn't merely about shuffling bits and bytes; it's about **intelligent, resilient, and user-centric data orchestration**.  
OmniPorter harnesses the full might of Laravel's queueing system, trait-based architecture, dynamic class resolution, and advanced caching mechanisms to forge a system that:

- ✅ **Ingests mammoth files asynchronously**, keeping your UI snappy
- ✅ **Validates data with surgical precision**, catching errors before they corrupt your database
- ✅ **Navigates complex model relationships** like a seasoned architect
- ✅ **Ensures peak performance** even under heavy load
- ✅ **Keeps your users fully informed** with real-time notifications

Let’s embark on this journey to bestow your models with these remarkable capabilities—**OmniPorter style**.

---

## 🧱 I. The Foundational Pillars: Architecting OmniPorter’s Excellence

- **🧩 Traits (`HasImport`, `HasExport`)**  
  Your plug-and-play powerups—just `use` them in your Eloquent models and you're off to the races.

- **📜 Interfaces (`Importable`, `Exportable`)**  
  Sacred contracts that ensure any participating model defines the required metadata and methods.

- **🎩 Service Provider (`ImportExportServiceProvider`)**  
  The dynamic scanner and registrar of all eligible models—**auto-wiring FTW**, courtesy of OmniPorter.

- **🧰 Controllers (`ImportController`, `ExportController`)**  
  OmniPorter’s API gatekeepers: enforcing permissions, handling requests, and delegating heavy work to jobs.

- **🧠 Intelligent Caching (`ImportDetailsCache`, `ExportDetailsCache`)**  
  Persist chunked job state in Redis for smooth recovery and flawless continuity.

- **📦 Queues & Jobs**  
  All major processing (reading, saving, exporting) happens off the main thread—**no UI freeze ever**.

- **📬 Notifications**  
  Clear and concise emails are dispatched to notify users of success or failure—with full results.

---

## 📥 II. Making Your Model Importable with OmniPorter

### 🔧 A. Implementing the `Importable` and `Exportable` Contracts

```php
use OmniPorter\Contracts\Importable;
use OmniPorter\Contracts\Exportable;
use Illuminate\Database\Eloquent\Model;

class YourModel extends Model implements Importable, Exportable
{
    public static function getUniqueKeyForImportExport(): string
    {
        return 'work_email';
    }

    public static function getListOfRelationDetails(): array
    {
        return [
            Department::class => ['type' => 'belongsTo', 'method' => 'department', 'field' => 'department_id'],
            Employee::class => ['type' => 'belongsTo', 'method' => 'manager', 'field' => 'reports_to'],
            Profile::class => ['type' => 'hasOne', 'method' => 'profile', 'field' => 'profile_id'],
            Role::class => ['type' => 'belongsToMany', 'method' => 'roles'],
        ];
    }
}
```

---

### ✨ B. Leveraging the `HasImport` Trait

```php
use OmniPorter\Traits\HasImport;

class YourModel extends Model implements Importable, Exportable
{
    use HasImport;
}
```

---

### ✅ C. Model-Specific Validation

```php
// CreateEmployeeRequest
public function rules(): array
{
    return [
        'work_email' => ['required', 'string', 'email', 'max:255', 'unique:employees,work_email'],
        // ...
    ];
}
```

```php
// UpdateEmployeeRequest
public function rules(?int $id = null): array
{
    return [
        'work_email' => ['required', 'string', 'email', 'max:255', Rule::unique('employees', 'work_email')->ignore($id)],
        // ...
    ];
}
```

---

### 🔄 D. Mapping Excel Headings to Model Fields

- Excel headers should match your model’s `fillable` fields.
- For `belongsTo` relations, use the related model's `getUniqueKeyForImportExport()` return value as the header name.
- For `belongsToMany` relations, provide a comma-separated list of unique keys.

> [!NOTE]
> `hasOne` relations are currently supported for **Export** only. For **Import**, use `belongsTo` on the model that holds the foreign key.

---

### 🔮 E. Auto-Creating Missing Related Records

OmniPorter can automatically create missing related records during import. For example, if an employee's CSV contains a designation that doesn't exist yet, OmniPorter can create it on the fly.

To enable this, implement the `getAutoCreateAttributesOnImport()` static method on the related model:

```php
class Designation extends Model
{
    /**
     * Return the attributes for auto-creating this model during import.
     * Return null to disable auto-creation.
     */
    public static function getAutoCreateAttributesOnImport(string $value): ?array
    {
        return [
            'title' => $value,       // The matched column
            'type'  => 'employee',   // Default values for required fields
        ];
    }
}
```

**How it works:**
1. During import, if a `belongsTo` relation value (e.g., "Data Scientist") is not found in the database, OmniPorter checks if the related model has `getAutoCreateAttributesOnImport()`.
2. If the method exists and returns a non-null array, a new record is created with those attributes.
3. The import cache is updated so subsequent rows referencing the same value don't trigger duplicate creation.
4. All auto-creations are logged for audit purposes.

> [!TIP]
> If `getAutoCreateAttributesOnImport()` returns `null`, the relation is skipped (set to `null`) and a warning is logged. This allows you to opt-in per model.

---

## 📤 III. Making Your Model Exportable with OmniPorter

### 🧲 A. Use the `HasExport` Trait

```php
use OmniPorter\Traits\HasExport;

class YourModel extends Model implements Importable, Exportable
{
    use HasExport;
}
```

---

### 📃 B. Define `getColumnsToExport()`

```php
public static function getColumnsToExport(): array
{
    return [
        'first_name',
        'work_email',
        'department',
        'roles',
    ];
}
```

---

### 🔍 C. Filtering Exports the OmniPorter Way

Example queries:

```
?status=active
?name_like=john
?department_id_in=1,2,3
```

| Suffix   | Description                     |
|----------|---------------------------------|
| `_eq`    | Equal to                        |
| `_ne`    | Not equal to                    |
| `_gt`    | Greater than                    |
| `_gte`   | Greater than or equal to        |
| `_lt`    | Less than                       |
| `_lte`   | Less than or equal to           |
| `_like`  | SQL LIKE (e.g. `%value%`)       |
| `_nlike` | SQL NOT LIKE                    |
| `_in`    | In list (comma-separated)       |
| `_nin`   | Not in list (comma-separated)   |
| `_null`  | Is NULL                         |
| `_nnull` | Is NOT NULL                     |

---

## 🌐 IV. Routing Data Traffic with OmniPorter

### 📥 Import Endpoint

```http
POST /imports/{resource}/{mode}
```

- `mode`: `create` or `update`
- `file`: required in body

---

### 📤 Export Endpoint

```http
GET /exports/{resource}
```

- Fully filterable
- OmniPorter handles everything in the background

---

### 📊 Progress Tracking Endpoint

```http
GET /imports/progress/{batchId}
```

Track the progress of an import in real-time:

**Response**:
```json
{
  "success": true,
  "data": {
    "batch_id": "550e8400-e29b-41d4-a716-446655440000",
    "total_rows": 1000,
    "processed_rows": 750,
    "progress": 75.0,
    "status": "in_progress"
  }
}
```

**Status Values**:
- `pending`: Import has not started
- `in_progress`: Import is currently processing
- `completed`: Import has finished

**WebSocket Events**:
For real-time updates, listen to the `omniporter-progress.{batchId}` channel:

```javascript
Echo.channel(`omniporter-progress.${batchId}`)
    .listen('ProgressUpdated', (e) => {
        console.log(`Progress: ${e.progress}%`);
        console.log(`Processed: ${e.processedRows}/${e.totalRows}`);
    });
```

---

## 🛡️ V. OmniPorter Authorization & Permissions

- `employee:import`, `employee:create`, `employee:store`
- `employee:update`, `employee:edit`
- `employee:export`, `employee:index`

```php
$user->hasAnyPermission(['employee:create', 'employee:store']);
```

---

---

## ⚙️ VI. Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag="omniporter-config"
```

| Key | Environment Variable | Default | Description |
|-----|----------------------|---------|-------------|
| `cache.store` | `OMNIPORTER_CACHE_STORE` | `redis` | The cache store for job state. |
| `cache.prefix` | `OMNIPORTER_CACHE_PREFIX` | `omniporter` | Prefix for cache keys. |
| `cache.ttl` | `OMNIPORTER_CACHE_TTL` | `3600` | How long to keep state (seconds). |
| `import.disk` | `OMNIPORTER_IMPORT_DISK` | `local` | Disk for uploads/results. |
| `export.disk` | `OMNIPORTER_EXPORT_DISK` | `local` | Disk for final export files. |

---

## 🧹 VII. Maintenance

### Clearing Cache
If you encounter issues with stuck jobs or state, you can clear the OmniPorter cache:

```bash
php artisan omniporter:clear-cache
```

---

## 🏗️ VIII. Behind the Curtains of OmniPorter: How it Works

OmniPorter is designed for massive scale and reliability. Here is how the magic happens:

### 📥 The Import Flow
1. **Upload**: The user sends a file to the `ImportController`.
2. **Storage**: The file is stored on the configured disk.
3. **Queueing**: A `GenericImport` job is dispatched to the queue.
4. **Processing**:
   - The file is read in chunks using `Maatwebsite\Excel`.
   - Each row is validated using your model's `getImportValidators()`.
   - Relationships are resolved via `getListOfRelationDetails()`.
   - Records are created or updated using the unique key from `getUniqueKeysForUpdate()`.
5. **State Tracking**: Progress and failures are tracked in real-time using the `ImportDetailsCache` (stored in Redis).
6. **Completion**: A notification is sent to the user with a summary of successes and failures.

### 📤 The Export Flow
1. **Request**: The user requests an export via `ExportController`, optionally providing filters and columns.
2. **Filtering**: OmniPorter applies dynamic filters based on the request parameters.
3. **Queueing**: A `GenericExport` job is dispatched.
4. **Generation**:
   - Data is queried in chunks to avoid memory issues.
   - Relationships are eager-loaded for performance.
   - The final spreadsheet is generated and saved to the export disk.
5. **Notification**: The user receives an email with a secure download link.

## 🎯 Conclusion: OmniPorter, Your Data Swiss Army Knife

You now wield **OmniPorter**—a high-performance Laravel-based import/export engine that’s:

✅ Asynchronous  
✅ Resilient  
✅ Secure  
✅ Developer-Friendly

> **Go forth, and automate with elegance—with OmniPorter.**  
> Because your data deserves better.
