# AWS SNS Notifications for Laravel Apps

[![tests](https://github.com/descom-es/aws-sns-notifications/actions/workflows/tests.yml/badge.svg)](https://github.com/descom-es/aws-sns-notifications/actions/workflows/tests.yml)
[![analyze](https://github.com/descom-es/aws-sns-notifications/actions/workflows/analyze.yml/badge.svg)](https://github.com/descom-es/aws-sns-notifications/actions/workflows/analyze.yml)
[![style](https://github.com/descom-es/aws-sns-notifications/actions/workflows/style_fix.yml/badge.svg)](https://github.com/descom-es/aws-sns-notifications/actions/workflows/style_fix.yml)

## Install

```bash
composer require descom/aws-sns-notification
```

## Usage

### Create en SNS a subscription HTTPS to a topic

`https://localhost:8000/aws/sns/webhook`

### Capture Events

#### TopicSubscriptionRequest

```php
use Descom\AwsSnsNotification\Events\TopicSubscriptionRequest;
use Illuminate\Support\Facades\Http;

class SnsSubscriptionConfirmation
{
    public function handle(TopicSubscriptionRequest $event): void
    {
        logger()->info('SNS subscription request', [
            'topic' => $event->topicArn(),
        ]);

        // Confirm the subscription by sending a GET request to the SubscribeURL

        Http::get($event->subscribeUrl());
    }
}
```

#### TopicNotification

```php
use Descom\AwsSnsNotification\Events\TopicNotification;
use Illuminate\Support\Facades\Http;

class SnsNotificationLogger
{
    public function handle(TopicNotification $event): void
    {
        logger()->info('SNS Notification received', [
            'topic' => $event->topicArn(),
            'subject' => $event->subject(),
            'message' => $event->toJson(),
        ]);
    }
}
```
