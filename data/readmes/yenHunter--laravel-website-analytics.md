# Laravel Website Analytics

A lightweight, efficient visitor tracking package for Laravel applications. It tracks unique visitors, page views, and user locations (GeoIP) without bloating your database. It includes a dedicated database for Country Coordinates, allowing for instant generation of Vector Maps without hardcoding logic in JavaScript.

## 🚀 Features

*   **Efficient Tracking:** Groups visits by IP and Date (prevents spamming DB on every page reload).
*   **GeoIP Integration:** Automatically detects Country based on IP (via `stevebauman/location`).
*   **Bot Protection:** Ignores common bots and crawlers (configurable).
*   **Database-Backed Mapping:** Includes a pre-filled database of Country Coordinates (Lat/Long) for mapping.
*   **Dashboard Ready:** Helper methods to get formatted data for ApexCharts and Vector Maps instantly.

## Installation

You can install the package via composer:

```bash
composer require yenhunter/laravel-website-analytics
```

### 1. Run Migrations
Publish and run the migrations to create the `website_analytics` and `analytics_countries` tables:

```bash
php artisan migrate
```

### 2. Configure GeoIP
This package relies on `stevebauman/location` for country detection. Publish the config:

```bash
php artisan vendor:publish --provider="Stevebauman\Location\LocationServiceProvider"
```

### 3. Seed Country Coordinates (Important)
To populate the map with Latitude/Longitude data for countries, run the included seeder command:

```bash
php artisan analytics:seed-countries
```
*This populates the `analytics_countries` table so your vector map works immediately.*

---

## Usage

### 1. Enable Tracking
Register the Middleware in your `bootstrap/app.php` file (Laravel 11) or `Http/Kernel.php` (Laravel 10).

**bootstrap/app.php:**
```php
use Yenhunter\LaravelWebsiteAnalytics\Http\Middleware\TrackVisitor;

->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        TrackVisitor::class,
    ]);
})
```

By default, the middleware tracks routes named `visitor.*`.

### 2. Retrieving Data for Dashboard
Inject the `Analytics` class into any Controller.

```php
namespace App\Http\Controllers;

use Yenhunter\LaravelWebsiteAnalytics\Analytics;

class DashboardController extends Controller
{
    public function index(Analytics $analytics)
    {
        // Get line chart data (Last 7 days)
        $chartData = $analytics->getChartData(7); 

        // Get map data (Returns Country Name, Coords, and Visit Count)
        // Format: [{ name: 'USA', coords: [37.09, -95.71], visits: 500 }, ...]
        $mapData = $analytics->getMapData();

        return view('admin.dashboard', compact('chartData', 'mapData'));
    }
}
```

---

## Frontend Examples

### 1. Line Chart (ApexCharts)
The `getChartData()` method returns arrays perfectly formatted for ApexCharts.

```blade
<div id="traffic-chart"></div>

<script>
    var options = {
        chart: { type: 'line', height: 350 },
        series: [{
            name: 'Total Views',
            data: @json($chartData['total'])
        }, {
            name: 'Unique Visitors',
            data: @json($chartData['unique'])
        }],
        xaxis: {
            categories: @json($chartData['dates'])
        }
    };
    var chart = new ApexCharts(document.querySelector("#traffic-chart"), options);
    chart.render();
</script>
```

### 2. World Map (jsVectorMap)
The `getMapData()` method returns an array of objects with coordinates, so you **do not** need to hardcode Lat/Long in JavaScript.

```blade
<div id="world-map-markers" style="height: 350px;"></div>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        // 1. Get Data directly from Laravel
        var dbData = @json($mapData);

        new jsVectorMap({
            selector: '#world-map-markers',
            map: 'world',
            markersSelectable: true,
            
            // 2. Pass data directly to markers
            markers: dbData, // [{name: 'BD', coords: [23.68, 90.35], visits: 100}]

            labels: {
                markers: {
                    render: marker => `${marker.name}: ${marker.visits}`
                }
            },
            onMarkerTooltipShow(event, tooltip, index) {
                tooltip.text(`${dbData[index].name}<br>Visits: ${dbData[index].visits}`);
            }
        });
    });
</script>
```

---

## Database Structure

### Table: `website_analytics`
Tracks individual daily visits per IP.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | BigInt | Primary Key |
| `ip_address` | String | Visitor IP |
| `visit_date` | Date | The date of the visit |
| `visits` | Integer | Count of hits per day |
| `country_code` | String | ISO Code (e.g., US, BD) |
| `user_agent` | String | Browser/Device Info |

### Table: `analytics_countries`
Stores static coordinate data for mapping. Populated via `analytics:seed-countries`.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | BigInt | Primary Key |
| `country_code` | String | Unique ISO Code (e.g., US) |
| `name` | String | Country Name (e.g., United States) |
| `lat` | Decimal | Latitude |
| `long` | Decimal | Longitude |

## License
The MIT License (MIT). Please see License File for more information.