# Laravel ZKTeco ADMS Server

A Laravel package implementing the ZKTeco ADMS (Attendance Data Management System) HTTP protocol for biometric attendance devices.

## Features

- **Full ADMS Protocol Support** — `/iclock/cdata`, `/iclock/getrequest`, `/iclock/devicecmd`, `/iclock/registry`, `/iclock/inspect`
- **Attendance Data Processing** — Parses ATTLOG records with multiple timestamp formats
- **Device Management** — Registration, online status tracking, stale device eviction
- **Command Queuing** — Queue and send commands to devices remotely (INFO, CHECK, user management, shell, etc.)
- **Event-Driven** — Laravel events for attendance, device info, registry, command results, and user queries
- **Database Persistence** — Eloquent models for devices, attendance logs, and command history
- **Configurable** — Body size limits, online thresholds, device limits, command queue depth, timezone support
- **Security** — Serial number validation, body size enforcement, command injection protection

## Requirements

- PHP 8.1+
- Laravel 10, 11, or 12

## Installation

```bash
composer require athwari/laravel-zkteco-adms-server
```

Publish the configuration:

```bash
php artisan vendor:publish --tag=zkteco-adms-config
```

Run the migrations:

```bash
php artisan migrate
```

## Configuration

The configuration file (`config/zkteco-adms.php`) provides:

| Option | Default | Description |
|--------|---------|-------------|
| `max_body_size` | 10MB | Max request body size in bytes |
| `online_threshold` | 120 | Seconds before device is offline |
| `max_devices` | 1000 | Max registered devices (0 = unlimited) |
| `max_commands_per_device` | 100 | Per-device command queue depth |
| `enable_inspect` | false | Enable debug endpoint |
| `default_timezone` | UTC | Fallback timezone for timestamps |
| `route_prefix` | iclock | Route prefix |
| `route_middleware` | [] | Middleware for ADMS routes |

## Device Setup

Configure your ZKTeco device ADMS settings:

- **Server Address**: `http://your-server:port`
- **Push Protocol**: ADMS

The device will communicate via:
- `GET/POST /iclock/cdata` — Attendance data
- `GET /iclock/getrequest` — Poll for commands
- `POST /iclock/devicecmd` — Command results
- `GET/POST /iclock/registry` — Registration

## Sending Commands

```php
use Athwari\ZktecoAdms\Facades\ZktecoAdms;

// Via the facade
$commands = ZktecoAdms::commands();

// Request device information
$id = $commands->sendInfoCommand('SERIAL001');

// Heartbeat check
$id = $commands->sendCheckCommand('SERIAL001');

// Add/update a user on the device
$id = $commands->sendUserAddCommand('SERIAL001', '1001', 'John Doe', 0, '12345');

// Delete a user
$id = $commands->sendUserDeleteCommand('SERIAL001', '1001');

// Query all users
$id = $commands->sendQueryUsersCommand('SERIAL001');

// Get a device option
$id = $commands->sendGetOptionCommand('SERIAL001', 'DeviceName');

// Custom command
$id = $commands->queueCommand('SERIAL001', 'CHECK');
```

## Listening to Events

```php
// In your EventServiceProvider or listener
use Athwari\ZktecoAdms\Events\AttendanceReceived;

class HandleAttendance
{
    public function handle(AttendanceReceived $event): void
    {
        foreach ($event->records as $record) {
            // $record->userId, $record->timestamp, $record->statusLabel()
        }
    }
}
```

Available events:
- `AttendanceReceived` — Attendance records from devices
- `DeviceRegistered` — Device registration/re-registration
- `DeviceInfoReceived` — Device info parameters
- `CommandResultReceived` — Command execution results
- `UserQueryReceived` — User query results

## Device Eviction

Schedule stale device cleanup:

```php
// In your console kernel
$schedule->command('zkteco:evict-stale-devices')->everyFiveMinutes();
```

## License

MIT
