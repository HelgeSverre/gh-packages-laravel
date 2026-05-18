# Stepped Form Submitter for Laravel

[![PHPUnit, PHPCS, PHPStan Tests](https://github.com/lexalium/laravel-stepped-form-submitter/actions/workflows/tests.yml/badge.svg)](https://github.com/lexalium/laravel-stepped-form-submitter/actions/workflows/tests.yml)

The package is based on the [Form Submitter](https://github.com/lexalium/form-submitter) and built for the
Laravel framework.

<a id="readme-top" mame="readme-top"></a>

Table of Contents

1. [Requirements](#requirements)
2. [Installation](#installation)
3. [Configuration](#configuration)
   - [Publish the config](#publish-the-config)
   - [Available config options](#available-config-options)
4. [Usage](#usage)
5. [License](#license)

## Requirements

**PHP:** >=8.2

**Laravel:** ^11.0 || ^12.0

## Installation

Via Composer

```
composer require lexal/laravel-stepped-form-submitter
```

## Configuration

### Publish the config

Run the following command to publish the package config file:

```shell
php artisan vendor:publish --provider="Lexal\LaravelSteppedFormSubmitter\ServiceProvider\ServiceProvider"
```

### Available config options

The configuration file `config/form-submitter.php` has the following options:

1. `transaction_class` - place a class name, instance or service alias which the FormSubmitter will use to handle
   transactions. Place `null` or remove config to disable transactions.
   ```php
   'transaction_class' => DatabaseTransaction::class,
   ```

2. `submitters` - specify at least one form submitter that the stepped form will use to submit entity on FormFinished
   event. Must implement `FormSubmitterInterface`.
   ```php
   'submitters' => [
       // list of form submitters
   ],
   ```

<div style="text-align: right">(<a href="#readme-top">back to top</a>)</div>

## Usage

1. [Publish configuration file](#publish-the-config).
2. Add form transaction implementation, if necessary.
   ```php
   use Lexal\FormSubmitter\Transaction\TransactionInterface;
   
   final class DatabaseTransaction implements TransactionInterface
   {
        public function start(): void
        {
            // start transaction
        }
   
        public function commit(): void
        {
            // commit transaction
        }
   
        public function rollback(): void
        {
            // rollback transaction
        }
   }
   ```

3. Create custom form submitters.
   ```php
   use Lexal\FormSubmitter\FormSubmitterInterface;
   
   final class CustomerFormSubmitter implements FormSubmitterInterface
   {
       public function supportsSubmitting(mixed $entity): bool
       {
           return $entity instanceof Customer;
       }
       
       public function submit(mixed $entity): mixed
       {
           // save entity to the database
           
           return $entity;
       }
   }
   ```

4. Update configuration file. Add form submitters and transaction class (if necessary).
   ```php
   return [
       'transaction_class' => DatabaseTransaction::class,
       'submitters' => [
           CustomerFormSubmitter::class,
       ],
   ];
   ```

5. Form submitter will call your custom form submitter automatically if it supports submitting of stepped-form entity.

<div style="text-align: right">(<a href="#readme-top">back to top</a>)</div>

---

## License

Laravel Stepped Form Submitter is licensed under the MIT License.
See [LICENSE](LICENSE) for the full license text.
