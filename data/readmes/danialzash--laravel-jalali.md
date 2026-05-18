# Laravel Jalali

[![Latest Version on Packagist](https://img.shields.io/packagist/v/danialzash/laravel-jalali.svg?style=flat-square)](https://packagist.org/packages/danialzash/laravel-jalali)
[![License](https://img.shields.io/packagist/l/danialzash/laravel-jalali.svg?style=flat-square)](https://packagist.org/packages/danialzash/laravel-jalali)

A Laravel package that provides seamless Jalali (Shamsi/Persian) date formatting with Carbon integration.

## Requirements

- PHP 8.1+
- Laravel 10, 11, or 12

## Installation

Install the package via Composer:

```bash
composer require danialzash/laravel-jalali
```

The package will auto-register its service provider and facade.

### Publish Configuration (Optional)

```bash
php artisan vendor:publish --tag=jalali-config
```

This will create a `config/jalali.php` file where you can set the default date format:

```php
return [
    'default_format' => 'datetime', // Options: 'datetime', 'date', 'time', or custom format
];
```

## Usage

### Using the Helper Function

The simplest way to convert dates to Jalali:

```php
// Current date/time in Jalali
jalali();

// Convert a specific date
jalali('2024-03-20');

// With custom format
jalali(now(), 'Y/m/d');

// From a Carbon instance
jalali($user->created_at, 'l j F Y');
```

### Using the Facade

```php
use Danialzash\LaravelJalali\Facades\Jalali;

// Get a Jalalian instance
$jalaliDate = Jalali::from(now());

// Format directly
$formatted = Jalali::format(now(), 'Y-m-d H:i:s');
```

### Using Carbon Macros

The package adds two macros to Laravel's Carbon class:

```php
use Illuminate\Support\Carbon;

// Get a Jalalian instance from Carbon
$jalali = Carbon::now()->toJalali();

// Get a formatted Jalali string directly
$dateString = Carbon::now()->toJalaliString('Y/m/d');

// Works with any Carbon instance
$user->created_at->toJalaliString(); // e.g., "1402/12/30 14:30:00"
```

### Working with Jalalian

The `toJalali()` method returns a `Morilog\Jalali\Jalalian` instance, giving you access to all its methods:

```php
$jalali = now()->toJalali();

$jalali->getYear();       // 1402
$jalali->getMonth();      // 12
$jalali->getDay();        // 30
$jalali->format('l j F'); // پنجشنبه 30 اسفند
$jalali->ago();           // 2 ساعت پیش
```

## Format Characters

Common format characters (from `morilog/jalali`):

| Character | Description | Example |
|-----------|-------------|---------|
| `Y` | Full year | 1402 |
| `y` | Two-digit year | 02 |
| `m` | Month (zero-padded) | 01-12 |
| `n` | Month | 1-12 |
| `d` | Day (zero-padded) | 01-31 |
| `j` | Day | 1-31 |
| `H` | Hour (24-hour, zero-padded) | 00-23 |
| `i` | Minutes (zero-padded) | 00-59 |
| `s` | Seconds (zero-padded) | 00-59 |
| `F` | Full month name | فروردین |
| `l` | Full day name | شنبه |
| `D` | Short day name | ش |

## Examples

```php
// In a Blade template
<p>تاریخ ثبت‌نام: {{ $user->created_at->toJalaliString('Y/m/d') }}</p>

// In a controller
public function show(User $user)
{
    return [
        'name' => $user->name,
        'joined' => jalali($user->created_at, 'j F Y'),
    ];
}

// With Eloquent
$posts = Post::latest()->get()->map(fn ($post) => [
    'title' => $post->title,
    'date' => $post->created_at->toJalaliString('Y/m/d'),
]);
```

## Testing

```bash
composer test
```

## Credits

- [Danial Zash](https://github.com/danialzash)
- [morilog/jalali](https://github.com/morilog/jalali) - The underlying Jalali date library

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
