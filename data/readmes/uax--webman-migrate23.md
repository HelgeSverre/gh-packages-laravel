# webman/migrate

Laravel-style migration commands for Webman projects.

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
composer require webman/migrate
```

After installation, Webman's plugin hook writes only the plugin config files needed to register commands:

- `config/plugin/webman/migrate/app.php`
- `config/plugin/webman/migrate/command.php`

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
composer remove webman/migrate
```

The uninstall hook removes:

- `config/plugin/webman/migrate/app.php`
- `config/plugin/webman/migrate/command.php`
- published files created by this package and still matching their recorded content

The uninstall hook does not blindly delete user-modified published files.

## Manifest Rule

Published resources are tracked in:

- `runtime/webman-migrate/published.json`

Each published file stores a content hash. During uninstall:

- if the file still matches the recorded hash, it is deleted
- if the file was modified by the project, it is kept

This keeps cleanup cautious and avoids deleting user-owned changes.

## Release Notes

Before publishing to GitHub or Packagist, confirm:

- package name is `webman/migrate`
- namespace is `Uax\\WebmanMigrate\\`
- plugin config path is `config/plugin/webman/migrate`
