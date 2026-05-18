# PhantomJS Laravel Testing

The PhantomJS Laravel Testing package allows you to easily test your Laravel application's JavaScript functionality.
It makes use of the PhantomJS headless browser to emulate how a real use would interact with your pages. If 
you have done regular Laravel testing, you'll be happy to know that this package attempts to match its syntax 
as much as possible.

**💡 NOTE: If you're starting a new project, I recommend using [Laravel Dusk](https://laravel.com/docs/master/dusk) instead.  [PhantomJS development is being suspended](https://github.com/ariya/phantomjs/issues/15344) and will likely not receive any future updates.**

## Features

* Identical syntax to standard Laravel testing code where possible
* PhantomJS-powered headless browser allows full functionality testing, including JavaScript & AJAX
* Makes use of database transactions to prevent testing having permanent effects on the database
* Optional auto-start of PhantomJS if a `phantomjs` binary is available

## Requirements

* Laravel 8.x
* PHP 7.4+
* A PhantomJS binary available in `PATH` or via `PHANTOMJS_BIN` (only needed if you use `PhantomJSTestCase`)

## Installation

1. Install via `composer require jord-jd/phantomjs-laravel-testing`.
2. Add global middleware `\JordJD\PhantomJSLaravelTesting\Http\Middleware\GlobalMiddleware::class` to `app/Http/Kernel.php` `middleware` array.

## Usage

Simply change your test classes to extend `PhantomJSTestCase` instead of `TestCase`, then run your unit tests as you normally do. PhantomJS will
automatically be started up when required.

By default, `PhantomJSTestCase` will try:
- `PHANTOMJS_BIN` (full path to `phantomjs`)
- `vendor/bin/phantomjs`
- `phantomjs` in `PATH`

Set `PJS_LT_DISABLE_AUTOSTART=1` to disable auto-start.

An example test case is shown below.

```php

<?php

use JordJD\PhantomJSLaravelTesting\Objects\PhantomJSTestCase;

class ExampleTestCase extends PhantomJSTestCase
{
    public function testGoogleShowsImFeelingLucky()
    {
    
        $this->visit('https://google.co.uk/');
        $this->see('I\'m Feeling Lucky');
    }

    public function testGoogleShowsImFeelingDucky()
    {
        $this->visit('https://google.co.uk/');
        $this->see('I\'m Feeling Ducky');
    }
}

```
