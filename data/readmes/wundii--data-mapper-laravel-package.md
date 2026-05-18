<p style="text-align:center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wundii/data-mapper/refs/heads/main/assets/data-mapper-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/wundii/data-mapper/refs/heads/main/assets/data-mapper-light.png">
    <img src="https://raw.githubusercontent.com/wundii/data-mapper/refs/heads/main/assets/data-mapper-light.png" alt="wundii/data-mapper-laravel-package" style="width: 100%; max-width: 600px; height: auto;">
  </picture>
</p>

[![PHP-Tests](https://img.shields.io/github/actions/workflow/status/wundii/data-mapper-laravel-package/code_quality.yml?branch=main&style=for-the-badge)](https://github.com/wundii/data-mapper-laravel-package/actions/workflows/code_quality.yml)
[![PHPStan](https://img.shields.io/badge/PHPStan-level%2010-brightgreen.svg?style=for-the-badge)](https://phpstan.org/)
![VERSION](https://img.shields.io/packagist/v/wundii/data-mapper-laravel-package?style=for-the-badge)
[![PHP](https://img.shields.io/packagist/php-v/wundii/data-mapper-laravel-package?style=for-the-badge)](https://www.php.net/)
[![Rector](https://img.shields.io/badge/Rector-8.2-blue.svg?style=for-the-badge)](https://getrector.com)
[![ECS](https://img.shields.io/badge/ECS-check-blue.svg?style=for-the-badge)](https://tomasvotruba.com/blog/zen-config-in-ecs)
[![PHPUnit](https://img.shields.io/badge/PHP--Unit-check-blue.svg?style=for-the-badge)](https://phpunit.org)
[![codecov](https://img.shields.io/codecov/c/github/wundii/data-mapper-laravel-package/main?token=R1FBWF8UJD&style=for-the-badge)](https://codecov.io/github/wundii/data-mapper-laravel-package)
[![Downloads](https://img.shields.io/packagist/dt/wundii/data-mapper-laravel-package.svg?style=for-the-badge)](https://packagist.org/packages/wundii/data-mapper-laravel-package)

A Laravel integration for [wundii/data-mapper](https://github.com/wundii/data-mapper).
This library is an extremely fast and strictly typed object mapper built for modern PHP (8.2+).
It seamlessly transforms data from formats like CSV, JSON, NEON, XML, YAML, array, and standard objects into well-structured PHP objects.

Ideal for developers who need reliable and efficient data mapping without sacrificing code quality or modern best practices.

## Features
- Mapping source data into objects
- Mapping source data with a list of elements into a list of objects
- Initialize object via constructor, properties or methods
- Map nested objects, arrays of objects
- Class mapping for interfaces or other classes
- Custom root element for starting with the source data
- Auto-casting for `float` types (eu to us decimal separator)
- Target alias via Attribute for properties and methods
- Automatic data sorting for constructor parameters

## Supported Types
- `null`
- `bool`|`?bool`
- `int`|`?int`
- `float`|`?float`
- `string`|`?string`
- `array`
  - `int[]`
  - `float[]`
  - `string[]`
  - `object[]`
- `object`|`?object`
- `enum`|`?enum`

## Supported Formats
optional formats are marked with an asterisk `*`
- `array`
- `csv`
- `json`
- `neon`*
- `object`
  - `public property`
  - `public getters`
  - `method toArray()`
  - `attribute SourceData('...')`
- `xml`
- `yaml`*

## Installation
Require the bundle and its dependencies with composer:

```bash
composer require wundii/data-mapper-laravel-package
```

Create a Laravel configuration file `config/data-mapper.php` with the command:

```bash
php artisan data-mapper:publish-config

```

## Configuration File
The following setting options are available

```php
<?php

return [
    'data_config' => [
        'approach' => \Wundii\DataMapper\Enum\ApproachEnum::SETTER,
        'accessible' => \Wundii\DataMapper\Enum\AccessibleEnum::PUBLIC,
        'class_map' => [
            \DateTimeInterface::class => \DateTime::class,
            // ... additional mappings can be added here
        ],
    ],
];
```

## Use as Laravel DataMapper Facade version
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Dto\TestClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Wundii\DataMapper\LaravelPackage\Facades\DataMapper;

final class YourController extends Controller
{
    public function doSomething(Request $request): JsonResponse
    {
        // Automatic recognition of the format based on the content type of the request
        // returns an instance of TestClass or an Exception
        $testClass = DataMapper::request($request, TestClass::class);

        // or you can use tryRequest to avoid exceptions, null will be returned instead
        $testClass = DataMapper::tryRequest($request, TestClass::class);
        DataMapper::getMapStatusEnum();
        DataMapper::getErrorMessage();

        // Do something with $testClass

        return response()->json(...);
    }
}
```

## Use as Native or Laravel DataMapper version
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Dto\TestClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Wundii\DataMapper\DataMapper as DataMapperNative;
use Wundii\DataMapper\LaravelPackage\DataMapper as DataMapperLaravel;

final class YourController extends Controller
{
    public function __construct(
        private readonly DataMapperNative $dataMapperNative,
        private readonly DataMapperLaravel $dataMapperLaravel,
    ) {
    }

    public function doSomething(Request $request): JsonResponse
    {
        // you can use the native DataMapper methods
        $testClass = $this->dataMapperNative->json($request->getContent(), TestClass::class);

        // or you can use the Laravel DataMapper methods
        $testClass = $this->dataMapperLaravel->request($request, TestClass::class);

        // Do something with $testClass

        return response()->json(...);
    }
}
```
