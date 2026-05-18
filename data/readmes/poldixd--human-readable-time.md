# Show date time or human readable time 🕐 👀

This package shows date time or human readable time. You can adjust the exact time when the package shows the date time instead the human readable time.

Human readable time example:

```php
$datetime = \Carbon\Carbon::parse('2021-05-05 10:30:00')->subMinutes(15);

<x:human-readable-time :datetime="$datetime" />
```

Output:

```html
<!-- Output -->
<time datetime="2021-05-05 10:15:00">15 minutes before</time>
```

Date time example:

```php
$datetime = \Carbon\Carbon::parse('2021-05-05 10:30:00')->subMinutes(90);

<x:human-readable-time :datetime="$datetime" />
```

Output:

```html
<!-- Output -->
<time datetime="2021-05-05 09:00:00">2021-05-05 09:00:00</time>
```

You can adjust the time when the date time is displayed. The default time is 1 hour.


```php
$datetime = \Carbon\Carbon::parse('2021-05-05 10:30:00')->subMinutes(120);

<x:human-readable-time :datetime="$datetime" human-until="-3 hours" />
```

Output:

```html
<!-- Output -->
<time datetime="2021-05-05 09:00:00">2 hour before</time>
```

## Requirements

- Laravel 9.x or Laravel 10.x
- PHP 8.x

## Installation

You can install the package via composer:

```bash
composer require poldixd/human-readable-time
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Credits

- [Nils Poltmann](https://github.com/poldixd)
- [All Contributors](../../contributors)


## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.