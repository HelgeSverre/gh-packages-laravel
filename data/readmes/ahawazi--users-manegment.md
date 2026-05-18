## User Manegment

- [Filament](https://filamentphp.com/).
- [Laravel](https://laravel.com/).
- [shield](https://filamentphp.com/plugins/bezhansalleh-shield).
- [Jalali](https://filamentphp.com/plugins/mokhosh-jalali).

## Installation

run:

```bash
composer install
```

next:
```bash
npm install
```

next:
```
php artisan migrate
```

## Use:

### run this command and have SuperAdmin:

```php
php artisan db:seed
```

or run the class:

```php
php artisan db:seed --class=SuperAdminSeeder
```

### can create by:

- Filament:
```php
php artisan make:filament-user
```

- Blade:
Register in Blade.

### Install shield:

- By this command your user become to SuperAdmin (if you have more then one user you can chose what user want to be SuperAdmin)
```php
php artisan shield:install
```
