# Laravel visitor Analytics 📊
A lightweight, self-hosted, and privacy-focused visitor tracking package for Laravel applications. Monitor your website traffic without relying on heavy third-party services like Google Analytics.

# 🚀 Key Features
Unique Visit Tracking: Uses a smart caching mechanism to prevent duplicate hits from page refreshes (Unique IPs per 24h).

Minimalistic Dashboard: Built-in analytics overview with Chart.js integration.

Performance Optimized: Designed to be non-intrusive and fast, ensuring your site speed remains unaffected.

Data Rich: Tracks URLs, IP addresses, User-Agents, and authenticated User IDs.

Plug & Play: Easy integration via Laravel Middleware.

# 🛠 Installation
You can install the package via composer (assuming it is hosted on GitHub or local path):
### composer require laravel-visitor-analytics/laravel-visitor-analytics

## Bash

Run the migrations to create the visits table:

Bash
php artisan migrate

# 📖 Usage
## 1. Register the Middleware
The easiest way to track visits is to apply the 'track.visits' middleware to your routes in routes/web.php:


Route::middleware(['track.visits'])->group(function () {
   Route::get('/example', [ExampleController::class, 'index']);
});

## 2. Access the Dashboard
   By default, you can view your stats at: your-domain.com/admin/analytics

# 📊 Analytics Dashboard
The dashboard provides:

Daily Traffic Trends: Visualized via a smooth line chart.

Top Pages: Discover which URLs are performing best.

Key Metrics: Total visits vs. Unique visitors.

#  🔒 Privacy & Security
This package stores data locally on your server. No data is shared with third parties, making it a great choice for GDPR compliance.

