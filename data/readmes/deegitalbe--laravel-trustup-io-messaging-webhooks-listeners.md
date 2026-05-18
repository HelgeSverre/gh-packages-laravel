# laravel-trustup-io-messaging-webhooks-listeners

## Compatibility

| Laravel | Package |
|---|---|
| 8.x / 9.x | 1.x |
| 12.x | 2.x |

## Prerequisite
This package uses ``deegitalbe/server-authorization`` package to authenticate requests. Refer to its [documentation](https://github.com/deegitalbe/server-authorization) to make sure it's correctly configured on your project.

## Installation
```shell
composer require deegitalbe/laravel-trustup-io-messaging-webhooks-listeners
```

## Publish configuration
```shell
php artisan vendor:publish --provider="Deegitalbe\LaravelTrustupIoMessagingWebhooksListeners\Providers\LaravelTrustupIoMessagingWebhooksListenersServiceProvider" --tag="config"
```

## Available listeners

### Message created
Define your listener
```php
use Deegitalbe\LaravelTrustupIoMessagingWebhooksListeners\Contracts\Listeners\Messages\TrustupIoMessagingMessageCreatedListenerContract;

class MessageCreatedListener implements TrustupIoMessagingMessageCreatedListenerContract
{
    public function onMessageCreated(array $webhookData): void
    {
        
    }
}
```
Register your listener in config
```php
    /**
     * Messaging microservice listeners.
     */
    "listeners" => [
        /**
         * Message related listeners.
         */
        "messages" =>  [
            /**
             *  Message created listener.
             * 
             * @implements \Deegitalbe\LaravelTrustupIoMessagingWebhooksListeners\Contracts\Listeners\Messages\TrustupIoMessagingMessageCreatedListenerContract
             */
            "created" => MessageCreatedListener::class
        ]
    ]
```
Webhook data structure
```js
{
    "message": {
    "id": 4339,
    "type": "text",
    "text": "The order of the message is not really good",
    "status": null,
    "user_id": 38943,
    "conversation_id": 2767,
    "conversation": {
        "id": 2767,
        "app_name": "trustup-io-ticketing",
        "type": "conversation",
        "title": "null",
        "model": "ticket",
        "model_id": "840942e5-b63e-4ab5-8f72-079e7a35be0e",
        "user_id": 38943,
        "meta": null,
        "deleted_at": null,
        "created_at": "2023-02-23T15:59:08.000000Z",
        "updated_at": "2023-02-23T15:59:08.000000Z"
    },
    "seen_by": [],
    "deleted_at": null,
    "created_at": "2023-02-24T14:54:37.000000Z",
    "updated_at": "2023-02-24T14:54:37.000000Z"
    }
}
```

## Listener configuration
Add any of those interfaces to your listener to customize it.

### Limit to your current app only
```php
use Deegitalbe\LaravelTrustupIoMessagingWebhooksListeners\Contracts\Listeners\Config\ListenToCorrespondingAppKey;

class MessageCreatedListener implements ListenToCorrespondingAppKey
```