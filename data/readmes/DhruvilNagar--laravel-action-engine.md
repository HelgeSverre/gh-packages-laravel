# Laravel Action Engine

A powerful, framework-agnostic Laravel package for managing bulk operations with queue support, progress tracking, undo functionality, and scheduled execution.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/dhruvilnagar/laravel-action-engine.svg?style=flat-square)](https://packagist.org/packages/dhruvilnagar/laravel-action-engine)
[![Total Downloads](https://img.shields.io/packagist/dt/dhruvilnagar/laravel-action-engine.svg?style=flat-square)](https://packagist.org/packages/dhruvilnagar/laravel-action-engine)
[![License](https://img.shields.io/github/license/DhruvilNagar/laravel-action-engine.svg?style=flat-square)](https://github.com/DhruvilNagar/laravel-action-engine/blob/main/LICENSE)

## ✨ Features

- **🚀 Fluent API** - Simple, readable syntax with method chaining
- **📦 Queue Integration** - Automatic batching for large datasets with configurable batch sizes
- **📊 Progress Tracking** - Real-time progress updates via polling or WebSocket
- **↩️ Undo Functionality** - Time-limited undo with full record snapshots
- **📅 Scheduled Actions** - Defer execution to a specific time
- **👁️ Dry Run Mode** - Preview what will happen without executing
- **🔗 Action Chaining** - Execute multiple actions sequentially
- **📝 Audit Trail** - Complete history of all bulk actions
- **⚡ Rate Limiting** - Prevent system overload
- **📤 Export Integration** - Export results to CSV/Excel/PDF
- **🔐 Authorization** - Policy-based authorization support
- **🎨 Multiple Frontend Integrations** - Livewire, Vue, React, Blade, Filament, Alpine.js

## 📋 Requirements

- PHP 8.1 or higher
- Laravel 10.x or 11.x

## 📦 Installation

Install via Composer:

```bash
composer require dhruvilnagar/laravel-action-engine
```

Run the interactive installer:

```bash
php artisan action-engine:install
```

The installer will ask you:
1. Which frontend stack(s) you're using (Livewire, Vue, React, Blade, Filament, Alpine.js)
2. Whether you need real-time progress updates via WebSocket
3. If yes, which broadcast driver you're using

## 🚀 Quick Start

### Basic Usage

```php
use DhruvilNagar\ActionEngine\Facades\BulkAction;
use App\Models\User;

// Delete inactive users
$execution = BulkAction::on(User::class)
    ->action('delete')
    ->where('status', 'inactive')
    ->where('last_login_at', '<', now()->subMonths(6))
    ->withUndo(days: 30)
    ->execute();

// Check progress
echo "UUID: {$execution->uuid}";
echo "Status: {$execution->status}";
echo "Progress: {$execution->progress_percentage}%";
```

### Using Specific IDs

```php
$execution = BulkAction::on(User::class)
    ->action('archive')
    ->ids([1, 2, 3, 4, 5])
    ->with(['reason' => 'Account cleanup'])
    ->withUndo()
    ->execute();
```

### Bulk Update

```php
$execution = BulkAction::on(User::class)
    ->action('update')
    ->where('role', 'subscriber')
    ->with(['data' => ['plan' => 'premium']])
    ->execute();
```

### Dry Run (Preview)

```php
$execution = BulkAction::on(User::class)
    ->action('delete')
    ->where('status', 'inactive')
    ->dryRun()
    ->execute();

// Get preview data
$preview = $execution->dry_run_results;
echo "Would affect {$preview['total_count']} records";
```

### Scheduled Execution

```php
$execution = BulkAction::on(User::class)
    ->action('delete')
    ->where('status', 'pending')
    ->scheduleFor('2024-12-31 00:00:00')
    ->execute();
```

### Synchronous Execution

```php
$execution = BulkAction::on(User::class)
    ->action('update')
    ->ids([1, 2, 3])
    ->with(['data' => ['verified' => true]])
    ->sync() // Run immediately without queue
    ->execute();
```

## 🔧 Configuration

After installation, the configuration file is at `config/action-engine.php`:

```php
return [
    'batch_size' => 500,          // Records per batch
    'queue' => [
        'connection' => null,      // Default queue connection
        'name' => 'default',
    ],
    'routes' => [
        'prefix' => 'bulk-actions', // API route prefix
        'middleware' => [
            'api' => ['api', 'auth:sanctum'],
        ],
    ],
    'undo' => [
        'enabled' => true,
        'default_expiry_days' => 7,
    ],
    'broadcasting' => [
        'enabled' => false,        // Enable WebSocket updates
    ],
    'audit' => [
        'enabled' => true,
    ],
    'rate_limiting' => [
        'enabled' => true,
        'max_concurrent_actions' => 5,
    ],
];
```

## 📚 Registering Custom Actions

Register custom actions in your `AppServiceProvider`:

```php
use DhruvilNagar\ActionEngine\Facades\ActionRegistry;

public function boot()
{
    // Simple closure-based action
    ActionRegistry::register('send_email', function ($record, $params) {
        Mail::to($record->email)->send(new BulkEmail($params['message']));
        return true;
    }, [
        'label' => 'Send Email',
        'supports_undo' => false,
    ]);

    // Class-based action
    ActionRegistry::register('notify', NotifyAction::class);
}
```

### Creating an Action Class

```php
use DhruvilNagar\ActionEngine\Contracts\ActionInterface;
use Illuminate\Database\Eloquent\Model;

class NotifyAction implements ActionInterface
{
    public function execute(Model $record, array $parameters = []): bool
    {
        $record->notify(new BulkNotification($parameters['message']));
        return true;
    }

    public function getName(): string
    {
        return 'notify';
    }

    public function getLabel(): string
    {
        return 'Send Notification';
    }

    public function supportsUndo(): bool
    {
        return false;
    }

    public function getUndoType(): ?string
    {
        return null;
    }

    public function validateParameters(array $parameters): array
    {
        return $parameters;
    }

    public function getUndoFields(): array
    {
        return [];
    }

    public function afterComplete(array $results): void
    {
        // Cleanup or notification logic
    }
}
```

## 🎨 Frontend Integrations

### Livewire

```php
// In your component
<livewire:action-engine.bulk-action-manager 
    :model="App\Models\User::class" 
    :selected-ids="$selectedIds" 
/>
```

### Vue.js

```javascript
import { useBulkAction } from '@/vendor/action-engine/composables/useBulkAction'

const { execute, progress, isLoading, undo } = useBulkAction()

await execute({
  action: 'delete',
  model: 'App\\Models\\User',
  filters: { ids: selectedIds },
  options: { with_undo: true }
})

// Watch progress
watch(progress, (p) => {
  console.log(`${p.percentage}% complete`)
})
```

### React

```jsx
import { useBulkAction } from '@/vendor/action-engine/hooks/useBulkAction'

function BulkDeleteButton({ selectedIds }) {
  const { execute, progress, isLoading, undo } = useBulkAction()

  const handleDelete = async () => {
    await execute({
      action: 'delete',
      model: 'App\\Models\\User',
      filters: { ids: selectedIds },
      options: { with_undo: true }
    })
  }

  return (
    <>
      <button onClick={handleDelete} disabled={isLoading}>
        Delete Selected ({selectedIds.length})
      </button>
      {progress && (
        <div>Progress: {progress.percentage}%</div>
      )}
    </>
  )
}
```

### Filament

```php
use App\Filament\Actions\BulkDeleteAction;
use App\Filament\Actions\BulkArchiveAction;

public function table(Table $table): Table
{
    return $table
        ->bulkActions([
            BulkDeleteAction::make(),
            BulkArchiveAction::make(),
        ]);
}
```

### Alpine.js

```html
<div x-data="bulkAction()">
    <button 
        @click="execute({ 
            action: 'delete', 
            model: 'App\\Models\\User', 
            filters: { ids: selectedIds } 
        })"
        :disabled="isLoading"
    >
        Delete Selected
    </button>

    <template x-if="isInProgress">
        <div class="progress-bar" :style="{ width: progress.percentage + '%' }"></div>
    </template>
</div>
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bulk-actions` | List user's bulk actions |
| POST | `/api/bulk-actions` | Execute a bulk action |
| GET | `/api/bulk-actions/{uuid}` | Get execution details |
| POST | `/api/bulk-actions/{uuid}/cancel` | Cancel an action |
| GET | `/api/bulk-actions/{uuid}/progress` | Get progress |
| POST | `/api/bulk-actions/{uuid}/undo` | Undo an action |
| POST | `/api/bulk-actions/preview` | Preview (dry run) |
| GET | `/api/bulk-actions/actions` | List available actions |

## 📖 Using the HasBulkActions Trait

Add the trait to your models for convenient bulk action methods:

```php
use DhruvilNagar\ActionEngine\Traits\HasBulkActions;

class User extends Model
{
    use HasBulkActions;
}

// Now you can use:
User::bulkDelete([1, 2, 3]);
User::bulkUpdate([1, 2, 3], ['status' => 'active']);
User::bulkArchive([1, 2, 3], 'Cleanup');
User::getBulkActionHistory();
User::getUndoableBulkActions();
```

## 📡 Real-time Progress (WebSocket)

Enable broadcasting in config:

```php
'broadcasting' => [
    'enabled' => true,
    'channel_prefix' => 'bulk-action',
],
```

Listen to events in JavaScript:

```javascript
Echo.private(`bulk-action.${executionUuid}`)
    .listen('.progress', (data) => {
        console.log(`Progress: ${data.progress_percentage}%`)
    })
    .listen('.completed', (data) => {
        console.log('Action completed!')
    })
    .listen('.failed', (data) => {
        console.log('Action failed:', data.error)
    })
```

## 🛠️ Console Commands

```bash
# Run the installer
php artisan action-engine:install

# List registered actions
php artisan action-engine:list

# Process scheduled actions
php artisan action-engine:process-scheduled

# Cleanup expired data
php artisan action-engine:cleanup
```

## 🧪 Testing

```bash
composer test
```

## 📄 License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.
