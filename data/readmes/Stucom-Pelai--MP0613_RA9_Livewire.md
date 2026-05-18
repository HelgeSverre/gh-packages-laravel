# Laravel 10 Livewire CRUD 
Learn how to develop a Laravel 10 Livewire CRUD application

## Installation 
Make sure that you have setup the environment properly. You will need minimum PHP 8.1, MySQL/MariaDB, and composer.

1. Clone the repository:

```bash
   git clone https://github.com/Stucom-Pelai/MP0613_RA9_Livewire
```

2. Install Composer dependencies:

```bash
composer install
```

3. Copy the example enviroment file:

```bash
cp .env.example .env
```

4. Generate an application key

```bash
php artisan key:generate
```

5. Create a symbolic link from 'public/storage' to 'storage/app/public'

```bash
php artisan storage:link
```

6. Clear compiled view files

```bash
php artisan view:clear
```

7. Publish livewire assets

```bash
php artisan livewire:publish --assets
```

8. Create database

create database mp0613_livewire


9. Run migrations and seed the database

```bash
php artisan migrate:fresh --seed
```

10. Start the Laravel development server 

```bash
php artisan serve
```

11. You are all set
