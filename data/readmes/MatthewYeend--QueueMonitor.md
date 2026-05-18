# Queue Monitor

A Laravel package for real-time monitoring of queues with stats on processing time, failed jobs, and retry status.

--- 

## Features
- Real-time queue monitoring.
- Detailed stats on processing time and retries.
- Notifications for failed jobs.

--- 

## Installation
1. Require the package via Composer
    ```bash
    composer require MattYeend/queue-monitor
    ```
2. Publish the configuration, views, and migrations: 
    ```bash
    php artisan vendor:publish --provider="MattYeend\QueueMonitoring\QueueMonitoringServiceProvider"
    ```
3. Run the migrations to create the necessary database table:
    ```bash
    php artisan migrate
    ```
4. Access the dashboard at `/queue-monitor` (or a custom route if configured)

---

## Usage
1. Queue Monitoring Dashboard
Once installed, the package provides a monitoring dashboard accessible at `/queue-monitor` (or a custom route specified in `config/queue-monitor.php`). The dashboard displays:
- The list of queues being monitored.
- The number of jobs processed.
- The number of failed jobs.
- The average processing time for each queue.
2. Automatically Updating Queue Statistics
To update queue statistics after job processing: 
- Inject the `QueueMonitorService` into your job classes or relevant services.
- Use the `updateQueueStatus` method to log the queue name, processing time, and failure status.
Example Integration in a Job:
```php
use MattYeend\QueueMonitoring\Services\QueueMonitorService;

class ExampleJob implements ShouldQueue
{
    public function handle(QueueMonitorService $service)
    {
        $queueName = 'example-queue';
        $startTime = microtime(true);

        try {
            // Performs job processing
        } catch (\Exception $e) {
            $service->updateQueueStatus($queueName, 0, true); // Log a failed job
            throw $e;
        }

        $endTime = microtime(true);
        $processingTime = ($endTime - $StartTime) * 1000; // Convert to milliseconds
        $service->updateQueueStatus($queueName, $processingTime, false); // Log a successful job
    }
}
```
3. Customising the Dashboard
You can customise the dashboard view by modifying the published Blade file
`resources/views/vendor/queue-monitor/dashboard.blade.php`
4. Custom Route
The change the route for the dashboard, edit the `dashboard_route` value in the configuration file
`'dashboard_route' => '/admin/queue-status'`
5. Notifications for Failed Jobs
To enable email notifications for failed jobs:
- Add the following to your `.env` file:
`QUEUE_MONITOR_NOTIFICATION_EMAIL=devops@yourcompany.com`
- The configured email address will receive alerts whenever a job fails in a monitored queue.

---

## Configuration
### `.env` File
To configure email notifications for failed jobs, add the following line to your `.env` file:
```ini
QUEUE_MONITOR_NOTIFICATION_EMAIL=devops@yourcompany.com
```
This will be used to send notifications for failed jobs. If not set, it will default to `admin@example.com`.
### Custom Dashboard Route
To change the default URL route, modify the `config/queue-monitor.php` file. For example
```php
'dashboard_route' => '/admin/queue-status',
```

---

## Tests
### Setting Up the Test Environment
1. Install Dependencies
```bash
composer install
```
2. Configure your environment
Ensure your `.env` file is set up for testing. By default, the `TestCase` class configures an in-memory SQLite database for testing, so no additional setup is required.

### Running the Test
1. Run all tests
```bash
php artisan test
```
or:
```bash
./vendor/bin/phpunit
```

---

## License
This package is licensed under the MIT License.

---

## Contributing
Feel free to fork the repository and submit pull requests for improvements or new features!
