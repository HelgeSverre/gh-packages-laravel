<p align="center"><img width="337" height="66" src="/art/logo.svg" alt="Logo Laravel Socialite"></p>

<p align="center">
<a href="https://github.com/saeedvir/socialite-slim/actions"><img src="https://github.com/saeedvir/socialite-slim/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/saeedvir/socialite-slim"><img src="https://img.shields.io/packagist/dt/saeedvir/socialite-slim" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/saeedvir/socialite-slim"><img src="https://img.shields.io/packagist/v/saeedvir/socialite-slim" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/saeedvir/socialite-slim"><img src="https://img.shields.io/packagist/l/saeedvir/socialite-slim" alt="License"></a>
</p>

## Introduction

Laravel Socialite Slim provides a lightweight, expressive, fluent interface to OAuth authentication with Google, GitHub, and Telegram. It handles almost all of the boilerplate social authentication code you are dreading writing.

- [Chat With AI for Socialite Slim](https://context7.com/saeedvir/socialite-slim?tab=chat)


## Supported Providers

- Google
- GitHub
- Telegram

## OAuth Connected Users Feature

This package now includes a complete OAuth connected users system that allows you to track and manage OAuth connections for your users. See [OAUTH-README.md](OAUTH-README.md) for detailed documentation.

## Installation

```bash
composer require saeedvir/socialite-slim
```

### Publish Migrations

To use the OAuth connected users feature, publish the migrations:

```bash
php artisan vendor:publish --provider="Saeedvir\SocialiteSlim\SocialiteServiceProvider" --tag="socialite-migrations"
```

Then run the migrations:

```bash
php artisan migrate
```

## Configuration

After installing the Socialite Slim library, register the `Saeedvir\SocialiteSlim\SocialiteServiceProvider` in your `config/app.php` configuration file:

```php
'providers' => [
    // Other service providers...

    Saeedvir\SocialiteSlim\SocialiteServiceProvider::class,
],
```

Also, add the `Socialite` facade to the `aliases` array in your `config/app.php` configuration file:

```php
'aliases' => [
    // Other aliases...

    'Socialite' => Saeedvir\SocialiteSlim\Facades\Socialite::class,
    'OAuth' => Saeedvir\SocialiteSlim\Facades\OAuth::class,
],
```

You will also need to add credentials for the OAuth services your application utilizes. These credentials should be placed in your `config/services.php` configuration file, and should use the key `google`, `github`, or `telegram`, depending on the providers your application needs:

```php
'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => 'http://your-callback-url',
],

'github' => [
    'client_id' => env('GITHUB_CLIENT_ID'),
    'client_secret' => env('GITHUB_CLIENT_SECRET'),
    'redirect' => 'http://your-callback-url',
],

'telegram' => [
    'client_id' => env('TELEGRAM_CLIENT_ID'),
    'client_secret' => env('TELEGRAM_CLIENT_SECRET'),
    'redirect' => 'http://your-callback-url',
],
```

## Basic Usage

```php
<?php

namespace App\Http\Controllers\Auth;

use Saeedvir\SocialiteSlim\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Redirect the user to the GitHub authentication page.
     *
     * @return \Illuminate\Http\Response
     */
    public function redirectToProvider()
    {
        return Socialite::driver('github')->redirect();
    }

    /**
     * Obtain the user information from GitHub.
     *
     * @return \Illuminate\Http\Response
     */
    public function handleProviderCallback()
    {
        $user = Socialite::driver('github')->user();

        // $user->token
    }
}
```

## OAuth Connected Users Usage

To use the OAuth connected users feature, add the trait to your User model:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Saeedvir\SocialiteSlim\Traits\HasOAuthConnections;

class User extends Authenticatable
{
    use HasOAuthConnections;
    
    // ... rest of your model
}
```

Then you can use the OAuth facade to manage connections:

```php
use Saeedvir\SocialiteSlim\Facades\OAuth;

// Find or create an OAuth connected user
$connectedUser = OAuth::findOrCreateOauthUser($provider, $providerId, $userData);
```

See [OAUTH-README.md](OAUTH-README.md) for complete documentation.

## Documentation

For comprehensive documentation, please visit:

- [Main Documentation](docs/index.md)
- [API Reference](docs/api.md)
- [OAuth Feature Documentation](OAUTH-README.md)

## Contributing

Thank you for considering contributing to Socialite Slim! The contribution guide can be found in the [GitHub repository](https://github.com/saeedvir/socialite-slim/blob/master/CONTRIBUTING.md).

## Security Vulnerabilities

Please review [our security policy](https://github.com/saeedvir/socialite-slim/security/policy) on how to report security vulnerabilities.

## License

Laravel Socialite Slim is open-sourced software licensed under the [MIT license](LICENSE.md).
