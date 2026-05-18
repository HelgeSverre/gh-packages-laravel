# read-time

Laravel package to determine the read time of a text. 

## Requirements

This package requires at least Laravel 11+ and PHP 8.2 or newer.

## Installation

You can install the package via composer:

`composer require vdhicts/read-time`

## Usage

This package can be used multiple ways. When the content contains HTML, the HTML is stripped before calculating the read
time.

### Helper

The helper returns the amount of minutes (as integer) it should take for the reader to read the text. 

```php
read_time($text);
read_time($text, $wordPerMinute);
```

### Blade

The blade directive returns the amount of minutes (as integer) it should take for the reader to read the text.

```php
@readTime($text)
@readTime($text, $wordPerMinute)
```

### Direct usage

The class offers a bit more functionality.

```php
use Vdhicts\ReadTime\ReadTime;

$readTime = new ReadTime($text);
// OR $readTime = new ReadTime($text, $wordsPerMinute);
$readTime->minutes(); // the amount of minutes (as integer) it should take to read
$readTime->seconds(); // the amount of seconds (as integer) it should take to read
$readTime->wordCount(); // the amount of words (as integer) found in the text
```

### Custom configuration

Publish the configuration with:

`php artisan vendor:publish --provider="Vdhicts\ReadTime\ReadTimeServiceProvider"`

## Tests

Unit tests are available in the `tests` folder. Run with:

`composer test`

When you want a code coverage report which will be generated in the `build/report` folder. Run with:

`composer test-coverage`

## Contribution

Any contribution is welcome, but it should meet the PSR-12 standard and please create one pull request per feature/bug.
In exchange, you will be credited as contributor on this page.

## Security

If you discover any security related issues in this or other packages of Vdhicts, please email security@vdhicts.nl instead
of using the issue tracker.

## Support

If you encounter a problem with this package or has a question about it, feel free to open an issue on GitHub.

## License

This package is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).

## About Vdhicts

[Vdhicts](https://www.vdhicts.nl) is the name of my personal company for which I work as freelancer. Vdhicts develops
and implements IT solutions for businesses and educational institutions.
