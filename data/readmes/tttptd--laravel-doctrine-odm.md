---
title: TTTPTD Laravel Doctrine ODM
description: Laravel package for Doctrine MongoDB ODM integration.
---

# TTTPTD Laravel Doctrine ODM

[![Tests](https://github.com/tttptd/laravel-doctrine-odm/actions/workflows/tests.yml/badge.svg)](https://github.com/tttptd/laravel-doctrine-odm/actions/workflows/tests.yml)
[![Latest Stable Version](https://poser.pugx.org/tttptd/laravel-doctrine-odm/v/stable)](https://packagist.org/packages/tttptd/laravel-doctrine-odm)
[![PHP Version Require](https://poser.pugx.org/tttptd/laravel-doctrine-odm/require/php)](https://packagist.org/packages/tttptd/laravel-doctrine-odm)
[![License](https://poser.pugx.org/tttptd/laravel-doctrine-odm/license)](https://packagist.org/packages/tttptd/laravel-doctrine-odm)

Laravel package for integrating [Doctrine MongoDB ODM](https://www.doctrine-project.org/projects/mongodb-odm.html) with Laravel applications.

This package started as a fork of [chefsplate/laravel-doctrine-odm](https://github.com/chefsplate/laravel-doctrine-odm). The original project has not been maintained for a long time, so the fork was adapted for current Laravel applications and used privately in production projects for about a year and a half before being published. It is now public to make that work reusable, but the API and documentation are still being shaped around real project usage.

## Table of Contents

- [Background](#background)
- [What It Solves](#what-it-solves)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Artisan Commands](#artisan-commands)
- [Testing](#testing)
- [Local Package Development](#local-package-development)

## Background

This package is based on [chefsplate/laravel-doctrine-odm](https://github.com/chefsplate/laravel-doctrine-odm). Since the upstream package appeared to be abandoned and no longer tracked modern Laravel and Doctrine ODM versions, this fork evolved as a private, project-driven continuation. It has been used in real applications for roughly eighteen months before this public release.

## What It Solves

Laravel does not include first-party Doctrine MongoDB ODM integration. This package provides the Laravel bridge:

- registers Doctrine `DocumentManager` in the Laravel container;
- publishes a MongoDB ODM config file;
- configures attribute metadata mapping;
- configures Doctrine proxies and hydrators;
- registers Gedmo Timestampable and Sluggable listeners;
- exposes Doctrine ODM console commands through Artisan;
- provides a small `PersistenceManager` abstraction for application code.

The package registers `DocumentManager` and `PersistenceManager` as scoped services. This is intentional: Doctrine `DocumentManager` is stateful and keeps an identity map/unit of work. In Laravel requests and queue jobs, one manager per lifecycle is the correct boundary; a singleton would leak stale documents between queue jobs.

## Requirements

- PHP 8.2+
- Laravel 11 or 12
- MongoDB PHP extension
- MongoDB server

Install the MongoDB extension before installing the package:

```bash
pecl install mongodb
```

Then enable it in your PHP configuration if your environment does not do that automatically.

## Installation

Install the package from Packagist:

```bash
composer require tttptd/laravel-doctrine-odm:^0.1
```

Laravel package discovery registers the service provider automatically:

```php
Ys\LaravelOdm\DoctrineMongoDBServiceProvider::class
```

Publish the config:

```bash
php artisan vendor:publish --provider="Ys\LaravelOdm\DoctrineMongoDBServiceProvider"
```

This creates:

```text
config/mongodb.php
```

## Configuration

Minimal `.env` example:

```dotenv
DB_MONGO_SERVER=mongodb://localhost:27017
DB_MONGO_DATABASE=app

DOCTRINE_METADATA_CACHE=array
DOCTRINE_PROXY_AUTOGENERATE=2
```

Default document path:

```php
'documents' => [
    base_path('app/Documents'),
],
```

For modular applications, configure all document roots explicitly:

```php
'documents' => [
    base_path('app/Documents'),
    base_path('domain/Art'),
    base_path('domain/Commerce'),
],
```

If some directories must be skipped by the metadata driver, add `exclude_documents`:

```php
'exclude_documents' => [
    base_path('domain/Art/tests'),
],
```

Proxy and hydrator files are generated into:

```php
'proxies' => [
    'namespace' => 'Proxies',
    'path' => storage_path('mongo_proxies'),
],

'hydrators' => [
    'namespace' => 'Hydrators',
    'path' => storage_path('mongo_hydrators'),
],
```

For production, disable automatic proxy generation and generate proxies during deploy:

```dotenv
DOCTRINE_PROXY_AUTOGENERATE=2
```

`2` means `Configuration::AUTOGENERATE_FILE_NOT_EXISTS`. The package also supports `3`, `Configuration::AUTOGENERATE_EVAL`, which is useful only for development.

## Usage

Inject Doctrine `DocumentManager` directly when you need full ODM APIs:

```php
use Doctrine\ODM\MongoDB\DocumentManager;

final readonly class CreateArticleHandler
{
    public function __construct(
        private DocumentManager $documentManager,
    ) {
    }

    public function handle(Article $article): void
    {
        $this->documentManager->persist($article);
        $this->documentManager->flush();
    }
}
```

Or inject the package abstraction when application code only needs persistence operations:

```php
use Ys\LaravelOdm\ODM\PersistenceManager;

final readonly class CreateArticleHandler
{
    public function __construct(
        private PersistenceManager $persistenceManager,
    ) {
    }

    public function handle(Article $article): void
    {
        $this->persistenceManager->persist($article);
        $this->persistenceManager->flush();
    }
}
```

Example document:

```php
use Doctrine\ODM\MongoDB\Mapping\Annotations as ODM;

#[ODM\Document(collection: 'articles')]
final class Article
{
    #[ODM\Id]
    private ?string $id = null;

    #[ODM\Field(type: 'string')]
    private string $title;
}
```

## Artisan Commands

The package wraps common Doctrine ODM console commands as Artisan commands:

```bash
php artisan odm:generate:proxies
php artisan odm:generate:hydrators
php artisan odm:query
php artisan odm:clear-cache:metadata
php artisan odm:schema:create
php artisan odm:schema:drop
php artisan odm:schema:update
php artisan odm:schema:shard
```

Run Artisan list in your application to see the exact command signatures:

```bash
php artisan list odm
```

## Testing

Install development dependencies:

```bash
composer install
```

Run the test suite:

```bash
composer test
```

The package uses PHPUnit 11 and Orchestra Testbench. The current tests cover:

- Laravel service provider registration;
- config publishing path;
- `DocumentManagerFactory` singleton lifetime;
- scoped `DocumentManager` lifecycle;
- `PersistenceManager` binding to the current scoped `DocumentManager`;
- Doctrine metadata loading from configured document paths;
- cache adapter creation;
- `PersistenceManagerDoctrine` delegation to Doctrine ODM.

The integration tests do not require a running MongoDB server. They verify container/config/metadata behavior without opening a database connection.

## Local Package Development

For active development inside a Laravel application, clone this package next to the application:

```text
~/example/laravel-doctrine-odm
```

In the application `composer.json`, temporarily add a path repository before installing/updating the package:

```json
{
  "repositories": [
    {
      "type": "path",
      "url": "/Users/user/example/laravel-doctrine-odm",
      "options": {
        "symlink": true
      }
    }
  ]
}
```

Then update only this dependency:

```bash
composer update tttptd/laravel-doctrine-odm -W
```

With `symlink: true`, changes in the package checkout are immediately visible in the Laravel application.

Before committing application changes meant for CI/production, make sure `composer.lock` does not lock the package to a local `path` repository unless that is intentional. Public projects should normally resolve this package from Packagist.
