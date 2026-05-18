# Laravel GraphQL SDK
This Laravel package is a provider for the Prepr GraphQL API.

## How to install

Install Package

```
composer require preprio/laravel-graphql-sdk
```

Added config in you're .env file and config/services.php

```
config/services.php

    'prepr' => [
        'endpoint' => env('PREPR_ENDPOINT'),
        'timeout' => env('PREPR_TIMEOUT'),
        'connect_timeout' => env('PREPR_CONNECT_TIMEOUT')
    ]
```

.env

```
PREPR_ENDPOINT={YOUR_API_ENDPOINT}
```

## Query the API

Option with query file (create file in app/Queries with .graphql extension):

```
$response = Http::prepr([
    'query' => 'name-of-the-file',
    'variables' => [
        'id' => 123,
    ]
]);
```

Option without a query file:

```
$response = Http::prepr([
    'raw-query' => 'query here',
    'variables' => [
        'id' => 123,
    ]
]);
```

Option with headers

```
$response = Http::prepr([
    'query' => 'name-of-the-file',
    'variables' => [
        'id' => 123
    ],
    'headers' => [
        'Prepr-Customer-Id' => request()->get('customer_id',request()->session()->getId())
    ]
]);
```
