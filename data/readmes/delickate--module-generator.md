# Delickate Module Generator

**Delickate Module Generator** is a lightweight Laravel package to quickly scaffold self-contained modules in your Laravel application. Each module comes with its own:

- Controllers  
- Models  
- Routes  
- Service Provider  
- Views  
- Migrations  
- Optional configuration  

This allows you to organize your app into reusable, maintainable modules — similar to `nWidart/laravel-modules` but in a lighter, streamlined way.

---

## Features

- Generate new modules with a single Artisan command  
- Auto-create controllers, models, routes, views, migrations, service providers, and config  
- Auto-register module service providers  
- Fully PSR-4 compatible  
- Works with Laravel 8, 9, 10, 11  
- Optional flags for migrations and config generation  
- Ready for multi-module projects  

---

## Installation

Install via Composer:

```bash
> composer require delickate/module-generator
```
To create new module
```bash
> php artisan delickate:module Blog --migration --config
```

To list modules
```bash
> php artisan module:list
```

To create controller in module
```bash
php artisan module:make-controller PostController Blog
```

To create model in module
```bash
php artisan module:make-model Post Blog
```

To create migrations in module
```bash
php artisan module:make-migration create_posts_table Blog
```

To enable / disable module
```bash
php artisan module:enable Blog
php artisan module:disable Blog
php artisan module:delete Blog
```

On hosting app. open composer.json file and add this `"Modules\\": "Modules/",` like 

```bash
"autoload": {
        "psr-4": {
            "App\\": "app/",
            "Modules\\": "Modules/",
            "Database\\Factories\\": "database/factories/",
            "Database\\Seeders\\": "database/seeders/"
        }
    },
```

and run following command

```bash
> composer dump-autoload
```