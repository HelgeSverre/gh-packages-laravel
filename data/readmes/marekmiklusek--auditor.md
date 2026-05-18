![logo for my php package called_ auditor(1)](https://github.com/user-attachments/assets/df26ed25-7521-4654-b085-606b7fc89655)

# 🔍 Laravel Auditor

<p align="center">
  <a href="https://github.com/marekmiklusek/auditor/actions"><img src="https://github.com/marekmiklusek/auditor/actions/workflows/ci.yaml/badge.svg" alt="CI Pipeline"></a>
  <a href="https://packagist.org/packages/marekmiklusek/auditor"><img src="https://img.shields.io/packagist/v/marekmiklusek/auditor.svg" alt="Latest Stable Version"></a>
  <a href="https://packagist.org/packages/marekmiklusek/auditor"><img src="https://img.shields.io/packagist/dt/marekmiklusek/auditor.svg" alt="Downloads"></a>
  <a href="https://github.com/marekmiklusek/auditor/blob/main/LICENSE.md"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
</p>

A Laravel package that helps you audit your codebase for debugging statements and task-related comments that should not make it to production, such as:

- 💥 `dd()` debug statements
- 🔮 `dump()` debug statements
- ✅ `// TODO:` comments
- 🛠️ `// FIXME:` comments

## 📋 Requirements

- PHP 8.3 or higher
- Laravel 12.17 or higher

## 📥 Installation

You can install the package via Composer:

```bash
composer require marekmiklusek/auditor --dev
```

## 🚀 Usage

### 🔍 Audit Your Code

Run the following command to scan your codebase for debugging statements and task-related comments:

```bash
php artisan audit:code
```

This will scan the following directories for PHP and Blade files:

- 📁 app
- 📁 config
- 📁 database
- 📁 resources
- 📁 routes
- 📁 tests

The command will display a list of all found issues with their file paths, line numbers, and content.

### 🔧 Fixing Issues

You can automatically remove the detected issues using the `--fix` option:

```bash
# Remove all detected issues
php artisan audit:code --fix=all

# Remove only dd() statements
php artisan audit:code --fix=dd

# Remove only dump() statements
php artisan audit:code --fix=dump

# Remove only TODO comments
php artisan audit:code --fix=todo

# Remove only FIXME comments
php artisan audit:code --fix=fixme
```

## 📊 Example Output

When running the audit command, you'll see output similar to this:

```
🔍 Auditing codebase...

app/Http/Controllers/UserController.php (Line 25): dd($user);
app/Models/Post.php (Line 47): // TODO: Add validation
resources/views/welcome.blade.php (Line 15): {{ dump($data) }}

❗ Found 3 issue(s). Run with --fix=all to remove them all.
```

After fixing:

```
🔍 Auditing codebase...

🔧 Fixed: app/Http/Controllers/UserController.php
🔧 Fixed: app/Models/Post.php
🔧 Fixed: resources/views/welcome.blade.php

🔧 Fixed 3 issue(s).
```

## 💡 Why Use This Package?

- 🛡️ **Code Quality**: Prevent debugging code from accidentally being deployed to production
- 📝 **Task-Related comments**: Keep track of TODOs and FIXMEs comments in your codebase
- 🚦 **Pre-Deployment Check**: Run as part of your CI/CD pipeline to ensure clean code
- 🧹 **Simple Cleanup**: Easily remove all debugging statements with a single command

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
