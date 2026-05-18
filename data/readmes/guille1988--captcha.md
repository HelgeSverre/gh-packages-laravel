# Installation and usage instructions:

## What it does:

This package allows you to integrate Captcha V2 or V3 to your Laravel application.

## Installation:

```bash
composer require felipetti/captcha
```

## Usage instructions:

First you publish config file:

```bash
php artisan vendor:publish --tag=captcha
```

Config file named captcha.php is published in config folder of root directory. Open the file and put the secret key provided by Google inside "secret_key" field.

```php
/*
    |--------------------------------------------------------------------------
    | Secret Key
    |--------------------------------------------------------------------------
    |
    | This is the Captcha key that only back-end has.
    |
    */

    'secret_key' => ''
```

There are three ways of captcha service integration, assuming $captcha is the field where front-end sends captcha response:

### Form request:

```php
    use Felipetti\Captcha\Rule\CaptchaVerification;
    
    public function rules()
    {
        $captcha = ['required', 'string', new CaptchaVerification];
        
        return compact('captcha');
    }
```

### Request validation:

Let's suppose we have a captcha controller, and we want to make validation inside:

```php
use Felipetti\Captcha\Rule\CaptchaVerification;
use Illuminate\Http\Request;

class CaptchaController extends Controller
{
    public function __invoke(Request $request)
    {
        $request->validate(
            ['captcha' => [new CaptchaVerification]]
        );

        //...
    }
}
```

### Validator:

```php
use Felipetti\Captcha\Rule\CaptchaVerification;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

class CaptchaController extends Controller
{
    public function __invoke(Request $request)
    {
        $rules  = ['captcha' => [new CaptchaVerification]];

        Validator::make($request->only('captcha'), $rules)->validate();

        //...
    }
}
```

## Config:

Explanations in config file are quite expressive, so if you have any questions, please email [guill388@hotmail.com](mailto:guill388@hotmail.com).

## Comments:

Please star me if you liked the package, it will really help me a lot.

## Security:

If you discover any security-related issues, please e-mail me to the one above instead of using the issue tracker.

## License:

The MIT License (MIT).
