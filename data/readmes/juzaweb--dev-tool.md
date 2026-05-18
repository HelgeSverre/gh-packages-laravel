# Juzaweb Dev Tool

Develop Tool for Juzaweb CMS. This package provides a set of Artisan commands to help you develop modules and themes for Juzaweb CMS.

## Installation

You can install the package via composer:

```bash
composer require --dev juzaweb/dev-tool
```

## Requirements

- PHP ^8.2
- juzaweb/core ^5.0

## Usage

### Module Commands

| Command | Description |
| --- | --- |
| `php artisan module:make <name>` | Create a new module. |
| `php artisan module:delete <name>` | Delete a module. |
| `php artisan module:use <name>` | Use a module. |
| `php artisan module:unuse <name>` | Un-use a module. |
| `php artisan module:publish <name>` | Publish module assets. |
| `php artisan module:publish-config <name>` | Publish module configuration. |
| `php artisan module:publish-migration <name>` | Publish module migrations. |
| `php artisan module:publish-translation <name>` | Publish module translations. |

### Theme Commands

| Command | Description |
| --- | --- |
| `php artisan theme:make <name>` | Create a new theme. |
| `php artisan theme:download-style <name>` | Download style template. |
| `php artisan theme:download-template <name>` | Download a template. |
| `php artisan theme:make-block <name>` | Create a page block for a theme. |
| `php artisan theme:make-template <name>` | Create a template for a theme. |
| `php artisan theme:make-view <name>` | Create a view for a theme. |
| `php artisan theme:make-widget <name>` | Create a widget for a theme. |
| `php artisan theme:make-controller <name>` | Create a controller for a theme. |
| `php artisan theme:seed <name> <website>` | Seed theme data. |

### Generator Commands

This package provides various generator commands to speed up your development:

- `php artisan module:make-command <name> [module]`
- `php artisan module:make-controller <name> [module]`
- `php artisan module:make-event <name> [module]`
- `php artisan module:make-job <name> [module]`
- `php artisan module:make-listener <name> [module]`
- `php artisan module:make-mail <name> [module]`
- `php artisan module:make-middleware <name> [module]`
- `php artisan module:make-model <name> [module]`
- `php artisan module:make-notification <name> [module]`
- `php artisan module:make-policy <name> [module]`
- `php artisan module:make-provider <name> [module]`
- `php artisan module:make-request <name> [module]`
- `php artisan module:make-resource <name> [module]`
- `php artisan module:make-rule <name> [module]`
- `php artisan module:make-test <name> [module]`
- `php artisan module:route-provider [module]`

### CRUD Generator

Generate CRUD (Create, Read, Update, Delete) operations for a model in a module.

```bash
php artisan module:make-crud <model> [module]
```

Options:
- `--api`: Generate API CRUD.

### GitHub Release

You can release your module to GitHub using the following command:

```bash
php artisan github:release <path>
```

#### Configuration

Add your GitHub token to your `.env` file:

```dotenv
JW_RELEASE_GITHUB_TOKEN=your_github_token
```

Options for `github:release`:
- `--ver`: Version to release. Auto increment version if not set.
- `--changelog`: Write to changelog.md. Default: true.
- `--target`: Target branch to release. Default: master.

Example:

```bash
php artisan github:release modules/my-module --ver=1.0.1 --target=main
```

### Agents Publishing

Publish dev-tool agents to the `.agent` directory for development assistance:

```bash
php artisan agents:publish
```

Options:
- `--force`: Overwrite existing files without confirmation
- `--skills`: Publish only the skills folder
- `--rules`: Publish only the rules folder

This command copies agent configuration files from the dev-tool package to your project's `.agent` directory, enabling AI-powered development assistance.

Examples:

```bash
# Publish all agents
php artisan agents:publish

# Publish only skills folder
php artisan agents:publish --skills

# Publish only rules folder
php artisan agents:publish --rules

# Force overwrite existing files
php artisan agents:publish --force
```
