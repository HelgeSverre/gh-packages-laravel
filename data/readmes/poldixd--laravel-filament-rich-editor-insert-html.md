# Laravel Filament Rich Editor Insert HTML

A small Filament rich editor plugin that adds an `insertHtml` toolbar button. The button opens a modal where users can paste HTML, then inserts that HTML into the editor at the current cursor position.

## Requirements

- PHP 8.2 or higher
- Filament Forms 5.6 or higher
- Laravel 11, 12, or 13

## Installation

Install the package with Composer:

```bash
composer require poldixd/laravel-filament-rich-editor-insert-html
```

Laravel will discover the service provider automatically.

## Usage

Register the plugin on a Filament `RichEditor` field:

```php
use Filament\Forms\Components\RichEditor;
use poldixd\FilamentRichEditorInsertHtml\RichEditorInsertHtmlPlugin;

RichEditor::make('content')
    ->plugins([
        RichEditorInsertHtmlPlugin::make(),
    ]);
```

The plugin automatically enables the `insertHtml` toolbar button. Clicking it opens a modal with an HTML textarea and inserts the submitted HTML using Filament's rich editor command API.

## Translations

The package ships with English and German translations. To customize them in your application, publish the language files:

```bash
php artisan vendor:publish --tag=filament-rich-editor-insert-html-translations
```

The files will be published to:

```text
lang/vendor/filament-rich-editor-insert-html
```

## Testing

```bash
composer test
```

## License

The MIT License (MIT).
