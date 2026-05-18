<div align="center">

<h3 align="center">Laravel Slack</h3>
</div>

[![Test](https://github.com/Joeri-Abbo/laravel-slack/actions/workflows/test.yml/badge.svg)](https://github.com/Joeri-Abbo/laravel-slack/actions/workflows/test.yml)
[![Test](https://github.com/Joeri-Abbo/laravel-slack/actions/workflows/psalm.yml/badge.svg)](https://github.com/Joeri-Abbo/laravel-slack/actions/workflows/psalm.yml)
[![Test](https://github.com/Joeri-Abbo/laravel-slack/actions/workflows/composer-normalize.yml/badge.svg)](https://github.com/Joeri-Abbo/laravel-slack/actions/workflows/composer-normalize.yml)
[![Test](https://github.com/Joeri-Abbo/laravel-slack/actions/workflows/php-normalize.yml/badge.svg)](https://github.com/Joeri-Abbo/laravel-slack/actions/workflows/php-normalize.yml)

## Getting Started

### Prerequisites
- Php 8 and up
- Laravel 9 
### Installation
To get started require the package with composer.

```bash
composer require joeri-abbo/laravel-slack

```
Publish the package for laravel
```bash
php artisan vandor:publish --provider="JoeriAbbo\LaravelSlack\LaravelSlackServiceProvider"
```

Now go to your config folder and edit the slack.php file.
Add your channel id and channel name like below
```php 
<?php
return [
    'bearer_token' => env('SLACK_BEARER_TOKEN'),
    'channels' => [
        'my-new-log-channel' => '#ID-of-slack-channel',
    ]
];
```
Now add the JoeriAbbo\Slack\SlackPackageServiceProvider:class to your providers array in config/app.php

And add your bearer token to your .env file with SLACK_BEARER_TOKEN

Now you can easily use the slack for logging or notifications. 
To notify the channel use the following function.
```php 
app('slack.log')->sendMessage('This is a test message')
```
## Usage

## Releases

version 1.0.0

- Initial release