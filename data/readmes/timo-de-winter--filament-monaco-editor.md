# Filament Monaco Editor

[![Latest Version on Packagist](https://img.shields.io/packagist/v/timo-de-winter/filament-monaco-editor.svg?style=flat-square)](https://packagist.org/packages/timo-de-winter/filament-monaco-editor)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/timo-de-winter/filament-monaco-editor/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/timo-de-winter/filament-monaco-editor/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/timo-de-winter/filament-monaco-editor/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/timo-de-winter/filament-monaco-editor/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/timo-de-winter/filament-monaco-editor.svg?style=flat-square)](https://packagist.org/packages/timo-de-winter/filament-monaco-editor)

A package to implement the monaco editor into a filament project. Including a morphable model to relate code to any model.
Obviously, you can use only the editor without publishing and running the migrations for the morphable model.

## Installation

You can install the package via composer:
```bash
composer require timo-de-winter/filament-monaco-editor
```

You can publish and run the migrations with:
```bash
php artisan vendor:publish --tag="filament-monaco-editor-migrations"
php artisan migrate
```

You can publish the config file with:
```bash
php artisan vendor:publish --tag="filament-monaco-editor-config"
```

This is the contents of the published config file:
```php
return [
    'table' => 'editor_codes',
];
```

Optionally, you can publish the views using
```bash
php artisan vendor:publish --tag="filament-monaco-editor-views"
```

## Usage
You can use the monaco editor directly in a form.
```php
public static function form(Form $form): Form
{
    return $form->schema([
        \TimoDeWinter\FilamentMonacoEditor\Filament\Forms\Components\MonacoEditor::make('code')
            ->language('php')
            ->height('500px'),
    ]);
}
```

### Code compilation
This package also comes with features to compile code. At this moment we support compilation of the following:

- SCSS -> CSS

```php
\TimoDeWinter\FilamentMonacoEditor\Facades\FilamentMonacoEditor::compileScssToCss('your-css');
```

### Use as action
The package also comes with an action that you can add to your resources or pages.

In order to do this you should first add the following interface and trait to the model you want to use this on.
```php
class YourModel extends Model implements \TimoDeWinter\FilamentMonacoEditor\Contracts\HasMonacoEditor
{
    use \TimoDeWinter\FilamentMonacoEditor\Concerns\InteractsWithMonacoEditor;
}
```

After doing that you can use an action to open the editor.
```php
protected function getHeaderActions(): array
{
    return [
        \TimoDeWinter\FilamentMonacoEditor\Filament\Actions\MonacoAction::make()
            ->language('php'),
    ];
}

// Table action
->actions([
    MonacoAction::make()
        ->language('php'),
])
```

By default, the code will be stored in the database under a specific collection. When not explicitly setting a collection we fall back to the language you use for the editor.
However, you can explicitly set the collection as well (for example when you want to add the same language twice on the same model):
```php
protected function getHeaderActions(): array
{
    return [
        \TimoDeWinter\FilamentMonacoEditor\Filament\Actions\MonacoAction::make()
            ->collection('client-side-code')
            ->label('Client side code')
            ->language('javascript'),
        \TimoDeWinter\FilamentMonacoEditor\Filament\Actions\MonacoAction::make()
            ->collection('server-side-code')
            ->label('Server side code')
            ->language('php'),
    ];
}
```

#### Using a grid within the actions
It is possible to use a (codepen like) grid in your actions by defining the collection as an array where key=collection and value=language.
```php
protected function getHeaderActions(): array
{
    return [
        \TimoDeWinter\FilamentMonacoEditor\Filament\Actions\MonacoAction::make()
            ->collection([
                'client-side-code' => 'javascript',
                'server-side-code' => 'php',
            ]),
    ];
}
```

If you want to set a default state for the different collections in the grid-style action you can do so like this:
```php
protected function getHeaderActions(): array
{
    return [
        \TimoDeWinter\FilamentMonacoEditor\Filament\Actions\MonacoAction::make()
            ->collection([
                'client-side-code' => 'javascript',
                'server-side-code' => 'php',
            ])
            ->default([
                'client-side-code' => 'Very cool code',
                'server-side-code' => 'Cool PHP code',
            ]),
    ];
}
```

## Testing
```bash
composer test
```

## Credits
- [Timo de Winter](https://github.com/timo-de-winter)
- [All Contributors](../../contributors)

## License
The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
