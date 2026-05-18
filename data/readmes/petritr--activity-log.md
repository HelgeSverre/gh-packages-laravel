# Laravel Activity Log

A small high-performance activity logging package for Laravel.  
Easily track user actions, record model changes via polymorphic subjects, and store custom metadata. Designed for simplicity and flexibility, it supports both synchronous and asynchronous (queued) logging out of the box.

Key Features:
- **Fluent API**: Log activities using a clean, readable facade.
- **Polymorphic Subjects**: Link activities to any Eloquent model automatically.
- **Data Snapshots**: Automatically capture specific model attributes at the time of logging.
- **Queue Support**: Offload logging to background workers for better application performance.
- **Customizable**: Configurable fields, silent failure options, and more.

---

## Installation

Install via Composer:

```bash
composer require petritr/activity-log
```
Publish the config file:

```bash
php artisan vendor:publish --tag=activity-log-config
```


Run migrations:

```bash
php artisan migrate
```

## Configuration
The package comes with a default configuration. You can customize it in `config/activity-log.php`.

You can also use environment variables in your `.env` file:
```bash
ACTIVITY_LOG_ENABLED=true
ACTIVITY_LOG_QUEUE_ENABLED=false
ACTIVITY_LOG_QUEUE=activity-logs
```

### Config File Options:
config/activity-log.php:

```bash
return [
    // Enable/disable logging globally
    'enabled' => true,

    // Enable/disable logging via queue
    'queue_enabled' => false,
];
```

## Usage
Using the Facade (recommended)

```bash
use Petritr\ActivityLog\Facades\ActivityLog;

// Log a simple action
ActivityLog::action('user.login')->log();

// Log with a subject
ActivityLog::action('project.updated')
    ->subject($project)
    ->log();

// Log with metadata
ActivityLog::action('order.created')
    ->withMetadata(['total' => 99.90, 'items' => ['apple', 'banana']])
    ->log();
```

## Subject Snapshots
You can log a snapshot of any model or object:

```bash
ActivityLog::action('user.updated')
    ->subject($user)
    ->log();
    
```
The snapshot is stored in JSON format (subject_snapshot) in the database.

## Queue Support
Enable queueing in config/activity-log.php:

```bash
'queue_enabled' => true,
```
Your activity will be dispatched to the queue using a Laravel Job.
 
## License
MIT License.

