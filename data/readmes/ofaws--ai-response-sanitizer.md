# A simple sanitizer of text responses received from ChatGPT or other LLM for Laravel

## Installation

You can install the package via composer:

```bash
composer require ofaws/ai-response-sanitizer
```

## Usage

```php
use Ofaws\Sanitizer\Sanitizer;

$sanitized = Sanitizer::json($response);
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.