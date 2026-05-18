# Laravel Package Template

<p align="center">
  <a href="https://github.com/aagjalpankaj/laravel-package-template">
    <img src="https://img.shields.io/github/stars/aagjalpankaj/laravel-package-template?style=for-the-badge" alt="GitHub Stars">
  </a>
  <a href="https://github.com/aagjalpankaj/laravel-package-template/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/aagjalpankaj/laravel-package-template/ci.yml?branch=main&style=for-the-badge&label=CI" alt="CI Status">
  </a>
  <a href="https://packagist.org/packages/aagjalpankaj/laravel-package-template">
    <img src="https://img.shields.io/packagist/dt/aagjalpankaj/laravel-package-template?style=for-the-badge" alt="Total Downloads">
  </a>
  <a href="https://packagist.org/packages/aagjalpankaj/laravel-package-template">
    <img src="https://img.shields.io/packagist/v/aagjalpankaj/laravel-package-template?style=for-the-badge" alt="Latest Version">
  </a>
  <a href="https://github.com/aagjalpankaj/laravel-package-template/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/aagjalpankaj/laravel-package-template?style=for-the-badge" alt="License">
  </a>
</p>

<p align="center">
  <strong>A comprehensive starter template for creating high-quality Laravel packages with modern development tools and best practices.</strong>
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)
- [Support](#support)

## 🎯 Overview

This template provides a solid foundation for developing Laravel packages with industry-standard tools and configurations. It follows Laravel package development best practices and includes everything you need to create, test, and maintain professional-grade packages.

## ✨ Features

- **🧪 Comprehensive Testing Suite**
  - PestPHP for Feature, Unit & Architecture testing
  - Laravel Workbench for integration testing
  - Pre-configured test environments

- **🔧 Code Quality Tools**
  - Laravel Pint for consistent code styling
  - Rector for automated refactoring and upgrades
  - GitHub Actions for continuous integration

- **📦 Package Development Tools**
  - Pre-configured composer.json with optimal settings
  - Service provider boilerplate
  - Configuration and migration publishing

- **🚀 Developer Experience**
  - Automated CI/CD workflows
  - Development helper commands
  - Documentation templates

## 📋 Requirements

- PHP 8.1 or higher
- Laravel 10.0 or higher
- Composer 2.0 or higher

## 🚀 Installation

### Using GitHub Template

1. Click the "Use this template" button on the [GitHub repository](https://github.com/aagjalpankaj/laravel-package-template)
2. Create your new repository
3. Clone your new repository locally

### Using Composer

```bash
composer create-project aagjalpankaj/laravel-package-template:dev-main your-package-name
cd your-package-name
```

## ⚡ Quick Start

After creating your package from this template, follow these steps:

### 1. Customize Package Information

Replace the following placeholders throughout your codebase:

| Placeholder | Replace With | Example |
|-------------|--------------|---------|
| `Aagjalpankaj` | Your vendor namespace | `YourCompany` |
| `LaravelPackageTemplate` | Your package class name | `AwesomePackage` |
| `laravel-package-template` | Your package name | `awesome-package` |

### 2. Update Package Configuration

Edit the following files with your package details:
- `composer.json` - Package metadata, dependencies, and autoloading
- `config/laravel-package-template.php` - Package configuration file
- `src/LaravelPackageTemplateServiceProvider.php` - Service provider

### Available Commands

| Command | Description |
|---------|-------------|
| `composer ci` | Run complete CI suite (tests, code style, static analysis) |
| `composer ci:fix` | Fix code style and refactor issues automatically |
| `composer test` | Run the full test suite |
| `composer test:unit` | Run unit tests only |
| `composer test:feature` | Run feature tests only |
| `composer test:arch` | Run architecture tests only |
| `composer pint` | Fix code style issues |
| `composer rector` | Apply automated refactoring |

### Continuous Integration
GitHub Actions automatically run:
- ✅ Tests across multiple PHP versions
- ✅ Code style checks
- ✅ Static analysis
- ✅ Dependency security scanning
