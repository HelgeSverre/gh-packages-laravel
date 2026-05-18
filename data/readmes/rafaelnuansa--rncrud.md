# RNCrud - Advanced Laravel CRUD Generator 🚀

[![Latest Version on Packagist](https://img.shields.io/packagist/v/rafaelnuansa/rncrud.svg?style=flat-square)](https://packagist.org/packages/rafaelnuansa/rncrud)
[![Total Downloads](https://img.shields.io/packagist/dt/rafaelnuansa/rncrud.svg?style=flat-square)](https://packagist.org/packages/rafaelnuansa/rncrud)
[![License](https://img.shields.io/packagist/l/rafaelnuansa/rncrud.svg?style=flat-square)](https://packagist.org/packages/rafaelnuansa/rncrud)

**RNCrud** is a professional Laravel package designed to accelerate development by generating smart, interactive, and flexible CRUD boilerplates. It is perfect for building both APIs and Blade-based applications.

---

## ✨ Features (v1.1.2)

* 🛠️ **Interactive Field Builder** (New!) Forget manual typing. If you skip the `--fields` flag, the package will guide you step-by-step to define your columns and data types.
* 🤖 **Modern Interactive UI** Uses **Laravel Prompts** for a sleek terminal experience. Navigate with arrow keys and toggle selections with the spacebar.
* 🌐 **API & Web Support** Choose between a standard Controller (Blade) or an API Controller (JSON response).
* 📂 **Multi-Namespace Support** Create files inside sub-folders (e.g., `Admin/Product`).
* 🔗 **Smart ORM Relations** Automatically detects foreign keys (ending with `_id`) to generate `belongsTo` relationships in Models and `constrained()` in Migrations.
* 🗑️ **Soft Deletes Support** Easily add `SoftDeletes` trait to Models and `softDeletes()` column to migrations with a single flag (`-s`).
* 🎨 **Blade Generation** Generates Blade files (`index`, `create`, `edit`, `show`) with clean and modern structures.

---

## 📋 Requirements

* PHP: `^8.1 - ^8.5`
* Laravel: `^10.0 | ^11.0 | ^12.0 | ^13.0`

---

## 📦 Installation

Install via Composer:

```bash
composer require rafaelnuansa/rncrud
```

---

## 🚀 Usage

### 1. The Easy Way (Fully Interactive)
Simply run the command and follow the prompts:
```bash
php artisan make:crud ModelName
```

### 2. The Pro Way (Using Flags)
Run everything in one line:
```bash
php artisan make:crud ModelName --fields="column_name:type"
```

### Pro Examples

**1. Standard CRUD with Soft Deletes:**
```bash
php artisan make:crud Post --fields="title:string,body:text" --soft-delete
```

**2. Admin CRUD with Relations (Using Shortcuts):**
```bash
php artisan make:crud Admin/Product -s --fields="category_id:foreign,name:string,price:integer"
```

**3. Generate only Model and Controller (No Migration):**
```bash
php artisan make:crud Task -m
```

---

## 🕹 Interactive Mode Guide

* **Arrow Keys**: Navigate between options.
* **Spacebar**: Toggle file selections (Model, Controller, etc.).
* **Enter**: Confirm selection or go to the next step.
* **Field Builder**: Type your field name, select the type from the list, and confirm to add more.

---

## 🛠 Command Options

| Option | Shortcut | Description |
| :--- | :--- | :--- |
| `--fields` | | Define database columns (Format: `name:type,name2:type`). |
| `--soft-delete` | `-s` | Adds `SoftDeletes` trait to Model and column to Migration. |
| `--no-migration`| `-m` | Skips generating the migration file. |
| `--force` | | Overwrite existing files without warning. |
| `--help` | | Display detailed usage instructions and examples. |

---

## 🧩 Customizing Templates (Stubs)

If you want to customize the generated code (e.g., changing the UI to Bootstrap or modifying the Controller logic), publish the stubs:

```bash
php artisan vendor:publish --tag=rncrud-stubs
```

The files will be available in `stubs/vendor/rncrud/`. 

---

## 📁 Output Structure

* **Model**: `app/Models/Product.php`
* **Controller**: `app/Http/Controllers/Admin/ProductController.php`
* **Migration**: `database/migrations/YYYY_MM_DD_create_products_table.php`
* **Views**: `resources/views/products/*.blade.php`
* **Route**: Automatically registered in `web.php` or `api.php`

---

## 📄 License

This package is open-sourced under the **MIT License**.

---

## 👨‍💻 Author

Developed by **[Rafael Nuansa](https://github.com/rafaelnuansa)**.