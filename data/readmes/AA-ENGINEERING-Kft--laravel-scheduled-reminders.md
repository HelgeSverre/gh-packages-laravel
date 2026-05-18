# Laravel Scheduled Reminders

[![Latest Version on Packagist](https://img.shields.io/packagist/v/aa-engineering/laravel-scheduled-reminders.svg?style=flat-square)](https://packagist.org/packages/aa-engineering/laravel-scheduled-reminders)
[![Total Downloads](https://img.shields.io/packagist/dt/aa-engineering/laravel-scheduled-reminders.svg?style=flat-square)](https://packagist.org/packages/aa-engineering/laravel-scheduled-reminders)

A Laravel package for scheduling and managing reminders with morphable relationships. Schedule notifications to be sent at specific times, attach them to any model, and track their delivery status.

## Features

- 📅 **Schedule reminders** for any date/time
- 🔗 **Polymorphic relationships** - attach reminders to any model
- 📊 **Track delivery status** - know when reminders were sent
- 🎯 **Source tracking** - link reminders to their originating models (tasks, events, etc.)
- 🧹 **Automatic pruning** - clean up old sent reminders
- 🎨 **Flexible data storage** - store custom data with each reminder
- ⚡ **Queue support** - send reminders via queue workers
- 🧪 **Fully tested** - comprehensive test suite included

## Installation

You can install the package via composer:

```bash
composer require aa-engineering/laravel-scheduled-reminders
```

Publish and run the migrations:

```bash
php artisan vendor:publish --tag="scheduled-reminders-migrations"
php artisan migrate
```

Optionally, publish the config file:

```bash
php artisan vendor:publish --tag="scheduled-reminders-config"
```

This is the contents of the published config file:

```php
return [
    'prune_after_days' => env('REMINDERS_PRUNE_AFTER_DAYS', 30),
    'log_errors' => env('REMINDERS_LOG_ERRORS', true),
    'queue_connection' => env('REMINDERS_QUEUE_CONNECTION', null),
    'queue_name' => env('REMINDERS_QUEUE_NAME', 'default'),
];
```

## Usage

### 1. Add the trait to your models

Add the `Remindable` trait to any model that should receive reminders:

```php
use AAEngineering\ScheduledReminders\Traits\Remindable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use Remindable;
    
    // ...
}
```

### 2. Create a reminder

```php
use App\Notifications\TaskDueNotification;

$user = User::find(1);
$task = Task::find(1);

// Schedule a reminder for tomorrow
$user->remindAt(
    notification: TaskDueNotification::class,
    source: $task,
    sendAt: now()->addDay(),
    data: ['custom' => 'data']
);
```

### 3. Query reminders

```php
// Get all reminders
$allReminders = $user->reminders;

// Get pending reminders (due but not sent)
$pendingReminders = $user->pendingReminders;

// Get future reminders (scheduled for later)
$futureReminders = $user->futureReminders;

// Get sent reminders
$sentReminders = $user->sentReminders;

// Check if user has pending reminders
if ($user->hasPendingReminders()) {
    // ...
}
```

### 4. Remove reminders

```php
// Remove reminders for a specific source
$user->removeReminder($task);

// Remove all pending reminders
$user->removePendingReminders();
```

### 5. Send reminders

Set up a scheduled task in your `routes/console.php`:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('reminders:send')->everyFiveMinutes();
```

Or manually send reminders:

```bash
# Send all pending reminders
php artisan reminders:send

# Limit the number of reminders to send
php artisan reminders:send --limit=100

# Dry run (see what would be sent without actually sending)
php artisan reminders:send --dry-run
```

### 6. Automatic pruning

Enable automatic pruning of sent reminders by adding to your `routes/console.php`:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('model:prune')->daily();
```

Sent reminders older than the configured `prune_after_days` will be automatically deleted.

## Advanced Usage

### Custom Notification Data

You can store any custom data with your reminders:

```php
$user->remindAt(
    notification: CustomNotification::class,
    source: $task,
    sendAt: now()->addHours(2),
    data: [
        'priority' => 'high',
        'category' => 'urgent',
        'custom_field' => 'value',
    ]
);
```

Access the data in your notification:

```php
class CustomNotification extends Notification
{
    public function __construct(
        public Model $source,
        public array $data
    ) {}
    
    public function toMail($notifiable)
    {
        $priority = $this->data['priority'] ?? 'normal';
        
        return (new MailMessage)
            ->subject("Task Reminder - Priority: {$priority}")
            ->line($this->data['custom_field']);
    }
}
```

### Notification Constructor Patterns

The package supports flexible notification constructors. Here are all possible patterns:

#### 1. Constructor with Source Only

```php
class SimpleNotification extends Notification
{
    public function __construct(
        public Model $source
    ) {}
}

// Usage
$user->remindAt(
    notification: SimpleNotification::class,
    source: $task,
    sendAt: now()->addDay()
);
```

#### 2. Constructor with Source and Data

```php
class DataNotification extends Notification
{
    public function __construct(
        public Model $source,
        public array $data
    ) {}
}

// Usage
$user->remindAt(
    notification: DataNotification::class,
    source: $task,
    sendAt: now()->addDay(),
    data: ['priority' => 'high']
);
```

#### 3. Constructor with Data Only

```php
class DataOnlyNotification extends Notification
{
    public function __construct(
        public array $data
    ) {}
}

// Usage
$user->remindAt(
    notification: DataOnlyNotification::class,
    sendAt: now()->addDay(),
    data: ['message' => 'Custom reminder']
);
```

#### 4. No Constructor Parameters

```php
class StaticNotification extends Notification
{
    // No constructor needed
    
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->line('Static reminder message');
    }
}

// Usage
$user->remindAt(
    notification: StaticNotification::class,
    sendAt: now()->addDay()
);
```

#### 5. Constructor with Custom Parameters

```php
class CustomNotification extends Notification
{
    public function __construct(
        public string $title,
        public int $priority = 1
    ) {}
}

// Usage - Custom parameters are passed via data array
$user->remindAt(
    notification: CustomNotification::class,
    sendAt: now()->addDay(),
    data: [
        'title' => 'Important Task',
        'priority' => 5
    ]
);
```



### Direct Model Access

You can also work with the `Reminder` model directly:

```php
use AAEngineering\ScheduledReminders\Models\Reminder;

// Find all pending reminders across the system
$pending = Reminder::whereNull('sent_at')
    ->where('send_at', '<=', now())
    ->get();

// Find reminders for a specific source
$taskReminders = Reminder::where('source_type', Task::class)
    ->where('source_id', $taskId)
    ->get();
```

### Using with Queues

Your notification classes can implement `ShouldQueue` as usual:

```php
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class TaskDueNotification extends Notification implements ShouldQueue
{
    // This notification will be queued when sent
}
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [AA Engineering Kft](https://github.com/AA-ENGINEERING-Kft)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
