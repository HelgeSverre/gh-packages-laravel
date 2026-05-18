# Laravel Filament Translatable

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)

## Introduction 

This package allows you to manage Laravel Models that use [Laravel Translatable](https://github.com/novius/laravel-translatable) in [Laravel Filament](https://filamentphp.com/).

## Requirements

* Laravel Filament >= 4
* Laravel >= 11.0
* PHP >= 8.2

## Installation

You can install the package via composer:

```bash
composer require novius/laravel-filament-translatable
```

## Assets

Next we need to publish the package's assets. We do this by running the following command:

```sh
php artisan vendor:publish --provider="Novius\LaravelFilamentTranslatable\LaravelFilamentTranslatableServiceProvider" --tag="public"
```

## Lang files

If you want to customize the lang files, you can publish them with:

```bash
php artisan vendor:publish --provider="Novius\LaravelFilamentTranslatable\LaravelFilamentTranslatableServiceProvider" --tag="lang"
```

## Locale Filter

Add the `LocaleFilter` filter on your Filament Resource.

```php
use Filament\Resources\Resource;
use Novius\LaravelFilamentTranslatable\Filament\Tables\Filters\LocaleFilter;

class Post extends Resource
{
    public static function table(Table $table): Table
    {
        return $table
            /// ...
            ->filters([
                LocaleFilter::make('locale'),
                /// ...
            ]);
    }
}
```

## Locale Column

Add the `LocaleColumn` column on your Filament Resource.

```php
use Filament\Resources\Resource;
use Novius\LaravelFilamentTranslatable\Filament\Tables\Columns\LocaleColumn;

class Post extends Resource
{
    public static function table(Table $table): Table
    {
        return $table
            /// ...
            ->columns([
                /// ...
                LocaleColumn::make('locale'),
            ]);
    }
}
```

## Locale Input

Add the `Locale` input on your Filament Resource.

```php
use Filament\Resources\Resource;
use Novius\LaravelFilamentTranslatable\Filament\Forms\Components\Locale;

class Post extends Resource
{
    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                // ...
                Locale::make('locale')
                    ->required(),
                // ...
            ]);
    }
}
```

## Translations Column and features

In your Filament Resource.

```php
use Filament\Resources\Resource;
use Novius\LaravelFilamentTranslatable\Filament\Tables\Columns\TranslationsColumn;

class Post extends Resource
{
    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Hidden::make('locale_parent_id'),
            ]);
    }

    public static function form(Form $form): Form
    {
        return $table
            // ...
            ->columns([
                // ...
                TranslationsColumn::make('translations')
                    ->locales(['de', 'en']) // Optional. Restricted the locals displayed on this list
                    ->flagWidth(16) // Optional. Width in pixel of the flags
                    ->onlyMissing() // Optional. Will display only translations missing
                    ->withoutMissing() // Optional. Will display only existing translations
                    ,
                // ...
            ]);
    }
}
```

And declare your Create page like this :

```php
<?php
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use LaravelLang\Locales\Facades\Locales;
use Novius\LaravelFilamentPageManager\Filament\PageManagerPlugin;
use Novius\LaravelFilamentTranslatable\Filament\Resources\Pages\CreateRecord;

class CreatePost extends CreateRecord
{
    public static function getResource(): string
    {
        return PageManagerPlugin::getPlugin()->getResource('PostResource');
    }

    protected function getDataFromTranslate(Model $parent, string $locale): array
    {
        $data = $parent->attributesToArray();

        // Modify data according the parent
        $data['title'] = $parent->title.' '.Locales::get($locale)->native;
        $data['slug'] = Str::slug($data['title']);

        return $data;
    }
}
```


## Lint

Lint your code with Laravel Pint using:

```bash
composer run-script lint
```

## Licence

This package is under [GNU Affero General Public License v3](http://www.gnu.org/licenses/agpl-3.0.html) or (at your option) any later version.
