# aruba-pec-laravel
Laravel package to send PEC emails with Aruba

## Install
```composer require regoldidealista/aruba-pec-laravel```

## Publish config
```php artisan vendor:publish --tag=aruba-mail-config```

## Add accounts:
in the config file```aruba-pec.php```add, under the "accounts" key, an array like the "default" one
```
'accounts' => [
        'default' => [
            'username' => env('ARUBA_PEC_USERNAME'),
            'password' => env('ARUBA_PEC_PASSWORD'),
            'from' => [
                'address' => env('ARUBA_PEC_FROM_ADDRESS'),
                'name' => env('ARUBA_PEC_FROM_NAME'),
            ],
        ],
        'secondary_address' => [
            'username' => env('ARUBA_PEC_SECONDARY_USERNAME'),
            'password' => env('ARUBA_PEC_SECONDARY_PASSWORD'),
            'from' => [
                'address' => env('ARUBA_PEC_SECONDARY_FROM_ADDRESS'),
                'name' => env('ARUBA_PEC_SECONDARY_FROM_NAME'),
            ],
        ],
    ]
```

## .env

```
ARUBA_PEC_HOST=smtps.pec.aruba.it
ARUBA_PEC_PORT=465
ARUBA_PEC_ENCRYPTION=ssl
ARUBA_PEC_USERNAME=
ARUBA_PEC_PASSWORD=
ARUBA_PEC_FROM_ADDRESS=
ARUBA_PEC_FROM_NAME=
```