# Introduction

**Sitemap Manager** is a Laravel package for automated sitemap generation and management.
It creates new sitemap files, replaces outdated ones, and keeps everything up to date using a single Artisan command and Laravel’s scheduler.

Ideal for Laravel applications that need **reliable, repeatable, and automated sitemap handling**.

# Installation

Install the package via Composer:

```shell
composer require mohammad-zarifiyan/laravel-sitemap-manager:^3.0
```

## Database Migrations
This package stores sitemap metadata in the database.

Publish and run the migrations:

```shell
php artisan vendor:publish --provider="MohammadZarifiyan\LaravelSitemapManager\Providers\SitemapManagerProvider" --tag="sitemap-manager-migrations"
  ```
```shell
php artisan migrate
```

## Configuration
To publish the configuration file:
```shell
php artisan vendor:publish --provider="MohammadZarifiyan\LaravelSitemapManager\Providers\SitemapManagerProvider" --tag="sitemap-manager-config"
```
## Routes
Register the package routes in your `routes/web.php` file:
```php
use Illuminate\Support\Facades\Route;

Route::sitemap();
```
This code registers sitemap serving routes.

## Scheduling
To keep sitemaps updated automatically, register the command in Laravel’s scheduler:
```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('sitemap-manager:refresh-sitemaps')->daily();
```
Make sure your server cron is configured to run Laravel’s scheduler.

# How It Works

1. Sitemap data is collected from all registered registries.
2. Sitemap files are generated in chunks based on the configured `tags-per-sitemap` limit.
3. Existing sitemap files are safely replaced with the new ones.
4. Metadata about generated sitemaps is stored in the database.
5. Your sitemaps are served dynamically at the `/sitemap.xml` path, automatically adapting to your domain.

# Creating a Custom Sitemap Registry
Sitemap Manager allows you to **add your own data** sources by implementing the `MohammadZarifiyan\LaravelSitemapManager\Interfaces\RegistryInterface` or `MohammadZarifiyan\LaravelSitemapManager\Interfaces\RestrictedRegistryInterface`.
This document explains how to create a custom registry, handle pagination, and register it in the configuration.

## 1. Implement `RegistryInterface`
Create a new class that implements `MohammadZarifiyan\LaravelSitemapManager\Interfaces\RegistryInterface`:

```php
<?php

namespace App\Sitemaps;

use MohammadZarifiyan\LaravelSitemapManager\Interfaces\RegistryInterface;
use App\Models\Post;
use Spatie\Sitemap\Tags\Url;
use Generator;

class PostRegistry implements RegistryInterface
{
    public function getName(): string
    {
        return 'posts';
    }

    public function tags(): Generator
    {
        $posts = Post::query()
            ->where('published', true)
            ->cursor();

        foreach ($posts as $post) {
            yield Url::create('http://localhost/blog/' . $post->slug);
        }
    }
}
```
Notes:

`getName()` returns a **unique name** for your registry.

`tags()` should return a `\Generator`.

## 2. Implement `RestrictedRegistryInterface` (Optional)
If your sitemap needs **domain restrictions**, implement `MohammadZarifiyan\LaravelSitemapManager\Interfaces\RestrictedRegistryInterface`:

```php
<?php

namespace App\Sitemaps;

use MohammadZarifiyan\LaravelSitemapManager\DataTransferObjects\Domain;
use MohammadZarifiyan\LaravelSitemapManager\Interfaces\RestrictedRegistryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\LazyCollection;
use MohammadZarifiyan\LaravelSitemapManager\Enums\SitemapRestrictionType;
use Spatie\Sitemap\Tags\Url;
use Generator;

class RestrictedPostRegistry implements RestrictedRegistryInterface
{
    public function getName(): string
    {
        return 'restricted-posts';
    }

    public function tags(): Generator
    {
        yield Url::create('https://localhost/first');
        yield Url::create('https://localhost/second');
    }

    public function domains(): Collection|LazyCollection
    {
        // Return allowed or prohibited domains
        return collect([
            new Domain('example.com'),
            new Domain('another-site.com'),
        ]);
    }

    public function restrictionType(): SitemapRestrictionType
    {
        return SitemapRestrictionType::Prohibition;
    }
}
```
## 3. Register Your Registry in Configuration
Open your `config/sitemap-manager.php` and add your registry class to the `registries` array:
```php
<?php

return [
    // rest of your configuration file
    'registries' => [
        \App\Sitemaps\PostRegistry::class,
        \App\Sitemaps\RestrictedPostRegistry::class,
    ],
    // rest of your configuration file
];
```
