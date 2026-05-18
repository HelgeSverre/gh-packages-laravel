# Laravel Sonar - Product Analytics

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mafrasil/laravel-sonar.svg?style=flat-square)](https://packagist.org/packages/mafrasil/laravel-sonar)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/mafrasil/laravel-sonar/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/mafrasil/laravel-sonar/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/mafrasil/laravel-sonar.svg?style=flat-square)](https://packagist.org/packages/mafrasil/laravel-sonar)

Laravel Sonar is a powerful product analytics package that makes it easy to track user interactions in your Laravel application. It provides automatic tracking for clicks, hovers, and impressions, with support for custom events.

## Features

-   🚀 Automatic event tracking (clicks, hovers, impressions)
-   🎯 Custom event tracking
-   ⚡ Efficient batch processing of events
-   🛠️ Optional React components and hooks for easy integration
-   📱 Responsive design support with screen size tracking
-   🔄 Compatible with Inertia.js
-   ⚙️ Configurable tracking behavior

## Installation

You can install the package via composer:

```bash
composer require mafrasil/laravel-sonar
```

Then install the package and publish the assets:

```bash
php artisan sonar:install
php artisan vendor:publish --tag=sonar-assets
```

This will publish the config file, assets and run the migrations.

You can also publish the config file, assets and run the migrations separately:

```bash
php artisan vendor:publish --tag=sonar-config # Publish the config file
php artisan vendor:publish --tag=sonar-assets # Publish the assets
php artisan vendor:publish --tag=sonar-migrations # Publish the migrations
php artisan migrate # Run the migrations
```

You can also publish the views of the dashboard:

```bash
php artisan vendor:publish --tag=sonar-views
```

### Optional: Export React Components

If you're using React, you can export the React components and TypeScript types:

```bash
php artisan sonar:export-react
```

This will create React components and hooks in your application's JavaScript directory.

## Usage

### Data Attributes

The simplest way to track elements is using data attributes:

```html
<button data-sonar="signup-button" data-sonar-metadata='{"variant": "blue"}'>
    Sign Up
</button>
```

### React Component (Optional)

If you've exported the React components, you can use the `SonarTracker` component:

```jsx
import { SonarTracker } from "@/components/SonarTracker";

function SignupButton() {
    return (
        <SonarTracker
            name="signup-button"
            metadata={{ variant: "blue" }}
            trackAllHovers={true} // Optional: track repeated hovers
        >
            <button>Sign Up</button>
        </SonarTracker>
    );
}
```

### Custom Events

Use the `useSonar` hook for custom event tracking and configuration:

```jsx
import { useSonar } from "@/hooks/useSonar";

function CheckoutForm() {
    const { track, configure } = useSonar();

    // Optional: Configure tracking behavior
    useEffect(() => {
        configure({ trackAllHovers: true });
    }, []);

    const handleSubmit = () => {
        track("checkout-complete", "custom", {
            amount: 99.99,
            currency: "USD",
        });
    };

    return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

### Server-Side Tracking

You can also track events from your PHP code:

```php
use Mafrasil\LaravelSonar\Facades\LaravelSonar;

LaravelSonar::track('order-processed', 'custom', [
    'orderId' => $order->id,
    'amount' => $order->total
]);
```

## Event Types

The package supports the following event types out of the box:

-   `click`: User clicks on tracked elements
-   `hover`: User hovers over tracked elements (configurable for repeated tracking)
-   `impression`: Element becomes visible in the viewport
-   `custom`: Any custom event you want to track

## Configuration

You can customize the package behavior in the `config/sonar.php` file:

```php
return [
    'route' => [
        'prefix' => 'api',
        'middleware' => ['api'],
    ],
    'queue' => [
        'batch_size' => 10,
        'flush_interval' => 1000,
    ],
    // ...
];
```

### JavaScript Configuration

You can configure the JavaScript behavior globally:

```javascript
import { configureSonar } from "laravel-sonar";

configureSonar({
    trackAllHovers: true, // Enable tracking of repeated hovers
});
```

## Analytics

Laravel Sonar provides several methods to analyze your collected data. You can use these methods to build dashboards or generate reports.

### Available Methods

```php
use Mafrasil\LaravelSonar\Facades\LaravelSonar;

// Get events grouped by type
$eventsByType = LaravelSonar::getEventsByType(
    startDate: now()->subDays(7), // optional
    endDate: now() // optional
);

// Get most active pages
$topPages = LaravelSonar::getTopPages(
    limit: 10, // optional, defaults to 10
    startDate: now()->subDays(30) // optional
);

// Get event timeline
$timeline = LaravelSonar::getEventTimeline(
    interval: '1 day', // optional, defaults to '1 day'
    startDate: now()->subDays(30) // optional
);

// Get most triggered events
$topEvents = LaravelSonar::getTopEvents(
    limit: 10, // optional, defaults to 10
    type: 'click' // optional, filter by event type
);

// Get user engagement metrics
$engagement = LaravelSonar::getUserEngagement();
```

## Dashboard & Analytics

### CLI Analytics

The package includes a convenient command-line interface for quick analytics overview:

```bash
php artisan sonar:stats --limit=20
```

This is particularly useful for quick analytics checks or automated reporting scripts.

### Access Control

By default, the Sonar dashboard is only accessible in the local environment.

You can enable it anytime by setting the SONAR_DASHBOARD_ENABLED environment variable to true.

To allow specific users in other environments, configure the allowed emails in your `config/sonar.php`:

```php
'allowed_emails' => [
    'user@example.com',
],
```

You can also customize the authorization logic by overriding the `viewSonar` gate in your `AuthServiceProvider`:

```php
use Illuminate\Support\Facades\Gate;
public function boot()
{
Gate::define('viewSonar', function ($user) {
return $user->hasRole('admin') || $user->hasPermission('view-analytics');
});
}
```

### Dashboard Access

The dashboard is available at `/sonar` and provides:

-   Event type distribution
-   Most active pages
-   Click and hover rates
-   User engagement metrics
-   Browser and device statistics
-   Screen size distribution
-   Detailed element interaction analysis

### Using the Facade

The `LaravelSonar` facade provides various methods for analyzing your tracking data. Here's a comprehensive example:

```php
class AnalyticsDashboardController extends Controller
{
    public function index()
    {
        return view('analytics.dashboard', [
            'eventsByType' => LaravelSonar::getEventsByType(now()->subDays(30)),
            'topPages' => LaravelSonar::getTopPages(5),
            'dailyEvents' => LaravelSonar::getEventTimeline(),
            'topClickedElements' => LaravelSonar::getTopEvents(5, 'click'),
            'engagement' => LaravelSonar::getUserEngagement(),
        ]);
    }
}
```

### Available Analytics Methods

#### Basic Analytics

-   `getEventsByType(DateTime $startDate = null, DateTime $endDate = null)`: Get event counts grouped by type
-   `getTopLocations(int $limit = 10, DateTime $startDate = null)`: Get most active pages/routes
-   `getEventTimeline(string $interval = '1 day', DateTime $startDate = null)`: Get event distribution over time
-   `getTopEvents(int $limit = 10, string $type = null)`: Get most triggered events
-   `getUserEngagement()`: Get overall engagement metrics

#### Detailed Analytics

-   `getElementStats(int $limit = 10)`: Get element-specific stats with conversion rates
-   `getBrowserStats()`: Get browser and device usage statistics
-   `getScreenSizeStats()`: Get screen size distribution
-   `getMetadataStats(string $name)`: Get detailed metadata analysis for specific elements
-   `getLocationStats()`: Get detailed page interaction statistics

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Inspiration & Acknowledgments

Laravel Sonar was inspired by [Pan](https://github.com/panphp/pan), a lightweight and privacy-focused PHP product analytics library. While sharing similar core concepts for simple analytics tracking, Laravel Sonar extends the functionality with additional features including:

-   Rich metadata support for events
-   Built-in analytics dashboard UI
-   Advanced analytics reporting capabilities
-   Screen size and device tracking
-   Detailed user engagement metrics
-   React component integration
-   And more...

## Credits

-   [mafrasil](https://github.com/mafrasil)
-   [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
