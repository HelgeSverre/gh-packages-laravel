# A simple package for managing Laravel token replacement from model data

[![Latest Version on Packagist](https://img.shields.io/packagist/v/eighteen73/laravel-tokens.svg?style=flat-square)](https://packagist.org/packages/eighteen73/laravel-tokens)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/eighteen73/laravel-tokens/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/eighteen73/laravel-tokens/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/eighteen73/laravel-tokens/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/eighteen73/laravel-tokens/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/eighteen73/laravel-tokens.svg?style=flat-square)](https://packagist.org/packages/eighteen73/laravel-tokens)

You can use provides an automated way to replace tokens in user-entered text with model/relation data. This is useful for things like email templates.

All unguarded model attributes are available as tokens - as well as relation data accessed through dot notation.

When model factories are available, the factory definition attributes will also available as tokens, otherwise Model::getAttributes() will be used.

## Installation

You can install the package via composer:

```bash
composer require eighteen73/laravel-tokens
```


## Usage
### List available tokens
```php
$tokenManager = new Eighteen73\LaravelTokens\TokenManager();

echo $tokenManager->forModel(App\Models\User::class)->plainTokens();
```

### Replace tokens in a string
```php
$tokenManager = new Eighteen73\LaravelTokens\TokenManager();

echo $tokenManager->forModel(User::factory()->make(['email' => 'test@example.com']))
    ->replaceTokens("My email address is ##email##.");
    
// My email address is test@example.com
```

### Custom tokens within a model
```php
use Eighteen73\LaravelTokens\Contracts\CustomTokens;

class User extends Model implements CustomTokens
{
    public function getCustomTokens(): array
    {
        return [
            'my_custom_token' => 'Use this custom text.',
        ];
    }
}

$tokenManager = new Eighteen73\LaravelTokens\TokenManager();

echo $tokenManager->forModel(User::factory()->make())
    ->replaceTokens("Example text - ##my_custom_token##.");

// Example text - Use this custom text.
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

- [Matt Jones](https://github.com/Muffinman)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
