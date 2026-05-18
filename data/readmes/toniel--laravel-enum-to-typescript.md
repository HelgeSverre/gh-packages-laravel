# Laravel Enum to TypeScript

[![Latest Version on Packagist](https://img.shields.io/packagist/v/toniel/laravel-enum-to-typescript.svg?style=flat-square)](https://packagist.org/packages/toniel/laravel-enum-to-typescript)
[![Total Downloads](https://img.shields.io/packagist/dt/toniel/laravel-enum-to-typescript.svg?style=flat-square)](https://packagist.org/packages/toniel/laravel-enum-to-typescript)

A simple Laravel package to convert your PHP enums into TypeScript enums, helping you maintain type safety between your backend and frontend.

## Installation

You can install the package via composer:

```bash
composer require toniel/laravel-enum-to-typescript
```

## Configuration

To publish the configuration file, run the following command:

```bash
php artisan vendor:publish --provider="Toniel\LaravelEnumToTypeScript\LaravelEnumToTypeScriptServiceProvider" --tag="config"
```

This will create a `config/enum-to-typescript.php` file in your application's config directory. Here, you can customize the default paths and behavior of the command.

```php
// config/enum-to-typescript.php

return [
    // The directory where your PHP enums are located.
    'source_dir' => 'app/Enums',

    // The directory where the generated TypeScript enums will be placed.
    'dest_dir' => 'resources/ts/Enums',

    // The case for the generated TypeScript enum filenames.
    // Supported values: "PascalCase", "kebab-case".
    'filename_case' => 'PascalCase',

    // Defines how the TypeScript enums are generated.
    // Supported values: "multiple_files", "single_file".
    'output_strategy' => 'multiple_files',

    // When using the "single_file" output strategy, this will be the name
    // of the generated TypeScript file (without the .ts extension).
    'single_file_name' => 'enums',
];
```

## Usage

To convert your PHP enums to TypeScript, run the following artisan command:

```bash
php artisan typescript:transform-enum
```

The command will scan the `source_dir` for PHP enums and generate the corresponding TypeScript enums in the `dest_dir`.

### Options

You can override the default configuration by passing options to the command:

-   `--source`: Specify the source directory for PHP enums.
    ```bash
    php artisan typescript:transform-enum --source="app/CustomEnums"
    ```

-   `--dest`: Specify the destination directory for TypeScript enums.
    ```bash
    php artisan typescript:transform-enum --dest="resources/js/types"
    ```

-   `--filename-case`: Specify the case for the generated filenames (`PascalCase` or `kebab-case`).
    ```bash
    php artisan typescript:transform-enum --filename-case=kebab-case
    ```

-   `--strategy`: Specify the output strategy (`single_file` or `multiple_files`).
    ```bash
    php artisan typescript:transform-enum --strategy=single_file
    ```

### Example

Given a PHP enum:

```php
// app/Enums/UserRole.php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case USER = 'user';
}
```

Running the command will generate the following TypeScript enum:

**Multiple Files Strategy (default)**

A new file `resources/ts/Enums/UserRole.ts` will be created:

```typescript
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}
```

**Single File Strategy**

A single file `resources/ts/Enums/enums.ts` (or your configured `single_file_name`) will be created containing all enums:

```typescript
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// ... other enums ...
```

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
