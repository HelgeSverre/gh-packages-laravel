# Laravel Page View

[![Latest Version on Packagist](https://img.shields.io/packagist/v/iotronlab/laravel-page-view.svg?style=flat-square)](https://packagist.org/packages/iotronlab/laravel-page-view)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/iotronlab/laravel-page-view/run-tests.yml?branch=main&label=tests)](https://github.com/iotronlab/laravel-page-view/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/iotronlab/laravel-page-view.svg?style=flat-square)](https://packagist.org/packages/iotronlab/laravel-page-view)

A simple package to track page views for any Laravel Eloquent model. It stores view records with IP, session, and user agent information to prevent duplicate counting.

## Installation

```bash
composer require iotronlab/laravel-page-view
```

Publish and run the migrations:

```bash
php artisan vendor:publish --tag="laravel-page-view-migrations"
php artisan migrate
```

Optionally publish the config file:

```bash
php artisan vendor:publish --tag="laravel-page-view-config"
```

## Configuration

```php
use Iotronlab\LaravelPageView\LaravelPageView;

return [
    // Auto-prune old page view records
    'range' => [
        'type' => LaravelPageView::MONTH, // or LaravelPageView::YEAR
        'value' => 1
    ],
];
```

## Usage

### 1. Add the trait to your model

```php
use Iotronlab\LaravelPageView\Traits\hasPageView;

class Post extends Model
{
    use hasPageView;
}
```

### 2. Add a `views` column to your model's table

```php
$table->unsignedBigInteger('views')->default(0);
```

### 3. Record page views

```php
// In your controller
public function show(Request $request, Post $post)
{
    $post->hasPageViews($request);

    return view('posts.show', compact('post'));
}
```

### 4. Access view data

```php
// Get the view count
$post->views;

// Get formatted views (1K, 1.5M, etc.)
$post->formatted_views;

// Get all page view records
$post->pageViews;
```

### Generate fake views for testing

```php
$post->fakePageViews();        // Creates a view in the past 30 days
$post->fakePageViews(true);    // Creates a view in the next 30 days
```

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

## Credits

- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
