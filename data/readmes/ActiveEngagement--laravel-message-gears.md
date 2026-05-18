# MessageGears for Laravel

[![CI](https://github.com/ActiveEngagement/laravel-message-gears/actions/workflows/ci.yml/badge.svg)](https://github.com/ActiveEngagement/laravel-message-gears/actions/workflows/ci.yml)

A Laravel package for the MessageGears API. Provides fluent Cloud and Accelerator API clients, a notification channel, and a Symfony Mailer transport.

## Requirements

- PHP 8.3+
- Laravel 11, 12, or 13

## Installation

```bash
composer require actengage/laravel-message-gears
```

The service provider is auto-discovered.

## Configuration

Add your MessageGears credentials to `config/services.php`:

```php
// config/services.php

return [
    'messagegears' => [
        'cloud' => [
            'accountId' => env('MESSAGEGEARS_ACCOUNT_ID'),
            'apiKey'    => env('MESSAGEGEARS_API_KEY'),
        ],
        'accelerator' => [
            'accountId' => env('MESSAGEGEARS_ACCELERATOR_ACCOUNT_ID'),
            'apiKey'    => env('MESSAGEGEARS_ACCELERATOR_API_KEY'),
        ],
        'campaign_id' => env('MESSAGEGEARS_CAMPAIGN_ID'),
    ],
];
```

## Usage

### Sending a Transactional Email Notification

```php
use Actengage\MessageGears\Notifications\TransactionalEmail;

$notification = TransactionalEmail::make()
    ->campaignId('CAMPAIGN_ID')
    ->context([
        'SubjectLine' => 'Welcome!',
        'HtmlContent' => '<h1>Hello</h1>',
        'TextContent' => 'Hello',
    ]);

$user->notify($notification);
```

### Cloud API

The Cloud facade authenticates automatically and prepends the API version to URIs.

```php
use Actengage\MessageGears\Facades\Cloud;

// Authenticated POST request
$response = Cloud::authenticate()->post('campaign/transactional/CAMPAIGN_ID', [
    'json' => [
        'accountId' => 'ACCOUNT_ID',
        'recipient' => [
            'data' => ['EmailAddress' => 'user@example.com'],
            'format' => 'JSON',
        ],
    ],
]);
```

### Accelerator API

```php
use Actengage\MessageGears\Facades\Accelerator;

$response = Accelerator::post('endpoint', [
    'json' => ['key' => 'value'],
]);
```

### Mail Transport

You can use MessageGears as a Laravel mail transport. Add the mailer to `config/mail.php`:

```php
// config/mail.php

'mailers' => [
    'messagegears' => [
        'transport' => 'messagegears',
        'campaign_id' => env('MESSAGEGEARS_CAMPAIGN_ID'),
    ],
],
```

Then send mail as usual:

```php
Mail::mailer('messagegears')->to('user@example.com')->send(new WelcomeEmail());
```

### TransactionalEmail Options

The `TransactionalEmail` notification supports a full set of fluent options:

```php
TransactionalEmail::make()
    ->campaignId('CAMPAIGN_ID')
    ->campaignVersion('v2')
    ->context(['SubjectLine' => 'Hello'])
    ->category('marketing')
    ->correlationId('corr-123')
    ->latestSendTime('2030-01-01 12:00:00')
    ->notificationEmailAddress('alerts@example.com')
    ->fromAddress('noreply@example.com')
    ->fromName('My App')
    ->replyToAddress('support@example.com');
```

## Testing

```bash
composer test           # Run Pest tests
composer lint           # Run Pint
composer analyse        # Run PHPStan
composer rector         # Run Rector (dry-run)
```

## License

MIT
