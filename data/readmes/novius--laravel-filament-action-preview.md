# Laravel Filament Action Preview

[![Packagist Release](https://img.shields.io/packagist/v/novius/laravel-filament-action-preview.svg?maxAge=1800&style=flat-square)](https://packagist.org/packages/novius/laravel-publishable)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)

## Introduction

This package allows you to add [Laravel Filament](https://filamentphp.com/) action to open the front preview url of a ressource.

## Requirements

* Laravel Filament >= 4
* Laravel >= 11.0
* Laravel >= 8.2

## Installation

You can install the package via composer:

```bash
composer require novius/laravel-filament-action-preview
```

## Usage

This package provides the following action:
* `\Novius\LaravelFilamentActionPreview\Filament\Actions\PreviewAction`

### If the model have a `previewUrl` method :

```php
use Filament\Resources\Resource;
use Novius\LaravelFilamentActionPreview\Filament\Actions\PreviewAction;

class Post extends Resource
{
    public static function table(Table $table): Table
    {
        return $table
            ->actions([
                PreviewAction::make(),
            ]);
    }
```

### Otherwise, you must specify the preview url :

```php
use App\Models\Post as PostModel;
use Filament\Resources\Resource;
use Novius\LaravelFilamentActionPreview\Filament\Actions\PreviewAction;

class Post extends Resource
{
    public static function table(Table $table): Table
    {
        return $table
            ->actions([
                PreviewAction::make()
                    ->using(function(PostModel $record) {
                        return route('post.preview', ['post' => $record]);
                    }),
            ]);
    }
```

## Lang files

If you want to customize the lang files, you can publish them with:

```bash
php artisan vendor:publish --provider="Novius\LaravelFilamentActionPreview\LaravelFilamentActionPreviewServiceProvider" --tag="lang"
```

## Lint

Lint your code with Laravel Pint using:

```bash
composer run-script lint
```

## Licence

This package is under [GNU Affero General Public License v3](http://www.gnu.org/licenses/agpl-3.0.html) or (at your option) any later version.
