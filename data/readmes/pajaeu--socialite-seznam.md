# Seznam.cz Provider for Laravel Socialite

Simple package that extends Laravel Socialite with [Seznam.cz](https://vyvojari.seznam.cz/oauth) provider, it can be easily used for user authentication via Seznam.cz, which is quite common in Czechia.

## Installation & Basic Usage

### Install this package via composer:

```bash
composer require pajaeu/socialite-seznam
```

### Add configuration to `config/services.php`

```php
'seznam' => [    
  'client_id' => env('SEZNAMCZ_CLIENT_ID'),  
  'client_secret' => env('SEZNAMCZ_CLIENT_SECRET'),  
  'redirect' => env('SEZNAMCZ_REDIRECT_URI') 
],
```

### Usage

You should now be able to use the provider like you would regularly use Socialite:

```php
return Socialite::driver('seznam')->redirect();
```