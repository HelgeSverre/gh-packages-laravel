# Laravel Runtime

**Laravel Runtime** is a lightweight **runtime control layer** built on top of the Laravel framework.

It was developed as the foundational package for **Elymod**, a modular mini-framework that enables the creation of **pluggable modules for an OAuth2 Passport Server**.

Instead of extending, forking, or modifying Laravel, this package **constrains and orchestrates it**, exposing only the framework features that a custom runtime truly needs.

---

## 🎯 Purpose

Laravel Runtime exists to support **custom runtimes and mini-frameworks** that:

- Use Laravel as a dependency, not as a full-stack framework
- Require a **minimal and predictable execution environment**
- Expose a **controlled subset of Artisan commands**
- Must remain **upgrade-safe** across Laravel versions

Its primary real-world implementation is **Elymod**, where Laravel Runtime acts as the infrastructure layer that enables modular development without inheriting the full Laravel application lifecycle.

---

## 🧩 Why Laravel Runtime?

Laravel is powerful, but not always appropriate as a complete framework for:

- Modular platforms
- Authorization servers
- OAuth2 / Passport-based systems
- Opinionated internal runtimes

Laravel Runtime positions Laravel as an **engine**, not as the final product.

---

## ✨ Core Features

- **Selective Artisan Exposure**
  Only explicitly allowed commands (such as `make:*`) are registered and executable.

- **Custom Runtime Bootstrap**
  Replaces Laravel’s default Application and Console Kernel to control the initialization flow.

- **Command Map Filtering**
  Filters Laravel’s internal command registry without modifying vendor files.

- **Upgrade-Safe by Design**
  No forks, no patches, no vendor overrides.

- **Framework-Oriented Architecture**
  Designed specifically to support mini-frameworks and modular systems.

---

## 🏗 Real-World Usage: Elymod

**Elymod** is a modular mini-framework built on top of Laravel Runtime. It is designed to:

- Build self-contained modules for an **OAuth2 Passport Server**
- Enforce strict boundaries between modules
- Provide familiar Laravel generators (`make:model`, `make:seeder`, etc.)
- Prevent uncontrolled framework growth

Laravel Runtime is the **core infrastructure layer** that makes Elymod possible.

---

## 📦 Installation

```bash
composer require elyerr/laravel-runtime
```

Laravel Runtime is intended to be **embedded into another framework or system**, not used as a standalone application.

---

## 🏗 Architecture

```
application (elymod)
   → laravel-runtime
       → laravel/framework
```

```
laravel-runtime
 ├── composer.json
 ├── README.md
 └── src
      ├── App
      │    ├── Application.php
      │    └── ApplicationBuilder.php
      └── Console
           ├── Application.php
           └── Kernel.php
```

---

## 🧠 Design Philosophy

Laravel Runtime is **not a Laravel replacement**.

It is a **control and constraint layer** that allows you to:

- Expose only what your runtime requires
- Keep developer ergonomics familiar
- Avoid framework sprawl in modular systems
- Build long-lived, maintainable architectures on top of Laravel

---

## 🧪 Compatibility

- Laravel 12.x
- PHP 8.2+

---

## 📄 License

MIT License

---

## 👤 Author

**Elvis Yerel Roman Concha**
Framework & Runtime Architecture