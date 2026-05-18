# Laravel Package Dev Tools

Development tooling for Laravel packages.

This package provides:

- A Laravel publish tag for installing a package-root `artisan` shim that proxies MCP calls to Testbench.
- A Testbench-aware Laravel Boost path fix so Boost commands inspect the package root instead of Testbench's bundled Laravel app.
- Laravel Boost-discoverable AI skill content for agents working on Laravel packages.

Install this package in `require-dev` only. Composer does not install transitive `require-dev` dependencies when your package is installed by a Laravel application, so this keeps package-author tooling out of sites that consume your package.

## Installation

Since this package is not published on Packagist, install it directly from its repository by adding a `repositories` entry to the package repository's `composer.json`:

```json
{
    "repositories": [
        {
            "type": "vcs",
            "url": "https://github.com/ts1997/laravel-package-dev-tools"
        }
    ]
}
```

Then require it as a dev dependency:

```bash
composer require --dev ts1997/laravel-package-dev-tools:^1.0
```

The package auto-discovers its service provider via Laravel's package discovery when installed in a Laravel package development environment.

## Laravel Boost Skill

This package includes a Boost-discoverable skill for Laravel package development. Install `laravel/boost` in the package development environment, then run Boost discovery after installing or updating this package:

```bash
vendor/bin/testbench boost:update --discover
```

When a package runs Boost commands through Testbench, this package automatically points `boost:*` commands back at the package root and uses `src` as the application path for the duration of the command. This lets Boost generate package-oriented guidelines instead of inspecting `vendor/orchestra/testbench-core/laravel`.

For Boost MCP servers, publish the package-root `artisan` shim once:

```bash
vendor/bin/testbench vendor:publish --tag=package-dev-tools-artisan --force
```

The shim proxies `php artisan ...` calls to `vendor/bin/testbench ...` and sets `CACHE_STORE=array` to avoid requiring a package database connection. This file must exist in each package repository because MCP clients call the root `artisan` file before Laravel can boot this package's service provider.

The `ts1997` Laravel package template runs both the Pint publish step and Boost discovery automatically:

```json
{
    "scripts": {
        "post-install-cmd": [
            "@php vendor/bin/testbench vendor:publish --tag=package-dev-tools-artisan --ansi --force",
            "@php vendor/bin/testbench boost:update --ansi --discover"
        ],
        "post-update-cmd": [
            "@php vendor/bin/testbench vendor:publish --tag=package-dev-tools-artisan --ansi --force",
            "@php vendor/bin/testbench boost:update --ansi --discover"
        ]
    }
}
```

The skill reminds agents to keep this package in `require-dev`, use package/Testbench-aware commands, and run Boost discovery.

## Tagging a Release

Composer resolves versions from git tags. To publish a new release, create an annotated tag and push it:

```bash
git tag -a v1.0.0 -m "v1.0.0"
git push origin v1.0.0
```

Tags must follow semver and be prefixed with `v`, such as `v1.0.0` or `v1.2.3`.

## Package development

This package includes Devenv tooling for running Testbench commands against the package while keeping generated files in package directories.

Use `package make:*` instead of `vendor/bin/testbench make:*` when generating package files:

```bash
package make:model Post --migration --factory
package make:migration create_posts_table
package make:factory PostFactory --model=Post
```

The command runs the matching Testbench generator, moves generated files out of Workbench paths, rewrites namespaces, removes duplicate imports, and deletes the temporary `workbench` directory.

For other Testbench or Artisan-style commands, use the same `package` wrapper:

```bash
package list
```

## Testing

```bash
composer test
```
