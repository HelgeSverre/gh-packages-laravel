# Stringhive for Laravel

The official Laravel package for [Stringhive](https://stringhive.com). Artisan commands to sync and audit your translation files, a full API client if you want to go deeper, and zero boilerplate.

[![CI](https://github.com/stringhive/laravel/actions/workflows/ci.yml/badge.svg)](https://github.com/stringhive/laravel/actions/workflows/ci.yml)
[![Latest Version](https://img.shields.io/packagist/v/stringhive/laravel)](https://packagist.org/packages/stringhive/laravel)
[![Total Downloads](https://img.shields.io/packagist/dt/stringhive/laravel)](https://packagist.org/packages/stringhive/laravel)
[![PHP](https://img.shields.io/packagist/php-v/stringhive/laravel)](https://packagist.org/packages/stringhive/laravel)
[![Laravel](https://img.shields.io/badge/Laravel-13%2B-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![License](https://img.shields.io/github/license/stringhive/laravel)](LICENSE)

---

## Installation

```bash
composer require stringhive/laravel
```

---

## Quick start

Push your source strings to Stringhive:

```bash
php artisan stringhive:push my-app
```

Pull translated locales back to `lang/`:

```bash
php artisan stringhive:pull my-app
```

Audit for missing or orphaned keys:

```bash
php artisan stringhive:audit my-app
```

---

Full setup and configuration: [stringhive.com/docs/sdk/laravel/setup](https://www.stringhive.com/docs/sdk/laravel/setup)
