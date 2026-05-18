# 📦 Laravel Taxonomy Package

A flexible and powerful taxonomy system for Laravel supporting:

- Categories (hierarchical / multiple)
- Tags (flat / multiple)
- Brands (flat / single)
- Polymorphic relationships
- Nested set structure (tree support)
- Query builder & manager layer

---

## 🚀 Features

- 🔗 Attach multiple taxonomies to any model
- 🌲 Hierarchical taxonomy support (nested set)
- ⚙️ Config-driven taxonomy types
- 🔍 Fluent query builder
- 🧠 Smart sync / attach / detach logic
- 🌍 Language-aware taxonomies
- 👤 Creator tracking (polymorphic)

---

## 📦 Installation

```bash
composer require sohrab-az/laravel-taxonomy
```

## ⚙️ Publish Config

```bash
php artisan vendor:publish --tag=taxonomy-config
```

## 🧾 Configuration

config/taxonomy.php

```php
return [
    'types' => [
        'category' => [
            'label' => 'Category',
            'is_multiple' => true,
            'is_hierarchical' => true,
        ],

        'tag' => [
            'label' => 'Tag',
            'is_multiple' => true,
            'is_hierarchical' => false,
        ],

        'brand' => [
            'label' => 'Brand',
            'is_multiple' => false,
            'is_hierarchical' => false,
        ],
    ],
];
```

## 🗄 Database Structure

### taxonomies table

- id
- name
- slug
- type
- order
- parent_id (nested set)
- _lft, _rgt (nested set)
- language_id
- created_by_type
- created_by_id
- timestamps

### Pivot: taxonomyables

Polymorphic relation table:

- taxonomy_id
- taxonomyable_id
- taxonomyable_type
- timestamps

## 🧠 Usage

Add trait to your model

```php
use SohrabAzinfar\Taxonomy\Traits\HasTaxonomies;

class Post extends Model
{
    use HasTaxonomies;
}
```

## 🔗 Relationship

```php
$post->taxonomies();
```

## ✍️ Attach Taxonomies

```php
$post->attachTaxonomy($taxonomyId);
$post->attachTaxonomy([1, 2, 3]);
```

## ❌ Detach Taxonomies

```php
$post->detachTaxonomy($taxonomyId);
$post->detachTaxonomyByType('tag');
```

## 🔄 Sync Taxonomies

```php
$post->syncTaxonomy([1, 2, 3]);
$post->syncTaxonomyByType('category', [1, 2]);
```

## 🔍 Query Builder

```php
$post->taxonomy()
```

### Examples

```php
$post->taxonomy()
    ->type('category')
    ->language('en')
    ->get();
```

## Filters

```php
    ->whereSlug('laravel')
    ->whereInSlug(['php', 'laravel'])
    ->whereId(1)
    ->children()
    ->root()
```

## Execution

```php
    ->get()
    ->first()
    ->pluck('name')
    ->count()
    ->exists()
```

## 🧠 Taxonomy Manager

Internal service handling logic:

```php
app(TaxonomyManager::class)
```

### Features:

- Type-aware syncing
- Handles multiple/single constraints
- Prevents duplicate attachments
- Grouped processing per taxonomy type

## 🧩 Taxonomy Type Helper

```php
TaxonomyType::get('category');
TaxonomyType::exists('tag');
TaxonomyType::isMultiple('brand');
TaxonomyType::isHierarchical('category');
```

## 🏗 Service Provider

Automatically registered via:

```php
TaxonomyServiceProvider
```

### Provides:

- Config merging
- Migration loading
- Config publishing

## 📌 Requirements

- PHP 8+
- Laravel 10+
- kalnoy/nestedset

##📄 License

```bash
MIT License
```