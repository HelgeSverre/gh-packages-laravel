# A Laravel wrapper for the Zendesk API client

[![Latest Version on Packagist](https://img.shields.io/packagist/v/alexanderpoellmann/laravel-zendesk.svg?style=flat-square)](https://packagist.org/packages/alexanderpoellmann/laravel-zendesk)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/alexanderpoellmann/laravel-zendesk/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/alexanderpoellmann/laravel-zendesk/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/alexanderpoellmann/laravel-zendesk/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/alexanderpoellmann/laravel-zendesk/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/alexanderpoellmann/laravel-zendesk.svg?style=flat-square)](https://packagist.org/packages/alexanderpoellmann/laravel-zendesk)

## Installation

You can install the package via composer:

```bash
composer require alexanderpoellmann/laravel-zendesk
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="laravel-zendesk-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-zendesk-config"
```

This is the contents of the published config file:

```php
return [
    //
];
```

Don't forget to add the following to your `config/services.php`:

```php
return [
    'zendesk' => [
        'subdomain' => env('ZENDESK_SUBDOMAIN', null),
        'username' => env('ZENDESK_USERNAME', null),
        'token' => env('ZENDESK_TOKEN', null)
    ],
];
```

## Usage

See also https://github.com/zendesk/zendesk_api_client_php/blob/master/README.md.

```php
// Basic usage

use AlexanderPoellmann\LaravelZendesk\Zendesk;

$zendesk = app(Zendesk::class);

// or

$zendesk = zendesk();

// Create or update a user

$user = zendesk()->createOrUpdateUser(
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
);

ray($user);

// Upload an attachment.

$media = $model->getFirstMedia(); // e.g. spatie/laravel-medialibrary

$upload = zendesk()->uploadAttachment(
    filePath: $media->getPath(),
    mimeType: $media->mime_type,
    fileName: $media->file_name,
);

ray($upload);

// Create an anonymous request

$request = zendesk()->createAnonymousRequest(
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    recipientEmailAddress: 'support@example.com',
    subject: 'Help!',
    body: '"My printer is on fire!',
    uploads: [$upload->token], // optional
);

ray($request);

// Create a ticket

$ticket = zendesk()->createTicket(
    subject: 'The quick brown fox jumps over the lazy dog',
    body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, ' .
          'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    priority: Priorities::Normal,
    uploads: [$upload->token], // optional
]);

ray($ticket);

// Create a ticket by directly accessing the Zendesk API clients tickets() method

$ticket = zendesk()->authenticate()->tickets()->create([
    'subject'  => 'The quick brown fox jumps over the lazy dog',
    'comment'  => [
        'body' => 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, ' .
                  'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    ],
    'priority' => 'normal'
]);

ray($ticket);
```

Through the `Zendesk` facade you may access any methods available on the `Zendesk\API\Client` class ([documentation](https://github.com/zendesk/zendesk_api_client_php#usage)).

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

- [AlexanderPoellmann](https://github.com/AlexanderPoellmann)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
