# Event sender for Laravel

![Laravel 5.8](https://img.shields.io/badge/Laravel-^5.8-rgb(246,21,0)?logo=laravel)
![PHPStan Level 8](https://img.shields.io/badge/phpstan-8-brightgreen?logo=php)
![test coverage](https://img.shields.io/badge/test%20coverage-81%25-brightgreen?logo=php)
![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)

## Install

Add this repository to your `composer.json`:
```json
"repositories": [
    {
    "type": "vcs",
    "url": "https://github.com/DAICAR-SRL/laravel-send-event-package.git"
    }
]
```

Install the package via Composer:
```bash
composer require daicar/laravel-event-sender
```

Create and customize the configuration file `config/daicar-eventsender.php`:
```php
return [
    'driver' => env('DAICAR_EVENT_SENDER_DRIVER', 'sqs'),

    'drivers' => [

        'sqs' => [
            'region' => env('DAICAR_EVENT_SENDER_SQS_REGION', 'eu-west-1'),
            'version' => 'latest',
            'credentials' => [
                'key' => env('DAICAR_EVENT_SENDER_SQS_KEY'),
                'secret' => env('DAICAR_EVENT_SENDER_SQS_SECRET'),
            ],
            'queue_url' => env('DAICAR_EVENT_SENDER_SQS_QUEUE_URL'),
        ],

    ],

    'backup_directory' => env('DAICAR_EVENT_SENDER_BACKUP_PATH', storage_path('app/daicarevents')),
];

```
Add the following parameters to your `.env`:
```bash
DAICAR_EVENT_SENDER_ENABLED=true
DAICAR_EVENT_SENDER_SQS_KEY=IAM_USER
DAICAR_EVENT_SENDER_SQS_SECRET=IAM_SECRET
DAICAR_EVENT_SENDER_SQS_QUEUE_URL=https://sqs.REGION.amazonaws.com/ACCOUNT/QUEUE-NAME
```

## Usage

### Send an event

Method syntax
```php
app(\Daicar\EventSender\Laravel\EventSender::class)
    ->send($productName, $dataArray);
```

Example:
```php
$response = app(\Daicar\EventSender\Laravel\EventSender::class)
    ->send('ideal', [
        'side' => 'backend',
        'env' => env('APP_ENV'),
        'user' => Auth::id(),
        'eventName' => $eventName,
        'data' => $data,
    ]);
```

`$response` contains the UUID of the sent message.

### Available Exceptions
 - `SendException`: generic error
 - `DriverException`: driver misconfiguration (e.g. SQS url is not valid)
 - `BackupException`: thrown when storing the JSON file fails

### Available commands

List events that have not been sent yet
```bash
php artisan event-sender:list
```

Retry sending failed events
```bash
php artisan event-sender:retry
```
