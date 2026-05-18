# Walu Framework

**Laravel‑style DX. Symfony‑grade foundation. Built for speed.**

Walu is a modern PHP framework that feels like Laravel but stays lean and fast. It ships with an MVC core, a Blade‑style template engine, a powerful router, middleware pipeline, Symfony components under the hood, Eloquent + query builder, and a Vue 3 admin panel with granular permissions.

**Why Walu**
- Laravel‑like syntax and naming, zero ceremony.
- Symfony components for reliability and performance.
- Eloquent ORM + query builder out of the box.
- First‑class routing, middleware, DI, and service container.
- Blade‑style templates with inheritance, sections, stacks, and includes.
- Cache, sessions, Redis, memcache/memcached, HTTP client, console tools.
- Admin panel SPA (Vue 3 + Pinia + TypeScript + Tailwind).

**Core Features**
- MVC + front controller + clean URLs.
- Routing with parameters, regex, and HTTP method matching.
- Middleware pipeline with aliases and route parameters.
- Dependency injection + autowiring.
- Eloquent ORM + query builder.
- Migrations + seeders + Faker helpers.
- Session drivers: file, database, redis, memcache/memcached.
- Cache drivers: file, redis, memcache/memcached.
- HTTP client wrapper on Symfony HttpClient.
- Blade‑style template engine.
- Laravel‑style helpers and facades.
- Admin RBAC with roles and granular permissions.

**Tech Stack**
- PHP 8.4+
- Symfony: Console, HttpFoundation, Routing, DependencyInjection, Dotenv, Cache, VarDumper, HttpClient
- Illuminate: Database (Eloquent + query builder)
- Spatie: Data (DTOs)
- Vite + Vue 3 + Pinia + TypeScript + Tailwind

## Quick Start

1. Install PHP dependencies:
   - `php composer install`
2. Create `.env`:
   - Copy `.env.example` to `.env` and set DB credentials.
3. Run migrations:
   - `php walu migrate`
4. Start the app:
   - Point web server document root to `public/`.
5. Start frontend dev server (optional):
   - `yarn`
   - `yarn dev`

## Routing

Define routes in `config/routes.php`:

```php
$router->get('/', [HomeController::class, 'index']);
$router->get('/posts/{id:\\d+}', [PostController::class, 'show']);
$router->post('/posts', [PostController::class, 'store']);
```

## Eloquent + Query Builder

```php
$users = db()->table('users')->where('email', 'like', '%@example.com')->get();
```

```php
use Walu\Core\EloquentModel;

final class Post extends EloquentModel
{
    protected $table = 'posts';
    protected $fillable = ['title', 'body'];
    public $timestamps = false;
}
```

## Views (Blade‑style)

Templates live in `src/App/Views` with `.tpl` or `.blade.php`.

```php
view()->share('appName', 'Walu');
```

Supported directives:
`@extends`, `@section`, `@yield`, `@show`, `@include`, `@includeIf`, `@includeWhen`, `@includeUnless`,
`@if`, `@elseif`, `@else`, `@endif`, `@foreach`, `@forelse`, `@empty`, `@endforelse`, `@for`, `@while`,
`@switch`, `@case`, `@default`, `@endswitch`, `@push`, `@stack`, `@php`, `@csrf`, `@method`.

## Auth + API Tokens

Run migrations once:

```
php walu migrate
```

Web auth routes:
- `GET /login`, `POST /login`
- `GET /register`, `POST /register`
- `POST /logout`

API tokens:
- `POST /api/login` (returns bearer token)
- `GET /api/me` (requires token)
- `POST /api/logout`

Attach bearer token:

```
Authorization: Bearer <token>
```

## Admin Panel (Vue 3 + TS + Tailwind)

- UI: `/admin`
- API: `/admin/api/*`
- Permissions enforced via middleware:
  - `permission:admin.access`
  - granular permissions like `permission:admin.users.view`

Seed roles/permissions:

```
php walu db:seed
```

## Cache

```php
cache()->put('greeting', 'hello', 60);
$value = cache('greeting');
```

Drivers: `file`, `redis`, `memcached`, `memcache`.

## HTTP Client

```php
http()->acceptJson()->get('https://example.com')->json();
Http::asJson()->post('https://example.com', ['name' => 'Walu']);
```

## Console

Run via `php walu`:

```
php walu list
php walu make:controller PostController
php walu make:model Post
php walu make:migration create_posts_table
php walu make:seeder UserSeeder
php walu migrate
php walu migrate:status
php walu migrate:rollback --step=1
php walu db:seed
php walu db:seed --class=UserSeeder
php walu route:list
php walu cache:clear --store=redis
```

## Testing

Install dev deps:

```
php composer update --dev phpunit/phpunit
```

Run tests:

```
php vendor/bin/phpunit
```

## Laravel Compatibility Layer

Walu ships with a lightweight Illuminate compatibility layer (facades, contracts, service providers) to ease package reuse.
Register package providers in `config/app.php` under `providers` and add aliases under `aliases`.

## Documentation

See `GUIDELINES.md` for detailed usage and architecture notes.

## License

MIT
