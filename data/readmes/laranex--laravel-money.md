# A Laravel package to work with Money Fields

[![Latest Version on Packagist](https://img.shields.io/packagist/v/laranex/laravel-money.svg?style=flat-square)](https://packagist.org/packages/laranex/laravel-money)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/laranex/laravel-money/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/laranex/laravel-money/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/laranex/laravel-money/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/laranex/laravel-money/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/laranex/laravel-money.svg?style=flat-square)](https://packagist.org/packages/laranex/laravel-money)

Tired of working with money fields in Laravel? This package is for you. It provides a simple way to work with money fields in Laravel.
Before using this package, get yourself familiar with [MoneyPHP](https://moneyphp.org/).


## Installation

You can install the package via composer:

```bash
composer require laranex/laravel-money
```


## Usage
- parseMoney (A helper to convert string into Money/Money Object. See More At [\Laranex\LaravelMoney\LaravelMoney.php](./src/LaravelMoney.php)
    ```php
    (new \Laranex\LaravelMoney\LaravelMoney())->parseMoney($amount);
    \Laranex\LaravelMoney\Facades\LaravelMoney::parseMoney($amount);
    ```
- MoneyTrait (A trait to work with money fields in Laravel Eloquent Model. See More At [\Laranex\LaravelMoney\HasMoneyFields.php](./src/Traits/HasMoneyFields.php)
    ```php
    use Laranex\LaravelMoney\Traits\HasMoneyFields;
  
    class Wallet extends Model
    {
        protected $moneyFields = ['balance'];
    
        use HasMoneyFields;
    }
  
    // Storing Money Field
    $wallet = new Wallet();
    $wallet->balance = \Laranex\LaravelMoney\Facades\LaravelMoney::parseMoney($amount);
  
    // Retrieving Money Field
    $wallet = Wallet::find(1);
    $moneyObject = $wallet->balance; // Returns Money Object
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

- [Nay Thu Khant](https://github.com/naythukhant)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
