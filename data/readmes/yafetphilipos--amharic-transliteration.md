# Amharic Transliteration Laravel Package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/yafet/amharic-transliteration.svg?style=flat-square)](https://packagist.org/packages/yafet/amharic-transliteration)
[![Total Downloads](https://img.shields.io/packagist/dt/yafet/amharic-transliteration.svg?style=flat-square)](https://packagist.org/packages/yafet/amharic-transliteration)

A Laravel package for dual-way Amharic to English transliteration. Effortlessly convert Amharic script to English phonetics and back.

## Features

- **Amharic to English**: Converts Amharic characters to English with smart suffix handling (removes 'i' at word endings).
- **English to Amharic**: Reverse conversion using the longest-match algorithm for complex phonetics (e.g., `she`, `gn´e`).
- **Laravel Integration**: Facades, Traits, and Service Providers included.
- **Customizable**: Publish and modify the letter mapping as needed.

## Installation

You can install the package via composer:

```bash
composer require yafet/amharic-transliteration
```

For local development or if the package is in a private folder:

```json
"repositories": [
    {
        "type": "path",
        "url": "./packages/amharic-transliteration"
    }
],
"require": {
    "yafet/amharic-transliteration": "*"
}
```

## Usage

### 1. Using the Facade

The simplest way to use the package is via the `Amharic` facade.

```php
use Yafet\AmharicTransliteration\Facades\Amharic;

// Amharic to English
$english = Amharic::transliterate("ላም"); // Result: "lam"

// English to Amharic
$amharic = Amharic::reverseTransliterate("lam"); // Result: "ላም"
```

### 2. Using the Trait in Models

Add the `Transliteratable` trait to your Eloquent models to easily convert attributes.

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Yafet\AmharicTransliteration\Traits\Transliteratable;

class Post extends Model
{
    use Transliteratable;

    protected $fillable = ['title_am'];

    // Get English transliteration of the title
    public function getTitleEnAttribute()
    {
        return $this->transliterateAttribute('title_am');
    }
}
```

### 3. Manual Service Injection

```php
use Yafet\AmharicTransliteration\TransliterationService;

public function __construct(TransliterationService $service)
{
    $this->service = $service;
}

public function convert()
{
    return $this->service->transliterate("ሀሎ");
}
```

## Configuration

If you want to modify the character mapping, you can publish the resources:

```bash
php artisan vendor:publish --tag="amharic-transliteration-resources"
```

The mapping will be available at `resources/json/amharicLetters.json`.

## Development & Testing

To run tests, ensure you have dev dependencies installed:

```bash
composer install
vendor/bin/phpunit
```

### Running Tests via PHP script
A lightweight test script is provided in the root:
```bash
php test.php
```

## Changelog

### v1.0.0
- Initial release.
- Support for Amharic to English transliteration.
- Support for English to Amharic (reverse) transliteration.
- Laravel Facade and Trait support.
- PHPUnit test suite.

## Credits
- [Yafet Philipos](mailto:yafetbabi@gmail.com)

## License
The MIT License (MIT). Please see [License File](LICENSE) for more information.
