# Laravel Organisation Package – Iquesters <img src="https://avatars.githubusercontent.com/u/7593318?s=200&v=4" alt="Iquesters Logo" width="40" style="vertical-align: middle;"/>

The **Organisation Package** provides a structured and reusable way to manage **multi-level organizational hierarchies** within a Laravel application.
Developed and maintained by **[Iquesters](https://github.com/iquesters)**, this package is designed to integrate seamlessly with other Iquesters modules such as **Foundation**, **User Management**, and **User Interface**.

---

## ⚙️ Purpose

The **Organisation Package** acts as the backbone for handling **organizational structures**, such as:

* Multi-level departments, branches, or business units
* Role and user assignments within each organization
* Reusable organizational logic for other packages

It’s ideal for applications that need structured control over users, teams, and permissions across different organizational levels.

---

## 🚀 Installation

1. Install the package via Composer:

   ```bash
   composer require iquesters/organisation
   ```

2. Run the database migrations to create the required tables:

   ```bash
   php artisan migrate
   ```

3. (Optional) If the package provides default data or roles, seed them using:

   ```bash
   php artisan organisation:seed
   ```

---

### Layout Configuration

You can control which Blade layout the package’s views should extend.
By default, the package uses its own built-in layout:

```php
'layout' => env('ORGANISATION_LAYOUT', 'organisation::layouts.package')
```

#### Example `.env` Setting:

```env
ORGANISATION_LAYOUT=layouts.app
```

This allows you to unify the look and feel of the Organisation module with your existing application’s design.

---
