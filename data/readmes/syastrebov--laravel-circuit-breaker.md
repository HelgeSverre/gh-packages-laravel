PHP Circuit Breaker implementation for microservices and API calls.

Laravel package for https://github.com/syastrebov/circuit-breaker library.

## Install

~~~bash
composer require syastrebov/laravel-circuit-breaker

php artisan vendor:publish --provider="CircuitBreaker\\Laravel\\CircuitBreakerServiceProvider"
~~~

## Config

~~~php
return [

    // Supported drivers (redis, predis, memcached, database, memory) 
    'driver' => 'redis',
    
    'logger' => [
        'channel' => '',
    ],

    'connections' => [
        'redis' => [
            'connection' => 'default',
        ],
        'database' => [
            'connection' => '',
            'table' => 'circuit_breaker',
        ],
    ],

    'configs' => [
        'default' => [
            'retries' => 3,
            'closed_threshold' => 3,
            'half_open_threshold' => 3,
            'retry_interval' => 1000,
            'open_timeout' => 60,
            'fallback_or_null' => false,
        ],
    ],
];
~~~

## Usage

### Simple example:

#### Default config:

~~~php
use CircuitBreaker\Laravel\Facades\CircuitBreaker;

public function request(): string
{
    try {
        // creates default config
        return CircuitBreaker::make()->run('test', static function () {
            return '{"response": "data"}';
        });
    } catch (UnableToProcessException $e) {
        // handle exception
    }
}
~~~

#### Custom config:

circuit-breaker.php

~~~php
return [

    'configs' => [
        'api' => [
            'retries' => 3,
            'closed_threshold' => 3,
            'half_open_threshold' => 3,
            'retry_interval' => 1000,
            'open_timeout' => 60,
            'fallback_or_null' => false,
        ],
    ],
];
~~~

~~~php
use CircuitBreaker\Laravel\Facades\CircuitBreaker;

public function request(): string
{
    try {
        return CircuitBreaker::make('api')->run('test', static function () {
            return '{"response": "data"}';
        });
    } catch (UnableToProcessException $e) {
        // handle exception
    }
}
~~~

### Stub response:

~~~php
use CircuitBreaker\Laravel\Facades\CircuitBreaker;

public function request(): string
{
    return CircuitBreaker::make()->run(
        '{endpoint}',
        static function () {
            return (string) (new Client)->get('https://domain/api/{endpoint}')->getBody();
        },
        static function () {
            return json_encode([
                'data' => [
                    'key' => 'default value',
                ],
            ]);
        }
    );
}
~~~

### Cache response:

~~~php
use CircuitBreaker\Laravel\Facades\CircuitBreaker;

public function request(): string
{
    return CircuitBreaker::make()->run(
        '{endpoint}',
        static function () {
            $response = (string) (new Client)->get('https://{domain}/api/{endpoint}')->getBody();
            Cache::set('circuit.{endpoint}.response', $response);
    
            return $response;
        },
        static function () {
            return Cache::get('circuit.{endpoint}.response');
        }
    );
}
~~~

Using CacheableCircuitBreaker:

~~~php
use CircuitBreaker\Laravel\Facades\CircuitBreaker;

public function request(): string
{
    return CircuitBreaker::makeCacheable()->run('{endpoint}', static function () {
        return (string) (new Client)->get('https://{domain}/api/{endpoint}')->getBody();
    });
}
~~~

## Multiple instances

circuit-breaker.php

~~~php
return [

    'configs' => [
        'api1' => [
            'retries' => 3,
            'closed_threshold' => 3,
            'half_open_threshold' => 3,
            'retry_interval' => 1000,
            'open_timeout' => 60,
            'fallback_or_null' => false,
        ],
        'api2' => [
            'retries' => 5,
            'closed_threshold' => 5,
            'half_open_threshold' => 5,
            'retry_interval' => 3000,
            'open_timeout' => 120,
            'fallback_or_null' => false,
        ],
    ],
];
~~~

~~~php
use CircuitBreaker\Laravel\Facades\CircuitBreaker;

public function requestApi1(): string
{
    return CircuitBreaker::makeCacheable('api1')->run('/users', static function () {
        return (string) (new Client)->get('https://{api1.domain}/api/users')->getBody();
    });
}

public function requestApi2(): string
{
    return CircuitBreaker::makeCacheable('api2')->run('/users', static function () {
        return (string) (new Client)->get('https://{api2.domain}/api/users')->getBody();
    });
}
~~~
