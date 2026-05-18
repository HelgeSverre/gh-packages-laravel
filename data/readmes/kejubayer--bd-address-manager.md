# 🇧🇩 BD Address Manager (Laravel Package)

A complete Laravel package for managing Bangladesh hierarchical address system:

> **Division → District → Upazila → Union**

Supports multilingual (English + Bangla), slug system, helper functions, caching, and full Laravel integration.

---

# 🚀 Features

* 📍 Complete Bangladesh address hierarchy (Division → District → Upazila → Union)
* 🌐 English + Bangla support
* 🔗 Slug-based system (SEO friendly)
* ⚡ Eloquent relationships
* 🌱 JSON-based seeder system
* 🧩 Global helper functions
* 🔍 Search across all levels
* 📦 Dropdown helpers (UI ready)
* 🧠 Full address generator (EN + BN)
* 🧹 Cache optimized queries
* 🛠 Artisan install command
* 🔌 Extensible API-ready structure

---

# 📦 Installation

Install via Composer:

```bash
composer require kejubayer/bd-address-manager
```

---

# ⚙️ Quick Setup (Recommended)

Run full installation in one command:

```bash
php artisan bd-address:install
```

---

## 🔥 Fresh Install (Reset DB)

```bash
php artisan bd-address:install --fresh --seed
```

---

# 🗃️ Manual Setup (Optional)

If you want full control:

### 1. Publish migrations

```bash
php artisan vendor:publish --tag=bd-address-migrations
```

### 2. Publish seeders

```bash
php artisan vendor:publish --tag=bd-address-seeders
```

### 3. Publish JSON data

```bash
php artisan vendor:publish --tag=bd-address-data
```

### 4. Run migrations

```bash
php artisan migrate
```

### 5. Run seeder

```bash
php artisan db:seed --class=BdAddressSeeder
```

---

# 🗃️ Database Structure

### 📍 bd_divisions

* id
* name_en
* name_bn
* slug

### 📍 bd_districts

* id
* division_id
* name_en
* name_bn
* slug

### 📍 bd_upazilas

* id
* district_id
* name_en
* name_bn
* slug

### 📍 bd_unions

* id
* upazila_id
* name_en
* name_bn
* slug

---

# 🧠 Usage (Helper Functions)

### 📍 Get all divisions

```php
bd_divisions();
```

### 📍 Get districts by division

```php
bd_districts($divisionId);
```

### 📍 Get upazilas by district

```php
bd_upazilas($districtId);
```

### 📍 Get unions by upazila

```php
bd_unions($upazilaId);
```

---

# 🌐 Full Address Generator

### English

```php
echo bd_full_address($unionId);
```

**Output:**

```
Mirpur Union, Mirpur, Dhaka, Dhaka
```

---

### Bangla

```php
echo bd_full_address_bn($unionId);
```

---

# 🔍 Search System

```php
bd_search('mirpur');
```

**Returns:**

```php
[
  'divisions' => [],
  'districts' => [],
  'upazilas' => [],
  'unions' => []
]
```

---

# 🔗 Find by Slug

```php
bd_find_by_slug('division', 'dhaka');
bd_find_by_slug('district', 'dhaka');
bd_find_by_slug('upazila', 'mirpur');
bd_find_by_slug('union', 'mirpur-union');
```

---

# 📦 Dropdown Helpers (UI Ready)

### Divisions

```php
bd_division_dropdown();
```

### Districts

```php
bd_district_dropdown($divisionId);
```

### Upazilas

```php
bd_upazila_dropdown($districtId);
```

### Unions

```php
bd_union_dropdown($upazilaId);
```

---

# ⚡ Eloquent Usage

```php
use Kejubayer\BdAddress\Models\Division;

$divisions = Division::with('districts.upazilas.unions')->get();
```

---

# 🌱 JSON Seeder Structure

```json
[
  {
    "name_en": "Dhaka",
    "name_bn": "ঢাকা",
    "districts": [
      {
        "name_en": "Dhaka",
        "name_bn": "ঢাকা",
        "upazilas": [
          {
            "name_en": "Mirpur",
            "name_bn": "মিরপুর",
            "unions": [
              {
                "name_en": "Mirpur Union",
                "name_bn": "মিরপুর ইউনিয়ন"
              }
            ]
          }
        ]
      }
    ]
  }
]
```

---

# 🛠 Artisan Command

### Install Package

```bash
php artisan bd-address:install
```

### Fresh Install

```bash
php artisan bd-address:install --fresh --seed
```

---

# ⚡ Performance Features

* Cached division data (24h)
* Indexed slug columns
* Eager loading support
* Optimized helper queries

---

# 🔌 Service Provider

Auto-loaded via:

```php
Kejubayer\BdAddress\BdAddressServiceProvider::class
```

---

# 📌 Requirements

* PHP >= 7.4
* Laravel >= 8

---

# 🚀 Roadmap

* REST API support
* Admin CRUD panel
* AJAX cascading dropdown UI
* Geo-location integration
* Redis cache layer
* Google Maps integration

---

# 👨‍💻 Author

**Khondoker Eftakhar Jubayer**
Laravel Developer
ERP & SaaS Builder
Open Source Contributor

---

# ⭐ Support

If you like this package, consider giving it a ⭐ on GitHub.
