# Laravel Project Map

<p align="center">
    <strong>Generate clean, configurable maps of your Laravel project structure.</strong>
</p>

<p align="center">
    <a href="https://github.com/Xultech-LTD/laravel-project-map/actions">
        <img src="https://img.shields.io/github/actions/workflow/status/Xultech-LTD/laravel-project-map/tests.yml?branch=main&label=tests&style=flat-square" alt="Tests">
    </a>
    <a href="https://packagist.org/packages/xul/laravel-project-map">
        <img src="https://img.shields.io/packagist/v/xul/laravel-project-map?style=flat-square" alt="Latest Version">
    </a>
    <a href="https://packagist.org/packages/xul/laravel-project-map">
        <img src="https://img.shields.io/packagist/php-v/xul/laravel-project-map?style=flat-square" alt="PHP Version">
    </a>
    <a href="https://packagist.org/packages/xul/laravel-project-map">
        <img src="https://img.shields.io/badge/laravel-11%20|%2012%20|%2013-red?style=flat-square" alt="Laravel Versions">
    </a>
    <a href="LICENSE.md">
        <img src="https://img.shields.io/github/license/Xultech-LTD/laravel-project-map?style=flat-square" alt="License">
    </a>
</p>


## 📌 Overview

**Laravel Project Map** is a developer-focused tool for generating a structured view of your application's filesystem.

It helps you:

- visualize your project structure
- audit large codebases
- inspect architecture quickly
- generate shareable project maps (text or JSON)


## ⚡ Features

- Artisan command: `project:map`
- Recursive directory mapping
- Configurable depth
- Include/exclude files
- Hidden file support
- Vendor & node_modules toggles
- JSON and text output formats
- Save output to file
- Fully tested (Pest)


## 📦 Installation

```bash
composer require xul/laravel-project-map
```
## ⚙️ Publish Configuration (Optional)
```bash
php artisan vendor:publish --tag=project-map-config
```
## 🚀 Usage

### Basic
```php
php artisan project:map
```
### Include files

```php
php artisan project:map --files
```

### Limit depth
```php
php artisan project:map --depth=2
```

### Include vendor and node_modules
```php
php artisan project:map --vendor --node-modules
```

### Include hidden files
```php
php artisan project:map --hidden
```

### Output as JSON
```php
php artisan project:map --format=json
```

### Save output to file
```php
php artisan project:map --save=project-map.txt
```

### Combine options
```php
php artisan project:map --files --depth=3 --vendor --format=json --save=map.json
```

### 🧾 Example Output

#### Text Output

```text
project-root/
├── app/
│   ├── Http/
│   └── Models/
├── routes/
│   └── web.php
└── config/
```
#### JSON Output
```json
[
    {
        "name": "app",
        "type": "directory",
        "path": "/project/app",
        "children": [...]
    }
]
```

## ⚙️ Configuration
```php
<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Default Scan Path
    |--------------------------------------------------------------------------
    |
    | This is the default base path that will be scanned when no explicit
    | path is provided to the Artisan command.
    |
    | In most Laravel projects, this should remain as base_path().
    |
    */

    'default_path' => base_path(),

    /*
    |--------------------------------------------------------------------------
    | Default Maximum Depth
    |--------------------------------------------------------------------------
    |
    | This value determines how many directory levels should be traversed
    | when generating the project map.
    |
    | Example:
    | - 1 = root level only
    | - 2 = root + one nested level
    | - 5 = deeper project inspection
    |
    */

    'default_depth' => 5,

    /*
    |--------------------------------------------------------------------------
    | Include Files
    |--------------------------------------------------------------------------
    |
    | Determines whether files should be included in the generated output.
    |
    | When set to false, only directories will be listed.
    | When set to true, both directories and files will be included.
    |
    */

    'include_files' => false,

    /*
    |--------------------------------------------------------------------------
    | Hidden Files and Directories
    |--------------------------------------------------------------------------
    |
    | Determines whether hidden files and directories should be included
    | in the generated output.
    |
    | This affects dot-prefixed paths such as:
    | - .git
    | - .idea
    | - .vscode
    | - .env.example
    |
    */

    'include_hidden' => false,

    /*
    |--------------------------------------------------------------------------
    | Excluded Paths
    |--------------------------------------------------------------------------
    |
    | These paths will be excluded from the generated project map by default.
    |
    | The values may be relative to the project base path. Common heavy or
    | generated directories are excluded to keep the output clean and fast.
    |
    */

    'exclude' => [
        'vendor',
        'node_modules',
        '.git',
        'storage/logs',
        'bootstrap/cache',
    ],

    /*
    |--------------------------------------------------------------------------
    | Optional Directory Toggles
    |--------------------------------------------------------------------------
    |
    | These toggles provide a more expressive way for users to control whether
    | commonly excluded heavy directories should be scanned.
    |
    | If enabled, the related path may be removed from exclusion internally
    | before the scan begins.
    |
    */

    'include_vendor' => false,

    'include_node_modules' => false,

    /*
    |--------------------------------------------------------------------------
    | Exclude By Name
    |--------------------------------------------------------------------------
    |
    | These directory or file names will be excluded anywhere they appear
    | in the scanned structure.
    |
    | This is useful for filtering common generated artifacts globally
    | without specifying full paths.
    |
    */

    'exclude_names' => [
        '.DS_Store',
        'Thumbs.db',
    ],

    /*
    |--------------------------------------------------------------------------
    | Sort Directories First
    |--------------------------------------------------------------------------
    |
    | When enabled, directories will be listed before files.
    | This usually makes the generated structure easier to read.
    |
    */

    'sort_directories_first' => true,

    /*
    |--------------------------------------------------------------------------
    | Case Sensitive Sorting
    |--------------------------------------------------------------------------
    |
    | Determines whether names should be sorted with case sensitivity.
    | In most cases, false produces more user-friendly output.
    |
    */

    'case_sensitive_sort' => false,

    /*
    |--------------------------------------------------------------------------
    | Follow Symbolic Links
    |--------------------------------------------------------------------------
    |
    | Determines whether symbolic links should be followed during traversal.
    |
    | This is disabled by default to avoid unexpected recursion or scanning
    | outside the intended project boundary.
    |
    */

    'follow_symlinks' => false,

    /*
    |--------------------------------------------------------------------------
    | Output Format
    |--------------------------------------------------------------------------
    |
    | Defines the default output format when no format option is supplied.
    |
    | Supported values:
    | - text
    | - json
    |
    */

    'output' => [
        'default_format' => 'text',

        /*
        |--------------------------------------------------------------------------
        | Save Path
        |--------------------------------------------------------------------------
        |
        | Optional default save location for generated project maps.
        | Leave as null to print only to the console unless --save is used.
        |
        */

        'default_save_path' => null,
    ],
];
```

## 🧪 Testing
```bash
vendor/bin/pest
```

## 🤝 Contributing

Please review [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes.


## 🔒 Security

If you discover any security issues, please review [SECURITY.md](SECURITY.md).


## 🔄 Upgrade Guide

See [UPGRADE.md](UPGRADE.md) for upgrade instructions.


## 📜 License

The MIT License (MIT). See [LICENSE.md](LICENSE.md) for details.


## 👤 Author

**Michael Erastus**  
GitHub: https://github.com/michaelerastus

## ⭐ Support

If you find this package useful, consider giving it a star on GitHub.