# Laravel Prompt Manager

[![Latest Version on Packagist](https://img.shields.io/packagist/v/chatvia/laravel-prompt-manager.svg?style=flat-square)](https://packagist.org/packages/chatvia/laravel-prompt-manager)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/chatvia/laravel-prompt-manager/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/chatvia/laravel-prompt-manager/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/chatvia/laravel-prompt-manager/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/chatvia/laravel-prompt-manager/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/chatvia/laravel-prompt-manager.svg?style=flat-square)](https://packagist.org/packages/chatvia/laravel-prompt-manager)

Writing LLM prompts into your Laravel application can make your code messy. This package helps you manage your prompts in a clean and efficient way.

## Installation

```bash
composer require chatvia/laravel-prompt-manager

php artisan vendor:publish --tag="prompt-manager-config"
```

## Usage

Create a new prompt:

```bash
php artisan make:prompt "system instructions for a chatbot"
```

```php
\Chatvia\PromptManager\Facades\PromptManager::load()
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

- [Ahmad Mayahi](https://github.com/chatvia)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
