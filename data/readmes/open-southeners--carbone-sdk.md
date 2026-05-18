Carbone PHP [![required php version](https://img.shields.io/packagist/php-v/open-southeners/carbone-sdk)](https://www.php.net/supported-versions.php) [![codecov](https://codecov.io/gh/open-southeners/carbone-sdk/branch/main/graph/badge.svg?token=zi0WDnuTmb)](https://codecov.io/gh/open-southeners/carbone-sdk) [![Edit on VSCode online](https://img.shields.io/badge/vscode-edit%20online-blue?logo=visualstudiocode)](https://vscode.dev/github/open-southeners/carbone-sdk)
===

Unofficial port of the Carbone API SDK to Saloon v4

## Getting started

```
composer require open-southeners/carbone-sdk
```

### Laravel installation

To make this work within a Laravel app you just need to add the following at the very bottom of your `.env` file:

```ini
CARBONE_API_KEY='your-carbone-api-key'
```

To customise the API version and more you can simply add `carbone` array item to the _config/services.php_:

```php
<?php

return [

    // rest of services.php items here...

    'carbone' => [
        'key' => env('CARBONE_API_KEY', ''),
        'version' => '4',
    ],

];
```

### Usage

Within Laravel you've it injected into your application's container:

```php
$response = app('carbone')->template()->base64Upload($templateBase64);

if ($response->failed()) {
    throw new \Exception('Template upload failed!');
}

// This is extracted from official Carbone SDK: https://carbone.io/api-reference.html#upload-a-template-carbone-cloud-sdk-php
$templateId = $response->getTemplateId();
```

### Any other framework (or not)

If you are using another framework (or just pure PHP), you can still use this as a standalone library:

```php
$carbone = new Carbone('your-carbone-api-key');

// Use this if you want to use a different API version: https://carbone.io/api-reference.html#api-version
// $carbone = new Carbone('your-carbone-api-key', '4');

$templateBase64 = base64_encode(file_get_contents('path_to_your_template_here'));

$response = $carbone->template()->base64Upload($templateBase64);

if ($response->failed()) {
    throw new \Exception('Template upload failed!');
}

// This is extracted from official Carbone SDK: https://carbone.io/api-reference.html#upload-a-template-carbone-cloud-sdk-php
$templateId = $response->getTemplateId();
```

### Differences between official SDK and this

- Full Laravel support (optionally as this supports any framework or even raw PHP)
- Use of [Saloon v3](https://github.com/saloonphp/saloon/releases/tag/v3.0.0) not the v1 (which improves at everything typed for better IDE autocompletion support, etc)
- **Replaced the `template()->upload()` method with `template()->base64Upload()`** so the upload method can be used to send `multipart/form-data` POST request instead of a `application/json` with all the file contents base64 encoded
- Added `template()->exists()` to get if template with ID exists in Carbone (just a HEAD request so no content fetch at all)
- Added `status()->fetch()` to get status (not currently publicly documented, only on the OpenAPI, Postman, etc. [Can check them here](https://carbone.io/api-reference.html#api-integration))

[You can still check the official one here](https://github.com/carboneio/carbone-sdk-php).

## Partners

[![skore logo](https://github.com/open-southeners/partners/raw/main/logos/skore_logo.png)](https://getskore.com)

## License

This package is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
