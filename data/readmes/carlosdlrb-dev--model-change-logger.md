# Model Change Logger
![CI](https://github.com/carlosdev/model-change-logger/actions/workflows/ci.yml/badge.svg)

[Leer en Espanol](README.es.md)

**Laravel library for recording changes (create, update, delete) in models.**  
Records JSON snapshots of changes, the responsible user, and the date of the change in a database table.

---

## 📦 Installation

Add the package to your project via Composer:
```bash
composer require carlosdev/model-change-logger
```

Make sure you have PHP 8.0+ and Laravel 10 - 13.

## 🔧 Configuration

Publish and run migrations:
```bash
php artisan migrate
```

Use the trait in the model you want to audit:
```php
use CarlosDev\ModelChangeLogger\Traits\TracksChanges;

class JobOffer extends Model
{
    use TracksChanges;
}
```

(Optional) Audit only specific attributes:
If you want to record only certain attributes, define the $auditFields property in your model:
```php
protected array $auditFields = ['job_offer_status_id', 'title'];
```

## 🧪 Examples

### Create
```php
$post = Post::create([
        'title' => 'Hello World',
        'content' => 'First post',
]);
```

Recorded values:
```json
{
    "event": "created",
    "old_value": null,
    "new_value": {
        "title": "Hello World",
        "content": "First post"
    }
}
```

### Update
```php
$post->update(['title' => 'New title']);
```

Recorded values:
```json
{
    "event": "updated",
    "old_value": {
        "title": "Hello World"
    },
    "new_value": {
        "title": "New title"
    }
}
```

### Delete
```php
$post->delete();
```

Recorded values:
```json
{
    "event": "deleted",
    "old_value": {
        "title": "New title",
        "content": "First post"
    },
    "new_value": null
}
```

## 🧠 What does it record?

- JSON payload with old/new values for changed attributes on update().
- JSON payload with all tracked attributes on create.
- Deletions (delete and forceDelete), saving a JSON snapshot of tracked attributes in old_value.
- Responsible user (Auth::id()).
- Affected model and ID.
- Date and time of the change.

## 📄 Structure of the model_changes table

| Column | Description |
|-------|-------------|
| model_type | Class of the affected model (App\Models\X) |
| model_id | ID of the modified model |
| old_value | Previous value |
| new_value | New value |
| user_id | ID of the user who made the change |
| event | Type of event (updated, deleted, etc.) |
| changed_at | Date and time of the change |


## ✅ Compatibility

- PHP: >= 8.0
- Laravel: ^10.0 - ^13.0

## 📬 Contributions

Suggestions, improvements, and pull requests are welcome! 🚀

This package is designed for projects that require change traceability without depending on complex auditing packages.

## 📄 License

MIT © CarlosDev