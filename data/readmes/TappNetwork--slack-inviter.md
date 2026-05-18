# Laravel Slack Inviter

[![Latest Version on Packagist](https://img.shields.io/packagist/v/tapp/slack-inviter.svg?style=flat-square)](https://packagist.org/packages/tapp/slack-inviter)
[![Quality Score](https://img.shields.io/scrutinizer/g/tapp/slack-inviter.svg?style=flat-square)](https://scrutinizer-ci.com/g/tapp/slack-inviter)
[![Total Downloads](https://img.shields.io/packagist/dt/tapp/slack-inviter.svg?style=flat-square)](https://packagist.org/packages/tapp/slack-inviter)

## Installation

You can install the package via composer:

```bash
composer require tapp/slack-inviter
```

## Appearance

![Slack Inviter Form](https://raw.githubusercontent.com/TappNetwork/slack-inviter/master/docs/form.png)

## Usage

Add the Slack env vars on your `.env` file:

```php
SLACK_COMMUNITY_NAME=
SLACK_TEAM_URL=
SLACK_LEGACY_TOKEN=
```

Add the inviter form on your blade file:

```php
<div>
    @include('slack-inviter::invite-form', [ 
        'email' => auth()->user()->email 
    ])
</div>
```

You're all set!

### Testing

``` bash
composer test
```

### Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

### Security

If you discover any security related issues, please email security@tappnetwork.com instead of using the issue tracker.

## Credits

- [Tapp Network](https://github.com/TappNetwork)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Laravel Package Boilerplate

This package was generated using the [Laravel Package Boilerplate](https://laravelpackageboilerplate.com).
