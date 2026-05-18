# A simple package for tracking user activities on your Laravel website.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/combindma/laravel-trail.svg?style=flat-square)](https://packagist.org/packages/combindma/laravel-trail)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/combindma/laravel-trail/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/combindma/laravel-trail/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/combindma/laravel-trail/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/combindma/laravel-trail/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/combindma/laravel-trail.svg?style=flat-square)](https://packagist.org/packages/combindma/laravel-trail)

Laravel Trail is a powerful and easy-to-use package for tracking user activities on your Laravel website. Developed by Combind, this package automatically logs important information such as UTM tags, referrers, user actions, and more, giving you valuable insights into your users behavior and their journey through your website.

## But WHY ?

The Laravel Trail is designed to help developers effortlessly capture and store user activity data on their websites. This package enables you to track vital information such as UTM tags, referrers, and user actions, which can be used to gain valuable insights into user behavior and website performance.

By storing this information, developers can easily integrate it with their preferred tracking tools, such as Google Analytics or other analytics platforms, to further analyze user interactions and optimize their websites for improved user experience, conversion rates and improve their marketing targeting.

## Features

- **Effortless Tracking**: Automatically track user activities without any additional code
- **Capture Important Data**: Log UTM tags, referrers, and user actions for valuable insights
- **Cookies Integration**: Store tracked data in cookies
- **Customizability**: Easily extend and modify the package to track additional data or events
- **Documentation & Support**: Benefit from comprehensive documentation and support

## About Combind Agency

[Combine Agency](https://combind.ma?utm_source=github&utm_medium=banner&utm_campaign=laravel_trail) is a leading web development agency specializing in building innovative and high-performance web applications using modern technologies. Our experienced team of developers, designers, and project managers is dedicated to providing top-notch services tailored to the unique needs of our clients.

If you need assistance with your next project or would like to discuss a custom solution, please feel free to [contact us](mailto:hello@combind.ma) or visit our [website](https://combind.ma?utm_source=github&utm_medium=banner&utm_campaign=laravel_trail) for more information about our services. Let's build something amazing together!


## Installation

You can install the package via composer:

```bash
composer require combindma/laravel-trail
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-trail-config"
```

This is the contents of the published config file:

```php
return [
     /*
     * The prefix key under which data is saved to the cookies.
     */
    'prefix' => env('TAIL_COOKIE_PREFIX', config('app.name', 'laravel')).'_',

    /*
     * The cookie duration in seconds used to store data. By default, we use 180 days.
     */
    'cookie_duration' => env('TAIL_COOKIE_DURATION', 60 * 24 * 180),

    /*
     * Enable or disable script rendering. Useful for local development.
     */
    'enabled' => env('TAIL_ENABLED', false),
];
```

## Monitored Tags
Laravel Trail automatically tracks and stores the following tags, providing valuable insights into user behavior, traffic sources, and user demographics:

1. **UTM Tags**
    - `utm_source`: Identifies the traffic source (e.g., google, newsletter, referral_website).
    - `utm_medium`: Describes the marketing medium (e.g., cpc, email, social).
    - `utm_campaign`: Provides details about the specific marketing campaign or promotion (e.g., spring_sale, newsletter_april).
    - `utm_term`: Captures the keywords used for paid search campaigns (e.g., running+shoes, digital+marketing).
    - `utm_content`: Differentiates between multiple links within the same ad or content piece (e.g., logo_link, text_link).


2. **Additional Tags**
    - `anonymous_id`: A unique identifier for tracking anonymous users on your website.
    - `user_id`: A unique identifier for registered or logged-in users on your website.
    - `email`: A unique email for registered or logged-in users on your website.
    - `name`: Full name for registered or logged-in users on your website.
    - `landing_page`: The first page the user visits on your website during a session.
    - `exit_page`: The last page the user visits before leaving your website.
    - `ip_address`: The user's IP address, which can provide insights into their location and network.
    - `last_activity`: The date and time of the user's most recent activity on your website.
    - `user_agent`: The user agent string, which provides detailed information about the user's browser, operating system, and device.
    - `language`: The user's preferred language, as specified in their browser settings.
    - `referrer`: The URL of the referring website that sent the user to your website.
    - `referrer_code`: A unique code or ID associated with the referrer (e.g., an affiliate partner or referral program).


3. **Expected Tags for the futur**
    - `device`: The type of device used by the user (e.g., desktop, tablet, mobile).
    - `browser`: The user's web browser (e.g., Chrome, Firefox, Safari).
    - `operating_system`: The user's operating system (e.g., Windows, macOS, Android, iOS).
    - `screen_resolution`: The user's screen resolution.
    - `page_views`: The number of pages viewed by the user during a single session.
    - `conversion_date`: The date when a user completes a desired action or goal (e.g., making a purchase or signing up for a newsletter).

These tags can help you optimize your website for better user experience and higher conversion rates by giving you a deeper understanding of user interactions and traffic patterns.

## Usage

### Add the setup middleware

This middleware is responsable for setting: anonymous_id, user_id, exit_page, landing_page, last_activity, user_agent, ip_address, language
```php
// app/Http/Kernel.php
protected $middleware = [
    ...
    \Illuminate\Session\Middleware\StartSession::class,
    \Combindma\Trail\Middleware\TrailSetupMiddleware::class,
    ...
];
``` 

### Save UTM tags
You have 2 options to save the utm tags:

#### 1. In your controller

```php
    public function index(Request $request)
    {
        \Combindma\Trail\Facades\Trail::setUtmCookies($request);
        
        //...
    }
```

#### 2. Using a middleware in your route

```php
   Route::group([ 'middleware' => ['web', \Combindma\Trail\Middleware\HandleUtmTagsMiddleware::class]], function () {
            Route::get('/test-trail', function (Request $request) {
                //...
            });
        });  //...
    }
```

### Save Referrer
You have 2 options to save the utm tags:

#### 1. In your controller

```php
    public function index(Request $request)
    {
        \Combindma\Trail\Facades\Trail::setReferrerCookies($request);
        
        //...
    }
```

#### 2. Using a middleware in your route

```php
   Route::group([ 'middleware' => ['web', \Combindma\Trail\Middleware\CaptureReferrerMiddleware::class]], function () {
            Route::get('/test-trail', function (Request $request) {
                //...
            });
        });  //...
    }
```

### Save User ID or Email
You can capture a user id or email using an url with those parameters: user_id or email.

For exemple: domaine.com?user_id=123456&email=email@email.com 

You have 2 options to save the user:

#### 1. In your controller

```php
    public function index(Request $request)
    {
        \Combindma\Trail\Facades\Trail::setUserCookie($request);
        
        //...
    }
```

#### 2. Using a middleware in your route

```php
   Route::group([ 'middleware' => ['web', \Combindma\Trail\Middleware\CaptureUserMiddleware::class]], function () {
            Route::get('/test-trail', function (Request $request) {
                //...
            });
        });  //...
    }
```

### Identify a user
The only required parameter is userId:

```php
   \Combindma\Trail\Facades\Trail::identify($userId);//User id can be an email if you don't offer a sign-up in your website
   \Combindma\Trail\Facades\Trail::identify($userId, 'email@domain.com', 'full name'); //you may also save an email with a name
```

### Get the cookies data
In order to get the saved data you can request it using:
```php
   \Combindma\Trail\Facades\Trail::data($request);
   \Combindma\Trail\Facades\Trail::data(); //Behind the scene uses request() helper
```

This will return a formatted data object:
```php
    readonly class TrailDto
    {
        public function __construct(
            public string $anonymousId,
            public ?string $userId,
            public ?string $email,
            public ?string $name,
            public ?string $landingPage,
            public ?string $exitPage,
            public ?string $lastActivity,
            public ?string $ipAddress,
            public ?string $language,
            public ?string $userAgent,
            public ?string $referrer,
            public ?string $referrerCode,
            public ?string $utmSource,
            public ?string $utmMedium,
            public ?string $utmCampaign,
            public ?string $utmTerm,
            public ?string $utmContent,
    ) {
    }
}
```

### Additional methods
```php
   \Combindma\Trail\Facades\Trail::disable(); //Disable in the fly
   \Combindma\Trail\Facades\Trail::enable(); //Enable in the fly
   \Combindma\Trail\Facades\Trail::getAnonymousId(); //Get anonymous id
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Combind](https://github.com/combindma)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
