# Nincomply SSO package for Laravel Framework

[![Latest Version on Packagist](https://img.shields.io/packagist/v/eximius/laravel-nincomply-sso.svg?style=flat-square)](https://packagist.org/packages/eximius/laravel-nincomply-sso)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/eximius/laravel-nincomply-sso/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/eximius/laravel-nincomply-sso/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/eximius/laravel-nincomply-sso/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/eximius/laravel-nincomply-sso/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/eximius/laravel-nincomply-sso.svg?style=flat-square)](https://packagist.org/packages/eximius/laravel-nincomply-sso)

Nincomply SSO package for Laravel Framework

[//]: # (## Support us)

[//]: # ([<img src="https://github-ads.s3.eu-central-1.amazonaws.com/laravel-nincomply-sso.jpg?t=1" width="419px" />]&#40;https://spatie.be/github-ad-click/laravel-nincomply-sso&#41;)

[//]: # (We invest a lot of resources into creating [best in class open source packages]&#40;https://spatie.be/open-source&#41;. You can support us by [buying one of our paid products]&#40;https://spatie.be/open-source/support-us&#41;.)

[//]: # (We highly appreciate you sending us a postcard from your hometown, mentioning which of our package&#40;s&#41; you are using. You'll find our address on [our contact page]&#40;https://spatie.be/about-us&#41;. We publish all received postcards on [our virtual postcard wall]&#40;https://spatie.be/open-source/postcards&#41;.)

## Installation

You can install the package via composer:

```bash
composer require eximius/laravel-nincomply-sso
```

You need to add the following parameters to your .env file and their appropriate values, you must have created an account on Nincomply and 
obtained the SSO credentials before you can do this.
```env
NINCOMPLY_CLIENT_ID=
NINCOMPLY_CLIENT_SECRET=
NINCOMPLY_SSO_REDIRECT_URI=
```

(Optional) You may publish the config file with:

```bash
php artisan vendor:publish --tag="nincomply-sso-config"
```

This is the contents of the published config file:

```php
return [
    'client_id' => env('NINCOMPLY_CLIENT_ID'),
    'client_secret' => env('NINCOMPLY_CLIENT_SECRET'),
    'redirect_uri' => env('NINCOMPLY_SSO_REDIRECT_URI'),
];
```

## Usage

To get the redirect URL where users will get to sign in using their Nincomply account credentials.
```php
use Eximius\Nincomply;
use Illuminate\Support\Facades\Redirect;

$nincomply = new Nincomply();
Redirect::to($nincomply->ssoUrl());

```

OR

You may use the Nincomply Facade
```php
use Eximius\Nincomply\Facades\Nincomply;
use Illuminate\Support\Facades\Redirect;

Redirect::to(Nincomply::ssoUrl());

```

To get the access token. This is when the user gets redirected back to your website after signing in on the Nincomply SSO, there
will be a `code` parameter in the URL, that is what you need to get the access token.
```php
use Eximius\Nincomply\Facades\Nincomply;

$code = request()->query('code');
$accessToken = Nincomply::getAccessToken($code));

Sample response:
{
  "token_type": "Bearer",
  "expires_in": 1295999,
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJkMDNiZjQwNC0yYWU4LTRmMjQtYTk3My1lZWIyZjNlNjA2NDEiLCJqdGkiOiIwYzZhMjBmNWJjMDBmYmZhMDk1OWQ0NzRhMTZjMDQ2N2FiYzhiOWE4YTE1Y2M4OTUxN2EyZmQzZjk1NGQ4MGRmMGUyYTUxYzdjZWFkOTYwZCIsImlhdCI6MTcyNDMxNDEzNy40MjYwMzgwMjY4MDk2OTIzODI4MTI1LCJuYmYiOjE3MjQzMTQxMzcuNDI2MDQ3MDg2NzE1Njk4MjQyMTg3NSwiZXhwIjoxNzI1NjEwMTM0LjI0NzU2MDk3NzkzNTc5MTAxNTYyNSwic3ViIjoiMSIsInNjb3BlcyI6W119.c7FbFljz-I3nKaSzOqy5cK9DR0q1azC3weXIB86nWVHGkZXY3hSrjCcMXrF3ccEO8RmWT3RS4IdxkuWMV2VLVYntg-ueqO7f2HI0s1SRobbOZyAAbww1D0lnhavCfMAIshhCLkewCdUEwQMZF9AL0SPO2jMVYTPGjQOroRN2YBaBa9Z7ybQUetszeuF10ha2FI42PumgCaXDs_8XSrPQO6k1CYO0YDRPfo8-bs4mBSE8PQyba4vmgL_7bfNjUr3nC7G8JvY3jkmOzKVDnQgVpwQRB33mJs93BJ8AyOa4E5N-0h0MJPbNv_2phZI4kjHAEow1mIJkF8Gz5zkRtyxbYEvBanCSeGiVaung7mVlAQ4haipf6C8yE1AHXccxfBNOiTGdPb0a0Fkt2JaCscxZkMp7DS5S4xRvaAMpCn7xBQpztlTHWytBY96mJ3vVzOE5KdBLgH3bVR_DaRddw4mpLBwMnyJHT5NIj83tn_GWy9G2WzD7ay9TQOV8L4edfdQlrQxs1wItwX7F7zZh0Hv1r-agQLXY3AzGQHEwYCSTL1kphUxJR860Dl8hkaXhfVpUiMyIwP1zcN-5kk6Y7zH2NBfrKOXjb5AdnqltRM-rd0kIk0qNuSJnv1RKf3I8QTDKuBO15nFuODkYFktxLmMRQz-V97DqUYeY_m0OevbcuLo",
  "refresh_token": "def5020050d2d10c0a4a6c9abaac312cb81709fd4bc1f56ed48428b2d65dd4db9c4338e8888ecd4588a7c958fb68c9b8027ee6a3359d1fd788e6c60c6323550f427c302cc70689f36c45f1e601e10020321ae9a1eca107720a7de48707da78f24ed7625dc0f211efdfe5d7dd7b1a38b45bec018181572f7249981ca635b381c97bbd9b86f478beeb30b56a413f4de5b44719e898618b83db44429a31b057d6369ca196dcab79f6201e692934b8028e9435a7e87b0bf7a8706847018367189aeb3e1a85341995f1767dd5c883dd4c7bc928627b39f13e35fcf699f3da97946cb3cb099c6ff3f7a794ab057f42382ab45e625f649de1844aa29cf693b6094b29c67e964087b847e7582557bf8d6b3a2b80fbf3b5a47684f37cb34e53d36a71e5b67de3b6dfb91c87aaf6407db9ba4430083e3c1327b0c88f5d95aa3f35578e18a7420a2a17490d1419c804371dcdcbbd6ce6608b6e279a6bbe4db0d821a3ef93cfea8a3c59091bba5a128c456d691449e67e3ac8b5ce8cf079464033611e5d9a29256c3415"
} 

```

To get the details of the authenticated user, you will need the access token from the request above.
```php
use Eximius\Nincomply\Facades\Nincomply;

$user = Nincomply::getUser($accessToken));

```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.


## Credits

- [Kazeem Asifat](https://github.com/Kazeeem)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
