# IP-Api Laravel - IP Address Information Lookup

[![Latest Version on Packagist](https://img.shields.io/packagist/v/harrisonratcliffe/ip-api-laravel.svg?style=flat-square)](https://packagist.org/packages/harrisonratcliffe/ip-api-laravel)
[![Total Downloads](https://img.shields.io/packagist/dt/harrisonratcliffe/ip-api-laravel?style=flat-square)](https://packagist.org/packages/harrisonratcliffe/ip-api-laravel)
[![Repo Size](https://img.shields.io/github/repo-size/harrisonratcliffe/ip-api-laravel?style=flat-square)](https://packagist.org/packages/harrisonratcliffe/ip-api-laravel)
[![Repo Size](https://img.shields.io/packagist/l/harrisonratcliffe/ip-api-laravel?style=flat-square)](https://packagist.org/packages/harrisonratcliffe/ip-api-laravel)

The `IpApiLaravel` package provides an easy-to-use interface for looking up information about IP addresses using the ip-api-laravel.com API. It allows you to fetch various details about an IP address, such as geographical location, time zone, currency, and more.

This package is a fork of [el-factory/ip-api](https://github.com/el-factory/ip-api) with additional features.

## Requirements

- PHP 7.2 or higher
- Laravel 7 or higher

## Installation

The `IpApiLaravel` package requires Laravel version 7 or higher.

To install the package, you can use Composer:

```bash
composer require harrisonratcliffe/ip-api-laravel
```

## Configuration

After installing the package, you can optionally publish the configuration file to customize the default settings:

```bash
php artisan vendor:publish --tag=ip-api-laravel-config
```

This will create a `ip-api-laravel.php` file in the `config` directory of your Laravel application. You can modify the default configuration values in this file according to your specific requirements.

## Usage

### IP Address Lookup

To perform an IP address lookup, you can use the `lookup` method on the `IpApiLaravel` class:

```php
use Harrisonratcliffe\IpApiLaravel\IpApiLaravel;

$ipDetails = IpApiLaravel::default('188.216.103.93')->lookup();
```

This will return an array with the details of the provided IP address.

### Additional Configuration

You can also customize the IP address lookup by using the following methods:

#### `fields(array $fields): IpApiLaravel`

Set the fields to be included in the API response. The `$fields` parameter should be an array of fields you want to retrieve.

```php
$ipDetails = IpApiLaravel::default('188.216.103.93')->fields(['city', 'country', 'timezone'])->lookup();
```

#### `usingKey(string $apiKey): IpApiLaravel`

By default, the package uses the API key provided in the config file. If you wish to send a different API key for a specific request, you can use the `usingKey` method to set the API key for that request.

```php
$ipDetails = IpApiLaravel::default('188.216.103.93')->usingKey('YOUR_API_KEY')->lookup();
```

#### `retry(int $times, int $sleep): IpApiLaravel`

Set the retry configuration for failed API requests. The `$times` parameter represents the number of retry attempts, and the `$sleep` parameter specifies the number of seconds to sleep between retries.

```php
$ipDetails = IpApiLaravel::default('188.216.103.93')->retry(3, 2)->lookup();
```

#### `lang(string $language): IpApiLaravel`

Set the language for the API response. The `$language` parameter should be a two-letter language code.

```php
$ipDetails = IpApiLaravel::default('188.216.103.93')->lang('en')->lookup();
```

#### `withHeaders(): IpApiLaravel`

Include request limit and remaining requests headers in the API response.

```php
$ipDetails = IpApiLaravel::default('188.216.103.93')->withHeaders()->lookup();
```

#### `timeout(int $seconds): IpApiLaravel`

Set a timeout for the API request. The `$seconds` parameter specifies the maximum number of seconds to wait for a response. If the request times out, an exception will be thrown.

```php
$ipDetails = IpApiLaravel::default('188.216.103.93')->timeout(10)->lookup(); // Set timeout to 10 seconds
```

### Console Command - `ip-api-laravel:connection`

The `IpApiLaravel` package also includes a console command named `ip-api-laravel:connection` that allows you to test the connection to the ip-api-laravel.com API with a specific IP address or your public IP address (if not provided).

To use the command, run the following Artisan command:

```bash
php artisan ip-api-laravel:connection {ip?}
```

- `{ip}` (optional): The IP address to test with. If not provided, the command will use your public IP address.

The command will display the details retrieved from the ip-api-laravel.com API for the provided IP address.

### Example

Here's an example of using the `ip-api-laravel:connection` command:

```bash
php artisan ip-api-laravel:connection 188.216.103.93
```

This will test the connection to ip-api-laravel.com API with the specified IP address and display the details retrieved.

If no IP address is provided, the command will automatically use your public IP address:

```bash
php artisan ip-api-laravel:connection
```

## Exceptions

The `IpApiLaravel` class may throw the following exceptions:

- `Exception`: If the provided IP address is invalid or reserved.
- `RequestException`: If an error occurs while making the API request.

## License

The `IpApiLaravel` package is open-source software licensed under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use and modify it according to your needs.
