<div align="center">

<img src="https://autocrud.mohmadyazansweed.nl/logo.png" alt="Laravel Auto CRUD" width="120">

# Laravel Auto CRUD

**Generate complete CRUD scaffolding in seconds**

[![Website](https://img.shields.io/badge/Website-autocrud.mohmadyazansweed.nl-orange?style=for-the-badge)](https://autocrud.mohmadyazansweed.nl)

[![Tests](https://img.shields.io/github/actions/workflow/status/Mosweed/laravel-auto-crud/tests.yml?style=flat-square&label=tests)](https://github.com/Mosweed/laravel-auto-crud/actions/workflows/tests.yml)
[![Latest Version](https://img.shields.io/packagist/v/mosweed/laravel-auto-crud.svg?style=flat-square)](https://packagist.org/packages/mosweed/laravel-auto-crud)
[![Downloads](https://img.shields.io/packagist/dt/mosweed/laravel-auto-crud.svg?style=flat-square)](https://packagist.org/packages/mosweed/laravel-auto-crud)
[![License](https://img.shields.io/packagist/l/mosweed/laravel-auto-crud.svg?style=flat-square)](https://packagist.org/packages/mosweed/laravel-auto-crud)
[![Stars](https://img.shields.io/github/stars/Mosweed/laravel-auto-crud.svg?style=flat-square)](https://github.com/Mosweed/laravel-auto-crud)

[Installation](#-installation) •
[Quick Start](#-quick-start) •
[Features](#-features) •
[Documentation](DOCUMENTATION.md)

</div>

---

## ⚡ Features

| Feature | Description |
|---------|-------------|
| 🏗️ **Complete CRUD** | Models, Controllers, Views, Routes in one command |
| 🌐 **API & Web** | Generate API and Web controllers simultaneously |
| 🎨 **Modern Views** | Tailwind v4 & Bootstrap 5 with dark mode |
| ⚡ **Livewire** | Real-time table and form components |
| 🛣️ **Auto Routing** | Routes automatically added to your files |
| 🏠 **App Layout** | Ready-to-use layout with navigation |
| 🎯 **Tailwind v4** | Auto-detects and configures CSS variables |
| 🗑️ **Soft Deletes** | Full restore/force-delete support |
| 🔍 **Filter & Sort** | Built-in query traits |
| 🧪 **Tests** | Automatic Pest/PHPUnit generation |
| 📋 **JSON Config** | Batch generate multiple CRUDs |
| ↩️ **Rollback** | Auto cleanup on errors |

---

## 📋 Requirements

- PHP 8.2+
- Laravel 11.x or 12.x

---

## 📦 Installation

```bash
composer require mosweed/laravel-auto-crud
```

### Publish Layout & Welcome Page

```bash
php artisan crud:layout --welcome
```

### Publish Configuration (Optional)

```bash
php artisan vendor:publish --tag=auto-crud-config
```

---

## 🚀 Quick Start

```bash
# 1. Publish layout and welcome page
php artisan crud:layout --welcome

# 2. Generate a complete CRUD
php artisan make:crud Product \
    --fields="name:string,price:decimal,description:text:nullable" \
    --belongsTo=Category \
    --all \
    --add-to-nav

# 3. Run migrations
php artisan migrate

# 4. Build assets
npm run build
```

Your CRUD is ready at `/products` ✨

---

## 💻 Usage

### Basic Command

```bash
php artisan make:crud Post
```

This generates:
- ✅ Model with Filterable and Sortable traits
- ✅ Web Controller
- ✅ API Controller
- ✅ Form Requests (Store & Update)
- ✅ Policy
- ✅ Blade Views (index, create, edit, show)
- ✅ Routes in `web.php` and `api.php`

### Command Options

| Option | Description |
|--------|-------------|
| `--type=api\|web\|both` | Output type (default: both) |
| `--css=tailwind\|bootstrap` | CSS framework (default: tailwind) |
| `--all` | Generate migration, factory, seeder, and tests |
| `--force` | Overwrite existing files |
| `--soft-deletes` | Add soft delete support |
| `--livewire` | Generate Livewire components |
| `--tests` | Generate feature and unit tests |
| `--fields=...` | Define fields inline |
| `--belongsTo=Model` | Add belongsTo relationship |
| `--hasMany=Model` | Add hasMany relationship |
| `--belongsToMany=Model` | Add belongsToMany relationship |
| `--json=path` | Generate from JSON configuration |
| `--add-to-nav` | Add to navigation menu |

### Defining Fields

```bash
php artisan make:crud Post --fields="title:string,body:text,is_published:boolean"
```

#### Supported Types

| Type | Database Column |
|------|-----------------|
| `string` | VARCHAR |
| `text` | TEXT |
| `integer` | INTEGER |
| `boolean` | BOOLEAN |
| `date` | DATE |
| `datetime` | DATETIME |
| `decimal` | DECIMAL |
| `json` | JSON |
| `foreignId` | BIGINT UNSIGNED |

#### Modifiers

```bash
--fields="title:string:255,slug:string:unique,body:text:nullable"
```

- `nullable` - Field can be null
- `unique` - Add unique constraint
- `255` - String length

### Relationships

```bash
# BelongsTo
php artisan make:crud Post --belongsTo=User --belongsTo=Category

# HasMany
php artisan make:crud User --hasMany=Post

# BelongsToMany
php artisan make:crud Post --belongsToMany=Tag
```

### JSON Configuration

Create a `crud.json` file:

```json
{
    "models": [
        {
            "name": "Product",
            "fields": [
                {"name": "name", "type": "string"},
                {"name": "price", "type": "decimal"}
            ],
            "relationships": [
                {"type": "belongsTo", "model": "Category"}
            ]
        }
    ],
    "options": {
        "all": true,
        "softDeletes": true
    }
}
```

Run:
```bash
php artisan make:crud --json=crud.json
```

---

## 🏠 Layout Command

```bash
php artisan crud:layout
```

| Option | Description |
|--------|-------------|
| `--css=bootstrap` | Use Bootstrap instead of Tailwind |
| `--force` | Overwrite existing layout |
| `--welcome` | Also publish welcome/dashboard page |
| `--models=Product` | Pre-populate navigation |

### Welcome Page

```bash
# Layout + welcome page together
php artisan crud:layout --welcome

# With Bootstrap
php artisan crud:layout --css=bootstrap --welcome
```

---

## 🔍 Filtering & Sorting

The generated models include `Filterable` and `Sortable` traits:

```php
// Filter
GET /products?status=active
GET /products?price_from=10&price_to=100
GET /products?search=keyword

// Sort
GET /products?sort=name&direction=asc

// Soft Deletes
GET /products?trashed=1
```

---

## 🎨 Tailwind v4 Colors

Laravel 12 uses Tailwind v4 by default. Edit `resources/css/app.css`:

```css
@theme {
    /* Primary - Change to green */
    --color-primary-500: #22c55e;
    --color-primary-600: #16a34a;
    --color-primary-700: #15803d;

    /* Secondary */
    --color-secondary-500: #6366f1;
    --color-secondary-600: #4f46e5;
}
```

---

## 📁 Generated Files

```
app/
├── Http/Controllers/
│   ├── ProductController.php
│   └── Api/ProductController.php
├── Http/Requests/Product/
│   ├── StoreProductRequest.php
│   └── UpdateProductRequest.php
├── Models/Product.php
└── Policies/ProductPolicy.php

database/
├── factories/ProductFactory.php
├── migrations/xxxx_create_products_table.php
└── seeders/ProductSeeder.php

resources/views/
├── components/app-layout.blade.php
├── welcome.blade.php
└── products/
    ├── index.blade.php
    ├── create.blade.php
    ├── edit.blade.php
    └── show.blade.php
```

---

## 📖 Documentation

For complete documentation, see [DOCUMENTATION.md](DOCUMENTATION.md).

---

## 🧪 Testing

```bash
composer test
```

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for recent changes.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 🔒 Security

If you discover any security-related issues, please open an issue on GitHub.

---

## 👨‍💻 Credits

- [Mosweed](https://github.com/Mosweed)

---

## 📄 License

The MIT License (MIT). See [LICENSE](LICENSE) for more information.

---

<div align="center">

**[⬆ Back to Top](#laravel-auto-crud)**

Made with ⚡ by [Mosweed](https://github.com/Mosweed)

</div>
