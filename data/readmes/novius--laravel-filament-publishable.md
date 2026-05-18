# Laravel Filament Publishable

[![Packagist Release](https://img.shields.io/packagist/v/novius/laravel-filament-publishable.svg?maxAge=1800&style=flat-square)](https://packagist.org/packages/novius/laravel-publishable)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)

## Introduction 

This package allows you to manage Laravel Models which use [Laravel Publishable](https://github.com/novius/laravel-publishable) in [Laravel Filament](https://filamentphp.com/).  

## Requirements

* Laravel Filament >= 4
* Laravel >= 11.0
* PHP >= 8.2

> **NOTE**: These instructions are for Laravel >= 10.0 and PHP >= 8.2 If you are using prior version, please
> see the [previous version's docs](https://github.com/novius/laravel-filament-publishable/tree/2.x).

## Installation

You can install the package via composer:

```bash
composer require novius/laravel-filament-publishable
```

## Usage

Insert Publishable fields, action and filter on your Filament Resource.

```php
use Filament\Resources\Resource;

class Post extends Resource
{
    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                // ...
                PublicationStatus::make('publication_status'),
                PublishedAt::make('published_at'),
                ExpiredAt::make('expired_at'),
                PublishedFirstAt::make('expired_at'),
                // ...
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                // ...
                PublicationColumn::make('publication_status'),
                // ...
            ])
            ->filters([
                // ...
                PublicationStatusFilter::make('publication_status'),
                // ...
            ])
            ->bulkActions([
                // ...
                PublicationBulkAction::make(),
                // ...
            ]);
    }
```

## Lang files

If you want to customize the lang files, you can publish them with:

```bash
php artisan vendor:publish --provider="Novius\LaravelFilamentPublishable\LaravelNovaPublishableServiceProvider" --tag="lang"
```

## Lint

Lint your code with Laravel Pint using:

```bash
composer run-script lint
```

## Licence

This package is under [GNU Affero General Public License v3](http://www.gnu.org/licenses/agpl-3.0.html) or (at your option) any later version.
