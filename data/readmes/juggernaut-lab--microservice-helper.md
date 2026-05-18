# Juggernaut Lab — Laravel Microservice Helper

A Laravel toolkit engineered to help microservice teams centralize and synchronize shared database migrations, enums, helpers, scaffolding generators, and core logic across multiple Laravel applications.

This package brings structure, consistency, and developer efficiency to multi-repo or multi-service Laravel environments.

## What It Solves

- Prevents schema drift across microservices
- Centralizes shared logic and reusable components
- Provides internal scaffolding for rapid package updates
- Enables safe and intelligent migration publishing
- Ensures predictable changes across distributed apps
- Eliminates duplication of enums, helpers, and domain classes
- Provides a workflow and tooling model for collaborative teams

Designed for engineering teams where multiple Laravel services depend on shared domain logic or a shared database.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Local Development (Symlink Mode)](#local-development-symlink-mode)
5. [Migration Management](#migration-management)
6. [Scaffolding System](#scaffolding-system)
7. [Commands](#commands)
8. [Recommended Workflow](#recommended-workflow)
9. [Handling Shared Environments (Staging/Prod)](#handling-shared-environments-stagingprod)
10. [Project Structure](#project-structure)
11. [Future Enhancements](#future-enhancements)

---

## Overview

The **Juggernaut Lab — Laravel Microservice Helper** package acts as a foundational layer for multi-service Laravel ecosystems.

It centralizes:

- Database migrations
- Enums
- Shared business logic
- Scaffolding & code generation
- Utilities and helper classes
- Schema definitions
- Internal developer tooling

This ensures every service remains aligned, even when multiple teams contribute to shared domain concepts.

---

## Features

### ✔ Centralized Shared Migrations
One source of truth for database schema shared across multiple Laravel apps.

### ✔ Smart Migration Publisher
Publishes only new migrations to prevent duplication or corruption.

### ✔ Internal Scaffolding System
Generate shared components directly inside the package:

- Migrations
- Classes
- Enums
- Full “bundle” creation (migration + class + enum)

### ✔ Symlink-Aware Package Development
When installed via `path` repository, the package becomes editable in real time.

### ✔ Microservice-Ready Architecture
Ideal for teams operating multiple Laravel services backed by a shared or partially shared database.

---

## Installation

Install via Composer:

```bash
composer require juggernaut-lab/microservice-helper
```

Publish package migrations:

```bash
php artisan juggernaut:publish-migrations
```

---

## Local Development (Symlink Mode)

For package maintainers, Juggernaut Lab supports a **local symlink workflow** that enables real-time editing and testing.

### Benefits

- Live editing of package files
- No modifying vendor/ files
- Perfect for contributors improving the package
- Ideal for multi-developer collaboration

### Strict Rule
**Do NOT commit path repositories or symlink configs.**  
Use a local-only override file.

### Step 1 — Create `composer.local.json`

```
composer.local.json
```

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "../microservice-helper",
            "options": { "symlink": true }
        }
    ]
}
```

### Step 2 — Gitignore It

```
composer.local.json
```

### Step 3 — Install in Symlink Mode

```bash
composer update juggernaut-lab/microservice-helper
```

### Result

- Maintainers work live within the package
- Nothing leaks into Git
- Staging/production do not use symlinks
- Team members stick to normal Composer installs

---

## Migration Management

Shared migrations live inside the package:

```
microservice-helper/database/migrations/
```

Publish them into the host application:

```bash
php artisan juggernaut:publish-migrations
```

### How the Publisher Works

- Detects existing migrations
- Publishes only new files
- Protects against duplication
- Supports `--force` for overwrites
- Summarizes changes

Example output:

```
Total migrations in package:   1025
Existing in project already:   1023
Newly published migrations:    2

New migrations added:
  ✔ 2025_01_10_000000_add_wallets_table.php
  ✔ 2025_01_11_000000_create_invoice_table.php
```

---

## Scaffolding System

Juggernaut Lab includes an internal scaffolding engine for generating new shared components.

All generated files are written **inside the package itself**, not inside the consuming Laravel project.

### Available Generators

- Migration Generator
- Class Generator
- Enum Generator
- Full Bundle Generator (migration + class + enum)

This ensures every shared artifact remains consistent and centralized.

---

## Commands

### 1. Publish Migrations

```bash
php artisan juggernaut:publish-migrations
```

Force overwrite:

```bash
php artisan juggernaut:publish-migrations --force
```

---

### 2. Generate a Migration

```bash
php artisan juggernaut:make-migration create_orders_table --create=orders
```

Modify a table:

```bash
php artisan juggernaut:make-migration add_status_to_users --table=users
```

Generated into:

```
microservice-helper/database/migrations/
```

---

### 3. Generate a Class

```bash
php artisan juggernaut:make-class MoneyFormatter
```

With namespace:

```bash
php artisan juggernaut:make-class TaxService --namespace=Services
```

---

### 4. Generate an Enum

```bash
php artisan juggernaut:make-enum UserStatus
```

---

### 5. Generate Everything (Migration + Class + Enum)

```bash
php artisan juggernaut:make-all Order --create=orders
```

---

## Recommended Workflow

This workflow ensures clean, safe collaboration between:

- Package maintainers
- Microservice developers
- Staging & production environments

### 1. Package Maintainers

Use symlink mode:

1. Enable via `composer.local.json`
2. Modify shared code/migrations/enums
3. Generate components using `juggernaut:make-*`
4. Publish updated migrations into local microservices
5. Push package updates to GitHub
6. Tag a release:
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```

### 2. Microservice Developers

No symlink. No scaffolding.

Workflow:

```bash
git pull
composer install
php artisan migrate
```

### 3. Staging & Production

Never use symlink mode.

Workflow:

```bash
composer install --no-dev
php artisan migrate
```

#### Shared DB Rule

If multiple services share one DB:

```
DB_LEADER_SERVICE=true
```

Others:

```
DB_LEADER_SERVICE=false
```

---

## Workflow Summary Table

| Role | Uses Symlink? | Generates Code? | Publishes Migrations? | Runs Migrations? |
|------|---------------|------------------|------------------------|-------------------|
| Maintainer | YES | YES | YES | YES |
| Team Member | NO | NO | NO | YES |
| Staging | NO | NO | NO | YES (leader only) |
| Production | NO | NO | NO | YES (leader only) |

---

## Project Structure

```
microservice-helper/
├── src/
│   ├── Commands/
│   │   ├── PublishMigrationsCommand.php
│   │   ├── MakeMigrationCommand.php
│   │   ├── MakeClassCommand.php
│   │   ├── MakeEnumCommand.php
│   │   └── MakeAllCommand.php
│   ├── MicroserviceHelperServiceProvider.php
│   └── ...
├── database/
│   └── migrations/
├── stubs/
│   ├── class.stub
│   └── enum.stub
└── composer.json
```

---

## Future Enhancements

- Dry-run mode for migration publishing
- Hash-based migration integrity checks
- JSON output mode for CI pipelines
- Additional scaffold types (DTOs, services, events, models)
- Domain module generators
- Diagnostics tooling (`juggernaut:doctor`)
- Automatic Pint formatting on generation

---

## Conclusion

The **Juggernaut Lab – Laravel Microservice Helper** provides a clean, scalable, team-friendly foundation for multi-service Laravel architectures.

It streamlines collaboration, prevents schema drift, centralizes business logic, and gives engineering teams a predictable workflow for managing shared domain components.

