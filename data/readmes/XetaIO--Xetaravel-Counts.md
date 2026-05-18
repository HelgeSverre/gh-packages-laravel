# Xetaravel Counts

> |Unit Tests|Stable Version|Downloads|                                                    Laravel                                                    |License|
> |:------:|:-------:|:------:|:-------:|:------:|
> |[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/XetaIO/Xetaravel-Counts/tests.yml?style=flat-square)](https://github.com/XetaIO/Xetaravel-Counts/actions/workflows/tests.yml)|[![Latest Stable Version](https://img.shields.io/packagist/v/XetaIO/Xetaravel-Counts.svg?style=flat-square)](https://packagist.org/packages/xetaio/xetaravel-counts)|[![Total Downloads](https://img.shields.io/packagist/dt/xetaio/xetaravel-counts.svg?style=flat-square)](https://packagist.org/packages/xetaio/xetaravel-counts)| [![Laravel 12.0](https://img.shields.io/badge/Laravel->=12.0-f4645f.svg?style=flat-square)](http://laravel.com) |[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](https://github.com/XetaIO/Xetaravel-Counts/blob/master/LICENSE)|

A lightweight Laravel package that automatically maintains `*_count` columns
for:

- `belongsTo` relations (ex: Category → Article)
- `belongsToMany` relations via pivot models (ex: Material ↔ Part)

This allows models to keep real-time counters in the database without writing
custom observers or manual logic.

Perfect for dashboards, ERPs, statistics, inventory systems, and any domain
where counts must remain immediately available and consistent.

---

## ✨ Features

- 🔹 Automatic increment/decrement on create/delete
- 🔹 Automatic sync when foreign key changes (update)
- 🔹 Automatic increment on restore (SoftDelete only)
- 🔹 Automatic increment/decrement on attach/detach/sync (pivot)
- 🔹 Zero configuration for Laravel service provider (auto-discovery)
- 🔹 Simple traits you can reuse anywhere
- 🔹 Works on Laravel 12+

---

## 📦 Installation

Install via Composer:

```bash
composer require xetaio/xetaravel-counts
```

---

## 📚 Usage
This package provides a trait to use in your Models:
`HasCounts` — `belongsTo` & `belongsToMany` relations

### 1️⃣ Example for `belongsTo` relations :

Used when a child belongs to a parent, and the parent stores a `*_count`.

You have:

- categories.articles_count

- articles.category_id

*Category model*
```php
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'articles_count'];

    public function articles()
    {
        return $this->hasMany(Article::class);
    }
}
```

*Article model (child)*
```php
use Illuminate\Database\Eloquent\Model;
use Xetaio\Counts\Concerns\HasCounts;

class Article extends Model
{
    use HasCounts;

    protected $fillable = ['title', 'category_id'];

    protected static array $countsConfig = [
        'category' => 'articles_count',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
```

| Action                            | Effect                         |
| --------------------------------- | ------------------------------ |
| Article created                   | `category.articles_count++`    |
| Article deleted                   | `category.articles_count--`    |
| Article restored (SofDeletes only)                  | `category.articles_count++`    |
| Article moved to another category | decrements old, increments new |


### 2️⃣ Example for `belongsToMany` relations :

Used when two models are linked via a pivot table and both have a `*_count`.

Example:

- `materials.parts_count`

- `parts.materials_count`

- `material_part` pivot  table

*Material model*
```php
class Material extends Model
{
    protected $fillable = ['name', 'parts_count'];

    public function parts()
    {
        return $this->belongsToMany(Part::class, 'material_part')
            ->using(MaterialPart::class) // We need a Pivot Model
            ->withTimestamps();
    }
}
```

*Part model*
```php
class Part extends Model
{
    protected $fillable = ['name', 'materials_count'];

    public function materials()
    {
        return $this->belongsToMany(Material::class, 'material_part')
            ->using(MaterialPart::class) // We need a pivot model
            ->withTimestamps();
    }
}
```

*Pivot model (the key part)*
```php

use Illuminate\Database\Eloquent\Relations\Pivot;
use Xetaio\Counts\Concerns\HasCounts;

class MaterialPart extends Pivot // Extends to Pivot
{
    use HasCounts;

    /**
     * Config the counts
     */
    protected static array $countsConfig = [
        'material' => 'parts_count',
        'part' => 'materials_count',
    ];

    public function material()
    {
        return $this->belongsTo(Material::class);
    }

    public function part()
    {
        return $this->belongsTo(Part::class);
    }
}
```

| Action                            | Effect                       |
| --------------------------------- | ---------------------------- |
| `material->parts()->attach(part)` | increments both counts          |
| `material->parts()->detach(part)` | decrements both counts              |
| `sync([...])`                     | decrements/increments both counts |

 --

 ## ⚡ Performance Notes

 This package uses:

  `increment()` / `decrement()` → atomic SQL updates

  No heavy SELECT COUNT(*)

  No observers per model

  No risk of race conditions beyond DB atomic ops

 For large-scale systems, this approach is highly performant.

 --

 ## 🤝 Contributing

 Pull Requests are welcome!
 Feel free to suggest improvements, new features, or optimizations.