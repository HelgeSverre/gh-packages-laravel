# RequestResponseLog

This package for Laravel applications provides a middleware for logging HTTP requests and responses, both incoming to, 
or outgoing from your Laravel application. It offers:
- Middleware to be used with the Laravel HTTP client, Guzzle and Saloon.
- Middleware to log requests made to your application and its response.
- Functionality to manual logs requests and responses.

It's originally created to log API requests to other services and to log incoming webhooks, but can be used for any 
request and response logging.

## Requirements

This package requires Laravel 11+ and PHP 8.3+.

## Installation

You can install the package via composer:

```bash
composer require goedemiddag/request-response-log
```

The package will automatically register itself in Laravel, but you need to run the migrations:

```bash
php artisan migrate
```

You are now ready to use the package.

## Usage

This package provides two middleware solutions:
- Logging HTTP requests and responses, to be used with the Laravel HTTP client, Guzzle and Saloon.
- Logging Requests and Responses from your application.

### HTTP Logger

#### Laravel HTTP client

When using the Laravel HTTP client:

```php
use Goedemiddag\RequestResponseLog\RequestResponseLogger;
use Illuminate\Support\Facades\Http;

Http::withMiddleware(RequestResponseLogger::middleware('vendor'))
```

#### Guzzle

When initializing the client:

```php
use Goedemiddag\RequestResponseLog\RequestResponseLogger;
use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Handler\CurlHandler;

$stack = new HandlerStack();
$stack->setHandler(new CurlHandler());
$stack->push(RequestResponseLogger::middleware('vendor'));

$client = new Client(['handler' => $stack]);
```

#### Saloon

In the constructor of the connector:

```php
use Goedemiddag\RequestResponseLog\RequestResponseLogger;
use Saloon\Http\Connector;

class YourConnector extends Connector
{
    public function __construct() 
    {
        $this
            ->sender()
            ->addMiddleware(RequestResponseLogger::middleware('vendor'));    
    }
}
```

### Application logger

The package provides a middleware for your Laravel application called `ApplicationRequestResponseLogger`. This will log
the incoming request and the response your application generates. This is originally use for logging incoming webhooks, 
but feel free to use it for anything you like. Just register the middleware to a group or apply it to a route 
individually:

```php
Route::post('/webhook')
    ->uses([WebhookController::class, 'handle'])
    ->middleware([ApplicationRequestResponseLogger::class]);
```

### Manual logger

The package provides a logger for manual logging of requests and responses. This can be useful when you want to log
requests and responses that do not support the middleware or any other use case you can come up with.

```php
use Goedemiddag\RequestResponseLog\Enums\RequestFlow;
use Goedemiddag\RequestResponseLog\ManualRequestResponseLogger;

$requestLog = ManualRequestResponseLogger::fromRequest(
    vendor: 'vendor',
    request: $request,
    flow: RequestFlow::Incoming,
);
        
// TODO your code here
        
ManualRequestResponseLogger::fromResponse(
    requestLog: $requestLog,
    response: $response,
);
```

### Including backtrace

When you want to know where the request has been made for, is it possible to include the backtrace in the log. By 
default, the backtrace isn't logged, as it can contain quite a lot of data. If you want to include the backtrace, there
are several backtrace resolvers available:

- `IgnoreResolver`: Do not log the backtrace. This is the default.
- `DefaultResolver`: Logs the full PHP backtrace. This requires the most resources so be careful.
- `LaravelApplicationResolver`: Logs the Laravel backtrace, which is a bit more optimized.

#### Using the backtrace resolver

You can provide the backtrace resolver to the middleware helper:

```php
use Goedemiddag\RequestResponseLog\Support\BacktraceResolvers\DefaultResolver;

RequestResponseLogger::middleware('vendor', new DefaultResolver());
```

Or when you are using the manual logger: 

```php
use Goedemiddag\RequestResponseLog\Support\BacktraceResolvers\DefaultResolver;

ManualRequestResponseLogger::fromRequest(
    vendor: 'vendor',
    request: $request,
    flow: RequestFlow::Incoming,
    backtraceResolver: new DefaultResolver(),
);
```

#### Laravel backtraces

When using the `LaravelApplicationResolver`, you can also configure which frames to include in the backtrace. By 
default, it ignores as much as possible and tries to include the specific frames. You can configure this when 
initializing the resolver:

```php
use Goedemiddag\RequestResponseLog\Support\BacktraceResolvers\LaravelApplicationResolver;

new LaravelApplicationResolver(
    includeIndex: false, // Whether to include the frame on index.php
    includeVendor: false, // Whether to include frames from the vendor directory
    includeMiddleware: false, // Whether to include frames from the middleware directory
    includePipeline: false, // Whether to include frames from the pipeline namespace
    includeRouting: false, // Whether to include frames from the routing namespace
);
```

#### Custom backtrace resolver

Feel free to create your own backtrace resolver by implementing the `BacktraceResolver` interface. This allows you to 
create a custom backtrace resolver that fits your needs perfectly.

## Configuration

The package provides a configuration file that allows you to configure the package to your needs. You can change the 
table names to your likings, change the database connection (so you can store the logs somewhere else than your default 
database), determine which fields should be masked (even per vendor), etc. The configuration file can be published by 
running:

```bash
php artisan vendor:publish --provider="Goedemiddag\RequestResponseLog\RequestResponseLogServiceProvider" --tag="config"
```

The configuration file will be published to `config/request-response-log.php`. The configuration file contains comments
to explain more about the options.

The migrations are loaded automatically and can't be published, as everything you can configure about it, is in the 
configuration.

## Cleaning up

This package uses the default model prune functionality from Laravel to clean up old logs. You can configure the amount
of days to keep logs in the configuration file. To clean up the logs automatically, schedule the model prune command
and pass the model you want to prune:

### Laravel 11+

Add the following to your `routes/console.php` file:

```php
use Goedemiddag\RequestResponseLog\Models\RequestLog;
use Illuminate\Support\Facades\Schedule;

Schedule::command('model:prune', ['--model' => [RequestLog::class]])->daily();
```

## Laravel 10 and below

Add the following to your `app/Console/Kernel.php` file:

```php
use Goedemiddag\RequestResponseLog\Models\RequestLog;

$schedule
    ->command('model:prune', ['--model' => [RequestLog::class]])
    ->daily();
```

## Request Identifier

It is possible to provide a specific request identifier to the logger which helps you relate logs to each other. In 
case you are using the middleware or the request middleware, you can use the Laravel Context to provide the `request-identifier`. 

```php
Context::add('request-identifier', 'your-identifier');
```

When using the application middleware, make sure to set the request identifier **before** the middleware is called.

For more information on how to use this, see the `ApplicationRequestResponseLoggerTest` for an example.

## Additional context

Besides the request identifier, you can also provide additional context to the logger. This can be useful when you want 
to log some extra information that is not included in the request or response.

You can provide this context to the `ManualRequestResponseLogger` and `RequestResponseLogger::middleware`.

```php
RequestResponseLogger::middleware(
    vendor: 'middleware-test-vendor',
    context: static fn (): array => ['test' => 'value'],
);
```

The context parameter can be an array or a closure that returns an array. The closure will be executed when the log is  
created, so you can use it to provide dynamic context.

For more information on how to use this, see the `RequestResponseLoggerTest` for an example.

## Contributing

Found a bug or want to add a new feature? Great! There are also many other ways to make meaningful contributions such 
as reviewing outstanding pull requests and writing documentation. Even opening an issue for a bug you found is 
appreciated.

When you create a pull request, make sure it is tested, following the code standard (run `composer code-style:fix` to 
take care of that for you) and please create one pull request per feature. In exchange, you will be credited as 
contributor.

### Testing

To run the tests, you can use the following command:

```bash
composer test
```

### Security

If you discover any security related issues in this or other packages of Goedemiddag, please email dev@goedemiddag.nl 
instead of using the issue tracker.

# About Goedemiddag

[Goedemiddag!](https://www.goedemiddag.nl) is a digital web-agency based in Delft, the Netherlands. We are a team of 
professionals who are passionate about the craft of building digital solutions that make a difference for its users. 
See our [GitHub organisation](https://github.com/goedemiddag) for more package.
