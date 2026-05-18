# Bumble

Playful, opinionated starter kit for Laravel projects.

## Stack

<!-- TALL stack -->
The project stack includes [Laravel](https://laravel.com), a popular PHP framework, for the backend development. [Livewire](https://livewire.laravel.com) and [Alpine.js](https://alpinejs.dev/) are used for building interactive user interfaces. [MySQL](https://mysql.com) is used for data management, being a reliable and widely-used relational database management system. Finally, [Tailwind CSS](https://tailwindcss.com) is employed for modern and utility-first styling.

<!-- VILT stack -->
The project stack includes [Laravel](https://laravel.com), a popular PHP framework, for the backend development. [Vue.js](https://vuejs.org) is used for building interactive user interfaces, and [Inertia.js](https://inertiajs.com) serves as the communication protocol that glues the backend and frontend into a modern monolithic application. [MySQL](https://mysql.com) is used for data management, being a reliable and widely-used relational database management system. Finally, [Tailwind CSS](https://tailwindcss.com) is employed for modern and utility-first styling.

## Installation

Install the application by cloning this repository. Then follow these steps:

1. Install Composer dependencies
```bash
composer install
```

2. Copy .env.example file to .env file and change necessary values
```bash
cp .env.example .env
```

3. Generate new application key
```bash
php artisan key:generate
```

4. Create the symbolic link for storage
```bash
php artisan storage:link
```

5. Migrate and seed database
```bash
php artisan migrate:fresh --seed
```

6. Install Bun dependencies
```bash
bun install
```

7. Run asset HMR compiler
```bash
bun run dev
```
