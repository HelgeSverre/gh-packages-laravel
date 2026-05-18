# Filament Package Skeleton CLI

A command-line tool to generate skeletons for Filament packages.
It uses this [template](https://github.com/G4b0rDev/filament-package-skeleton-cli) to generate the package.

> 💡 This package is inspired by [Spatie Laravel Package](https://github.com/spatie/laravel-package-tools).

## Installation

You can install the package via Composer globally and use it as a command line tool:

```bash
composer global require g4b0rdev/filament-package-skeleton-cli
```

or you can download the phar file from the [releases page](https://github.com/G4b0rDev/filament-package-skeleton-cli/releases).

### Download and Setup

1. Download the file from the [releases page](https://github.com/G4b0rDev/filament-package-skeleton-cli/releases).
2. Move the file to your bin directory:
    ```bash
    sudo mv filament-package-skeleton-cli /usr/local/bin/filament-package-skeleton-cli
    ```
3. Make the file executable:
   ```bash
    chmod +x /usr/local/bin/filament-package-skeleton-cli
   ```

## Commands

### `new`

Creates a new FilamentPHP package project.

**Usage:**
```sh
filament-package-skeleton new <package-name>
```

**Parameters:**
- `<package-name>`: The name of the new package.

**Options:**
- `--standalone`: Create a standalone filament package

### `config`

Changes the global configuration of the Filament Package Skeleton CLI.

**Usage:**
```sh
filament-package-skeleton config
```

This configs can be globally set for generating new filament packages

- `Vendor name`: Set the base vendor name globally.
- `Path`: Set the publish package path globally.

### Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/G4b0rDev/filament-package-skeleton-cli/.github/blob/main/CONTRIBUTING.md) for details.

## Credits

- [G4b0rDev](https://github.com/G4b0rDev)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
