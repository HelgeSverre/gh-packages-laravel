# Laravel Model Service Generator

Extends Laravel's `make:model` Artisan command to also generate a **Service class** in `app/Services` when using the `-s` (or `--service`) flag.

## Features
- Works with **Laravel 10, 11, and 12**
- Fully PSR-4 compliant
- Generates service alongside model, migration, and controller
- Seamlessly integrates with all existing `make:model` options

---

## Installation

```bash
composer require mattyeend/laravel-model-service
```
Laravel will auto-discover the service provider.

--- 

## Usage
```bash
php artisan make:model Post -mcrS
# -> Creates Post model and PostService
php artisan make:model Post --service
# -> Creates PostService
php artisan make:model Post -a 
# -> Creates Post model, migration, controller, factory, seeder, policy, 
#    and now also Postervice
```
This will create:
```markdown
app/
    Models/
        Post.php
    Services/
        PostService.php
    Http/
        Controllers/
            PostController.php
database/
    migrations/
        2025_08_15_000000_create_posts_table.php
```
Flags
- `-m` — Create migration
- `-c` — Create controller
- `-r` — Resource controller
- `-S`/`--service` — Create service

---

## Customizing the Service Stub
You can publish the stub to modify the generated service file:
```bash
php artisan vendor:publish --tag=stubs
```
This will place `stubs/service.stub` in your project root.
Modify it to fit your coding standards.

--- 

## License
This package is licensed under the MIT License.

--- 

## Contributing
Feel free to fork the repository and submit pull requests for improvements or new features!
