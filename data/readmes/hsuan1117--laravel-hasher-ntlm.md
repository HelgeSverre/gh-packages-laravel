# laravel-hasher-ntlm
The package provides NTLM hashing for Laravel.

## Installation
```shell
composer require hsuan1117/laravel-hasher-ntlm
```

## Configuration
You must publish the configuration file to modify default hashing settings.
```shell
php artisan config:publish hashing
```

After publishing, you can find the configuration file at `config/hashing.php`. You can set the default driver to `ntlm` in the configuration file.

```php
return [
    'driver' => 'ntlm',
];
```


## References
- https://github.com/qnibus/laravel-multi-hash