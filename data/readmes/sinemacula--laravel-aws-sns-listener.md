# Laravel AWS SNS Listener

[![Latest Stable Version](https://img.shields.io/packagist/v/sinemacula/laravel-aws-sns-listener.svg)](https://packagist.org/packages/sinemacula/laravel-aws-sns-listener)
[![Build Status](https://github.com/sinemacula/laravel-aws-sns-listener/actions/workflows/tests.yml/badge.svg?branch=master)](https://github.com/sinemacula/laravel-aws-sns-listener/actions/workflows/tests.yml)
[![Maintainability](https://qlty.sh/gh/sinemacula/projects/laravel-aws-sns-listener/maintainability.svg)](https://qlty.sh/gh/sinemacula/projects/laravel-aws-sns-listener)
[![Code Coverage](https://qlty.sh/gh/sinemacula/projects/laravel-aws-sns-listener/coverage.svg)](https://qlty.sh/gh/sinemacula/projects/laravel-aws-sns-listener)
[![Total Downloads](https://img.shields.io/packagist/dt/sinemacula/laravel-aws-sns-listener.svg)](https://packagist.org/packages/sinemacula/laravel-aws-sns-listener)

Laravel integration package for receiving AWS SNS webhooks with signature validation, typed payload mapping, and Laravel
event dispatch.

## What This Package Does

- Registers an SNS webhook route in your Laravel app.
- Validates incoming SNS signatures with AWS certificates.
- Maps SNS payloads to typed message entities.
- Handles subscription confirmation for expected topics.
- Dispatches Laravel events for generic and provider-specific notifications.

## Installation

```bash
composer require sinemacula/laravel-aws-sns-listener
```

The service provider is auto-discovered by Laravel.

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --provider="SineMacula\Aws\Sns\SnsServiceProvider"
```

Key options (`config/aws.php`):

- `aws.sns.route`: webhook path for SNS callbacks (default: `/hooks/sns`).
- `aws.sns.topics`: expected topic ARNs for subscription confirmation checks.

Environment examples:

```dotenv
AWS_SNS_ROUTE=/hooks/sns
AWS_SNS_TOPICS=arn:aws:sns:eu-west-1:123456789012:orders,arn:aws:sns:eu-west-1:123456789012:alerts
```

To disable auto route registration, set `aws.sns.route` to `false` in config.

## Request Flow

1. SNS posts to the configured route.
2. `VerifySnsSignature` validates the message signature.
3. `MessageFactory` maps the payload to a typed message.
4. `SnsController` handles the message and dispatches events.

For `SubscriptionConfirmation`, the package confirms the subscription URL only when the topic is registered in
`aws.sns.topics`.

## Dispatched Events

- `SineMacula\Aws\Sns\Events\SubscriptionConfirmed`
- `SineMacula\Aws\Sns\Events\NotificationReceived`
- `SineMacula\Aws\Sns\Events\SNSNotificationReceived`
- `SineMacula\Aws\Sns\Events\S3NotificationReceived`
- `SineMacula\Aws\Sns\Events\SesNotificationReceived`
- `SineMacula\Aws\Sns\Events\CloudWatchNotificationReceived`

Each event carries a typed message object implementing the matching contract interface from
`SineMacula\Aws\Sns\Entities\Messages\Contracts`.

## Example Listener

```php
<?php

namespace App\Listeners;

use SineMacula\Aws\Sns\Events\S3NotificationReceived;

final class HandleS3Notification
{
    public function handle(S3NotificationReceived $event): void
    {
        foreach ($event->getNotification()->getRecords() as $record) {
            // Process each S3 record.
        }
    }
}
```

## Testing

```bash
composer test
composer test-coverage
composer check
```

## Contributing

Contributions are welcome via GitHub pull requests.

## Security

If you discover a security issue, please contact Sine Macula directly rather than opening a public issue.

## License

Licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
