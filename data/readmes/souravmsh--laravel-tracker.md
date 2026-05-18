# Laravel Tracker

A robust Laravel package for tracking referrals and visitors with advanced analytics, widgets, and a dashboard. This package allows you to track referral codes, UTM parameters, visitor data, and provides a user-friendly interface to visualize referral performance.

## Features

- **Modern & Industrial UI**: Compact, dark theme with a focus on technical data visualization.
- **Ultra-Fast Analytics**: 
    - **Dashboard Caching**: Intelligent caching for analytics reports with configurable TTL.
    - **Indexed Queries**: Optimized SQL for maximum throughput on large data sets.
    - **Settings Caching**: Global settings are cached to eliminate redundant database calls.
- **Asynchronous Tracking**: 
    - **Queue Support**: Offload database writes and geocoding API calls to background jobs.
    - **Geocoding**: Integrated IP-to-country mapping via queueable listeners.
- **Route Customization**: Fully customizable URL prefixes and middleware-based access control.
- **Modern Analytics**: Modern GA4 Measurement Protocol integration for lightweight tracking.
- **Zero CDN Dependency**: All assets (Bootstrap, Icons, Fonts) are hosted locally.

## Requirements

- PHP >= 8.2
- Laravel 10.x, 11.x, 12.x, or 13.x
- MySQL / PostgreSQL / SQLite
- Redis (recommended for caching and rate limiting)

## Installation

1. **Install via Composer**

   ```bash
   composer require souravmsh/laravel-tracker
   ```

2. **Run the Install Command**

   Publish config, migrations, and assets:

   ```bash
   php artisan tracker:install
   php artisan vendor:publish --tag=tracker-assets --force
   ```

3. **Database Setup**

   ```bash
   php artisan migrate
   ```

## Configuration

The configuration is located at `config/tracker.php`. Most settings can also be updated at runtime via the **/tracker/settings** dashboard.

### Route Customization
```php
'routes' => [
    'prefix'     => 'admin/analytics',
    'middleware' => ['web', 'auth', 'role:admin'],
],
```

## Usage

### Dashboard Access
By default, the analytics terminal is available at:
`http://your-app.com/tracker`

### Automated Tracking
The `TrackerMiddleware` is automatically active on the `web` group. To trigger tracking, include a referral code or UTM parameters:
`http://your-app.com?ref=CODE&utm_source=google`

## Contribution
Contributions are welcome! Please feel free to submit Pull Requests.

## License
The MIT License (MIT). Please see [License File](LICENSE.md) for more information.