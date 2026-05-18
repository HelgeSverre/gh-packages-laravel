# Laravel package for Shahin banking API

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mr-mr7/laravel-shahin.svg?style=flat-square)](https://packagist.org/packages/mr-mr7/laravel-shahin)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/mr-mr7/laravel-shahin/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/mr-mr7/laravel-shahin/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/mr-mr7/laravel-shahin/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/mr-mr7/laravel-shahin/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/mr-mr7/laravel-shahin.svg?style=flat-square)](https://packagist.org/packages/mr-mr7/laravel-shahin)

This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## Installation

First add this repository into composer.json file
``` json
"repositories": [
    {
        "type": "vcs",
        "url": "https://github.com/mr-mr7/laravel-shahin"
    }
    // Other repositories
],
```

Then you can install the package via composer:


```bash
composer require mr-mr7/laravel-shahin
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="shahin-config"
```


## Usage

```php

// اگر از قصد استفاده از مولتی-یوزر دارید یک شناسه یکتا به ازای هر کاربر باید استفاده کنید مانند ایدی
\Mrmr7\LaravelShahin\Facades\Shahin::forUser($user->id,['clientId' => '','clientSecret' => '']);

// اختصار بانک بر اساس داکیومنت شاهین
\Mrmr7\LaravelShahin\Facades\Shahin::setBank('CBI');

// تولید و ساخت توکن (اگر قصد استفاده از bank و clientId, clientSecret کانفیگ را دارید نیازی نیست اینجا پاس بدین به متد)
\Mrmr7\LaravelShahin\Facades\Shahin::token()->getTwoWayToken('CBI',$clientId,$clientSecret);

// برای گرفتن توکن تولید شده (در صورت استفاده از bank, clinetId, clientSecret موجود در کانفیگ نیازی نیست اینجا پاس داده بشن)
// در صورتی clientId, clientSercret مورد استفاده قرار میگیرن که createIfNotExists=true باشه
\Mrmr7\LaravelShahin\Facades\Shahin::token()->getToken(bank: 'CBI',clientId: $clientId,clientSecret: $clientSecret,createIfNotExists: true);

// برای گرفتن گردش حساب (در صورت پاس ندادن sourceAccount همه حساب های متصل به بانک در نظر گرفته میشوند)
\Mrmr7\LaravelShahin\Facades\Shahin::account()->accountStatement(1111111,now()->subHours(5),now());


```

## Credits

- [mr-mr7](https://github.com/mr-mr7)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
