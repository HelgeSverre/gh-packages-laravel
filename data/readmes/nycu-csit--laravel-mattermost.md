# nycu-csit/laravel-mattermost

This package provides the custom Mattermost Notification Channel for Laravel 10+ applications.

## Installation

```shell
composer require nycu-csit/laravel-mattermost
```

## Usage

1. Add Mattermost config in the `services.php`

    ```php
    // services.php
    'mattermost' => [
        'webhook_url' => env('MATTERMOST_WEBHOOK_URL'),
    ],
    ```

1. Use `MattermostChannel` in `via` method, and define `toMattermost` method which should return an instance of `MattermostMessage`. You can return falsy value from that method to not send the message to Mattermost.

    ```php
    <?php

    namespace App\Notifications;

    use NycuCsit\LaravelMattermost\MattermostChannel;
    use NycuCsit\LaravelMattermost\MattermostMessage;
    use Illuminate\Bus\Queueable;
    use Illuminate\Notifications\Notification;

    class NotifyMeetingStartEnd extends Notification
    {
        use Queueable;

        public function __construct(private Meeting $meeting)
        {
        }
        /**
        * Get the notification channels.
        */
        public function via(object $notifiable)
        {
            return [MattermostChannel::class];
        }

        /**
        * Get the payload of the mattermost webhook.
        * See on the [official website](https://developers.mattermost.com/integrate/webhooks/incoming/#parameters).
        * 
        * Notification can exit early without actually sending to Mattermost
        * channel by returning from falsy value.
        */
        public function toMattermost(object $notifiable)
        {
            // exit early
            if ($this->meeting->started) {
                return null;
            }
            // https://developers.mattermost.com/integrate/webhooks/incoming/#parameters
            return (new MattermostMessage)
                ->text('...')
                ->channel('town-square');
        }
    }
    ```

## Testing

```sh
./vendor/bin/phpunit
```
