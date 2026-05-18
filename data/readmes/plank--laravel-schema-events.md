<p align="center"><a href="https://plank.co"><img src="art/schema-events.png" width="100%"></a></p>

<p align="center">
<a href="https://packagist.org/packages/plank/laravel-schema-events"><img src="https://img.shields.io/packagist/php-v/plank/laravel-schema-events?color=%23fae370&label=php&logo=php&logoColor=%23fff" alt="PHP Version Support"></a>
<a href="https://laravel.com/docs/11.x/releases#support-policy"><img src="https://img.shields.io/badge/laravel-10.x,%2011.x-%2343d399?color=%23f1ede9&logo=laravel&logoColor=%23ffffff" alt="PHP Version Support"></a>
<a href="https://github.com/plank/laravel-schema-events/actions?query=workflow%3Arun-tests"><img src="https://img.shields.io/github/actions/workflow/status/plank/laravel-schema-events/run-tests.yml?branch=main&&color=%23bfc9bd&label=run-tests&logo=github&logoColor=%23fff" alt="GitHub Workflow Status"></a>
<a href="https://codeclimate.com/github/plank/laravel-schema-events/test_coverage"><img src="https://img.shields.io/codeclimate/coverage/plank/laravel-schema-events?color=%23ff9376&label=test%20coverage&logo=code-climate&logoColor=%23fff" /></a>
<a href="https://codeclimate.com/github/plank/laravel-schema-events/maintainability"><img src="https://img.shields.io/codeclimate/maintainability/plank/laravel-schema-events?color=%23528cff&label=maintainablility&logo=code-climate&logoColor=%23fff" /></a>
</p>

# Laravel Schema Events

Track and respond to database schema changes in your Laravel application through a simple event system.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Available Events](#available-events)
  - [Event Properties](#event-properties)
  - [Repository](#repository)
- [Contributing](#contributing)
- [Credits](#credits)
- [License](#license)
- [Security Vulnerabilities](#security-vulnerabilities)
- [About Plank](#check-us-out)

## Installation

You can install the package via composer:

```bash
composer require plank/laravel-schema-events
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="schema-events-config"
```

## Quick Start

1. Install the package
2. Set up an event listener:

```php
<?php

namespace App\Listeners;

use Plank\LaravelSchemaEvents\Events\TableCreated;

class LogTableCreation
{
    public function handle(TableCreated $event)
    {
        \Log::info("Table {$event->table} was created with columns: " . implode(', ', $event->columns->toArray()));
    }
}
```

3. Register your listener in `EventServiceProvider.php`:

```php
protected $listen = [
    TableCreated::class => [
        LogTableCreation::class,
    ],
];
```

## Configuration

The configuration file allows you to customize:

- Which migration events to listen for
- Which commands are tracked for different schema operations

```php
return [
    'listeners' => [
        'ran' => MigrationRan::class,
        'finished' => MigrationsFinished::class,
    ],
    
    'commands' => [
        'renamed_columns' => ['renameColumn'],
        'dropped_columns' => ['dropColumn'],
        'added_indexes' => [
            'primary',
            'unique',
            'index',
            'fulltext',
            'spatialIndex',
        ],
        // ... additional commands
    ],
];
```

## Usage

### Available Events

The package provides four main events:

1. `TableCreated` - Emitted when a new table is created
2. `TableChanged` - Emitted when an existing table is modified
3. `TableDropped` - Emitted when a table is dropped
4. `TableRenamed` - Emitted when a table is renamed

### Event Properties

Each event includes basic connection information:

- `connection` - The name of the database connection
- `databaseName` - The name of the database
- `driverName` - The database driver being used

#### TableCreated Event

```php
public readonly string $table;
public readonly Collection $columns;      // Added columns
public readonly Collection $indexes;      // Added indexes
public readonly Collection $foreignKeys;  // Added foreign keys
```

#### TableChanged Event

```php
public readonly string $table;
public readonly Collection $addedColumns;
public readonly Collection $droppedColumns;
public readonly Collection $renamedColumns;     // Contains [from => x, to => y]
public readonly Collection $modifiedColumns;
public readonly Collection $addedIndexes;
public readonly Collection $droppedIndexes;
public readonly Collection $renamedIndexes;     // Contains [from => x, to => y]
public readonly Collection $addedForeignKeys;
public readonly Collection $droppedForeignKeys;
```

#### TableDropped Event

```php
public readonly string $table;
```

#### TableRenamed Event

```php
public readonly string $from;
public readonly string $to;
```

### Repository

The event repository collects the schema events that occur during the migrations which can be retrieved after the `MigrationsEnded` event is fired by the Migrator.

If your application wants to handle dispatching and flushing the events, you can set the `schema-events.listeners.finished` listener to `null` and listen to the `MigrationsEnded` event in your application.

The schema event repository can be controlled using the `SchemaEvents` facade.

#### get()

Retrieve all schema events that were fired during the course of the migrations.

#### created()

Retrieve all `TableCreated` events that were fired during the course of the migrations.

#### changed()

Retrieve all `TableChanged` events that were fired during the course of the migrations.

#### renamed()

Retrieve all `TableRenamed` events that were fired during the course of the migrations.

#### dropped()

Retrieve all `TableDropped` events that were fired during the course of the migrations.

#### flush()

Clear all schema events stored in the schema event repository.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

&nbsp;

## Credits

- [Kurt Friars](https://github.com/kfriars)
- [All Contributors](../../contributors)

&nbsp;

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

&nbsp;

## Security Vulnerabilities

If you discover a security vulnerability within siren, please send an e-mail to [security@plank.co](mailto:security@plank.co). All security vulnerabilities will be promptly addressed.

&nbsp;

## Check Us Out!

<a href="https://plank.co/open-source/learn-more-image">
    <img src="https://plank.co/open-source/banner">
</a>

&nbsp;

Plank focuses on impactful solutions that deliver engaging experiences to our clients and their users. We're committed to innovation, inclusivity, and sustainability in the digital space. [Learn more](https://plank.co/open-source/learn-more-link) about our mission to improve the web.
