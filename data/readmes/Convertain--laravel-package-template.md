# Laravel Package Template

[![Laravel 12.x](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat-square&logo=laravel)](https://laravel.com)
[![PHP 8.2 - 8.5](https://img.shields.io/badge/PHP-8.2%20to%208.5-777BB4?style=flat-square&logo=php)](https://www.php.net)
[![PHPStan](https://img.shields.io/badge/PHPStan-Level%200--10-brightgreen?style=flat-square)](https://phpstan.org)
[![Rector](https://img.shields.io/badge/Rector-Enabled-blue?style=flat-square)](https://getrector.com)
[![Laravel Pint](https://img.shields.io/badge/Laravel%20Pint-Configurable-FF2D20?style=flat-square)](https://laravel.com/docs/pint)
[![Sponsor Convertain](https://img.shields.io/badge/Sponsor-Convertain-blue?style=flat-square&logo=github)](https://github.com/sponsors/Convertain)

A modern, fully-featured Laravel package template that scaffolds a production-ready package with interactive configuration, integrated tooling, CI/CD pipelines, and Laravel Boost support.

## Features

- **Interactive Installer**: Guided setup with spinner-based progress display and CTRL+U go-back support
- **Configurable Tooling**: Choose your [PHPStan](https://phpstan.org) level (0-10) and [Laravel Pint](https://laravel.com/docs/pint) preset (laravel, psr12, per, symfony)
- **Community Files**: Optional CONTRIBUTING.md, SECURITY.md, and GitHub issue templates
- **MCP Configuration**: Automatic setup for VS Code, Cursor, Gemini, and Junie with [Laravel Boost](https://boost.laravel.com) MCP server
- **Resource Management**: Selective inclusion of migrations, views, translations, routes, and publishable assets
- **CI/CD Pipeline**: GitHub Actions workflow with linting, static analysis, and tests
- **Laravel Boost Integration**: Full support for [Laravel Boost](https://boost.laravel.com) with testbench MCP configuration
- **Workbench Support**: Local development environment for testing your package

## Quick Start

Two ways to start:

1) **Clone this template repo (will drop the template remote automatically):**

   ```bash
   git clone git@github.com:Convertain/laravel-package-template.git your-package-name
   cd your-package-name
   php install.php
   ```

   The installer will remove the template `origin` remote if it points to `Convertain/laravel-package-template`, so you can add your own remote afterwards.

2) **Use GitHub’s “Use this template → Create a new repository”** (your remotes are already correct):

   ```bash
   php install.php
   ```

During installation you will be guided through:

- Package name and vendor details
- Author name and email
- GitHub repository URL
- License selection (MIT, Proprietary, Apache 2.0, or BSD-3-Clause)
- Feature selection (config, routes, views, translations, migrations)
- Community files (CONTRIBUTING.md, SECURITY.md, issue templates)
- PHPStan validation level (0-10)
- Laravel Pint preset (laravel, psr12, per, symfony, empty)
- Laravel Boost installation (optional, default yes)
- Composer dependency installation and workbench setup
- Code quality checks (lint and static analysis)

**Start developing:**

```bash
composer serve  # Start the workbench app
```

### Branch setup (GitHub template repos)

When you create a repo via GitHub’s **Use this template** button, GitHub initializes the default branch as `main`, but the branch policy in [.github/workflows/enforce-branch-policy.yml](.github/workflows/enforce-branch-policy.yml) runs on `master` and `*.x` release branches. After running `install.php`, align your branches with the policy:

```bash
# Rename local main to master and push it as the new default branch
git branch -m main master
git push origin -u master

# Create the first release branch from master (example: 1.x)
git checkout -b 1.x master
git push origin -u 1.x

# Switch the default branch to the release branch (requires GitHub CLI auth)
gh repo edit --default-branch 1.x
# Alternatively via GitHub UI: Repo → Settings → Default Branch → Change to 1.x, then save

# Delete main on the remote (after default branch is changed)
git push origin --delete main

# Create a feature branch from master (open PRs from here into master)
git checkout master
git pull
git checkout -b feature/your-feature
```

## Available Commands

### Testing & Quality Assurance

```bash
composer test       # Run the test suite with PHPUnit
composer analyse    # Run PHPStan static analysis (configured level)
composer lint       # Check and fix code style with Laravel Pint
composer rector     # Run Rector for automated code improvements
composer rector:dry # Preview Rector changes without applying
composer check      # Run all quality checks: lint → rector → lint → analyse → test
```

### Development

```bash
composer serve     # Start the Workbench development server
composer workbench:install  # Reinstall the workbench
```

## Package Configuration

After installation, your package will be:

- Named as `vendor_slug/package_slug`
- Using namespace `Vendor\Package`
- Auto-discovered by Laravel via `Vendor\Package\PackageServiceProvider`

### Automatic Asset Registration

Based on the features you selected during `install.php`, your package will automatically register:

| Feature | Auto-Registration | Description |
|---------|-------------------|-------------|
| **Configuration** | `mergeConfigFrom()` | Config values available via `config('your-package.key')` |
| **Web Routes** | `loadRoutesFrom()` | Routes immediately available in the application |
| **API Routes** | `loadRoutesFrom()` | API routes immediately available |
| **Views** | `loadViewsFrom()` | Views accessible via `view('your-package::view-name')` |
| **Translations** | `loadTranslationsFrom()` | Translations via `__('your-package::messages.key')` |
| **Migrations** | `loadMigrationsFrom()` | Migrations run automatically with `php artisan migrate` |

### Publishing Package Assets (Optional)

Publishing is **optional** and only needed if users want to customize the package assets. The following publish tags are available based on your selected features:

```bash
# Configuration file
php artisan vendor:publish --tag=your-package-config

# Blade views (for customization)
php artisan vendor:publish --tag=your-package-views

# Translation files
php artisan vendor:publish --tag=your-package-lang

# Migration files (if users need to modify them)
php artisan vendor:publish --tag=your-package-migrations
```

> **Note:** Replace `your-package` with your actual package slug (e.g., `my-awesome-package-config`).

## Included Technologies

| Technology | Version | Purpose | Documentation |
|-----------|---------|---------|---------|
| [Laravel](https://laravel.com) | 12.x | Framework foundation | [Docs](https://laravel.com/docs) |
| [PHP](https://www.php.net) | 8.2 - 8.5 | Language requirement | [Docs](https://www.php.net/docs.php) |
| [Orchestra Testbench](https://github.com/orchestraplatform/testbench) | ^10 | Laravel package testing | [Docs](https://github.com/orchestraplatform/testbench) |
| [PHPUnit](https://phpunit.de) | ^11 | Unit testing framework | [Docs](https://docs.phpunit.de) |
| [PHPStan](https://phpstan.org) | ^2 (Level 0-10) | Static code analysis | [Docs](https://phpstan.org/user-guide/getting-started) |
| [Larastan](https://github.com/larastan/larastan) | ^3 | Laravel-aware PHPStan | [Docs](https://github.com/larastan/larastan) |
| [Laravel Pint](https://laravel.com/docs/pint) | ^1.14 | Code style formatter | [Docs](https://laravel.com/docs/pint) |
| [Rector](https://getrector.com) | ^2 | Automated code upgrades & refactoring | [Docs](https://getrector.com/documentation) |
| [Rector Laravel](https://github.com/driftingly/rector-laravel) | ^2 | Laravel-specific Rector rules | [Docs](https://github.com/driftingly/rector-laravel) |
| [Roave Security Advisories](https://github.com/Roave/SecurityAdvisories) | dev-latest | Blocks vulnerable dependencies | [GitHub](https://github.com/Roave/SecurityAdvisories) |
| [Laravel Boost](https://boost.laravel.com) | ^1.0 | Development enhancement | [Docs](https://boost.laravel.com) |
| [phpstan/extension-installer](https://github.com/phpstan/extension-installer) | ^1.4 | PHPStan extension auto-discovery | [GitHub](https://github.com/phpstan/extension-installer) |

## Rector Configuration

This template includes [Rector](https://getrector.com) for automated code refactoring and upgrades. Rector applies consistent code improvements across your package, ensuring modern PHP and Laravel best practices.

### What is Rector?

Rector is a tool that automatically upgrades and refactors PHP code. It can:

- Upgrade PHP syntax to newer versions
- Apply Laravel-specific refactorings via [Rector Laravel](https://github.com/driftingly/rector-laravel)
- Enforce coding standards beyond what formatters can do
- Prepare your code for major framework upgrades

### Configuration File

The template includes a `rector.php` configuration file with sensible defaults:

```php
return RectorConfig::configure()
    ->withPaths(['config', 'src', 'tests'])
    ->withPhpSets(php82: true)
    ->withPreparedSets(deadCode: true, codeQuality: true, typeDeclarations: true)
    ->withSets([LaravelSetList::LARAVEL_120])
    ->withRules([
        AddVoidReturnTypeWhereNoReturnRector::class,
        StaticArrowFunctionRector::class,
        StaticClosureRector::class,
    ]);
```

### Available Rector Commands

```bash
# Apply Rector refactorings to your code
composer rector

# Preview changes without applying them (dry-run)
composer rector:dry
```

### Rector in CI/CD

The CI workflow runs `composer rector:dry` after Pint to ensure no Rector rules are violated. This catches issues before they're merged:

```yaml
- name: Run Pint
  run: composer lint

- name: Run Rector (dry-run)
  run: composer rector:dry
```

### Customizing Rector Rules

Edit `rector.php` to add or remove rule sets. See the [Rector documentation](https://getrector.com/documentation) and [Rector Laravel rules](https://github.com/driftingly/rector-laravel) for available options:

- **PHP Sets**: `->withPhpSets(php83: true)` - Target specific PHP versions
- **Prepared Sets**: `deadCode`, `codeQuality`, `typeDeclarations`, `privatization`
- **Laravel Sets**: `LaravelSetList::LARAVEL_120`, `LaravelSetList::LARAVEL_FACADE_ALIASES_TO_FULL_FQCN`
- **Individual Rules**: Add specific rules via `->withRules([...])`

## MCP Configuration

The installer automatically updates MCP configurations for popular code editors:

- **VS Code**: `.vscode/mcp.json`
- **Cursor**: `.cursor/mcp.json`
- **Gemini**: `.gemini/settings.json`
- **Junie**: `.junie/mcp/mcp.json`
- **Generic**: `.mcp.json`

All configurations are set to use `vendor/bin/testbench boost:mcp` for Laravel Boost integration. If you're using a different editor or the configuration isn't auto-updated, manually change:

```json
{
    "laravel-boost": {
        "command": "vendor/bin/testbench",
        "args": ["boost:mcp"]
    }
}
```

## Directory Structure

```text
├── .github/
│   ├── ISSUE_TEMPLATE/          # Bug report & feature request templates
│   └── workflows/               # CI/CD GitHub Actions
├── config/                      # Package configuration files
├── data/                        # Template resources (removed after install)
├── src/
│   ├── Contracts/               # Package interfaces
│   ├── Services/                # Core service classes
│   ├── Steps/                   # Installation steps
│   ├── Traits/                  # Reusable traits
│   └── PackageServiceProvider.php
├── tests/
│   ├── Feature/                 # Feature tests
│   ├── Unit/                    # Unit tests
│   └── TestCase.php
├── workbench/                   # Development/testing app (created by installer)
├── composer.json
├── CONTRIBUTING.md              # Contribution guidelines (optional)
├── SECURITY.md                  # Security policy (optional)
├── phpstan.neon.dist
├── phpunit.xml.dist
├── pint.json
├── rector.php                   # Rector configuration
└── README.md
```

## CI/CD Pipeline

During installation, you can choose which GitHub Actions workflows to include in your package. By default, all three are enabled:

1. **`ci.yml`** - Validates code style with Laravel Pint, runs Rector for code quality, performs static analysis with PHPStan, and runs the test suite with PHPUnit
   - Runs on: `master` branch and `*.x` release branches
   - Can be disabled during installation if you have a different CI/CD setup

2. **`enforce-branch-policy.yml`** - Enforces a branching strategy for organized development and releases
   - Runs on: `master` branch and `*.x` release branches (does NOT run on `main`)
   - Can be disabled if you prefer a different branching workflow

3. **`validate-release.yml`** - Validates release tags follow semantic versioning and match the release branch
   - Runs on: GitHub release published/edited events
   - Can be disabled if you manage releases differently

### Branch Strategy & Releases

The template includes optional workflows that enforce this branching model for your generated package:

```text
Feature branches
    ↓
master (development/main development branch)
    ↓
1.x, 2.x, etc. (release branches - only for critical hotfixes)
    ↓
GitHub Releases (v1.0.0, v1.0.1, v2.0.0, etc.)
```

**Branch Rules:**

- Feature branches → `master` (all new features and changes)
- `master` → `1.x`, `2.x`, etc. (for releases only)
- `1.x`, `2.x`, etc. → Only for critical hotfixes/cherry-picks

**Release Validation:**

When creating a GitHub release, the workflow validates:

1. **Semantic Versioning**: Tag must match format `X.Y.Z` or `X.Y.Z-alpha` (e.g., `1.0.0`, `2.1.3-beta`)
2. **Branch Matching**: Release from `1.x` must have tag starting with `1.` (e.g., `1.0.0`, `1.2.5`)
3. **Correct Branch**: Release from `2.x` must have tag starting with `2.` (e.g., `2.0.0`, `2.1.0`)

**Examples:**

- ✅ Release `1.0.0` from `1.x` branch → Valid
- ✅ Release `1.2.3-alpha` from `1.x` branch → Valid
- ❌ Release `2.0.0` from `1.x` branch → Invalid (major version mismatch)
- ❌ Release `1.0.0-invalid` from `1.x` branch → Invalid (non-semantic tag)

### Customizing Workflows

**During Installation:**
When you run `install.php`, you'll be asked which GitHub workflows to include. All three workflows are selected by default, but you can deselect any you don't need.

**After Installation:**
If you want to disable a workflow after installation, simply delete the corresponding file:

- Remove `.github/workflows/ci.yml` to disable CI/CD pipeline
- Remove `.github/workflows/enforce-branch-policy.yml` to disable branch policy enforcement
- Remove `.github/workflows/validate-release.yml` to disable release validation

Or you can manually edit the workflow files to customize their behavior (e.g., change the branches they run on, add additional checks, etc.).

## License

This template defaults to a Proprietary license. You can choose a different license during installation:

- MIT
- Proprietary
- Apache License 2.0
- BSD 3-Clause License

See [LICENSE.md](LICENSE.md) for the selected license details.

## Support

For issues or questions about the template, please open an issue on this repository.

## Credits & Sponsorship

If you use this template for your Laravel package, we'd love it if you:

⭐ **Star this repository** — It helps others discover it!

📝 **Credit the template** — Add a note to your README:

```markdown
Built using [Laravel Package Template](https://github.com/Convertain/laravel-package-template)
```

💖 **Consider sponsoring** — If this template saved you time, consider [sponsoring the maintainers](https://github.com/sponsors/Convertain) to support continued development.

---

Made with ❤️ by [Convertain](https://github.com/Convertain)
