# Visitor Tracker for Laravel

A simple and flexible Laravel package  to track website visitors and page visits.


## 1. Installation
```bash
composer require kitoko/visitor-tracker
```

## 2. Publish the configuration file:
```
php artisan vendor:publish --tag=visitor-tracker-config
```
This command will generate 
```
config/visitor-tracker.php
```
## 3. Run migration to create the required tables:
````
php artisan migrate
````
## Confuguration
Edit __config/visitor-tracker.php__ to customize your settings, for example:
```
return [
    'enabled' => true,
    'retention_days' => 30,
    'cache_minutes' => 10,
];
```

* ``enable`` is true by default 
* ``retention_days`` is how long yo want to conserve your data (It is 1 month by default)
* ``cache minites`` is the time you want to keep data in cache

## Usage
Once installed, the package will automatically track visitors and page views.
You can display visitor statistics in your application using the provided services or helpers.  

#### Display statistics in blade 
```
<div>
    Total visitors: {{ \Kitoko\VisitorTracker\Facades\VisitorTracker::total() }}
    Today: {{ \Kitoko\VisitorTracker\Facades\VisitorTracker::today() }}
    Yesterday: {{ \Kitoko\VisitorTracker\Facades\VisitorTracker::yesterday() }}
</div>
```

#### Using in a controller
```
use Kitoko\VisitorTracker\Facades\VisitorTracker;

public function index()
{
    $stats = [
        'total' => VisitorTracker::total(),
        'today' => VisitorTracker::today(),
        'week'  => VisitorTracker::week(),
    ];

    return view('dashboard', compact('stats'));
}
```

## Features
* Track unique visitors
* Track page visits
* Daily, weekly, and monthly statistics
* Total visitor counter
* Easy integration with Laravel

## Requirements
* PHP ^8.0
* Laravel ^9 | ^10 | ^11 | ^12

## Troubleshooting
* __Class not found__
``` 
composer dump-autoload 
```

* __Migrations not working?__ Ensure your ``VisitorTrackerServiceProvider`` has:
```
$this->loadMigrationsFrom(__DIR__.'/../database/migrations');
```

## License

This package is open-sourced software licensed under the MIT license.
