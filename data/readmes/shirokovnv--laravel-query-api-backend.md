# LaravelQueryApiBackend

[![Latest Version on Packagist][ico-version]][link-packagist]
[![Total Downloads][ico-downloads]][link-downloads]
[![Build Status][ico-travis]][link-travis]
[![StyleCI][ico-styleci]][link-styleci]

Unified API for running queries with eloquent models from any http client.

For query data format and usage in frontend see [this package](https://github.com/shirokovnv/laravel-query-api-frontend)

## Installation

Via Composer

``` bash
$ composer require shirokovnv/laravel-query-api-backend
```

## Usage

Ensure all migrations done

``` bash
php artisan migrate
```

Publish configuration: 

```php
php artisan vendor:publish --provider="Shirokovnv\LaravelQueryApiBackend\LaravelQueryApiBackendServiceProvider" --tag=config
```

Once installed you can do stuff like this in Controller:

```php
$queryRunner = LaravelQueryApiBackend::makeQueryRunnerInstance($request, $options);
$queryResult = $queryRunner->run();
$queryRunner->saveLog();
      
return response()->json($queryResult);
```

$request is Illuminate\Http\Request or Illuminate\Foundation\Http\FormRequest

For available options see config section

Request must contain following keys:

> query_data

> query_mode

> client_request_id

This can be provided in middleware (check example controller and ClientRequestId middleware)

Example controller: 

> Shirokovnv\LaravelQueryApiBackend\Http\Controllers\QueryApiController

### Available query modes:

> transaction 

runs a couple of queries as a whole. If one of the queries fails,
transaction will be rolled back.

> multiple

runs a couple of queries individually.

all occurred errors will be added to the error pool with the rest of the result.

### Available types of queries:

> create

> delete

> fetch (aka select)

> find

> update

> custom

### Authorization

Package provides a way to authorize actions with your queries.

By default no authorization needed.

1. To switch it on, at first, the model you want to authorize requests for, should implement Shirokovnv\LaravelQueryApiBackend\Support\ShouldAuthorize interface.

The interface is simple and contains one static method: 

```php
    public static function shouldAuthorizeAbilities(): array;
```

This function must return array that contains names of abilities, for ex. 

```php
    return ['create', 'update', 'view', 'viewAny'];
```

Query type names and authorization ability names correlate as: 

create -> create

custom -> custom

delete -> delete

fetch -> viewAny

find -> view

update -> update

2. The second options are default [laravel policies](https://laravel.com/docs/8.x/authorization) for your models.

Each policy contains specific methods, where you feel free to implement any 
logic for query authorization.

### Validation

Each query can be validated the following way: 

1. Use Laravel FormRequest generator for model.

For ex. for App\Models\User create request with name Models\UserRequest

2. Model should implement Shirokovnv\LaravelQueryApiBackend\Support\ShouldValidate interface

with one static method: 

```php
    public static function shouldValidateActions(): array;
```

For ex: 

```php
    return ['create', 'fetch', 'update', 'delete'];
```

Available list of actions is equal to list of query type names.

3. FormRequest action name to method correlation: 

custom, create -> POST

update -> PATCH

delete -> DELETE

find, fetch -> GET

## Change log

Please see the [changelog](changelog.md) for more information on what has changed recently.

## Testing

``` bash
$ composer test
```

## Contributing

Please see [contributing.md](contributing.md) for details and a todolist.

## Security

If you discover any security related issues, please email shirokovnv@gmail.com instead of using the issue tracker.

## Credits

- [Nickolai Shirokov][link-author]
- [All Contributors][link-contributors]

## License

MIT. Please see the [license file](license.md) for more information.

[ico-version]: https://img.shields.io/packagist/v/shirokovnv/laravel-query-api-backend.svg?style=flat-square
[ico-downloads]: https://img.shields.io/packagist/dt/shirokovnv/laravel-query-api-backend.svg?style=flat-square
[ico-travis]: https://img.shields.io/travis/shirokovnv/laravel-query-api-backend/master.svg?style=flat-square
[ico-styleci]: https://styleci.io/repos/335063835/shield

[link-packagist]: https://packagist.org/packages/shirokovnv/laravel-query-api-backend
[link-downloads]: https://packagist.org/packages/shirokovnv/laravel-query-api-backend
[link-travis]: https://travis-ci.org/shirokovnv/laravel-query-api-backend
[link-styleci]: https://styleci.io/repos/335063835
[link-author]: https://github.com/shirokovnv
[link-contributors]: ../../contributors

