# Laravel DDD Generator

[![CI](https://github.com/OlegMarko/ddd-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/OlegMarko/ddd-generator/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/OlegMarko/ddd-generator/branch/main/graph/badge.svg)](https://codecov.io/gh/OlegMarko/ddd-generator)
[![Latest Version](https://img.shields.io/packagist/v/fixik/ddd-generator)](https://packagist.org/packages/fixik/ddd-generator)
[![Total Downloads](https://poser.pugx.org/fixik/ddd-generator/downloads)](https://packagist.org/packages/fixik/ddd-generator)
[![License](https://poser.pugx.org/fixik/ddd-generator/license)](https://packagist.org/packages/fixik/ddd-generator)

A Laravel package for generating **Domain-Driven Design (DDD)** modules with
**CQRS**, **modular architecture**, and **HTTP API presets**.

> Opinionated, test-driven, production-ready scaffolding for large Laravel apps.

---

## ✨ Features

- Modular DDD structure (`App/Modules/*`)
- Clean separation:
   - Domain / Application / Infrastructure
- CQRS (Commands / Queries / Handlers)
- HTTP API generation (Controllers, Requests, Resources, Routes)
- Idempotent generators (safe to re-run)
- Preset-based generation (`domain`, `http-crud`, `http-api`) + optional `--style=cqrs`
- Custom base namespace and path
- Fully covered by tests

---

## 🚀 Quick Start

### Install

```bash
composer require fixik/ddd-generator --dev
```

### Generate API HTTP module

```bash
php artisan ddd:make http-api Order --entity=Order
```

This will generate:
- Domain entity & repository
- CQRS commands / queries & handlers
- HTTP controller, request, resource
- Module routes
- Module ServiceProvider

## 📦 Presets
| Preset        | Description                                      |
|---------------|--------------------------------------------------|
| `domain`      | Domain only (Entities, Events, Repositories)     |
| `domain` + `--style=cqrs` | Domain + CQRS (Commands, Queries, Handlers) |
| `http-crud`   | Domain + HTTP CRUD (Controllers, Requests, Routes) |
| `http-api`    | Domain + HTTP API (Controllers, Requests, Routes) |
| `http-api` + `--style=cqrs` | Domain + CQRS + HTTP API |

## 📚 Documentation

### 👉 Full documentation:
https://olegmarko.github.io/ddd-generator/

Includes:
- Architecture overview
- Presets explained
- CQRS flow
- Configuration
- Extending generators

## 🧠 Philosophy

This package enforces explicit architecture:
- No hidden magic
- No guessing entities
- No global routes
- No infrastructure leaks into domain
- Designed for long-living Laravel applications.

## ⚡ Performance & Caching

The generator provides optional cache commands for large, modular applications:

- `php artisan ddd:modules-cache`
- `php artisan ddd:event-listeners-cache`
- `php artisan ddd:cache-clear`

These commands are intended **ONLY for production environments**.

They should NOT be used in:
- local development
- automated tests
- CI pipelines

They work similarly to Laravel's `route:cache` and `event:cache`
and significantly reduce bootstrapping overhead in large projects.

## 📄 License

### MIT