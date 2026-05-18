# markdown-tools

[![Latest Version on Packagist](https://img.shields.io/packagist/v/cassarco/markdown-tools.svg?style=flat-square)](https://packagist.org/packages/cassarco/markdown-tools)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/cassarco/markdown-tools/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/cassarco/markdown-tools/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/cassarco/markdown-tools/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/cassarco/markdown-tools/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/cassarco/markdown-tools.svg?style=flat-square)](https://packagist.org/packages/cassarco/markdown-tools)

A Laravel package for processing markdown files with validation and custom handlers.

## Why?

Markdown files with YAML front-matter are a great way to manage content. They're version-controlled, portable, and easy to edit. But when your Laravel application needs that content in the database, you need a reliable way to import it.

This package lets you:

- **Sync markdown to your database** - Import blog posts, documentation, or any content from markdown files to Eloquent models, keeping them in sync as you update your files.
- **Validate front-matter** - Use Laravel's validation rules to ensure every markdown file has the required metadata (title, slug, dates, etc.) before processing.
- **Process multiple content types** - Define separate schemes for different content types (articles, docs, pages) each with their own validation rules and handlers.
- **Automate in CI/CD** - Run the command in your deployment pipeline to automatically sync content changes.

## How it works

Define one or more schemes in your configuration file, then run the bundled command to process them.

## Installation

Install the package via composer:

```bash
composer require cassarco/markdown-tools
```

Run the install command to publish the config and action stubs:

```bash
php artisan markdown-tools:install
```

This publishes:
- `config/markdown-tools.php` - configuration file
- `app/Actions/MarkdownFileHandler.php` - handler for processing markdown files
- `app/Actions/MarkdownFileRules.php` - validation rules for front-matter

Alternatively, publish them separately:

```bash
php artisan vendor:publish --tag=markdown-tools-config
php artisan vendor:publish --tag=markdown-tools-actions
```

## Configuration

The published config file defines your schemes:

```php
use App\Actions\MarkdownFileHandler;
use App\Actions\MarkdownFileRules;

return [
    'schemes' => [
        'default' => [
            'path' => resource_path('markdown'),
            'rules' => MarkdownFileRules::class,
            'handler' => MarkdownFileHandler::class,
        ],
    ],

    'common-mark' => [
        // League/CommonMark settings...
    ],
];
```

## Usage

### Define Validation Rules

Edit `app/Actions/MarkdownFileRules.php` to specify validation rules for front-matter properties:

```php
<?php

namespace App\Actions;

use Cassarco\MarkdownTools\Contracts\MarkdownFileRules as MarkdownFileRulesContract;

class MarkdownFileRules implements MarkdownFileRulesContract
{
    public function __invoke(): array
    {
        return [
            'uuid' => 'required|uuid',
            'title' => 'required|string|max:255',
        ];
    }
}
```

### Define a Handler

Edit `app/Actions/MarkdownFileHandler.php` to process each markdown file:

```php
<?php

namespace App\Actions;

use App\Models\Article;
use Cassarco\MarkdownTools\Contracts\MarkdownFileHandler as MarkdownFileHandlerContract;
use Cassarco\MarkdownTools\MarkdownFile;

use function Laravel\Prompts\info;

class MarkdownFileHandler implements MarkdownFileHandlerContract
{
    public function __invoke(MarkdownFile $file): void
    {
        Article::updateOrCreate([
            'uuid' => $file->frontMatter()['uuid'],
        ], [
            'uuid' => $file->frontMatter()['uuid'],
            'title' => $file->frontMatter()['title'],
        ]);

        info("Processed: {$file->pathname()}");
    }
}
```

### Process Your Schemes

Run the bundled command:

```bash
php artisan markdown-tools:process
```

![Output](./docs/output.png)

If files fail validation, you'll see Laravel validation errors:

![Validation Error](./docs/validation-error.png)

## MarkdownFile Methods

The handler receives a `MarkdownFile` instance with these methods:

```php
$file->frontMatter()  // Front-matter as a PHP array
$file->markdown()     // Raw markdown content
$file->html()         // HTML without table of contents
$file->toc()          // Table of contents HTML
$file->htmlWithToc()  // HTML with embedded table of contents
$file->pathname()     // File path
```

## Real-World Example

Here's how I use this package to sync markdown files to my database:

```php
<?php

namespace App\Actions;

use App\Models\Article;
use Cassarco\MarkdownTools\Contracts\MarkdownFileHandler as MarkdownFileHandlerContract;
use Cassarco\MarkdownTools\MarkdownFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

use function Laravel\Prompts\info;

class MarkdownFileHandler implements MarkdownFileHandlerContract
{
    public function __invoke(MarkdownFile $file): void
    {
        Article::updateOrCreate([
            'uuid' => $file->frontMatter()['uuid'],
        ], [
            'uuid' => $file->frontMatter()['uuid'],
            'title' => $file->frontMatter()['title'],
            'slug' => $file->frontMatter()['slug'] ?? Str::slug($file->frontMatter()['title']),
            'description' => $file->frontMatter()['description'],
            'table_of_contents' => $file->toc(),
            'content' => $file->html(),
            'image' => $file->frontMatter()['image'],
            'tags' => collect($file->frontMatter()['tags']),
            'published_at' => Carbon::make($file->frontMatter()['published_at']),
            'deleted_at' => Carbon::make($file->frontMatter()['deleted_at']),
            'created_at' => Carbon::make($file->frontMatter()['created_at']),
            'updated_at' => Carbon::make($file->frontMatter()['updated_at']),
        ]);

        info("Processing {$file->frontMatter()['title']}");
    }
}
```

## Upgrading from v1 to v2

Version 2.0 introduces breaking changes to support config caching. Handlers and rules are now class-based instead of closures.

### Step 1: Update your dependencies

```bash
composer require cassarco/markdown-tools:^2.0
```

This requires Laravel 11+ and PHP 8.3+.

### Step 2: Publish the action stubs

```bash
php artisan vendor:publish --tag=markdown-tools-actions
```

This creates `app/Actions/MarkdownFileHandler.php` and `app/Actions/MarkdownFileRules.php`.

### Step 3: Migrate your handler logic

Move your closure logic from the config file to the new handler class.

**Before (v1):**
```php
// config/markdown-tools.php
'handler' => function (MarkdownFile $file) {
    Article::updateOrCreate(
        ['uuid' => $file->frontMatter()['uuid']],
        ['title' => $file->frontMatter()['title']]
    );
},
```

**After (v2):**
```php
// app/Actions/MarkdownFileHandler.php
public function __invoke(MarkdownFile $file): void
{
    Article::updateOrCreate(
        ['uuid' => $file->frontMatter()['uuid']],
        ['title' => $file->frontMatter()['title']]
    );
}
```

### Step 4: Migrate your validation rules

Move your rules array to the new rules class.

**Before (v1):**
```php
// config/markdown-tools.php
'rules' => [
    'title' => 'required',
],
```

**After (v2):**
```php
// app/Actions/MarkdownFileRules.php
public function __invoke(): array
{
    return [
        'title' => 'required',
    ];
}
```

### Step 5: Update your config

Replace closures with class references:

```php
// config/markdown-tools.php
use App\Actions\MarkdownFileHandler;
use App\Actions\MarkdownFileRules;

'schemes' => [
    'default' => [
        'path' => resource_path('markdown'),
        'rules' => MarkdownFileRules::class,
        'handler' => MarkdownFileHandler::class,
    ],
],
```

Note: The default scheme was renamed from `'markdown'` to `'default'`.

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

If you find a bug that impacts the security of this package please send an email to security@cassar.co instead of using the issue tracker.

## Credits

- [Carl Cassar](https://carlcassar.com)
- [Cassar & Co](https://github.com/cassarco)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
