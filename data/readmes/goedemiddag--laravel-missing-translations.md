# Laravel Missing Translations finder

This package allows you to find discrepancies between your languages.

## Installation

First use composer to install the package using the following command

```sh
composer require goedemiddag/laravel-missing-translations
```

## Configuration

In `config/lang.php` you can choose to use a different Comparer. The default (and only provided)
comparer works by comparing all languages against your application's base language. Create your
own comparer to implement different behaviour.

## Usage

```sh
php artisan lang:missing
```
