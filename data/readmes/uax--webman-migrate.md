# uax/webman-migrate

Laravel-style migration commands for Webman projects.

中文说明请见 [README.zh-CN.md](./README.zh-CN.md).

## What This Package Provides

The package provides commands from inside the package itself instead of copying command PHP files into the host project.

Available commands:

- `make:migration`
- `migrate`
- `migrate:rollback`
- `migrate:status`
- `migrate:publish`

## Installation

Install with Composer in a Webman project:

```bash
composer require uax/webman-migrate
```

After installation, Webman's plugin hook writes only the plugin config files needed to register commands:

- `config/plugin/uax/webman-migrate/app.php`
- `config/plugin/uax/webman-migrate/command.php`

The package does not automatically publish migration stubs or migration directories into the project.

## Publish Project Resources

Publish resources only when the host project needs local stubs or the migrations directory:

```bash
php webman migrate:publish
```

This publishes:

- `databases/stubs/migration.stub`
- `databases/stubs/migration.create.stub`
- `databases/stubs/migration.update.stub`
- `databases/migrations/.gitkeep`

To overwrite already published files:

```bash
php webman migrate:publish --force
```

## Uninstall Behavior

When the package is removed through Composer:

```bash
composer remove uax/webman-migrate
```

The uninstall hook removes:

- `config/plugin/uax/webman-migrate/app.php`
- `config/plugin/uax/webman-migrate/command.php`
- published files created by this package and still matching their recorded content

The uninstall hook does not blindly delete user-modified published files.
