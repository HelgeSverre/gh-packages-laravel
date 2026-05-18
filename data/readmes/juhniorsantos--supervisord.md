# Laravel Supervisord

A simple and elegant Laravel package for managing Supervisor (supervisord) workers. List, start, stop, restart, create and delete workers directly from Laravel using Artisan commands or the Facade.

## Features

- **List workers** - View status of all workers or specific groups
- **Control workers** - Start, stop and restart workers individually or in bulk
- **Manage configurations** - Create, update and delete worker configuration files
- **Artisan commands** - Full CLI support for all operations
- **Facade & DI** - Use the Facade or inject the interface
- **Laravel 10, 11 & 12** - Compatible with the latest Laravel versions
- **No database required** - Works directly with supervisorctl

## Requirements

- PHP 8.1+
- Laravel 10.0+, 11.0+ or 12.0+
- Supervisor installed on the system

## Installation

```bash
composer require juhniorsantos/supervisord
```

The package will auto-register its service provider and facade.

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=supervisord-config
```

This will create `config/supervisord.php`:

```php
return [
    'supervisorctl_path' => env('SUPERVISORD_CTL_PATH', '/usr/bin/supervisorctl'),
    'config_path' => env('SUPERVISORD_CONFIG_PATH', '/etc/supervisor/conf.d'),
    'config_extension' => '.conf',
    'timeout' => env('SUPERVISORD_TIMEOUT', 30),
    'default_worker_config' => [
        'command' => 'php artisan queue:work',
        'autostart' => true,
        'autorestart' => true,
        'numprocs' => 1,
        'redirect_stderr' => true,
    ],
];
```

### Environment Variables

Add these to your `.env` file as needed:

```env
SUPERVISORD_CTL_PATH=/usr/bin/supervisorctl
SUPERVISORD_CONFIG_PATH=/etc/supervisor/conf.d
SUPERVISORD_TIMEOUT=30
```

### Permissions

If you encounter a permission error like:

```
Permission denied: file: /usr/lib/python3/dist-packages/supervisor/xmlrpc.py
```

You need to configure the supervisor socket to allow access to your web server user.

#### Configure supervisor socket permissions

Edit the supervisor configuration file:

```bash
sudo nano /etc/supervisor/supervisord.conf
```

Find the `[unix_http_server]` section and change it to allow access to the `www-data` group:

```ini
[unix_http_server]
file=/var/run/supervisor.sock
chmod=0770
chown=root:www-data
```

Or for Laravel Forge, use the `forge` group:

```ini
[unix_http_server]
file=/var/run/supervisor.sock
chmod=0770
chown=root:forge
```

Then restart supervisor:

```bash
sudo systemctl restart supervisor
```

Verify the permissions:

```bash
ls -la /var/run/supervisor.sock
# Should show: srwxrwx--- 1 root www-data (or forge)
```

## Usage

### Artisan Commands

#### List all workers

```bash
php artisan supervisord:status
```

#### Check status of a specific worker

```bash
php artisan supervisord:status worker:worker_00
```

#### Check status of a worker group

```bash
php artisan supervisord:status "my-group:*"
# or
php artisan supervisord:status my-group --group
```

#### Start workers

```bash
# Start a single worker
php artisan supervisord:start worker:worker_00

# Start multiple workers
php artisan supervisord:start worker1:worker1_00 worker2:worker2_00

# Start a group
php artisan supervisord:start "my-group:*"

# Start all workers
php artisan supervisord:start --all
```

#### Stop workers

```bash
php artisan supervisord:stop worker:worker_00
php artisan supervisord:stop --all
```

#### Restart workers

```bash
# Restart a single worker
php artisan supervisord:restart worker:worker_00

# Restart multiple workers
php artisan supervisord:restart worker1:worker1_00 worker2:worker2_00

# Restart all workers
php artisan supervisord:restart --all
```

#### Create a new worker

```bash
php artisan supervisord:create my-worker \
    --command="php artisan queue:work redis --queue=high" \
    --numprocs=3 \
    --directory=/var/www/app \
    --autostart \
    --autorestart
```

#### Delete a worker

```bash
php artisan supervisord:delete my-worker

# Skip confirmation
php artisan supervisord:delete my-worker --force
```

### Facade Usage

```php
use JuhniorSantos\Supervisord\Facades\Supervisord;

// List all workers
$workers = Supervisord::all();

// Get status of a specific worker
$worker = Supervisord::status('worker:worker_00');
echo $worker->status->value; // RUNNING, STOPPED, etc.
echo $worker->pid;
echo $worker->uptime;

// Get status of a worker group
$group = Supervisord::groupStatus('my-group');
echo $group->runningCount();
echo $group->stoppedCount();

// Start/Stop/Restart workers
Supervisord::start('worker:worker_00');
Supervisord::stop('worker:worker_00');
Supervisord::restart('worker:worker_00');

// Restart multiple workers
$results = Supervisord::restartMany([
    'worker1:worker1_00',
    'worker2:worker2_00',
]);
// Returns: ['worker1:worker1_00' => true, 'worker2:worker2_00' => true]

// Create a new worker
Supervisord::create('my-worker', [
    'command' => 'php artisan queue:work redis --queue=high',
    'numprocs' => 3,
    'directory' => '/var/www/app',
    'autostart' => true,
    'autorestart' => true,
]);

// Update an existing worker
Supervisord::update('my-worker', [
    'numprocs' => 5,
]);

// Delete a worker
Supervisord::delete('my-worker');

// Reload supervisor configuration
Supervisord::reread();
Supervisord::reload();

// Bulk operations
Supervisord::startAll();
Supervisord::stopAll();
Supervisord::restartAll();

// Get all groups
$groups = Supervisord::groups();

// Check if worker exists
if (Supervisord::exists('worker:worker_00')) {
    // ...
}

// Check if configuration file exists
if (Supervisord::configExists('my-worker')) {
    // ...
}
```

### Dependency Injection

```php
use JuhniorSantos\Supervisord\Contracts\SupervisorInterface;

class MyController
{
    public function __construct(
        protected SupervisorInterface $supervisor
    ) {}

    public function index()
    {
        $workers = $this->supervisor->all();
        // ...
    }
}
```

## DTOs

### Worker

```php
use JuhniorSantos\Supervisord\DTOs\Worker;

$worker = Supervisord::status('worker:worker_00');

$worker->name;        // Full name (e.g., "worker:worker_00")
$worker->group;       // Group name (e.g., "worker")
$worker->processName; // Process name (e.g., "worker_00")
$worker->status;      // WorkerStatus enum
$worker->pid;         // Process ID (nullable)
$worker->uptime;      // Uptime string (nullable)

$worker->isRunning(); // bool
$worker->isStopped(); // bool
$worker->hasError();  // bool
$worker->fullName();  // "group:processName"
$worker->toArray();   // Array representation
```

### WorkerGroup

```php
use JuhniorSantos\Supervisord\DTOs\WorkerGroup;

$group = Supervisord::groupStatus('my-group');

$group->name;           // Group name
$group->workers;        // Collection of Worker objects
$group->count();        // Total workers
$group->runningCount(); // Running workers
$group->stoppedCount(); // Stopped workers
$group->errorCount();   // Workers with errors
$group->allRunning();   // bool
$group->allStopped();   // bool
$group->hasErrors();    // bool
$group->getWorkerNames(); // Array of full names
$group->toArray();      // Array representation
```

### WorkerStatus Enum

```php
use JuhniorSantos\Supervisord\Enums\WorkerStatus;

WorkerStatus::RUNNING;
WorkerStatus::STOPPED;
WorkerStatus::STARTING;
WorkerStatus::STOPPING;
WorkerStatus::FATAL;
WorkerStatus::EXITED;
WorkerStatus::BACKOFF;
WorkerStatus::UNKNOWN;

$status->isRunning();      // bool
$status->isStopped();      // bool
$status->isError();        // bool
$status->isTransitioning(); // bool
$status->color();          // Color for CLI output
```

## Exception Handling

```php
use JuhniorSantos\Supervisord\Exceptions\SupervisorException;
use JuhniorSantos\Supervisord\Exceptions\WorkerNotFoundException;
use JuhniorSantos\Supervisord\Exceptions\ConfigurationException;

try {
    $worker = Supervisord::status('non-existent:worker');
} catch (WorkerNotFoundException $e) {
    // Worker not found
} catch (ConfigurationException $e) {
    // Configuration error
} catch (SupervisorException $e) {
    // General supervisor error
}
```
