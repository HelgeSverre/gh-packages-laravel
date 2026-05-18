<img src="https://banners.beyondco.de/Laravel%20Postfinance%20B2B.png?theme=light&packageManager=composer+require&packageName=codebar-ag%2Flaravel-postfinance-b2b&pattern=circuitBoard&style=style_2&description=An+opinionated+way+to+integrate+postfinance-b2b+with+Laravel&md=1&showWatermark=0&fontSize=150px&images=document-download&widths=500&heights=500">

[![Latest Version on Packagist](https://img.shields.io/packagist/v/codebar-ag/laravel-postfinance-b2b.svg?style=flat-square)](https://packagist.org/packages/codebar-ag/laravel-postfinance-b2b)
[![GitHub-Tests](https://github.com/codebar-ag/laravel-postfinance-b2b/actions/workflows/run-tests.yml/badge.svg?branch=main)](https://github.com/codebar-ag/laravel-postfinance-b2b/actions/workflows/run-tests.yml)
[![GitHub Code Style](https://github.com/codebar-ag/laravel-postfinance-b2b/actions/workflows/fix-php-code-style-issues.yml/badge.svg?branch=main)](https://github.com/codebar-ag/laravel-postfinance-b2b/actions/workflows/fix-php-code-style-issues.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/codebar-ag/laravel-postfinance-b2b.svg?style=flat-square)](https://packagist.org/packages/codebar-ag/laravel-postfinance-b2b)

This package was developed to give you a quick start to communicate with the
PostFinance B2B REST API.

## 💡 What is PostFinance B2B?

PostFinance B2B is a digital interface for all your invoices
where you can send and receive your invoices electronically.

## 🛠 Requirements

| Package |     PHP     | Laravel | 
|:-------:|:-----------:|:-------:|
| v12.0.0 | ^8.2 - ^8.4 |  12.x   |
| v11.0.0 | ^8.2 - ^8.3 |  11.x   |

## ⚙️ Installation

You can install the package via composer:

```bash
composer require codebar-ag/laravel-postfinance-b2b
```

Add the following environment variables to your `.env` file:

```bash
POSTFINANCE_B2B_USERNAME=
POSTFINANCE_B2B_PASSWORD=
```

## 🏗 Usage

Invoice download web services provided by PostFinance

## 🚧 Testing

Copy your own phpunit.xml-file.

```bash
cp phpunit.xml.dist phpunit.xml
```

Modify environment variables in the phpunit.xml-file:

```xml
    <env name="POSTFINANCE_B2B_WSDL" value="wds"/>
    <env name="POSTFINANCE_B2B_CACHE_WSDL" value="wsdl"/>
    <env name="POSTFINANCE_B2B_USERNAME" value="username"/>
    <env name="POSTFINANCE_B2B_PASSWORD" value="password"/>
    <env name="POSTFINANCE_B2B_DEBUG" value="debug"/>

    <env name="POSTFINANCE_B2B_TESTS_PAYER_ID" value=""/>
    <env name="POSTFINANCE_B2B_TESTS_BILLER_ID" value=""/>
    <env name="POSTFINANCE_B2B_TESTS_TRANSACTION_ID" value=""/>
    <env name="POSTFINANCE_B2B_TESTS_FILE_TYPE" value="RGXMLSIG"/>
```

Run the tests:

```bash
./vendor/bin/pest
```

## 📝 Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## ✏️ Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

```bash
POSTFINANCE_B2B_USERNAME=xxxxx POSTFINANCE_B2B_PASSWORD='XXXXX' POSTFINANCE_B2B_DEBUG=true composer test
```

### Code Style

```bash
./vendor/bin/pint
```

## 🧑‍💻 Security Vulnerabilities

Please review [our security policy](.github/SECURITY.md) on how to report security vulnerabilities.

## 🙏 Credits

- [Sebastian Bürgin-Fix](https://github.com/StanBarrows)
- [All Contributors](../../contributors)
- [Skeleton Repository from Spatie](https://github.com/spatie/package-skeleton-laravel)
- [Laravel Package Training from Spatie](https://spatie.be/videos/laravel-package-training)

## 🎭 License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
