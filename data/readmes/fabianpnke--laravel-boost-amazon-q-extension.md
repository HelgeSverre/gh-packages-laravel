# Laravel Boost - Amazon Q Developer Extension

<a href="https://packagist.org/packages/fabianpnke/laravel-boost-amazon-q-extension"><img src="https://img.shields.io/packagist/dt/fabianpnke/laravel-boost-amazon-q-extension?v=1" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/fabianpnke/laravel-boost-amazon-q-extension"><img src="https://img.shields.io/packagist/v/fabianpnke/laravel-boost-amazon-q-extension?v=1" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/fabianpnke/laravel-boost-amazon-q-extension"><img src="https://img.shields.io/packagist/l/fabianpnke/laravel-boost-amazon-q-extension?v=1" alt="License"></a>

## Introduction

A Laravel Composer package that provides [Amazon Q Developer](https://aws.amazon.com/q/) integration for [Laravel Boost](https://github.com/laravel/boost).

## Requirements

- PHP 8.2 or higher
- Laravel 11.45.3 / 12.41.1 / 13.0 or higher
- Laravel Boost 2.1.6 or higher
- [Amazon Q JetBrains Plugin](https://plugins.jetbrains.com/plugin/24267-amazon-q)

## Installation

### Step 1: Install the Package

Install the package via Composer as a development dependency:

```bash
composer require fabianpnke/laravel-boost-amazon-q-extension --dev
```

### Step 2: Install Laravel Boost

Laravel Boost will auto-detect the Amazon Q Developer installation automatically. Run the command below to install Laravel Boost follow the installation instructions. More information can be found in the [Laravel Boost documentation](https://github.com/laravel/boost).

```bash
php artisan boost:install
```

During installation, you will be prompted to select an AI agent. The available options will include the following one:

- `amazonq` - For Amazon Q Jetbrains Plugin (PhpStorm, etc.)

## License

Laravel Boost - Amazon Q Developer Extension is open-sourced software licensed under the [MIT license](LICENSE).
