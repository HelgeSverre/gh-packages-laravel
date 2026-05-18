# Laravel Runner

Run system runners via jobs with a migration-like structure. Track runner execution, support database transactions, and run runners via queue or synchronously. Now with PHP 8 Attribute support!

## Features

- **Migration-like runners** - Tasks run in filename order and are tracked in the database
- **PHP 8 Attributes** - Configure runners using modern PHP attributes (optional)
- **Transaction support** - Optionally wrap runners in database transactions
- **Queue support** - Run via queue or synchronously
- **Progress tracking** - Track status, output, errors, and timing
- **Idempotent** - Won't re-run completed runners
- **Per-runner queue** - Specify different queues per runner
- **Artisan commands** - Create and run runners via CLI

## Installation

Install via Composer:

```bash
composer require adeildo-jr/laravel-runner
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag="runner-config"
```

Publish and run the migration:

```bash
php artisan vendor:publish --tag="runner-migrations"
php artisan migrate
```

Create the `Runner` model in your application (if it doesn't exist):

```bash
# Copy the stub to your app/Models directory
cp vendor/adeildo-jr/laravel-runner/stubs/RunnerModel.stub app/Models/Runner.php
```

## Configuration

The configuration file `config/runner.php` contains:

```php
return [
    // Path where runners are stored
    'path' => env('RUNNER_PATH', app_path('Runners')),

    // Namespace for runners
    'namespace' => env('RUNNER_NAMESPACE', 'App\\Runners'),

    // Base class that runners must extend
    'base_class' => AdeildoJr\Runner\Runner::class,

    // Eloquent model for tracking runners
    'model' => App\Models\Runner::class,

    // Database table name
    'table' => env('RUNNER_TABLE', 'runners'),
];
```

## Usage

### Creating a Task

Use the artisan command to create a new runner:

```bash
php artisan make:runner SendWelcomeEmails
```

This creates a new runner class in `app/Runners/SendWelcomeEmails.php`.

### Two Ways to Configure Tasks

You can configure runners using either **class properties** (traditional) or **PHP 8 Attributes** (modern). Attributes take precedence over properties when both are present.

#### Option 1: Class Properties (Traditional)

```php
<?php

namespace App\Runners;

use AdeildoJr\Runner\Runner;

class SendWelcomeEmails extends Runner
{
    protected ?string $name = 'send-welcome-emails';
    protected bool $queue = true;
    protected ?string $queueName = 'emails';
    protected bool $useTransaction = true;

    public function run(): ?string
    {
        User::whereNull('welcome_email_sent')->chunk(100, function ($users) {
            foreach ($users as $user) {
                $user->notify(new WelcomeEmail());
                $user->update(['welcome_email_sent' => true]);
            }
        });

        return 'Welcome emails sent to all users';
    }

    public function down(): void
    {
        User::whereNotNull('welcome_email_sent')
            ->update(['welcome_email_sent' => null]);
    }
}
```

#### Option 2: PHP 8 Attributes

```php
<?php

namespace App\Runners;

use AdeildoJr\Runner\Attributes\ShouldQueue;
use AdeildoJr\Runner\Attributes\RunnerName;
use AdeildoJr\Runner\Attributes\RunnerQueue;
use AdeildoJr\Runner\Attributes\UseTransaction;
use AdeildoJr\Runner\Runner;

#[RunnerName('send-welcome-emails')]
#[ShouldQueue(true)]
#[RunnerQueue('emails')]
#[UseTransaction(true)]
class SendWelcomeEmails extends Runner
{
    public function run(): ?string
    {
        User::whereNull('welcome_email_sent')->chunk(100, function ($users) {
            foreach ($users as $user) {
                $user->notify(new WelcomeEmail());
                $user->update(['welcome_email_sent' => true]);
            }
        });

        return 'Welcome emails sent to all users';
    }

    public function down(): void
    {
        User::whereNotNull('welcome_email_sent')
            ->update(['welcome_email_sent' => null]);
    }
}
```

#### Option 3: Mixed Approach

You can mix both approaches. Attributes override properties:

```php
<?php

namespace App\Runners;

use AdeildoJr\Runner\Attributes\RunnerName;
use AdeildoJr\Runner\Runner;

#[RunnerName('custom-name')] // This takes precedence over the property
class MyTask extends Runner
{
    protected ?string $name = 'default-name'; // Ignored because attribute is present
    protected bool $queue = false; // Used because no attribute

    public function run(): ?string
    {
        return 'Task executed';
    }

    public function down(): void
    {
    }
}
```

### Available Attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| `#[RunnerName('name')]` | Set the runner name | `#[RunnerName('send-emails')]` |
| `#[ShouldQueue(bool)]` | Enable/disable queuing | `#[ShouldQueue(false)]` |
| `#[RunnerQueue('name')]` | Specify queue name | `#[RunnerQueue('high-priority')]` |
| `#[UseTransaction(bool)]` | Enable/disable transactions | `#[UseTransaction(false)]` |
| `#[Skippable(bool)]` | Skip this runner from running | `#[Skippable]` or `#[Skippable(true)]` |

### Running Tasks

Run all pending runners:

```bash
php artisan runner:go
```

Run a specific runner:

```bash
php artisan runner:go --runner="App\Runners\SendWelcomeEmails"
```

Run synchronously (without queue):

```bash
php artisan runner:go --sync
```

### Dispatching from Code

```php
use AdeildoJr\Runner\Jobs\RunRunnersJob;

// Run all pending runners
RunRunnersJob::dispatch();

// Run a specific runner
RunRunnersJob::dispatch(App\Runners\SendWelcomeEmails::class);
```

## Task Options

Each runner class supports the following options:

| Option | Property | Attribute | Default | Description |
|--------|----------|-----------|---------|-------------|
| Name | `$name` | `#[RunnerName]` | `null` | Custom runner name (defaults to class name) |
| Queue | `$queue` | `#[ShouldQueue]` | `true` | Whether to run via queue |
| Queue Name | `$queueName` | `#[RunnerQueue]` | `null` | The queue name to use |
| Transaction | `$useTransaction` | `#[UseTransaction]` | `true` | Wrap runner in database transaction |
| Skippable | `$skippable` | `#[Skippable]` | `false` | Skip this runner from running |

**Priority:** Attributes > Properties > Defaults

### Customizing Task Names

The runner name is auto-generated from the class name using kebab-case:

- `SendWelcomeEmails` → `send-welcome-emails`
- `CleanUpOldDataTask` → `clean-up-old-data` (Task suffix removed)

Override with property:

```php
protected ?string $name = 'custom-runner-name';
```

Or with attribute:

```php
#[RunnerName('custom-runner-name')]
```

### Database Transactions

Enable database transactions for data integrity:

**Using property:**
```php
protected bool $useTransaction = true;
```

**Using attribute:**
```php
#[UseTransaction(true)]
```

When enabled, the entire runner runs within a database transaction. If the runner fails, all changes are rolled back.

### Queue Configuration

**Disable queuing (run synchronously):**

Using property:
```php
protected bool $queue = false;
```

Using attribute:
```php
#[ShouldQueue(false)]
```

**Specify a custom queue:**

Using property:
```php
protected ?string $queueName = 'high-priority';
```

Using attribute:
```php
#[RunnerQueue('high-priority')]
```

### Skippable Tasks

Sometimes you may want to temporarily disable a runner without deleting it. Mark a runner as skippable to exclude it from execution:

**Using property:**
```php
protected bool $skippable = true;
```

**Using attribute:**
```php
#[Skippable]
// or explicitly
#[Skippable(true)]
```

**Use cases:**
- Temporarily disabling a problematic runner
- Conditional runner execution based on environment
- Feature-flagging runners during development

**Note:** Skipped runners are not tracked in the database at all. They are silently ignored during runner discovery.

## Database Schema

The `runners` table tracks all runner executions:

| Column | Type | Description |
|--------|------|-------------|
| `id` | `bigint` | Primary key |
| `runner_class` | `string` | Fully qualified class name (unique) |
| `status` | `enum` | `pending`, `running`, `completed`, or `failed` |
| `output` | `text` | Task output/result (nullable) |
| `error` | `text` | Error message if failed (nullable) |
| `started_at` | `timestamp` | When runner started (nullable) |
| `completed_at` | `timestamp` | When runner completed (nullable) |
| `failed_at` | `timestamp` | When runner failed (nullable) |
| `created_at` | `timestamp` | Record creation time |
| `updated_at` | `timestamp` | Record update time |

## Task Execution Flow

1. **Discovery** - The job scans the configured runners directory for PHP files
2. **Filtering** - Abstract classes and non-runner classes are skipped
3. **Tracking** - Each runner is tracked in the `runners` table
4. **Execution** - Tasks are executed in filename order
5. **Status Updates** - Status is updated throughout execution:
   - `pending` → `running` → `completed`/`failed`

## Available Commands

| Command | Description |
|---------|-------------|
| `make:runner <name>` | Create a new system runner class |
| `runner:go` | Run all pending runners |
| `runner:go --runner=<class>` | Run a specific runner |
| `runner:go --sync` | Run runners synchronously |
| `runner:retry` | Retry failed runners |
| `runner:retry --runner=ClassName` | Retry specific failed runner |
| `runner:retry --sync` | Retry synchronously |

## Testing

Run the test suite:

```bash
composer test
```

Run tests with coverage:

```bash
vendor/bin/pest --coverage
```

## Advanced Usage

### Task Output

Return data from your runner to store in the database:

```php
public function run(): ?string
{
    $count = User::count();
    
    return "Processed {$count} users";
}
```

### Rollback Support

Implement the `down()` method to reverse a runner:

```php
public function down(): void
{
    // Undo the changes made by run()
    User::where('processed_at', today())->update(['processed_at' => null]);
}
```

### Manual Task Registration

You can manually register a runner as completed:

```php
use App\Models\Runner;

Runner::create([
    'runner_class' => App\Runners\MyTask::class,
    'status' => 'completed',
    'completed_at' => now(),
]);
```

### Events

The package dispatches events during the runner lifecycle:

#### RunnerStarted

Fired when a runner begins execution:

```php
use AdeildoJr\Runner\Events\RunnerStarted;

Event::listen(RunnerStarted::class, function (RunnerStarted $event) {
    // $event->runner - The runner instance
    // $event->model - The database model
    
    Log::info("Runner started: {$event->runner->getName()}");
});
```

#### RunnerFinished

Fired when a runner completes successfully:

```php
use AdeildoJr\Runner\Events\RunnerFinished;

Event::listen(RunnerFinished::class, function (RunnerFinished $event) {
    // $event->runner - The runner instance
    // $event->model - The database model
    // $event->output - The output from the runner
    
    Log::info("Runner finished: {$event->runner->getName()}", [
        'output' => $event->output,
    ]);
});
```

#### RunnerFailed

Fired when a runner fails:

```php
use AdeildoJr\Runner\Events\RunnerFailed;

Event::listen(RunnerFailed::class, function (RunnerFailed $event) {
    // $event->runner - The runner instance
    // $event->model - The database model
    // $event->exception - The exception that caused the failure
    
    Log::error("Runner failed: {$event->runner->getName()}", [
        'error' => $event->exception->getMessage(),
    ]);
});
```

All events implement Laravel's `ShouldQueue` interface by default, so they can be queued for async processing.

## Architecture

```
┌─────────────────────────────────────┐
│         runner:go Command           │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│      RunRunnersJob (Queue)      │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Task Discovery (File System)      │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Task Configuration                 │
│  (Attributes > Properties)          │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Task Execution (with transaction)  │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│    Database (runners table)    │
└─────────────────────────────────────┘
```

## Requirements

- PHP ^8.2
- Laravel ^11.0 || ^12.0

## License

MIT License. See [LICENSE](LICENSE) for details.
