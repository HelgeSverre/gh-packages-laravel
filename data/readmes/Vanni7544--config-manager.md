# Config Manager for Laravel

![PHP](https://img.shields.io/badge/PHP-%5E8.2-blue)
![Laravel](https://img.shields.io/badge/Laravel-10%2B-red)
![License](https://img.shields.io/badge/License-MIT-green)

Safely manage multiple `.env` configurations for your Laravel projects.

Config Manager helps you export, validate, apply, and rollback environment
configuration files — without the risk of silently breaking your application.

---

## Why this exists

Managing `.env` files across multiple environments (local, staging, production)
is error-prone.

A single mistake can:

- break your application  
- leak secrets  
- cause downtime in production  

Config Manager makes configuration changes:

- explicit  
- reversible  
- and safe-by-default  

---

## Safety guarantees

Config Manager guarantees that:

- Your existing `.env` file is **never modified** unless you explicitly use `--apply`
- Every applied change creates an **automatic backup**
- You can **rollback the previous `.env`** at any time
- Required variables are **validated before export**
- Production environments trigger **explicit warnings**

No hidden side-effects.  
No silent overwrites.

---

## Requirements

- PHP 8.2+
- Laravel 10+

---

## Installation

Install the package using Composer:

```bash
composer require vanni/config-manager
```

---

## Basic usage

### Export an environment configuration

```bash
php artisan config-manager:export <project-id> <environment-id>
```

This generates:

```bash
.env.config-manager
```

➡ Your existing `.env` file is **not modified**.

---

### Apply immediately (with automatic backup)

```bash
php artisan config-manager:export <project-id> <environment-id> --apply
```

This will:

✔ backup your current `.env`  
✔ replace it with the generated one  

---

### Rollback the last applied `.env`

```bash
php artisan config-manager:export --rollback
```

---

## Production safety

If the selected environment is marked as production,
you will see a **clear warning prompt**
before anything is applied.

---

## Automatic backups

Backups are stored in:

```bash
.env.backups/
```

and handled automatically.

---

## 🛡 License

This project is released under the **MIT License**.

The Base edition provides essential features for a safe
and controlled management of `.env` files.

Advanced features such as audit logs, extended security checks,
and guided workflows are available in **Config Manager Pro**.

👉 **The English version of this documentation is the legally valid one.**
