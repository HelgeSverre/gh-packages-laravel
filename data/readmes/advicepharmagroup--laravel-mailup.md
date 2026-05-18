# MailUp driver

[![Latest Version on Packagist](https://img.shields.io/packagist/v/advicepharmagroup/mailup.svg?style=flat-square)](https://packagist.org/packages/advicepharmagroup/mailup)
[![Total Downloads](https://img.shields.io/packagist/dt/advicepharmagroup/mailup.svg?style=flat-square)](https://packagist.org/packages/advicepharmagroup/mailup)

A Laravel package for sending emails using the MailUp service API.

## Installation

You can install the package via composer:

```bash
composer require advicepharmagroup/mailup
```

## Basic Usage

* In the `config/services.php` file add the following lines of code:

```php
...

'mailup' => [
    'host'       => env('MAILUP_HOST'),
    'user'       => env('MAILUP_USER'),
    'secret'     => env('MAILUP_SECRET'),
    'proxy'      => env('MAILUP_PROXY'),
    'force_html' => true,
],

...

```

* In the `config/mail.php` file add the following lines of code:
```php
'mailers' => [

    ...

    'mailup' => [
        'transport'  => 'mailup',
    ],
],
```

* In your .env file:

```env
...

MAILUP_HOST=HOST
MAILUP_USER=YOUR_USERNAME
MAILUP_SECRET=YOUR_SECRET

...
```

* Example:

```php
Route::get('/mail', function () {

    Mail::raw('Hello world', function (Message $message) {
        $message
            ->to('to@mail.com')
            ->from('from@mail.com');
    });

});
```