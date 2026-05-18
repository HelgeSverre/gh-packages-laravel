# REST Messages

[![Latest Version on Packagist](https://img.shields.io/packagist/v/victormgomes/rest-messages.svg?style=flat-square)](https://packagist.org/packages/victormgomes/rest-messages)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/victormgomes/rest-messages/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/victormgomes/rest-messages/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/victormgomes/rest-messages/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/victormgomes/rest-messages/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/victormgomes/rest-messages.svg?style=flat-square)](https://packagist.org/packages/victormgomes/rest-messages)
[![License](https://img.shields.io/packagist/l/victormgomes/rest-messages.svg?style=flat-square)](https://packagist.org/packages/victormgomes/rest-messages)

**Standardized message responses for REST resources**

---

## Introduction

**Rest Messages** is a lightweight package designed to standardize success messages across your Laravel REST API. It automatically detects the model name and the current CRUD action (index, store, update, destroy) to generate localized and professional response messages.

### Why use this package?

*   **Consistency**: Ensure every success response in your API follows the same linguistic pattern.
*   **Automatic Detection**: No need to manually type messages for every controller action. The package "just knows" what you're doing.
*   **Localized**: Built-in support for multiple languages with proper grammar and gender resolution for model names.
*   **Clean API**: Focus on your data, while the package handles the communication part of your REST interface.

---

## Support us

We invest a lot of resources into creating [best in class open source packages](https://github.com/victormgomes). You can support us by [sponsoring us on GitHub](https://github.com/sponsors/VictorMGomes).

---

## Installation

You can install the package via composer:

```bash
composer require victormgomes/rest-messages
```

---

## Usage

Simply use the `HasResourceMessages` trait in your response helpers or base controllers.

```php
use Victormgomes\RestMessages\Traits\HasResourceMessages;

class ApiResponse
{
    use HasResourceMessages;

    public function success($data)
    {
        return response()->json([
            'message' => $this->message(),
            'data' => $data,
        ]);
    }
}
```

The `$this->message()` method will automatically resolve the model and action from the current route context. For example, if called from `UserController@store`, it will return: *"User created successfully."*

---

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Credits

- [Victor M. Gomes](https://github.com/VictorMGomes)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
