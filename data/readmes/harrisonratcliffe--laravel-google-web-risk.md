# Laravel Google Web Risk
[![Latest Stable Version](https://poser.pugx.org/harrisonratcliffe/laravel-google-web-risk/v/stable.svg)](https://packagist.org/packages/harrisonratcliffe/laravel-google-web-risk) [![Total Downloads](https://poser.pugx.org/harrisonratcliffe/laravel-google-web-risk/downloads.svg)](https://packagist.org/packages/harrisonratcliffe/laravel-google-web-risk) [![License](https://poser.pugx.org/harrisonratcliffe/laravel-google-web-risk/license.svg)](https://packagist.org/packages/harrisonratcliffe/laravel-google-web-risk)

__This package requires that you have a Google API key. It absolutely will not work without one.__

## Overview

The `harrisonratcliffe/laravel-google-web-risk` package provides a simple interface for integrating with the Google Web Risk API to check if URLs are harmful or not, leveraging Google's threat intelligence. This package allows developers to assess the safety of URLs based on predefined threat types, making it an essential tool for web applications that require enhanced security measures.

Right now it's only using the Search API, but I'll be updating it to include the remaining APIs later. It's free up to 100k requests per month.

__This package requires that you have a Google API key. It absolutely will not work without one.__

## Installation

You can install the package via Composer. Run the following command in your Laravel project:

```bash
composer require harrisonratcliffe/laravel-google-web-risk
```

Once installed, you will need to add the service provider to your `config/app.php` if using Laravel versions below 5.5:

```php
'providers' => [
    // ...
    Harrisonratcliffe\LaravelGoogleWebRisk\GoogleWebRiskServiceProvider::class,
],
```

## Configuration

Publish the configuration file using the following Artisan command:

```bash
php artisan vendor:publish --provider="Harrisonratcliffe\LaravelGoogleWebRisk\GoogleWebRiskServiceProvider"
```

This will create a configuration file located at `config/google-web-risk.php`. You must set your **Google API key** in your `.env` file:

```bash
GOOGLE_API_KEY=your_google_api_key
```

You can also modify other settings, such as `timeout` and `threat_types` as needed:

```php
'google' => [
    'api_key' => env('GOOGLE_API_KEY'),
    'timeout' => 10, // Timeout in seconds
    'threat_types' => [
        'MALWARE',
        'SOCIAL_ENGINEERING',
        'UNWANTED_SOFTWARE',
        'SOCIAL_ENGINEERING_EXTENDED_COVERAGE',
    ],
],
```

### Important:

The Google Web Risk free tier is limited to **100,000 requests per month**. Ensure to monitor your usage to avoid exceeding this limit.

## Usage

### Checking URL Safety

You can check the safety of a URL using the `isSafe` method provided by the `GoogleWebRisk` class:

```php
use Harrisonratcliffe\LaravelGoogleWebRisk\GoogleWebRisk;

$url = "http://example.com";
$googleWebRisk = new GoogleWebRisk();

if ($googleWebRisk->isSafe($url)) {
    echo "The URL is safe.";
} else {
    echo "The URL may be harmful.";
}
```

### Direct API Access

If you need to access the raw response from the Google Web Risk API to see what specific threats are flagged, you can invoke the `checkUrl` method directly:

```php
$response = GoogleWebRisk::checkUrl($url);

if (isset($response['error'])) {
    // Handle error
    echo $response['details'];
} else {
    // Process response data
    var_dump($response);
}
```

### Test URLs

Here are some handy test urls you can use while you're experimenting with the system.

- http://www.yahoo.com/ (OK)
- - https://github.com/ (OK)
- http://malware.testing.google.test/testing/malware/ (Malware)
- http://ianfette.org (malware)

## License

This package is open-sourced software licensed under the [GNU General Public License](LICENSE).

## Contributing

If you would like to contribute to this project, please submit a pull request or open an issue on the GitHub repository.
