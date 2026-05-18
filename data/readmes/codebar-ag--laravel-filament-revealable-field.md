<img src="https://banners.beyondco.de/Laravel%20Filament%20Revealable%20Field.png?theme=light&packageManager=composer+require&packageName=codebar-ag%2Flaravel-filament-revealable-field&pattern=circuitBoard&style=style_1&description=A+Laravel+Filament+Revealable+Field+integration.&md=1&showWatermark=1&fontSize=100px&images=light-bulb">

[![Latest Version on Packagist](https://img.shields.io/packagist/v/codebar-ag/laravel-filament-revealable-field.svg?style=flat-square)](https://packagist.org/packages/codebar-ag/laravel-filament-revealable-field)
[![GitHub-Tests](https://github.com/codebar-ag/laravel-filament-revealable-field/actions/workflows/run-tests.yml/badge.svg?branch=main)](https://github.com/codebar-ag/laravel-filament-revealable-field/actions/workflows/run-tests.yml)
[![GitHub Code Style](https://github.com/codebar-ag/laravel-filament-revealable-field/actions/workflows/fix-php-code-style-issues.yml/badge.svg?branch=main)](https://github.com/codebar-ag/laravel-filament-revealable-field/actions/workflows/fix-php-code-style-issues.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/codebar-ag/laravel-filament-revealable-field.svg?style=flat-square)](https://packagist.org/packages/codebar-ag/laravel-filament-revealable-field)

## 💡 What is Filament Revealable Field?

Filament Revealable Field is an Infolist Field for toggling the visibility of sensitive data. It provides a secure way to display confidential information that can be revealed on demand, with optional copy-to-clipboard functionality.

## 🛠 Requirements

| Package |     PHP     | Laravel | Filament Infolists |
|:-------:|:-----------:|:-------:|--------------------|
| v13.0.0 (alpha)  | ^8.3        |  ^13.x   | ^4.0               |
| v12.0.0  | ^8.2        |  ^12.x   | ^3.0               |
| v2.0.0  | ^8.2 - ^8.3 |  11.x   | ^3.2               |
| v1.0.0  | ^8.2 - ^8.3 |  11.x   | ^3.2               |


## ⚙️ Installation

You can install the package via composer:

```bash
composer require codebar-ag/laravel-filament-revealable-field
```

### CSS Setup

Add the following to your `resources/css/app.css` file:

```css
@source '../../vendor/codebar-ag/laravel-filament-revealable-field/src/Infolists/Components/RevealableEntry.php';
```


## Usage

Infolists:
```php
use CodebarAg\FilamentRevealableField\Infolists\Components\RevealableEntry;

...

public function infolist(Infolist $infolist): Infolist
{
    return $infolist
        ->schema([
            RevealableEntry::make('revealable')
                ->label('REVEALABLE')
                ->copyable() // Enable copy functionality
                ->copyMessage('Value copied!') // Custom copy message
                ->copyableState('Custom copy text'); // Custom text to copy
        ]);
}
...
````

## 📋 Features

### Revealable Content
- Click the eye icon to toggle visibility of sensitive data
- Hidden content is displayed as asterisks (`********`)
- Secure by default - content is hidden until explicitly revealed

### Copyable Content
- Enable copy-to-clipboard functionality with `->copyable()`
- Customize copy message with `->copyMessage('Custom message')`
- Set custom text to copy with `->copyableState('Custom text')`
- Set copy message duration with `->copyMessageDuration(3000)`

### Available Methods
```php
RevealableEntry::make('field_name')
    ->label('Field Label')
    ->copyable() // Enable copy functionality
    ->copyMessage('Value copied to clipboard!') // Custom success message
    ->copyableState('Custom text to copy') // Custom text to copy (defaults to field value)
    ->copyMessageDuration(3000); // Message duration in milliseconds (default: 2000)
```

## 🚧 Testing

Copy your own phpunit.xml-file.

```bash
cp phpunit.xml.dist phpunit.xml
```

Run the tests:

```bash
./vendor/bin/pest
```



## 📝 Changelog

Please see [CHANGELOG](CHANGELOG.md) for recent changes.

## ✏️ Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

```bash
composer test
```

### Code Style

```bash
./vendor/bin/pint
```

## 🧑‍💻 Security Vulnerabilities

Please review [our security policy](.github/SECURITY.md) on reporting security vulnerabilities.

## 🙏 Credits
- [Rhys Lees](https://github.com/RhysLees)
- [Sebastian Fix](https://github.com/StanBarrows)
- [All Contributors](../../contributors)
- [Skeleton Repository from Spatie](https://github.com/spatie/package-skeleton-laravel)
- [Laravel Package Training from Spatie](https://spatie.be/videos/laravel-package-training)

## 🎭 License

The MIT License (MIT). Please have a look at [License File](LICENSE.md) for more information.
