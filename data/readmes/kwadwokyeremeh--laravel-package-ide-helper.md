# Laravel Package IDE Helper

A **standalone IDE helper generator and linter** for Laravel packages. Unlike other IDE helper tools, this works **without requiring Laravel application or artisan command access** - perfect for package development!

## 🎯 Why This Package?

When developing Laravel packages, you don't have access to `php artisan ide-helper:generate`. This tool solves that by:

- ✅ **No Laravel required** - Works on any PHP codebase
- ✅ **Static analysis** - Analyzes code without bootstrapping Laravel
- ✅ **Package-aware** - Understands Laravel package structure
- ✅ **IDE agnostic** - Works with VS Code, PHPStorm, Vim, etc.
- ✅ **Zero configuration** - Auto-detects namespace, vendor, and structure
- ✅ **Built-in linter** - Catches common issues and enforces best practices

## 📦 Installation

### As a Development Dependency

```bash
composer require --dev kwadwokyeremeh/laravel-package-ide-helper
```

### Globally

```bash
composer global require kwadwokyeremeh/laravel-package-ide-helper
```

## 🚀 Usage

### Generate IDE Helpers

Run from your package root:

```bash
vendor/bin/generate-ide-helper generate .
```

This will:
1. Scan your package for Models, Facades, Commands, etc.
2. Generate IDE helper files in `.idea-ide-helper/`
3. Create PHPDoc stubs for better autocompletion

### Advanced Usage

```bash
# Specify output directory
vendor/bin/generate-ide-helper generate . --output ./ide-helpers

# Use custom config
vendor/bin/generate-ide-helper generate . --config my-config.php

# Generate only models
vendor/bin/generate-ide-helper generate . --models true --facades false --commands false

# Override namespace
vendor/bin/generate-ide-helper generate . --namespace "MyPackage\\Namespace"

# Specify vendor name
vendor/bin/generate-ide-helper generate . --vendor "my-vendor"
```

### Command Options

```
generate <path> [options]

Arguments:
  path                  Path to the Laravel package directory

Options:
  --output, -o          Output directory for IDE helper files (default: .idea-ide-helper)
  --config, -c          Path to configuration file
  --models, -M          Generate model helpers (default: true)
  --facades, -F         Generate facade helpers (default: true)
  --commands, -C        Generate command helpers (default: true)
  --events, -E          Generate event/helpers (default: false)
  --providers, -P       Generate service provider helpers (default: true)
  --namespace, -N       Package namespace (auto-detected if not provided)
  --vendor-name         Vendor name (auto-detected if not provided)
  --inline, -i          Inject PHPDocs directly into model files (recommended!)
  --backup, -b          Create backup before modifying files (use with --inline)
  --help, -h            Show help
```

### 📝 Inline PHPDoc Injection (Recommended)

The `--inline` option injects comprehensive PHPDoc blocks directly into your model files!

**Usage:**
```bash
# Inject PHPDocs into models
vendor/bin/generate-ide-helper generate . --inline

# With backup
vendor/bin/generate-ide-helper generate . --inline --backup
```

**Example Output:**
```php
/**
 * App\Models\User
 *
 * @table users
 *
 * @property int $id (auto-increment)
 * @property string $name
 * @property \Illuminate\Support\Carbon|string|null $email_verified_at
 * @property string|null $settings - User preferences
 * @property float $balance (default: 0.00)
 *
 * @method \Illuminate\Database\Eloquent\Relations\HasMany|Post[] posts()
 * @method static \Illuminate\Database\Eloquent\Builder|User query()
 */
class User extends Model { ... }
```

## 🔍 Linter

The package includes a powerful linter that checks your Laravel package for common issues, best practices, and code quality problems.

### Basic Linting

```bash
vendor/bin/generate-ide-helper lint .
```

### Advanced Linting

```bash
# Output as JSON
vendor/bin/generate-ide-helper lint . --format json

# Save report to file
vendor/bin/generate-ide-helper lint . --format file --output lint-report.json

# Only show errors and warnings
vendor/bin/generate-ide-helper lint . --severity warning

# Run only specific checks
vendor/bin/generate-ide-helper lint . --only models --only commands

# Exclude specific checks
vendor/bin/generate-ide-helper lint . --exclude naming --exclude types

# Fail on warnings instead of errors
vendor/bin/generate-ide-helper lint . --fail-on warning

# Use custom config
vendor/bin/generate-ide-helper lint . --config lint-config.php
```

### Lint Command Options

```
lint <path> [options]

Arguments:
  path                  Path to the Laravel package directory

Options:
  --config, -c          Path to configuration file
  --format, -f          Output format: console, json, file (default: console)
  --output, -o          Output file path (for file format)
  --severity, -s        Minimum severity: error, warning, info, hint (default: hint)
  --only                Run only specific checks (e.g., models, commands)
  --exclude             Exclude specific checks
  --fail-on             Exit with error on: error, warning (default: error)
```

### Available Lint Checks

| Check | Description |
|-------|-------------|
| **general** | PHP tags, namespaces, strict types, trailing whitespace |
| **models** | Fillable/guarded, casts, relationships, table names |
| **facades** | Accessor methods, proper facade structure |
| **commands** | Signatures, descriptions, handle methods, return types |
| **providers** | Register/boot methods, parent calls, config publishing |
| **naming** | File names, class names, naming conventions |
| **types** | Return types, parameter types, type hints |
| **best_practices** | Security issues, debug functions, hardcoded secrets |

### Example Lint Output

```
┌─────────────────────────────────────────────────────────────┐
│                    Laravel Package Linter                    │
└─────────────────────────────────────────────────────────────┘

Scanning Package
================

─────────────────────────────────────────────────────────────
Lint Results
─────────────────────────────────────────────────────────────

 ❌  Errors (2)

 src/Models/User.php:15 - Model doesn't define $fillable or $guarded. 
    This may allow mass assignment vulnerabilities.
    💡 Suggestion: Define protected $fillable = [...] or protected $guarded = ['*'];

 src/Commands/MyCommand.php:1 - Command is missing $signature property.
    💡 Suggestion: Add: protected $signature = 'your:command {argument?} {--option?}';

 ⚠️  Warnings (3)

 src/Models/Post.php:1 - Consider defining $casts property for automatic type conversion.

─────────────────────────────────────────────────────────────
Summary
─────────────────────────────────────────────────────────────

 ┌─────────────────┬───────┐
 │ Metric          │ Count │
 ├─────────────────┼───────┤
 │ Files Scanned   │ 12    │
 │ Total Issues    │ 5     │
 │ ❌ Errors       │ 2     │
 │ ⚠️  Warnings    │ 3     │
 │ ℹ️  Info         │ 0     │
 │ 💡 Hints        │ 0     │
 └─────────────────┴───────┘

 ❌ Found 2 error(s). Please fix them before proceeding.
```

### Lint Configuration

Create a custom config file for advanced linting:

```php
<?php
// lint-config.php

return [
    'source_dirs' => ['src', 'lib'],
    
    'exclude' => ['vendor', 'tests', 'node_modules'],
    
    'checks' => [
        'general' => true,
        'models' => true,
        'facades' => true,
        'commands' => true,
        'providers' => true,
        'naming' => true,
        'types' => true,
        'best_practices' => true,
    ],
];
```

Then use it with:

```bash
vendor/bin/generate-ide-helper lint . --config lint-config.php
```

## 📁 Generated Files

After running the generator, you'll get:

```
.idea-ide-helper/
├── _ide_helper.php              # Main entry point (includes all files)
├── _ide_helper_models.php       # Model PHPDoc stubs
├── _ide_helper_facades.php      # Facade PHPDoc stubs
├── _ide_helper_commands.php     # Command PHPDoc stubs
├── _ide_helper_providers.php    # Service provider PHPDoc stubs
└── _ide_helper_events.php       # Event PHPDoc stubs (if enabled)
```

## 🔧 IDE Configuration

### VS Code

Add to `.vscode/settings.json`:

```json
{
    "php.suggestPaths": [
        ".idea-ide-helper/_ide_helper.php"
    ],
    "intelephense.files.include": [
        ".idea-ide-helper/**/*.php"
    ]
}
```

### PHPStorm

1. Go to **Settings > Languages & Frameworks > PHP**
2. Add `.idea-ide-helper/` to the **Include paths**
3. The IDE will automatically recognize the helper files

### Vim (with ALE or CoC)

Add to your `.vimrc` or `.config/nvim/init.vim`:

```vim
let g:ale_php_namespace_paths = ['.idea-ide-helper']
```

## 📝 Configuration File

Create a custom config file for advanced usage:

```bash
vendor/bin/generate-ide-helper generate . --config ide-helper-config.php
```

Example `ide-helper-config.php`:

```php
<?php

return [
    'source_dirs' => ['src', 'lib'],
    
    'output' => [
        'directory' => '.idea-ide-helper',
        'format' => 'php',
    ],
    
    'generate' => [
        'models' => true,
        'facades' => true,
        'commands' => true,
        'providers' => true,
        'events' => false,
    ],
    
    'models' => [
        'include_magic_properties' => true,
        'include_relationships' => true,
        'include_scopes' => true,
    ],
    
    'exclude' => [
        'vendor',
        'tests',
        'node_modules',
    ],
];
```

## 🎨 Example Output

### For Models

```php
<?php

namespace YourPackage\Models {

    /**
     * YourPackage\Models\User
     *
     * @table users
     * @property int $id
     * @property string $name
     * @property string $email
     * @property bool $is_active
     * @property \Illuminate\Support\Carbon|string $created_at
     * @property \Illuminate\Support\Carbon|string $updated_at
     * @method \Illuminate\Database\Eloquent\Relations\HasMany|\Illuminate\Database\Eloquent\Collection|Post[] posts()
     * @method static \Illuminate\Database\Eloquent\Builder|User query()
     * @method static \Illuminate\Database\Eloquent\Builder|User where($column, $operator = null, $value = null, $boolean = 'and')
     * @method static \Illuminate\Database\Eloquent\Builder|User create(array $attributes = [])
     */
    class User extends \Illuminate\Database\Eloquent\Model {}

}
```

### For Facades

```php
<?php

namespace YourPackage\Facades {

    /**
     * Facade: YourPackage\Facades\MyService
     * @accessor my-service
     */
    class MyService extends \Illuminate\Support\Facades\Facade {}

}
```

## 🔄 Continuous Integration

Add to your CI/CD pipeline to keep IDE helpers up-to-date:

```yaml
# GitHub Actions Example
- name: Generate IDE Helpers
  run: vendor/bin/generate-ide-helper generate .
  
- name: Check for changes
  run: git diff --exit-code .idea-ide-helper/
```

## 📋 What Gets Analyzed?

| Component | What's Detected | 
|-----------|----------------|
| **Models** | Properties, fillable, casts, relationships, table name |
| **Facades** | Class name, accessor, namespace |
| **Commands** | Signature, description, namespace |
| **Providers** | Service provider classes, namespaces |
| **Events** | Event classes, namespaces |
| **Middlewares** | Middleware classes |
| **Jobs** | Job classes (ShouldQueue) |
| **Listeners** | Event listener classes |

## 🛠️ Requirements

- PHP 8.1 or higher
- No Laravel installation required!

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

## 🙏 Credits

Created by [Kyeremeh](https://github.com/kyeremeh)

Inspired by the need for better IDE support in Laravel package development.

## 🐛 Issues & Support

If you encounter any issues or have questions, please [open an issue](https://github.com/kyeremeh/laravel-package-ide-helper/issues).

---

**Happy Package Developing! 🎉**
