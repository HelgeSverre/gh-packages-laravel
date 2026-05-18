# A clean, fluent, and developer-friendly PHP wrapper for the Patrowl API

[![Latest Version on Packagist](https://img.shields.io/packagist/v/xternalsoft/laravel-patrowl.svg?style=flat-square)](https://packagist.org/packages/xternalsoft/laravel-patrowl)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/xternalsoft/laravel-patrowl/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/xternalsoft/laravel-patrowl/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/xternalsoft/laravel-patrowl/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/xternalsoft/laravel-patrowl/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/xternalsoft/laravel-patrowl.svg?style=flat-square)](https://packagist.org/packages/xternalsoft/laravel-patrowl)

A clean, fluent, and developer-friendly PHP wrapper for the Patrowl API. This package allows you to easily interact with assets, asset groups, and tags within the Patrowl ecosystem from your Laravel application.

## Support us

[<img src="https://github-ads.s3.eu-central-1.amazonaws.com/laravel-patrowl.jpg?t=1" width="419px" />](https://spatie.be/github-ad-click/laravel-patrowl)

We invest a lot of resources into creating [best in class open source packages](https://spatie.be/open-source). You can support us by [buying one of our paid products](https://spatie.be/open-source/support-us).

We highly appreciate you sending us a postcard from your hometown, mentioning which of our package(s) you are using. You'll find our address on [our contact page](https://spatie.be/about-us). We publish all received postcards on [our virtual postcard wall](https://spatie.be/open-source/postcards).

## Installation

You can install the package via composer:

```bash
composer require xternalsoft/laravel-patrowl
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="laravel-patrowl-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-patrowl-config"
```

This is the contents of the published config file:

```php
return [
    'api_token' => env('PATROWL_API_TOKEN'),
    'base_url' => env('PATROWL_API_BASE_URL', 'https://dashboard.cloud.patrowl.io/api/auth'),
    'timeout' => 30,
    'default_organization_id' => env('PATROWL_DEFAULT_ORGANIZATION_ID'),
    'limit' => env('PATROWL_PAGINATION_LIMIT', 100),
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="laravel-patrowl-views"
```

## Usage

### Configuration

Add your Patrowl API token and base URL to your `.env` file:

```env
PATROWL_API_TOKEN=your-api-token
PATROWL_API_BASE_URL=https://dashboard.cloud.patrowl.io/api/auth
PATROWL_DEFAULT_ORGANIZATION_ID=1
```

### Basic Usage

You can use the `LaravelPatrowl` facade to interact with the API:

```php
use Xternalsoft\LaravelPatrowl\Facades\LaravelPatrowl;

// Get all assets
$assets = LaravelPatrowl::assets()->all();

foreach ($assets->items() as $asset) {
    echo $asset->value;
}
```

### Managing Assets

#### Create an Asset

```php
use Xternalsoft\LaravelPatrowl\Data\CreateAssetData;

$data = new CreateAssetData(
    value: 'example.com',
    description: 'My new asset',
    organization: 1
);

$asset = LaravelPatrowl::assets()->create($data);
```

#### Add a Tag to an Asset

```php
use Xternalsoft\LaravelPatrowl\Data\AddTagToAssetData;

$data = new AddTagToAssetData(
    value: 'production',
    organization: 1
);

$response = LaravelPatrowl::assets()->addTag($assetId, $data);

if ($response->successful()) {
    // Tag added successfully
}
```

#### Remove a Tag from an Asset

```php
$response = LaravelPatrowl::assets()->removeTag($assetId, $tagId);
```

### Risks

#### List and Get Risks

```php
// List all risks
$risks = LaravelPatrowl::risks()->all();

foreach ($risks->items() as $risk) {
    echo $risk->title . ' (' . $risk->severity->name . ')';
}

// Get a specific risk
$risk = LaravelPatrowl::risks()->get($riskId);
```

#### Export Risks to CSV

```php
// Export all risks to CSV format
$csvContent = LaravelPatrowl::risks()->exportCsv();

file_put_contents('risks_export.csv', $csvContent);
```

#### List Risk Topics and Subtopics

```php
// List all risk topics
$topics = LaravelPatrowl::risks()->topics();

foreach ($topics->items() as $topic) {
    echo $topic->title . ' (' . $topic->slug . ')';
}

// List all risk subtopics
$subtopics = LaravelPatrowl::risks()->subtopics();

foreach ($subtopics->items() as $subtopic) {
    echo $subtopic->title . ' (' . $subtopic->slug . ')';
}
```

### Asset Groups

#### Create an Asset Group

```php
use Xternalsoft\LaravelPatrowl\Data\CreateAssetGroupData;

$data = new CreateAssetGroupData(
    title: 'My Production Assets',
    description: 'Assets in production environment',
    organization: 1,
    assets: [123, 456] // List of asset IDs to add after creation
);

$group = LaravelPatrowl::assetGroups()->create($data);
```

#### List and Get Asset Groups

```php
// List all asset groups
$groups = LaravelPatrowl::assetGroups()->all();

// Get a specific group
$group = LaravelPatrowl::assetGroups()->get($groupId);
```

#### Add a Tag to an Asset Group

```php
use Xternalsoft\LaravelPatrowl\Data\AddTagToAssetData;

$data = new AddTagToAssetData(
    value: 'critical-infrastructure',
    organization: 1
);

$response = LaravelPatrowl::assetGroups()->addTag($groupId, $data);
```

### Asset Tags

```php
// List all available tags
$tags = LaravelPatrowl::assetTags()->all();
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

- [Parrot](https://github.com/XternalSoft)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
