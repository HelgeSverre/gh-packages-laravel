<div align="center">بسم الله الرحمن الرحيم</div>
<div align="left">

# Anvil

[![Latest Version on Packagist](https://img.shields.io/packagist/v/goodm4ven/anvil.svg?style=for-the-badge&color=gray)](https://packagist.org/packages/goodm4ven/anvil)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/goodm4ven/PACKAGE_LARAVEL_anvil/pest.yml?branch=main&label=tests&style=for-the-badge&color=forestgreen)](https://github.com/goodm4ven/PACKAGE_LARAVEL_anvil/actions?query=workflow%3Apest+branch%3Amain)
[![Coverage Status](https://img.shields.io/codecov/c/github/goodm4ven/PACKAGE_LARAVEL_anvil/main?style=for-the-badge&color=purple)](https://codecov.io/gh/goodm4ven/PACKAGE_LARAVEL_anvil)
[![Total Downloads](https://img.shields.io/packagist/dt/goodm4ven/anvil.svg?style=for-the-badge&color=blue)](https://packagist.org/packages/goodm4ven/anvil)

An internal package used for Laravel package development...


## Installation

Install the package with [`Composer`](https://getcomposer.org/):

```bash
composer require --dev goodm4ven/anvil
```


## Usage

I'm doing my best to make the helper classes "activatable" or injectable with ease. This is what we have, so far:

### Laravel Booster incorrect alias for package development

Inject this to a service provider's `register` method:
```php
\GoodMaven\Anvil\Fixes\RegisterLaravelBoosterJsonSchemaFix::activate();
```

### Synchronize environment variables & configurations for Workbench testing

1. Inside your `TestCase.php` class, use this **trait**:
```php
use \GoodMaven\Anvil\Concerns\TestableWorkbench;
```

2. Inside the same class Testbench's `getEnvironmentSetUp` method, call this method:
```php
$this->setDatabaseTestingEssentials();
```

### PestPHP Livewire Testing Methods

In order to bypass the issue of assigning specific waiting time for input fields to update correctly, we have these 2 helper methods:

```php
use GoodMaven\Anvil\Support\LivewireTester;

LivewireTester::waitForDomInputValue($page, $selector, $expectedValue);
LivewireTester::waitForRenderedInputValue($page, $selector, $expectedValue);
```


## Development

This package was initiated based on my [Laravel package template](https://github.com/goodm4ven/PACKAGE_LARAVEL_anvil/blob/main/README.md#development) that is built on top of [Spatie's](https://github.com/spatie/package-skeleton-laravel). Make sure to read the docs for both.

### Tasks

- // TODO Unit testing all features


## Support

Support ongoing package maintenance as well as the development of **other projects** through [sponsorship](https://github.com/sponsors/GoodM4ven) or one-time [donations](https://github.com/sponsors/GoodM4ven?frequency=one-time&sponsor=GoodM4ven) if you prefer.

### Credits
- [ChatGPT & Codex](https://developers.openai.com/codex)
- [GoodM4ven](https://github.com/GoodM4ven)
- [All Contributors](../../contributors)

</div>
<br>
<div align="center">والحمد لله رب العالمين</div>
