# Laravel Typesense Tools

This package adds Artisan commands that help manage Typesense Collections and Collection Aliases in Laravel applications using Laravel Scout.

Using Typesense with Scout requires you to define the schema in the Scout config file so we change the expected functions to `static` to reduce duplication. This means that the functions cannot reference `app()` or `config()` because they're executed too early in the booting process.

We make use of Typesense Collection Aliases so that schema changes can be gracefully deployed to our frontends without causing issues.

See the full examples in [`examples/models/User.php`](examples/models/User.php) and [`examples/config/scout.php`](examples/config/scout.php).

## Requirements

- PHP `^8.2`
- Laravel Framework `>=10.0`
- Laravel Scout `>=10.0`
- Typesense PHP client `>=5.1`

## Installation

```bash
composer require synergitech/laravel-typesense-tools
```

## Usage

Our environments typically have separated application/frontend and worker contexts and we also usually run a separate CLI context. The deployment runbook is usually as follows.

1. deploy new code to the CLI and run any migrations
2. deploy new code to the workers with an updated TYPESENSE_VERSION_SUFFIX. We typically use a date for the suffix for easy versioning, i.e. 20260325.
3. run `php artisan search:setup` to populate the new collections
4. when the queue is empty, the new collection schema fields are now available as `search:switch-alias` is run as the final queue job
5. deploy the new code to the frontend so the new fields are in use
6. (optional) run `php artisan search:cleanup` to remove the now unused collections and get some memory back

### Development

As the frontend is powered by Aliases, you can save yourself a little bit of effort by adding the following to the bottom of your DatabaseSeeder class.

```php
\Illuminate\Support\Facades\Artisan::call(
    command: 'search:switch-alias',
    outputBuffer: $this->command->getOutput()->getOutput(),
);
```

This means that every time you or a colleague are starting from scratch, the Aliases will be created. Scout will automatically create the Collections as part of the new data being added.

If you aren't implicitly creating every Collection during your seeding process, you can swap in `search:setup` instead and that will make sure all the Collections exist and the Aliases are created.

## Command reference

- `search:setup` to ensure collections exist and (optionally) import data.
- `search:switch-alias` to point aliases at the current index collections.
- `search:delete-suffix {suffix}` to remove old suffixed collections.
- `search:cleanup` to remove collections that are not referenced by an alias.

### `search:setup`

Populates all known collections and dispatches a `search:switch-alias` at the end. If `--only-index` is provided, it checks each Collection/Alias exists. The check is useful for confirming your schema works and there aren't any errors.

Options:

- `--only-index`: only verify/create collections.
- `--flush`: flush each model before importing.

Examples:

```bash
php artisan search:setup --only-index
php artisan search:setup --flush
```

### `search:switch-alias`

Upserts each model's alias (`searchableAs`) to target the active collection (`indexableAs`). This is used automatically after a call to `search:setup`

```bash
php artisan search:switch-alias
```

### `search:delete-suffix {suffix}`

Deletes old collections named as:

- `<searchableAs>_<suffix>`

Example:

```bash
php artisan search:delete-suffix 20260325
```

### `search:cleanup`

Finds and optionally deletes collections not currently referenced by any alias.

```bash
php artisan search:cleanup
```
