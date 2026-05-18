# Laravel Optimize MCP

Optimize your Laravel project with AI assistance through the Model Context Protocol (MCP).

## Installation

Install via Composer:

```bash
composer require skylence/laravel-optimize-mcp
```

Run the installation command and follow the prompts:

```bash
php artisan optimize-mcp:install
```

The installer will:
- Automatically detect and configure your code editor (Cursor, Claude Code, VS Code, or PhpStorm)
- Ask if you want HTTP access for staging/production servers
- Generate a secure token and configuration instructions for remote access

## Usage

Once installed, ask your AI assistant to optimize your Laravel project:

**"Analyze my Laravel project and help me optimize it"**

Your AI will use the installed MCP tools to:
- Analyze your configuration for performance and security issues
- Review your project structure and development workflow
- Recommend useful packages and improvements
- Provide actionable recommendations with code snippets

## Remote Access for Staging/Production

Want to analyze your staging or production environment? The installer can configure this for you automatically, or you can set it up manually by adding these to your `.env` file:

```env
# Enable secure HTTP access
OPTIMIZE_MCP_AUTH_ENABLED=true

# Generate token: php artisan tinker --execute="echo bin2hex(random_bytes(32))"
OPTIMIZE_MCP_API_TOKEN=your-secure-token-here
```

Then ask your AI to connect to your remote server:

**"Connect to my production Laravel server at https://myapp.com and analyze the .env configuration"**

This allows you to check production environment variables, cache/session drivers, and security settings without SSH access.

## Database Monitoring & Alerts

Set up automatic database size monitoring with growth tracking and email alerts:

### Enable Monitoring

1. Add to your `.env`:
```env
OPTIMIZE_MCP_DB_MONITORING=true
OPTIMIZE_MCP_DB_NOTIFICATION_EMAILS=dev@example.com,ops@example.com
OPTIMIZE_MCP_DB_WARNING_THRESHOLD=80
OPTIMIZE_MCP_DB_CRITICAL_THRESHOLD=90
```

2. Run migrations:
```bash
php artisan migrate
```

3. Schedule the monitoring command:

**Laravel 11+ / 12** (in `bootstrap/app.php`):
```php
->withSchedule(function (Schedule $schedule): void {
    $schedule->command('optimize-mcp:monitor-database')
        ->daily()
        ->onOneServer()
        ->when(fn () => config('app.schedule_enabled', true));
})
```

**Laravel 10 and earlier** (in `app/Console/Kernel.php`):
```php
protected function schedule(Schedule $schedule)
{
    // Run database monitoring daily (or hourly, weekly, etc.)
    $schedule->command('optimize-mcp:monitor-database')->daily();
}
```

**Make schedules configurable** (recommended):

Add to `config/app.php`:
```php
'schedule_enabled' => (bool) env('APP_SCHEDULE_ENABLED', true),
```

Add to `.env`:
```env
APP_SCHEDULE_ENABLED=true  # Set to false to disable all scheduled tasks
```

This allows you to easily enable/disable schedules per environment (local, staging, production).

### Available Commands

```bash
# Check database size manually
php artisan optimize-mcp:database-size

# Run monitoring (logs size, calculates growth, sends alerts)
php artisan optimize-mcp:monitor-database

# Clean up old logs (keeps 90 days by default)
php artisan optimize-mcp:prune-database-logs
```

### Features

- **Automatic Tracking**: Logs database size, growth rate, and disk usage
- **Growth Prediction**: Estimates when your database will be full based on growth trends
- **Smart Alerts**: Email notifications at warning (80%) and critical (90%) thresholds
- **Historical Data**: Track size over time to identify growth patterns
- **Cross-Database**: Supports MySQL, PostgreSQL, and SQLite

## What's Included

- **Configuration Analyzer**: Checks your Laravel config for performance and security
- **Database Size Inspector**: Monitor database size, growth trends, and disk usage
- **Database Monitoring & Alerts**: Automatic size tracking with email notifications
- **Log File Inspector**: Check log sizes and rotation configuration (HTTP MCP only)
- **Nginx Config Inspector**: Analyze nginx for security and performance (HTTP MCP only)
- **Nginx Config Generator**: Generate production-ready nginx configs (HTTP MCP only)
- **Project Structure Analyzer**: Reviews your composer scripts, CI/CD, testing setup, and more
- **Package Advisor**: Recommends useful packages for your project

## LLM Guidelines for AI Assistants

Want your AI assistant to know how to use these MCP tools? Add the Laravel Optimize MCP guidelines to your project's LLM instruction files:

```bash
# From the root of your Laravel project
php vendor/skylence/laravel-optimize-mcp/bin/append-guidelines.php CLAUDE.md

# Or for other LLM instruction files
php vendor/skylence/laravel-optimize-mcp/bin/append-guidelines.php .cursorrules
php vendor/skylence/laravel-optimize-mcp/bin/append-guidelines.php .copilot-instructions.md
```

This appends comprehensive guidelines about:
- How to use each MCP tool
- When to use HTTP MCP vs stdio/PHP MCP tools
- Best practices for security and performance
- Configuration examples and common solutions

The script will:
- ✅ Append guidelines to existing files without overwriting
- ✅ Skip if guidelines are already present
- ✅ Create the file with guidelines if it doesn't exist

## Advanced Configuration

For remote access, HTTP endpoints, and custom tool configuration, see the [full documentation](https://github.com/skylence/laravel-optimize-mcp).

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
