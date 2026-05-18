# NHT Queue Monitor (Queue Pulse)

[![Latest Version on Packagist](https://img.shields.io/packagist/v/nht/queue-monitor.svg?style=flat-square)](https://packagist.org/packages/nht/queue-monitor)
[![Total Downloads](https://img.shields.io/packagist/dt/nht/queue-monitor.svg?style=flat-square)](https://packagist.org/packages/nht/queue-monitor)
[![License](https://img.shields.io/packagist/l/nht/queue-monitor.svg?style=flat-square)](https://packagist.org/packages/nht/queue-monitor)

NHT Queue Monitor is a modern, enterprise-grade queue monitoring package for Laravel. Designed as a powerful alternative to Laravel Horizon, it provides deep insights into your queue system with a beautiful dark UI, real-time capabilities, and advanced diagnostics.

## 🚀 Features

- **Comprehensive Dashboard**: Real-time metrics and failure charts.
- **Failed Job Management**: 
    - **AI-Powered Failure Insight**: Get automatic root-cause analysis for failed jobs using OpenAI or Anthropic.
    - **Payload Editor on Retry**: Modify job parameters directly from the UI before retrying a job.
    - **Job Batch & Chain Flow**: Visualize relationships between jobs in the same batch or chain.
    - Detailed payload and exception viewer.
    - Single/Bulk Retry and Delete actions.
    - Clear all functionality with premium dark-themed confirmation modals.
- **Advanced Filtering**: Grid-based filtering by date, queue, connection, and keyword search.
- **Smart Tracking**: 
    - Track both successful and failed jobs.
    - Customizable data retention (pruning).
- **Advanced Alerting**: 
    - Threshold-based alerts (e.g., alert if >20 failures in 1h).
    - Multi-channel notifications (Mail, Slack).
- **Security & Access Control**: 
    - Email-based allowlist.
    - Integrated Laravel Gate support.
- **Enterprise Ready**: 
    - Multi-tenant support.
    - Real-time broadcasting (Reverb, Pusher, Soketi).
    - CSV/Export capabilities.
    - Audit logs for all monitor actions.

## 📦 Installation

```bash
composer require nht/queue-monitor
```

### Finalize Installation
Run the following commands to publish assets and migrate:
```bash
php artisan nht-queue-monitor:published --force
php artisan migrate
```

### Uninstallation
If you need to remove the package and its assets:
```bash
php artisan nht-queue-monitor:remove
```

## ⚙️ Configuration

The package can be configured entirely via environment variables in your `.env` file.

| Variable | Default | Description |
|----------|---------|-------------|
| `QUEUE_MONITOR_ENABLED` | `true` | Enable/Disable the monitor. |
| `QUEUE_MONITOR_AI_ENABLED` | `false` | Enable AI-powered failure analysis. |
| `QUEUE_MONITOR_AI_PROVIDER` | `openai` | AI provider (`openai` or `anthropic`). |
| `QUEUE_MONITOR_AI_KEY` | `null` | Your AI provider API key. |
| `QUEUE_MONITOR_ROUTE_PREFIX` | `queue-monitor` | URL path for the dashboard. |
| `QUEUE_MONITOR_ALLOWED_EMAILS` | `null` | Comma-separated emails for access. |
| `QUEUE_MONITOR_ENABLE_GATE` | `false` | Enable Laravel Gate protection. |
| `QUEUE_MONITOR_TRACK_SUCCESSFUL_JOBS` | `false` | Log successful jobs to DB. |
| `QUEUE_MONITOR_STORE_JOB_PAYLOAD` | `false` | Save full payload for all jobs. |
| `QUEUE_MONITOR_JOB_RETENTION_DAYS` | `30` | Auto-delete records older than X days. |
| `QUEUE_MONITOR_ALERTS_ENABLED` | `true` | Enable threshold-based alerting. |
| `QUEUE_MONITOR_NOTIFICATIONS_ENABLED` | `false` | Enable Slack/Mail notifications. |
| `QUEUE_MONITOR_BROADCAST_ENABLED` | `false` | Enable real-time UI updates. |

## 🛡️ Security

### Email Access
Add specific users who can access the dashboard:
```env
QUEUE_MONITOR_ALLOWED_EMAILS=admin@example.com,dev@nht.com
```

### Laravel Gate
For complex authorization, enable the Gate in `.env`:
```env
QUEUE_MONITOR_ENABLE_GATE=true
```
Then define the `viewQueueMonitor` gate in your `AuthServiceProvider`:
```php
Gate::define('viewQueueMonitor', function ($user) {
    return $user->isAdmin(); 
});
```

## ⏰ Scheduling & Maintenance

To keep your dashboard clean and receive alerts, add these to your `app/Console/Kernel.php` (or `routes/console.php` in Laravel 11+):

```php
// Check for alert thresholds every 5 minutes
$schedule->command('queue-monitor:check-alerts')->everyFiveMinutes();

// Run health checks every 10 minutes
$schedule->command('queue-monitor:health')->everyTenMinutes();

// Prune old data daily
$schedule->command('queue-monitor:prune')->daily();
```

## 📊 Usage

Once installed, visit `/queue-monitor` in your browser.

- **Dashboard**: High-level overview of your queue health.
- **Failed Jobs**: The core workstation for inspecting and resolving issues.
- **Audit Logs**: See who retried or deleted which job and when.
- **System**: Detailed diagnostics of your worker nodes.

## 🤖 AI Failure Analysis

Queue Pulse integrates with OpenAI and Anthropic to provide intelligent insights into your failed jobs.

### Setup
1. Enable the feature in your `.env`:
```env
QUEUE_MONITOR_AI_ENABLED=true
QUEUE_MONITOR_AI_PROVIDER=openai # or anthropic
QUEUE_MONITOR_AI_KEY=your-api-key-here
```
2. (Optional) Customize the model:
```env
QUEUE_MONITOR_AI_MODEL=gpt-4o-mini
```

### How to Use
1. Navigate to the **Failed Jobs** list.
2. Click **View** on any failed job.
3. Click the **AI Analysis** button in the header.
4. The system will send the job name, exception, and payload to the AI to generate a root-cause analysis and a suggested fix.

## 🛠️ Payload Editor (Edit & Retry)

Sometimes a job fails because of a typo or missing data. You can fix it without leaving the dashboard:

1. Click **View** on a failed job.
2. Click **Edit & Retry** in the header.
3. Modify the JSON payload in the modal.
4. Click **Update & Retry Now**.

The job will be updated in the database and immediately pushed back to the queue with your new data.

## 🔌 API Reference

Queue Pulse provides a lightweight JSON API for external integrations or custom dashboards.

### Live Feed
Returns the latest failed jobs and monitor events.
- **Endpoint**: `GET /queue-monitor/api/live`
- **Response**:
```json
{
  "failed_jobs": [...],
  "events": [...]
}
```

### Failure Trends
Returns data for generating charts.
- **Endpoint**: `GET /queue-monitor/api/trend?days=7`
- **Parameters**: 
    - `days` (optional): Number of days to include (default: 7).
- **Response**:
```json
{
  "labels": ["2026-04-25", "2026-04-26", ...],
  "values": [5, 12, ...]
}
```

## 🤝 Contributing
Contributions are welcome! Please feel free to submit Pull Requests.

## 📜 License
The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
